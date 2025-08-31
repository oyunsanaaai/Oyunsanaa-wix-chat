export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  try {
    let { model, msg, history = [] } = req.body || {};
    
    const MAP = new Map([
      ['gpt-4o', 'gpt-4o'],
      ['gpt-4o-mini', 'gpt-4o-mini'],
      ['gpt-3.5-turbo', 'gpt-4o'],
      ['gpt-4', 'gpt-4o'],           // засварлав
      ['gpt-4-mini', 'gpt-4o-mini'] // засварлав
    ]);
    const resolvedModel = MAP.get(model) || 'gpt-4o';
    
    console.log('[oy-chat] model:', model, '->', resolvedModel);
    
    if (!process.env.OPENAI_API_KEY) {
      return res.status(200).json({
        reply: 'API key тохируулаагүй байна.'
      });
    }
    
    // History боловсруулах
    const messages = [];
    for (const m of history) {
      const role = m.who === 'user' ? 'user' : 'assistant';
      const content = String(m.html || '').replace(/<[^>]+>/g, '');
      messages.push({ role, content });
    }
    messages.push({ role: 'user', content: String(msg || '') });
    
    // OpenAI API дуудах (өөрийгөө биш!)
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: resolvedModel,
        messages: messages,
        temperature: 0.7
      })
    });
    
    const data = await r.json();
    if (!r.ok) {
      console.error('[oy-chat] OpenAI error:', r.status, data);
      return res.status(r.status).json({ error: data?.error?.message || 'OpenAI API error' });
    }
    
    const reply = data?.choices?.[0]?.message?.content || '';
    return res.status(200).json({ reply });
    
  } catch (e) {
    console.error('[oy-chat] server error:', e);
    return res.status(500).json({ error: e.message || 'Server error' });
  }
}
