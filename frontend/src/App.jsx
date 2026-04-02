import { useState, useEffect } from "react";

function App() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [urls, setUrls] = useState([]);
  const [customAlias, setCustomAlias] = useState("");

  // 🔥 Fetch all URLs
  const fetchUrls = async () => {
    const res = await fetch("http://localhost:5000/urls");
    const data = await res.json();
    setUrls(data);
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  // 🔗 Shorten URL
  const handleShorten = async () => {
    const res = await fetch("http://localhost:5000/shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        customAlias: customAlias || undefined,
      }),
    });

    const data = await res.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    setShortUrl(data.shortUrl);
    setCustomAlias("");
    fetchUrls();
  };

  // 📊 Analytics
  const getAnalyticsFromCode = async (code) => {
    const res = await fetch(`http://localhost:5000/analytics/${code}`);
    const data = await res.json();
    setAnalytics(data);
  };

  // ❌ Delete URL
  const deleteUrl = async (code) => {
    if (!window.confirm("Delete this link?")) return;

    await fetch(`http://localhost:5000/delete/${code}`, {
      method: "DELETE",
    });

    fetchUrls();
    setAnalytics(null);
  };

  // 📋 Copy link
  const copyToClipboard = (code) => {
    const fullUrl = `http://localhost:5000/${code}`;
    navigator.clipboard.writeText(fullUrl);
    alert("Copied to clipboard!");
  };

  // 🎨 Styles
  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "8px",
    border: "1px solid #475569",
    background: "#0f172a",
    color: "white",
  };

  const primaryButton = {
    width: "100%",
    padding: "10px",
    background: "#22c55e",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  };

  const actionButton = (color) => ({
    background: color,
    color: "white",
    border: "none",
    padding: "6px 10px",
    margin: "4px",
    borderRadius: "6px",
    cursor: "pointer",
  });

  const thStyle = {
    padding: "12px",
    color: "#cbd5f5",
  };

  const tdStyle = {
    padding: "10px",
    borderTop: "1px solid #334155",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#e2e8f0",
        padding: "30px",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        🔗 URL Shortener Dashboard
      </h1>

      {/* Input Card */}
      <div
        style={{
          background: "#1e293b",
          padding: "20px",
          borderRadius: "12px",
          maxWidth: "600px",
          margin: "auto",
          boxShadow: "0 0 20px rgba(0,0,0,0.3)",
        }}
      >
        <input
          type="text"
          placeholder="Enter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Custom alias (optional)"
          value={customAlias}
          onChange={(e) => setCustomAlias(e.target.value)}
          style={inputStyle}
        />

        <button onClick={handleShorten} style={primaryButton}>
          Shorten URL
        </button>

        {shortUrl && (
          <p style={{ marginTop: "15px" }}>
            Latest:{" "}
            <a
              href={shortUrl}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#38bdf8" }}
            >
              {shortUrl}
            </a>
          </p>
        )}
      </div>

      {/* Table */}
      <div style={{ marginTop: "40px" }}>
        <h2 style={{ textAlign: "center" }}>📋 All Links</h2>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "20px",
              background: "#1e293b",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <thead style={{ background: "#334155" }}>
              <tr>
                <th style={thStyle}>Code</th>
                <th style={thStyle}>Short URL</th>
                <th style={thStyle}>Original</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {urls.map((item) => (
                <tr key={item.short_code} style={{ textAlign: "center" }}>
                  <td style={tdStyle}>{item.short_code}</td>

                  <td style={tdStyle}>
                    <a
                      href={`http://localhost:5000/${item.short_code}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#38bdf8" }}
                    >
                      {`http://localhost:5000/${item.short_code}`}
                    </a>
                  </td>

                  <td style={tdStyle}>{item.original_url}</td>

                  <td style={tdStyle}>
                    <button
                      onClick={() => getAnalyticsFromCode(item.short_code)}
                      style={actionButton("#22c55e")}
                    >
                      Analytics
                    </button>

                    <button
                      onClick={() => deleteUrl(item.short_code)}
                      style={actionButton("#ef4444")}
                    >
                      Delete
                    </button>

                    <button
                      onClick={() => copyToClipboard(item.short_code)}
                      style={actionButton("#3b82f6")}
                    >
                      Copy
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics */}
      {analytics && (
        <div
          style={{
            marginTop: "30px",
            background: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
            maxWidth: "400px",
            marginInline: "auto",
            textAlign: "center",
          }}
        >
          <h3>📊 Analytics</h3>
          <p>Code: {analytics.shortCode}</p>
          <p>Total Clicks: {analytics.totalClicks}</p>
        </div>
      )}
    </div>
  );
}

export default App;
