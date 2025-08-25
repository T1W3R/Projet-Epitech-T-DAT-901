from flask import Flask, jsonify
from flask_cors import CORS
from kafka import KafkaConsumer
import duckdb, json, threading, time

app = Flask(__name__)
CORS(app)

# Connexion à DuckDB persistante
con = duckdb.connect('crypto.duckdb')
con.execute("""
CREATE TABLE IF NOT EXISTS news (
    crypto TEXT, 
    price DOUBLE, 
    ts TIMESTAMP
)
""")

def consume():
    while True:
        try:
            consumer = KafkaConsumer(
                "crypto_news",
                bootstrap_servers="kafka:9092",
                value_deserializer=lambda v: json.loads(v.decode("utf-8"))
            )
            for msg in consumer:
                data = msg.value
                con.execute(
                    "INSERT INTO news VALUES (?, ?, NOW())",
                    [data["crypto"], data["price"]]
                )
                print("Inserted from Kafka into DuckDB:", data)
        except Exception as e:
            print("Kafka error:", e)
            time.sleep(5)

threading.Thread(target=consume, daemon=True).start()

@app.route("/last10")
def last10():
    result = con.execute("SELECT * FROM news ORDER BY ts DESC LIMIT 10").fetchall()
    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
