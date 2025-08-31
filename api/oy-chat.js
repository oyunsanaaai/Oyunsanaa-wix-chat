export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    let { model, msg, history = [] } = req.body || {};

   const MAP = new Map([
  ['gpt-4o', 'gpt-4o'],
  ['gpt-4o-mini', 'gpt-4o-mini'],
  ['gpt-3.5-turbo', 'gpt-4o'],  // ⚠️ 3.5 ирвэл шууд 4o болгож байна
]);
const resolvedModel = MAP.get(model) || 'gpt-4o';
    // 🔎 Лог (Vercel Logs-д харагдана)
    console.log('[oy-chat] model:', model, '->', resolvedModel);

    // Түүхийн форматыг chat/completions-д тааруулна
    const messages = [];
    for (const m of history) {
      // history: [{who:'user'|'bot', html:'...'}] гэж хадгалдаг байсан
      const role = m.who === 'user' ? 'user' : 'assistant';
      const content = String(m.html || '').replace(/<[^>]+>/g, ''); // энгийн safety
      messages.push({ role, content });
    }
    messages.push({ role: 'user', content: String(msg || '') });

    const r = await fetch(`${OY_API_BASE}/api/oy-chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: el.modelSelect?.value || 'gpt-4o-mini',
    msg: t,
    chatSlug: state.current || '',
    history: hist
  })
});
5
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
