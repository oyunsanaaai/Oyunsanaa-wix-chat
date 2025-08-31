export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { model, msg, history = [] } = req.body || {};

    const MAP = new Map([
      ['gpt-4o', 'gpt-4o'],
      ['gpt-4o-mini', 'gpt-4o-mini'],
      ['gpt-3.5-turbo', 'gpt-4o'],
    ]);
    const resolvedModel = MAP.get(model) || 'gpt-4o';

    const messages = [
      ...history.map(m => ({ role: m.who === 'user' ? 'user' : 'assistant', content: String(m.html || '').replace(/<[^>]+>/g,'') })),
      { role: 'user', content: String(msg || '') },
    ];

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ model: resolvedModel, messages, temperature: 0.7 }),
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data?.error?.message || 'OpenAI API error' });

    const reply = data?.choices?.[0]?.message?.content || '';
    res.status(200).json({ reply });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Server error' });
  }
}
