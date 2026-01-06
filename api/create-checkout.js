const stripe = require('stripe')('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');

console.log('===== HARDCODED KEY VERSION - TIMESTAMP: 2026-01-06 13:15 =====');
console.log('Stripe key type:', typeof stripe);
console.log('Has stripe:', !!stripe);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('Create checkout called');
  console.log('Price ID:', req.body?.priceId);
  console.log('Stripe key exists:', !!process.env.STRIPE_SECRET_KEY);

  try {
    const { priceId } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' });
    }

    console.log('Creating Stripe session...');

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: priceId === 'price_1SmcQwCsMGESldVaYSPruaAo' ? 'subscription' : 'payment',
      success_url: `${req.headers.origin || 'https://resumeai.ink'}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'https://resumeai.ink'}?canceled=true`,
    });

    console.log('Session created:', session.id);

    return res.status(200).json({ 
      sessionId: session.id, 
      url: session.url 
    });
  } catch (err) {
    console.error('Stripe error details:', err);
    return res.status(500).json({ 
      error: err.message,
      type: err.type,
      statusCode: err.statusCode
    });
  }
};
