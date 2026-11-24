"use client";
import { useEffect, useState } from "react";

const EXAMPLES = [
  "一顆球從 20 m 高的地方自由落下，忽略空氣阻力，多久會落地？落地速度多少？",
  "質量 2 kg 的木塊放在傾角 30° 的斜面上，動摩擦係數 0.2，求下滑的加速度。",
  "長度 1.0 m 的單擺，在地球表面的週期是多少？",
];

const card = { background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,.06)", marginBottom: 16 };
const input = { width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 10, border: "1px solid #d1d5db", fontSize: 15 };

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [remember, setRemember] = useState(false);
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState("hint");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const k = localStorage.getItem("openai_key");
      if (k) { setApiKey(k); setRemember(true); }
    } catch {}
  }, []);

  function saveKey(k, r) {
    try { r ? localStorage.setItem("openai_key", k) : localStorage.removeItem("openai_key"); } catch {}
  }

  async function solve() {
    setError(""); setAnswer(""); setLoading(true);
    saveKey(apiKey, remember);
    try {
      const res = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-openai-key": apiKey.trim() },
        body: JSON.stringify({ question, mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "發生錯誤");
      setAnswer(data.answer);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: 28, marginBottom: 4 }}>⚛️ 普物解題小幫手</h1>
      <p style={{ color: "#6b7280", marginTop: 0 }}>輸入普通物理題目，AI 會依照你選的模式給提示、完整解答，或幫你檢查解法。</p>

      <section style={card}>
        <h2 style={{ fontSize: 17, marginTop: 0 }}>① 輸入你的 OpenAI API Key（BYOK）</h2>
        <input type="password" placeholder="sk-..." value={apiKey} onChange={(e) => setApiKey(e.target.value)} style={input} autoComplete="off" />
        <label style={{ display: "block", marginTop: 8, fontSize: 14, color: "#4b5563" }}>
          <input type="checkbox" checked={remember} onChange={(e) => { setRemember(e.target.checked); saveKey(apiKey, e.target.checked); }} /> 記在這個瀏覽器（只存在你的電腦）
        </label>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 0 }}>金鑰只會隨這次請求送到本站後端，轉給 OpenAI 使用，不會被儲存在伺服器上。</p>
      </section>

      <section style={card}>
        <h2 style={{ fontSize: 17, marginTop: 0 }}>② 輸入題目</h2>
        <textarea rows={5} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="把題目貼在這裡；選「檢查我的解法」時，也把你的計算過程一起貼上。" style={{ ...input, resize: "vertical" }} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => setQuestion(ex)} style={{ border: "1px solid #c7d2fe", background: "#eef2ff", color: "#3730a3", borderRadius: 999, padding: "4px 12px", cursor: "pointer", fontSize: 13 }}>範例 {i + 1}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap", fontSize: 15 }}>
          {[["hint", "只給提示"], ["full", "完整解答"], ["check", "檢查我的解法"]].map(([v, label]) => (
            <label key={v}><input type="radio" name="mode" value={v} checked={mode === v} onChange={() => setMode(v)} /> {label}</label>
          ))}
        </div>
        <button onClick={solve} disabled={loading || !apiKey || !question.trim()} style={{ marginTop: 16, width: "100%", padding: 12, borderRadius: 10, border: "none", background: loading || !apiKey || !question.trim() ? "#9ca3af" : "#4f46e5", color: "#fff", fontSize: 16, cursor: "pointer" }}>
          {loading ? "AI 思考中…" : "送出"}
        </button>
      </section>

      {error && <section style={{ ...card, background: "#fef2f2", color: "#b91c1c" }}>⚠️ {error}</section>}
      {answer && (
        <section style={card}>
          <h2 style={{ fontSize: 17, marginTop: 0 }}>AI 回覆</h2>
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.75 }}>{answer}</div>
        </section>
      )}
      <footer style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", marginTop: 24 }}>Next.js API Route × OpenAI · BYOK 模式</footer>
    </main>
  );
}
