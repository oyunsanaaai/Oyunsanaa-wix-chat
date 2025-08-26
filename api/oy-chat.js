export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(500).json({ error: 'No OPENAI_API_KEY' });

  const { msg, chatSlug, history = [] } = req.body || {};
  const last = history.slice(-10).map(m => ({
    role: m.who === 'user' ? 'user' : 'assistant',
    content: (m.html || '').replace(/<[^>]+>/g, '')
  }));

  const system = [
    `Та "Оюунсанаа" нэртэй эелдэг сэтгэлийн хөтөч.`,
    `Хэрэглэгчийн ангилал: ${chatSlug || 'сонгоогүй'}.`,
    `Товч, ойлгомжтой, аюулгүй зөвлөмжөөр тусал.`
  ].join(' ');

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [
        { role: 'system', content: system },
        ...last,
        { role: 'user', content: msg || '' }
      ], temperature: 0.3 })
    });
    if (!r.ok) return res.status(r.status).json({ error: await r.text() });
    const data = await r.json();
    res.json({ reply: data?.choices?.[0]?.message?.content?.trim() || 'Ойлголоо. 🌿' });
  } catch (e) { res.status(500).json({ error: String(e) }); }
}
