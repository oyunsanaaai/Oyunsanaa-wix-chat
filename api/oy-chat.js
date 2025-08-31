// /api/oy-chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
 
  try {
    const { model = 'gpt-4o-mini', msg = '', chatSlug = '', history = [] } = req.body || {};
 
    if (!process.env.OPENAI_API_KEY) {
      return res.status(200).json({
        reply: `⚠️ OPENAI_API_KEY тохируулаагүй байна. Vercel dashboard-аас нэмнэ үү.`,
      });
    }

    // Model нэрүүдийг засварлах
    const validModels = {
      'gpt-3.5-turbo': 'gpt-3.5-turbo',
      'gpt-4': 'gpt-4-turbo',           // засварлав
      'gpt-4-turbo': 'gpt-4-turbo', 
      'gpt-4o': 'gpt-4o',
      'gpt-4o-mini': 'gpt-4o-mini',
      'gpt-4-mini': 'gpt-4o-mini'       // засварлав
    };
    
    const selectedModel = validModels[model] || 'gpt-4o-mini';
 
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel,              // засварласан model ашиглах
        temperature: 0.7,
        messages: [
          { role: 'system', content: 'Та Монгол хэлээр товч, эелдэг, ойлгомжтой хариулна.' },
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
