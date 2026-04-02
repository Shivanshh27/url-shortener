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
      alert(data.error); // show duplicate alias error
      return;
    }

    setShortUrl(data.shortUrl);

    // reset input
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

    fetchUrls(); // refresh list
    setAnalytics(null); // clear analytics
  };

  // 📋 Copy link
  const copyToClipboard = (code) => {
    const fullUrl = `http://localhost:5000/${code}`;
    navigator.clipboard.writeText(fullUrl);
    alert("Copied to clipboard!");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>URL Shortener Dashboard</h1>

      {/* Input */}
      <input
        type="text"
        placeholder="Enter URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <input
        type="text"
        placeholder="Custom alias (optional)"
        value={customAlias}
        onChange={(e) => setCustomAlias(e.target.value)}
      />

      <button onClick={handleShorten}>Shorten</button>

      {/* Latest */}
      {shortUrl && (
        <p>
          Latest:{" "}
          <a href={shortUrl} target="_blank" rel="noreferrer">
            {shortUrl}
          </a>
        </p>
      )}

      {/* Table */}
      <h2>All Links</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Short Code</th>
            <th>Short URL</th>
            <th>Original URL</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {urls.map((item) => (
            <tr key={item.short_code}>
              <td>{item.short_code}</td>

              {/* 🔗 Short URL */}
              <td>
                <a
                  href={`http://localhost:5000/${item.short_code}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {`http://localhost:5000/${item.short_code}`}
                </a>
              </td>

              <td>{item.original_url}</td>

              <td>
                <button onClick={() => getAnalyticsFromCode(item.short_code)}>
                  Analytics
                </button>

                <button
                  onClick={() => deleteUrl(item.short_code)}
                  style={{ marginLeft: "10px" }}
                >
                  Delete
                </button>

                <button
                  onClick={() => copyToClipboard(item.short_code)}
                  style={{ marginLeft: "10px" }}
                >
                  Copy
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Analytics */}
      {analytics && (
        <div>
          <h3>Analytics for {analytics.shortCode}</h3>
          <p>Total Clicks: {analytics.totalClicks}</p>
        </div>
      )}
    </div>
  );
}

export default App;
