// app/api/oy-chat/route.js эсвэл api/oy-chat.js
export async function POST(request) {
  try {
    const body = await request.json();
    const { msg = '', chatSlug = '', history = [] } = body;
    
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return Response.json({ error: 'No API key' }, { status: 500 });
    }

    const last = (history || []).slice(-10).map(m => ({
      role: m.who === 'user' ? 'user' : 'assistant',
      content: String(m.html || '').replace(/<[^>]+>/g, '')
    }));

    const system = `Та "Оюунсанаа" нэртэй зөвлөгч. Хэрэглэгч: ${chatSlug}. Монголоор товч хариул.`;

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
          { role: 'user', content: String(msg) }
        ]
      })
    });

    const data = await r.json();
    const reply = data?.choices?.[0]?.message?.content || 'Алдаа гарлаа.';
    
    return Response.json({ reply });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
