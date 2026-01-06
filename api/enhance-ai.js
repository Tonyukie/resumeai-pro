module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { field, text } = req.body;

    // Use dynamic import for node-fetch
    const fetch = (await import('node-fetch')).default;

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

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Anthropic API error:', errorData);
      return res.status(500).json({ error: 'AI service error' });
    }

    const data = await response.json();
    res.status(200).json({ enhanced: data.content[0].text.trim() });
  } catch (err) {
    console.error('AI Enhancement error:', err);
    res.status(500).json({ error: err.message });
  }
};
