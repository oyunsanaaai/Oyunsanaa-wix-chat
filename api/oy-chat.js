// app/api/oy-chat/route.js
export async function POST(req) {
  try {
    const { model, msg, history = [] } = await req.json();

    const MAP = new Map([
      ['gpt-4o', 'gpt-4o'],
      ['gpt-4o-mini', 'gpt-4o-mini'],
      ['gpt-3.5-turbo', 'gpt-4o'], // 3.5 ирвэл шууд 4o
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
    if (!r.ok) {
      return new Response(JSON.stringify({ error: data?.error?.message || 'OpenAI API error' }), { status: r.status });
    }

    const reply = data?.choices?.[0]?.message?.content || '';
    return Response.json({ reply });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || 'Server error' }), { status: 500 });
  }
}

// (Сануулахад GET → 405 буцаавал OK)
export async function GET() {
  return new Response('Method Not Allowed', { status: 405 });
}
