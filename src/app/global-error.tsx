"use client";

// Last-resort boundary for errors in the root layout itself. It replaces the
// whole document, so it can't use the app's CSS — minimal inline styling only.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-Hant">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: "#f6f4ef",
          color: "#23271f",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 360 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px" }}>
            出了點狀況
          </h1>
          <p style={{ color: "#6b6f64", margin: "0 0 20px" }}>
            頁面載入時發生問題，請再試一次。
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              background: "#5e6b4f",
              color: "#fff",
              border: 0,
              borderRadius: 12,
              padding: "12px 24px",
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            重新整理
          </button>
        </div>
      </body>
    </html>
  );
}
