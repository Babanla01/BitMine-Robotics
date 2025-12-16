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

export default router;
