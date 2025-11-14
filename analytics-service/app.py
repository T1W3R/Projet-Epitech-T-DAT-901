from flask import Flask, jsonify
from flask_cors import CORS
from kafka import KafkaConsumer
import duckdb, json, threading, os
from datetime import datetime
import requests
from dotenv import load_dotenv

app = Flask(__name__)
load_dotenv()
API_KEY = os.getenv("API_KEY")
CORS(app)

# Connexion persistante à DuckDB
con = duckdb.connect('crypto.duckdb')
con.execute("""
CREATE TABLE IF NOT EXISTS crypto_prices (
    crypto TEXT,
    price DOUBLE,
    market_cap DOUBLE,
    volume DOUBLE,
    ts TIMESTAMP
)
""")

def consume():
    consumer = KafkaConsumer(
        "crypto_prices",
        bootstrap_servers="redpanda:9092",
        value_deserializer=lambda v: json.loads(v.decode("utf-8"))
    )
    print("✅ Consumer connected to Redpanda")
    for msg in consumer:
        data = msg.value
        con.execute(
            "INSERT INTO crypto_prices VALUES (?, ?, ?, ?, NOW())",
            [data["crypto"], data["price"], data["market_cap"], data["volume"]]
        )
        print("Inserted:", data)

threading.Thread(target=consume, daemon=True).start()

# Dernier prix
@app.route("/price/<symbol>")
def get_price(symbol):
    print('hello')
    row = con.execute(
        "SELECT price, ts FROM crypto_prices WHERE crypto = ? ORDER BY ts DESC LIMIT 1",
        [symbol.upper()]
    ).fetchone()
    
    if row:
        return jsonify({"crypto": symbol.upper(), "price": row[0], "ts": row[1].isoformat()})
    else:
        return jsonify({"error": "Crypto not found"}), 404
    
@app.route("/history/<period>/<symbol>")
def history(period, symbol):
    """Historique de prix d'une crypto (jour / mois / année)"""

    # 1️⃣ Mapping symbol → id CoinGecko
    id_map = {
        "BTC": "bitcoin",
        "ETH": "ethereum",
        "XRP": "ripple",
        "SOL": "solana",
        "ADA": "cardano",
        "LINK": "chainlink",
        "MANA": "decentraland",
        "AVAX": "avalanche-2",
        "POLYGON": "polygon-ecosystem-token"
    }
    coin_id = id_map.get(symbol.upper(), symbol.lower())

    # 2️⃣ Mapping période → jours
    days_map = {
        "day": 1,
        "month": 30,
        "year": 365
    }
    days = days_map.get(period, 1)

    # 3️⃣ Construire la requête CoinGecko
    url = f"https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart"
    params = {"vs_currency": "eur", "days": days}
    headers = {"x-cg-demo-api-key": API_KEY}

    try:
        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()
        data = response.json()

        prices = data.get("prices", [])
        if not prices:
            return jsonify({"error": "Aucune donnée disponible"}), 404

        # 4️⃣ Échantillonnage selon la période (réduit le nombre de points)
        total = len(prices)
        if period == "day":
            step = max(1, total // 24)     # environ 12 points -> toutes les 2h
        elif period == "month":
            step = max(1, total // 15)     # environ 1 point par 15 jours
        else:  # year
            step = max(1, total // 12)     # environ 1 point par mois

        sampled = prices[::step]

        # 5️⃣ Formatage pour le front-end
        points = [
            {
                "time": datetime.utcfromtimestamp(p[0] / 1000).isoformat(),
                "price": p[1]
            }
            for p in sampled
        ]

        return jsonify({
            "symbol": symbol.upper(),
            "period": period,
            "points": points
        })

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Erreur de requête CoinGecko: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)


