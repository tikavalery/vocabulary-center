const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const PDF = require('../models/PDF');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Helper function to get frontend URL (same as in auth.js)
const getFrontendUrl = (req) => {
  if (process.env.CLIENT_URL) {
    return process.env.CLIENT_URL;
  }
  
  // In production, construct URL from request (same origin)
  if (process.env.NODE_ENV === 'production') {
    const protocol = req.protocol || 'https';
    const host = req.get('host') || req.hostname;
    return `${protocol}://${host}`;
  }
  
  // Development default
  return 'http://localhost:3000';
};

// Create Stripe checkout session
router.post('/create-checkout-session', authenticate, async (req, res) => {
  try {
    const { pdfId } = req.body;

    if (!pdfId) {
      return res.status(400).json({ message: 'PDF ID is required' });
    }

    // Get PDF details
    const pdf = await PDF.findById(pdfId);
    if (!pdf) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    // Check if user already purchased this PDF
    const user = await User.findById(req.user._id);
    if (user.purchasedPdfs.includes(pdfId)) {
      return res.status(400).json({ message: 'You have already purchased this PDF' });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: pdf.title,
              description: `Language: ${pdf.language}`,
              images: [pdf.coverImageUrl]
            },
            unit_amount: Math.round(pdf.price * 100) // Convert to cents
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${getFrontendUrl(req)}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getFrontendUrl(req)}/checkout/cancel`,
      client_reference_id: pdfId.toString(),
      customer_email: user.email,
      metadata: {
        userId: req.user._id.toString(),
        pdfId: pdfId.toString()
      }
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ message: 'Error creating checkout session', error: error.message });
  }
});

// Verify payment and create order
router.post('/verify-payment', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    // Check if order already exists
    const existingOrder = await Order.findOne({ paymentIntentId: session.payment_intent });
    if (existingOrder) {
      return res.status(400).json({ message: 'Order already processed' });
    }

    const userId = session.metadata.userId;
    const pdfId = session.metadata.pdfId;

    // Verify user matches
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Create order
    const order = new Order({
      userId,
      pdfId,
      paymentIntentId: session.payment_intent,
      amount: session.amount_total / 100, // Convert from cents
      status: 'completed'
    });

    await order.save();

    // Add PDF to user's purchased list
    const user = await User.findById(userId);
    if (!user.purchasedPdfs.includes(pdfId)) {
      user.purchasedPdfs.push(pdfId);
      await user.save();
    }

    // Get PDF details for response
    const pdf = await PDF.findById(pdfId);

    res.json({
      message: 'Payment verified and order created',
      order: {
        id: order._id,
        pdf: {
          id: pdf._id,
          title: pdf.title,
          language: pdf.language
        },
        amount: order.amount,
        status: order.status,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Error verifying payment', error: error.message });
  }
});

// Get user's orders
router.get('/my-orders', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('pdfId', 'title language price coverImageUrl')
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

// Webhook endpoint for Stripe (optional, for production)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      const userId = session.metadata.userId;
      const pdfId = session.metadata.pdfId;

      // Check if order already exists
      const existingOrder = await Order.findOne({ paymentIntentId: session.payment_intent });
      if (existingOrder) {
        return res.json({ received: true });
      }

      // Create order
      const order = new Order({
        userId,
        pdfId,
        paymentIntentId: session.payment_intent,
        amount: session.amount_total / 100,
        status: 'completed'
      });

      await order.save();

      // Add PDF to user's purchased list
      const user = await User.findById(userId);
      if (!user.purchasedPdfs.includes(pdfId)) {
        user.purchasedPdfs.push(pdfId);
        await user.save();
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
    }
  }

  res.json({ received: true });
});

module.exports = router;

