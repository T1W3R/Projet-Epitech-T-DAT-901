from flask import Flask, jsonify
from flask_cors import CORS
from kafka import KafkaConsumer
import duckdb, json, threading, time

app = Flask(__name__)
CORS(app)

# DuckDB persistante
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
    while True:
        try:
            consumer = KafkaConsumer(
                "crypto_prices",
                bootstrap_servers="redpanda:9092",
                value_deserializer=lambda v: json.loads(v.decode("utf-8")),
                consumer_timeout_ms=1000  # ne bloque pas indéfiniment
            )
            print("Consumer connected to Redpanda ✅", flush=True)

            for msg in consumer:
                data = msg.value
                con.execute(
                    "INSERT INTO crypto_prices VALUES (?, ?, ?, ?, NOW())",
                    [data["crypto"], data["price"], data["market_cap"], data["volume"]]
                )
                print("Inserted:", data, flush=True)
        except Exception as e:
            print("Kafka connection error:", e, flush=True)
            time.sleep(5)  # on retente après 5 secondes

# Lancer le thread consumer
threading.Thread(target=consume, daemon=True).start()

@app.route("/last10")
def last10():
    result = con.execute(
        "SELECT * FROM crypto_prices ORDER BY ts DESC LIMIT 10"
    ).fetchall()
    return jsonify(result)

if __name__ == "__main__":
    print("Starting Flask server...", flush=True)
    app.run(host="0.0.0.0", port=5000)
