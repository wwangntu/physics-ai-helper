export const metadata = {
  title: "普物解題小幫手 | BYOK",
  description: "輸入普物題目，AI 引導你一步步解題（自備 OpenAI API Key）",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, 'Noto Sans TC', sans-serif", background: "#f4f6fb", color: "#1f2937" }}>
        {children}
      </body>
    </html>
  );
}
