// api/oy-chat.js
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Use POST' });
    }

    const key = process.env.OPENAI_API_KEY;
    if (!key) return res.status(500).json({ error: 'No OPENAI_API_KEY' });

    // Клиентээс ирэх өгөг
    const { message = '', chatSlug = '', history = [] } = req.body || {};

    // Сүүлийн 10 мессежийг цэвэр текст болгоно
    const last = (history || []).slice(-10).map(m => ({
      role: m.who === 'user' ? 'user' : 'assistant',
      content: String(m.html || '').replace(/<[^>]+>/g, '')
    }));

    const system = [
      'Та "Оюунсанаа" нэртэй эелдэг, аюулгүй зөвлөгөө өгдөг туслах.',
      `Хэрэглэгчийн ангилал: ${chatSlug || 'сонгоогүй'}.`,
      'Товч, ойлгомжтой, монголоор хариул.'
    ].join(' ');

    // OpenAI Chat Completions дуудах
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        messages: [
          { role: 'system', content: system },
          ...last,
          { role: 'user', content: String(message) }
        ]
      })
    });

    if (!r.ok) {
      const txt = await r.text();
      return res.status(r.status).json({ error: txt });
      // Жич: Vercel Logs дээр алдааг харахад амар
    }

    const data = await r.json();
    const reply = (data?.choices?.[0]?.message?.content || 'Ойлголоо. 🌿').trim();
    return res.json({ reply });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
