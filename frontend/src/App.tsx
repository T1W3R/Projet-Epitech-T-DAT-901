import { useEffect, useState } from "react";

type CryptoNews = {
  crypto: string;
  price: number;
  ts: string; // timestamp en string
};

function App() {
  const [news, setNews] = useState<CryptoNews[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/last10")
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((row: any[]) => ({
          crypto: row[0],
          price: row[1],
          ts: row[2],
        }));
        setNews(mapped);
      })
            .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Dernières news crypto</h1>
      <ul>
        {news.map((n, idx) => (
          <li key={idx}>
            <strong>{n.crypto}</strong> : ${n.price} - {new Date(n.ts).toLocaleTimeString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
