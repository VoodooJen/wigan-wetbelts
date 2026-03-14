export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0b0b0b", color: "#fff", padding: "40px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "48px", marginBottom: "16px" }}>
          Wigan Wetbelts
        </h1>

        <p style={{ fontSize: "18px", color: "#cfcfcf", marginBottom: "24px" }}>
          Specialist Wet Belt & Timing Belt Replacement
        </p>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <a
            href="/book"
            style={{
              background: "#ffffff",
              color: "#000000",
              padding: "12px 18px",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: 600
            }}
          >
            Book Appointment
          </a>

          <a
            href="/reviews"
            style={{
              border: "1px solid #333",
              color: "#ffffff",
              padding: "12px 18px",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: 600
            }}
          >
            Reviews
          </a>
        </div>
      </div>
    </main>
  );
}