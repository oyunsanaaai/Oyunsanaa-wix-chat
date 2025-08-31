// pages/api/oy-chat.js
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { model, msg, history = [], chatSlug } = req.body || {};

    const MAP = new Map([
      ["gpt-4o", "gpt-4o"],
      ["gpt-4o-mini", "gpt-4o-mini"],
      ["gpt-3.5-turbo", "gpt-4o-mini"],
    ]);
    const resolvedModel = MAP.get(model) || "gpt-4o-mini";

    const messages = [];
    for (const m of history) {
      const role = m.who === "user" ? "user" : "assistant";
      const content = String(m.html ?? "").replace(/<[^>]+>/g, "");
      messages.push({ role, content });
    }
    messages.push({ role: "user", content: String(msg ?? "") });
    messages.unshift({
      role: "system",
      content:
        `You are Oyunsanaa's helpful Mongolian assistant. ` +
        (chatSlug ? `Chat slug: ${chatSlug}.` : ""),
    });

    const r = await openai.chat.completions.create({
      model: resolvedModel,
      messages,
      temperature: 0.2,
    });

    const reply = r.choices?.[0]?.message?.content ?? "";
    return res.status(200).json({ reply });
  } catch (e) {
    console.error("[oy-chat] server error:", e);
    return res.status(500).json({ error: e?.message || "Server error" });
  }
}
