// pages/api/oy-chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { model, msg, history = [] } = req.body || {};

    // UI-аас ирсэн model-ийг зөвшөөрөгдсөн нэршил рүү зурагдвал сайн
    const MAP = {
      'gpt-4o': 'gpt-4o',
      'gpt-4o-mini': 'gpt-4o-mini',
      'gpt-3.5-turbo': 'gpt-4o', // 3.5 ирвэл 4o болгож явуулна
    };
    const resolvedModel = MAP[model] || 'gpt-4o-mini';

    // Түүхийг OpenAI-д таарах messages хэлбэрт хөрвүүлнэ
    const messages = [
      ...history.map((m) => ({
        role: m.who === 'user' ? 'user' : 'assistant',
        content: String(m.html || '').replace(/<[^>]+>/g, ''), // энгийн safety
      })),
      { role: 'user', content: String(msg || '') },
    ];

    // 👉 ЭНД жинхэнэ OpenAI API руу дуудна
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // Vercel env
      },
      body: JSON.stringify({
        model: resolvedModel,
        messages,
        temperature: 0.7,
      }),
    });

    const data = await r.json();

    if (!r.ok) {
      console.error('[oy-chat] OpenAI error:', r.status, data);
      return res
        .status(r.status)
        .json({ error: data?.error?.message || 'OpenAI API error' });
    }

    const reply = data?.choices?.[0]?.message?.content || '';
    return res.status(200).json({ reply });
  } catch (e) {
    console.error('[oy-chat] server error:', e);
    return res.status(500).json({ error: e.message || 'Server error' });
  }
}
