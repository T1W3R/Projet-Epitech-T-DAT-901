from flask import Flask, jsonify
from flask_cors import CORS
from kafka import KafkaConsumer
import duckdb, json, threading
from datetime import datetime
import requests

app = Flask(__name__)
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
def history(symbol, period):
    """Historique de prix sur 1 jour / 30 jours / 365 jours"""
    id_map = {
        "BTC": "bitcoin",
        "ETH": "ethereum",
        "BNB": "binancecoin",
        "SOL": "solana",
        "ADA": "cardano"
    }
    coin_id = id_map.get(symbol.upper(), symbol.lower())

    # On adapte les périodes
    days_map = {
        "day": 1,
        "month": 30,
        "year": 365
    }
    days = days_map.get(period, 1)

    url = f"https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart"
    params = {"vs_currency": "eur", "days": days}
    headers = {"x-cg-demo-api-key": "CG-xY4ZEujRYTJ2iDUEziUq8rqD"}

    try:
        response = requests.get(url, params=params, headers=headers).json()
        prices = [
            {
                "time": datetime.utcfromtimestamp(p[0] / 1000).isoformat(),
                "price": p[1]
            }
            for p in response["prices"]
        ]
        return jsonify({"symbol": symbol.upper(), "period": period, "points": prices})
    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)


