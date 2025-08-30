// api/oy-chat.js (Vercel serverless function / CommonJS)
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { msg = '', chatSlug = '', history = [], model } = req.body || {};
    const key = process.env.OPENAI_API_KEY;
    if (!key) return res.status(500).json({ error: 'No API key' });

    const last = (history || []).slice(-10).map(m => ({
      role: m.who === 'user' ? 'user' : 'assistant',
      content: String(m.html || '').replace(/<[^>]+>/g, '')
    }));

    const system = `Та "Оюунсанаа" нэртэй зөвлөх. Хэрэглэгч: ${chatSlug}. Монгол хэлээр товч хариул.`;

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',   // <-- эндээс сонгоно (gpt-4o эсвэл gpt-4o-mini)
        temperature: 0.3,
        messages: [
          { role: 'system', content: system },
          ...last,
          { role: 'user', content: String(msg) }
        ]
      })
    });

    const data = await r.json();
    const reply = data.choices?.[0]?.message?.content || 'Алдаа гарлаа.';
    return res.status(200).json({ reply });

  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
};
