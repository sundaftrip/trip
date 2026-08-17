export default function WebsiteLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Memuat halaman"
      style={{
        minHeight: "100svh",
        boxSizing: "border-box",
        padding: "116px 20px 72px",
        background: "#FFFFFF",
        color: "#132b3a",
      }}
    >
      <div style={{ width: "min(100%, 760px)", margin: "0 auto" }}>
        <p
          role="status"
          style={{
            margin: "0 0 18px",
            color: "#075d63",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: ".14em",
          }}
        >
          MEMUAT INFORMASI TERBARU
        </p>
        <div
          aria-hidden="true"
          style={{
            width: "72%",
            height: 42,
            borderRadius: 8,
            background: "#e8eeee",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            width: "100%",
            height: 220,
            marginTop: 28,
            borderRadius: 18,
            background: "#f1f5f4",
          }}
        />
      </div>
    </main>
  );
}
