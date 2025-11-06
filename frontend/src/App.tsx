import { useEffect, useState } from "react";

type CryptoData = {
  crypto: string;
  price: number;
  market_cap: number;
  volume: number;
  ts: string; // timestamp en string
};

function App() {
  const [news, setNews] = useState<CryptoData[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/last10")
      .then((res) => res.json())
      .then((data) => {
        // mapping depuis ton tableau de tableaux
        const mapped = data.map((row: any[]) => ({
          crypto: row[0],
          price: row[1],
          market_cap: row[2] || 0,  // si pas encore disponible, mettre 0
          volume: row[3] || 0,      // si pas encore disponible, mettre 0
          ts: row[4] || new Date().toISOString(),
        }));
        setNews(mapped);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Dernières crypto</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Crypto</th>
            <th>Price (USD)</th>
            <th>Market Cap</th>
            <th>Volume</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {news.map((n, idx) => (
            <tr key={idx} style={{ textAlign: "center", borderBottom: "1px solid #ccc" }}>
              <td>{n.crypto}</td>
              <td>${n.price.toLocaleString()}</td>
              <td>${n.market_cap.toLocaleString()}</td>
              <td>${n.volume.toLocaleString()}</td>
              <td>{new Date(n.ts).toLocaleTimeString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
