import express from 'express';

const router = express.Router();

// Initialize payment
router.post('/initiate', (req, res) => {
  try {
    const { amount, email, orderId } = req.body;

    if (!amount || !email) {
      return res.status(400).json({ error: 'Amount and email required' });
    }

    // TODO: Integrate with Paystack or Flutterwave
    // For now, return mock response
    const paymentInitiation = {
      reference: `BITMINE-${Date.now()}`,
      amount,
      email,
      orderId,
      status: 'pending',
      authorization_url: 'https://checkout.paystack.com/mock-url' // Mock URL
    };

    res.json({
      message: 'Payment initiated',
      payment: paymentInitiation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify payment
router.post('/verify', (req, res) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ error: 'Reference required' });
    }

    // TODO: Verify with payment gateway
    // For now, return mock response
    const paymentVerification = {
      status: 'success',
      reference,
      amount: 10000,
      customer_code: 'CUS-123',
      paid: true
    };

    res.json({
      message: 'Payment verified successfully',
      payment: paymentVerification
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Handle Paystack callback redirect
// This endpoint receives the Paystack callback and redirects to frontend payment verification
router.get('/callback', (req, res) => {
  try {
    const { reference, trxref } = req.query;

    if (!reference && !trxref) {
      return res.status(400).json({ error: 'Payment reference is required' });
    }

    // Use reference from query params (Paystack sends it as 'reference')
    const paymentReference = reference || trxref;

    // Redirect to frontend payment callback page which will verify the payment
    let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
    
    // Remove trailing slash if present to avoid double slashes
    frontendUrl = frontendUrl.replace(/\/$/, '');
    
    const redirectUrl = `${frontendUrl}/payment/callback?reference=${paymentReference}`;

    console.log(`Payment callback received - redirecting to: ${redirectUrl}`);
    
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Error handling payment callback:', error);
    let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
    frontendUrl = frontendUrl.replace(/\/$/, '');
    res.redirect(`${frontendUrl}/cart?error=payment_callback_error`);
  }
});

export default router;
