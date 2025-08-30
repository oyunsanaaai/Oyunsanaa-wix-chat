// api/oy-chat.js  — Vercel Serverless (Node 18+)
const stripHtml = (s = '') => String(s).replace(/<[^>]+>/g, '');

const pickModel = (m) => {
  const v = String(m || '').toLowerCase().trim();
  if (v.includes('4o-mini')) return 'gpt-4o-mini';
  if (v.includes('4o'))      return 'gpt-4o';
  if (v.includes('3.5'))     return 'gpt-3.5-turbo';
  return 'gpt-4o-mini'; // анхдагч
};

// Жижиг CORS (хэрэв Wix зэрэг өөр домэйноос дуудахаар бол)
const withCors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

module.exports = async (req, res) => {
  withCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key) return res.status(500).json({ error: 'No API key' });

    const body = req.body || {};
    const msg      = String(body.msg || '').trim();
    const chatSlug = String(body.chatSlug || 'default');
    const history  = Array.isArray(body.history) ? body.history : [];
    const model    = pickModel(body.model);

    if (!msg) return res.status(400).json({ error: 'Empty message' });

    // Түүхээс сүүлийн 10-г OpenAI формат руу
    const last = history.slice(-10).map((m) => ({
      role: m.who === 'user' ? 'user' : 'assistant',
      content: stripHtml(m.html || '')
    }));

    const system = [
      'Та "Оюунсанаа" нэртэй сэтгэлийн зөвлөгч.',
      'Монгол хэлээр товч, ил тод, эелдэг, практик байдлаар хариул.',
      `Хэрэглэгчийн суваг: ${chatSlug}.`
    ].join(' ');

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        messages: [
          { role: 'system', content: system },
          ...last,
          { role: 'user', content: msg }
        ]
      })
    });

    if (!r.ok) {
      const errText = await r.text().catch(() => '');
      return res.status(502).json({ error: 'OpenAI error', detail: errText });
    }

    const data = await r.json();
    const reply = data?.choices?.[0]?.message?.content || '';

    return res.status(200).json({
      reply: reply || 'Хариу олдсонгүй.',
      modelUsed: model
    });
  } catch (e) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
};
