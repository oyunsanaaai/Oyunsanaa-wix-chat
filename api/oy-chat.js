export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(500).json({ error: 'No OPENAI_API_KEY' });

  const { message = "" } = req.body || {};

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Та "Оюунсанаа" нэртэй эелдэг сэтгэлийн хөтөч.' },
          { role: 'user', content: message }
        ],
        temperature: 0.3
      })
    });

    if (!r.ok) return res.status(r.status).json({ error: await r.text() });
    const data = await r.json();
    res.json({ reply: data?.choices?.[0]?.message?.content?.trim() || 'Ойлголоо. 🌿' });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
