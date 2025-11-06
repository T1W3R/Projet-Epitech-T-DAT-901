import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

type Point = {
  time: string;
  price: number;
};

function App() {
  const [data, setData] = useState<Point[]>([]);

  // Fonction de récupération des données
  const fetchData = async () => {
    const res = await fetch("http://localhost:5000/btc/history");
    const json = await res.json();
    setData(json);
  };

  // Rafraîchissement toutes les 60s
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>📈 Évolution du prix du BTC (24h)</h1>
      <Line
        data={{
          labels: data.map((d) =>
            new Date(d.time).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })
          ),
          datasets: [
            {
              label: "Prix (USD)",
              data: data.map((d) => d.price),
              borderColor: "rgb(75, 192, 192)",
              fill: false,
              tension: 0.2,
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { display: true, position: "top" },
          },
          scales: {
            x: { title: { display: true, text: "Heure" } },
            y: { title: { display: true, text: "Prix (USD)" } },
          },
        }}
      />
    </div>
  );
}

export default App;
