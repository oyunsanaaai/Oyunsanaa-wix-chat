// /api/oy-chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { model = 'gpt-4o-mini', msg = '', chatSlug = '', history = [] } = req.body || {};
    
    console.log(`🔥 API Request - Model: ${model}, Chat: ${chatSlug}`);
    
    // API key шалгах
    if (!process.env.OPENAI_API_KEY) {
      return res.status(200).json({
        reply: `⚠️ API key тохируулаагүй. Vercel dashboard-аас OPENAI_API_KEY нэмнэ үү.`,
      });
    }

    // Model нэр засварлах  
    const validModels = {
      'gpt-3.5-turbo': 'gpt-3.5-turbo',
      'gpt-4': 'gpt-4-turbo',           // засварлав
      'gpt-4-turbo': 'gpt-4-turbo',
      'gpt-4o': 'gpt-4o',
      'gpt-4o-mini': 'gpt-4o-mini',
      'gpt-4-mini': 'gpt-4o-mini'       // засварлав
    };
    
    const selectedModel = validModels[model] || 'gpt-4o-mini';

    // History боловсруулах
    const processedHistory = (history || [])
      .slice(-10)
      .map(h => ({
        role: h.who === 'user' ? 'user' : 'assistant',
        content: h.text || h.html || h.content || ''
      }));

    // OpenAI API дуудах
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel,
        temperature: 0.7,
        max_tokens: 1000,
        messages: [
          { role: 'system', content: 'Та Монгол хэлээр товч, эелдэг хариулна.' },
          ...processedHistory,
          { role: 'user', content: msg }
        ],
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API Error:', data);
      let errorMessage = 'API алдаа';
      
      if (data?.error?.code === 'invalid_api_key') {
        errorMessage = 'API key буруу байна';
      } else if (data?.error?.code === 'insufficient_quota') {
        errorMessage = 'API quota дууссан';
      }
      
      return res.status(500).json({ error: errorMessage });
    }

    const reply = data.choices?.[0]?.message?.content?.trim() || 'Хариу олдсонгүй.';
    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}
Энэ л кодыг танай /api/oy-chat.js файлд хуулж тавиад Vercel дээр OPENAI_API_KEY нэмбэл ажиллана! 🚀RetryClaude can make mistakes. Please double-check responses.Research Sonnet 4
