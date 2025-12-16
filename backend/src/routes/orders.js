import express from 'express';
import pool from '../config/database.js';
import axios from 'axios';
import emailjs from '@emailjs/nodejs';

const router = express.Router();

// Get delivery zones
router.get('/delivery-zones', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM delivery_zones ORDER BY state ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching delivery zones:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get delivery fee for a specific state
router.get('/delivery-fee/:state', async (req, res) => {
  try {
    const { state } = req.params;
    
    // Try exact match first
    let result = await pool.query(
      'SELECT delivery_fee FROM delivery_zones WHERE state = $1',
      [state]
    );

    // If no exact match, use "Other"
    if (result.rows.length === 0) {
      result = await pool.query(
        'SELECT delivery_fee FROM delivery_zones WHERE state = $1',
        ['Other']
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Delivery zone not found' });
    }

    res.json({ delivery_fee: result.rows[0].delivery_fee });
  } catch (error) {
    console.error('Error fetching delivery fee:', error);
    res.status(500).json({ error: error.message });
  }
});

// Initialize Paystack payment
router.post('/initialize-payment', async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      street_address,
      city,
      state,
      postal_code,
      items,
      subtotal,
      delivery_fee,
      total_amount
    } = req.body;

    if (!customer_name || !customer_email || !customer_phone || !street_address || !city || !state || !items || !total_amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify calculation: ensure total_amount = subtotal + delivery_fee
    const calculatedTotal = parseFloat(subtotal) + parseFloat(delivery_fee);
    const finalTotal = parseFloat(total_amount);
    
    if (Math.abs(calculatedTotal - finalTotal) > 0.01) {
      console.warn(`Total mismatch: calculated=${calculatedTotal}, provided=${finalTotal}. Using calculated value.`);
    }

    // Initialize Paystack payment
    const paystackUrl = 'https://api.paystack.co/transaction/initialize';
    const callbackUrl = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/payment/callback`;
    
    const paystackResponse = await axios.post(paystackUrl, {
      email: customer_email,
      amount: Math.round(finalTotal * 100), // Convert to kobo
      callback_url: callbackUrl,
      metadata: {
        customer_name,
        customer_email,
        customer_phone,
        street_address,
        city,
        state,
        postal_code,
        items: items,
        subtotal: parseFloat(subtotal),
        delivery_fee: parseFloat(delivery_fee),
        total_amount: finalTotal
      }
    }, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });

    const { authorization_url, access_code, reference } = paystackResponse.data.data;

    res.json({
      authorization_url,
      access_code,
      reference
    });
  } catch (error) {
    console.error('Error initializing payment:', error);
    res.status(500).json({ error: error.message || 'Failed to initialize payment' });
  }
});

// Verify payment and create order
router.post('/verify-payment', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ error: 'Payment reference is required' });
    }

    // Start transaction
    await client.query('BEGIN');

    // Check if order already exists for this payment reference (prevent duplicates with FOR UPDATE)
    const existingOrderResult = await client.query(
      'SELECT * FROM orders WHERE paystack_reference = $1 FOR UPDATE',
      [reference]
    );

    if (existingOrderResult.rows.length > 0) {
      await client.query('COMMIT');
      console.log(`Order already exists for reference: ${reference}`);
      
      // Get order items for the existing order
      const itemsResult = await client.query(
        'SELECT * FROM order_items WHERE order_id = $1',
        [existingOrderResult.rows[0].id]
      );
      
      return res.json({
        success: true,
        message: 'Payment verified and order already created',
        order: existingOrderResult.rows[0],
        items: itemsResult.rows,
        isDuplicate: true
      });
    }

    // Verify payment with Paystack
    const paystackUrl = `https://api.paystack.co/transaction/verify/${reference}`;
    const paystackResponse = await axios.get(paystackUrl, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });

    const { status, data } = paystackResponse.data;

    if (status && data.status === 'success') {
      const metadata = data.metadata || {};
      const {
        customer_name,
        customer_email,
        customer_phone,
        street_address,
        city,
        state,
        postal_code,
        items,
        subtotal,
        delivery_fee,
        total_amount
      } = metadata;

      // Log for debugging
      console.log('Payment verification successful');
      console.log('Paystack Response Data:', JSON.stringify(data, null, 2));
      console.log('Extracted Metadata:', JSON.stringify(metadata, null, 2));

      // Validate required fields
      if (!customer_email || !customer_name || !customer_phone) {
        await client.query('ROLLBACK');
        console.error('Missing required customer information:', { customer_email, customer_name, customer_phone });
        return res.status(400).json({ 
          error: 'Missing customer information in payment metadata',
          details: { customer_email, customer_name, customer_phone }
        });
      }

      // Ensure all amounts are numbers
      const finalSubtotal = parseFloat(subtotal) || 0;
      const finalDeliveryFee = parseFloat(delivery_fee) || 0;
      const finalTotalAmount = parseFloat(total_amount) || (finalSubtotal + finalDeliveryFee);

      // Generate order number
      const orderNumber = `ORD-${Date.now()}`;

      // Use the Paystack reference as fallback
      const paystackReference = data.reference || reference;

      // Create order
      const orderQuery = `
        INSERT INTO orders (
          order_number, customer_name, customer_email, customer_phone,
          street_address, city, state, postal_code, country,
          subtotal, delivery_fee, total_amount, payment_status,
          order_status, paystack_reference, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *;
      `;

      const orderResult = await client.query(orderQuery, [
        orderNumber,
        customer_name,
        customer_email,
        customer_phone,
        street_address,
        city,
        state,
        postal_code,
        'Nigeria',
        finalSubtotal,
        finalDeliveryFee,
        finalTotalAmount,
        'completed',
        'processing',
        paystackReference
      ]);

      const order = orderResult.rows[0];

      // Create order items
      for (const item of items) {
        const itemQuery = `
          INSERT INTO order_items (order_id, product_id, product_name, quantity, price, subtotal)
          VALUES ($1, $2, $3, $4, $5, $6);
        `;

        await client.query(itemQuery, [
          order.id,
          item.product_id,
          item.product_name,
          item.quantity,
          item.price,
          item.quantity * item.price
        ]);
      }

      // Send confirmation email
      try {
        const templateParams = {
          to_email: customer_email,
          customer_name,
          order_number: orderNumber,
          total_amount: finalTotalAmount.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' }),
          delivery_fee: finalDeliveryFee.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' }),
          subtotal: finalSubtotal.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' }),
          street_address,
          city,
          state,
          postal_code,
          items_list: items.map(i => `${i.name} (x${i.quantity}) - ₦${(i.quantity * i.price).toLocaleString()}`).join('\n')
        };

        await emailjs.send(
          'service_c4xxg3q',
          'template_order_confirmation',
          templateParams,
          'DIAu_wU0XjhTN9yc8'
        );
      } catch (emailError) {
        console.warn('Email notification failed (non-critical):', emailError);
      }

      // Commit transaction
      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Payment verified and order created',
        order,
        isDuplicate: false
      });
    } else {
      await client.query('ROLLBACK');
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    await client.query('ROLLBACK');
    
    // Check if error is due to duplicate paystack_reference (unique constraint violation)
    if (error.code === '23505' && error.detail && error.detail.includes('paystack_reference')) {
      console.log('Duplicate paystack_reference detected, checking for existing order');
      
      try {
        const { reference } = req.body;
        const existingOrder = await pool.query(
          'SELECT * FROM orders WHERE paystack_reference = $1',
          [reference]
        );
        
        if (existingOrder.rows.length > 0) {
          const itemsResult = await pool.query(
            'SELECT * FROM order_items WHERE order_id = $1',
            [existingOrder.rows[0].id]
          );
          
          return res.json({
            success: true,
            message: 'Payment verified and order already created',
            order: existingOrder.rows[0],
            items: itemsResult.rows,
            isDuplicate: true
          });
        }
      } catch (fallbackError) {
        console.error('Error checking for existing order:', fallbackError);
      }
    }
    
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: error.message || 'Failed to verify payment' });
  } finally {
    client.release();
  }
});

// Get all orders (admin)
router.get('/all/list', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM orders ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get orders by customer email
router.get('/customer/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const result = await pool.query(`
      SELECT * FROM orders WHERE customer_email = $1 ORDER BY created_at DESC
    `, [email]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single order with items
router.get('/detail/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const itemsResult = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [id]);

    res.json({
      order: orderResult.rows[0],
      items: itemsResult.rows
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { order_status } = req.body;

    if (!['processing', 'shipped', 'delivered', 'cancelled'].includes(order_status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      `UPDATE orders SET order_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [order_status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      message: 'Order status updated',
      order: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel order
router.put('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE orders SET order_status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      message: 'Order cancelled successfully',
      order: result.rows[0]
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
