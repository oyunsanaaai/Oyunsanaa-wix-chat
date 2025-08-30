// /api/oy-chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { model = 'gpt-4o-mini', msg = '', chatSlug = '', history = [] } = req.body || {};

    if (!process.env.OPENAI_API_KEY) {
      // API ключ тохируулаагүй үед алдаа биш — демо хариу буцаая
      return res.status(200).json({
        reply: `⚠️ OPENAI_API_KEY тохируулаагүй байна. Демо хариу: ${msg}`,
      });
    }

    // OpenAI Chat Completions (simple, найдвартай)
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,                         // gpt-4o эсвэл gpt-4o-mini ирнэ
        temperature: 0.7,
        messages: [
          { role: 'system', content: 'Та Монгол хэлээр товч, эелдэг, ойлгомжтой хариулна.' },
          // history-г хүсвэл өмнөх мессежүүд болгоод шиднэ
          ...[]
            .concat(history || [])
            .filter(Boolean)
            .map(x => ({ role: x.who === 'user' ? 'user' : 'assistant', content: x.text || x.html || '' })),
          { role: 'user', content: msg },
        ],
      }),
    });

    const data = await r.json();
    if (!r.ok) {
      const errMsg = data?.error?.message || 'OpenAI error';
      return res.status(500).json({ error: errMsg });
    }

    const reply = data.choices?.[0]?.message?.content?.trim() || 'Хариу олдсонгүй.';
    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
