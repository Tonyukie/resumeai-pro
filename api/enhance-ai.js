const fetch = require('node-fetch');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  console.log('Enhance API called with:', req.body);

  try {
    const { field, text } = req.body;

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('Missing ANTHROPIC_API_KEY');
      return res.status(500).json({ error: 'API key not configured' });
    }

    console.log('Calling Anthropic API...');

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ 
          role: "user", 
          content: `Improve this resume ${field}: "${text}". Make it more professional, achievement-focused, and ATS-friendly. Return ONLY the improved text, no explanations.` 
        }]
      })
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', errorText);
      return res.status(500).json({ error: 'AI service error', details: errorText });
    }

    const data = await response.json();
    console.log('Success! Enhanced text length:', data.content[0].text.length);
    
    res.status(200).json({ enhanced: data.content[0].text.trim() });
  } catch (err) {
    console.error('AI Enhancement error:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};
