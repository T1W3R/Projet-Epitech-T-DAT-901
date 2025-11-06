import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

type Point = {
  time: string;
  price: number;
};

const COINS = ["BTC", "ETH", "BNB", "SOL", "ADA"];
const PERIODS: ("day" | "month" | "year")[] = ["day", "month", "year"];

function App() {
  const [coin, setCoin] = useState<string>("BTC");
  const [period, setPeriod] = useState<"day" | "month" | "year">("day");
  const [price, setPrice] = useState<number | null>(null);
  const [history, setHistory] = useState<Point[]>([]);

  // Fetch dernier prix
const fetchPrice = async () => {
  try {
    const res = await fetch(`http://localhost:5000/price/${coin}`);
    const json = await res.json();
    if (!json.error) {
      setPrice(json.price);

      // 🔹 Ajoute un nouveau point dans le graphique
      const now = new Date().toISOString();
      setHistory((prev) => [
        ...prev.slice(-500), // garde un historique max de 500 points
        { time: now, price: json.price },
      ]);
    }
  } catch (err) {
    console.error(err);
  }
};


    // 🔹 Récupération de l’historique selon la période
  const fetchHistory = async () => {
    try {
      const res = await fetch(`http://localhost:5000/history/${period}/${coin}`);
      const json = await res.json();
      if (json.points) setHistory(json.points);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPrice();
    fetchHistory();
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, [coin, period]);

  const chartData = {
    labels: history.map((d) => {
      const dt = new Date(d.time);
      return period === "day"
        ? dt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
        : dt.toLocaleDateString("fr-FR");
    }),
    datasets: [
      {
        label: `${coin} (USD)`,
        data: history.map((d) => d.price),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
        tension: 0.2,
      },
    ],
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>
        {coin} — Prix actuel :{" "}
        {price ? price.toFixed(2) : "..."} $
      </h1>

      <div style={{ marginBottom: "20px" }}>
        <label>
          Crypto :
          <select value={coin} onChange={(e) => setCoin(e.target.value)}>
            {COINS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label style={{ marginLeft: "20px" }}>
          Période :
          <select
            value={period}
            onChange={(e) =>
              setPeriod(e.target.value as "day" | "month" | "year")
            }
          >
            {PERIODS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
      </div>

      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: { legend: { position: "top" } },
          scales: {
            x: { title: { display: true, text: period === "day" ? "Heure" : "Date" } },
            y: { title: { display: true, text: "Prix (USD)" } },
          },
        }}
      />
    </div>
  );
}

export default App;