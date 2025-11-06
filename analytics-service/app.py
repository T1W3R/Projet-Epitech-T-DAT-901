from flask import Flask, jsonify
from flask_cors import CORS
from kafka import KafkaConsumer
import duckdb, json, threading, time
from datetime import datetime, timedelta

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

# Route pour les 10 dernières lignes (déjà existante)
@app.route("/last10")
def last10():
    result = con.execute(
        "SELECT * FROM crypto_prices ORDER BY ts DESC LIMIT 10"
    ).fetchall()
    return jsonify(result)

# 🚀 Nouvelle route : historique BTC sur 24h
@app.route("/btc/history")
def btc_history():
    # Récupère toutes les valeurs du BTC depuis les dernières 24h
    one_day_ago = datetime.utcnow() - timedelta(hours=24)
    query = """
        SELECT ts, price
        FROM crypto_prices
        WHERE crypto = 'BTC' AND ts >= ?
        ORDER BY ts ASC
    """
    rows = con.execute(query, [one_day_ago]).fetchall()
    
    # Structure les données pour le front
    data = [{"time": r[0].isoformat(), "price": r[1]} for r in rows]
    return jsonify(data)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
