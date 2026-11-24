const MODES = {
  hint: "只給提示：指出該用的定律與關鍵觀念，列出已知量與未知量，但不要算出最終答案。",
  full: "給完整解答：列出已知量、選用的定律與公式、逐步計算過程（含單位），最後寫出答案並注意有效位數。",
  check: "檢查使用者的解法：指出哪一步正確、哪一步有錯，並說明錯誤原因與正確做法。",
};

export async function POST(req) {
  const apiKey = req.headers.get("x-openai-key");
  if (!apiKey || !apiKey.startsWith("sk-")) {
    return Response.json({ error: "請先輸入有效的 OpenAI API Key（以 sk- 開頭）。" }, { status: 400 });
  }
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "請求格式錯誤。" }, { status: 400 });
  }
  const question = String(body.question || "").trim();
  const mode = MODES[body.mode] ? body.mode : "hint";
  if (!question) return Response.json({ error: "請輸入題目。" }, { status: 400 });
  if (question.length > 3000) return Response.json({ error: "題目太長了（上限 3000 字）。" }, { status: 400 });

  let r;
  try {
    r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "你是大學普通物理的助教，用繁體中文回答。所有數值都要附單位，公式用純文字表示（例如 v = v0 + a t）。" +
            MODES[mode],
        },
        { role: "user", content: question },
      ],
    }),
    });
  } catch {
    return Response.json({ error: "無法連線到 OpenAI，請稍後再試。" }, { status: 502 });
  }
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = data?.error?.message || `OpenAI 回傳錯誤（${r.status}）`;
    return Response.json({ error: msg }, { status: r.status === 401 ? 401 : 502 });
  }
  return Response.json({ answer: data.choices?.[0]?.message?.content || "（沒有回應）" });
}
