# app.py
import json
import threading
from datetime import datetime
from flask_socketio import SocketIO
from kafka import KafkaConsumer
import duckdb, json, threading, os, time
import os
import requests
from flask_cors import CORS
from dotenv import load_dotenv
from flask import Flask, jsonify, Response, stream_with_context


# ----------------------------
# CONFIG
# ---------------------------
load_dotenv()
REDPANDA_HOST = os.environ.get("REDPANDA_HOST", "localhost:19092")
TOPIC = "crypto-prices"
GROUP_ID = "crypto-consumers-ws"
RSS_TOPIC = os.getenv("RSS_TOPIC", "rss_alerts")
BUFFER_SIZE = 100  # nombre max de messages à bufferiser si aucun client n'est connecté

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

# ----------------------------
# APP + SOCKET.IO
# ----------------------------
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")

# ----------------------------
# BUFFER pour messages avant qu'un client se connecte
# ----------------------------
# Mémoire temporaire pour les événements RSS récents (affichage temps réel)
RSS_MAX_EVENTS = 100
rss_events = []
rss_lock = threading.Lock()
message_buffer = []

# ----------------------------
# Kafka Consumer Thread
# ----------------------------
def kafka_listener():
    global message_buffer
    try:
        print("📡 Connexion au consumer Kafka...", flush=True)
        consumer = KafkaConsumer(
            TOPIC,
            bootstrap_servers=[REDPANDA_HOST],
            group_id=GROUP_ID,
            auto_offset_reset="latest",
            enable_auto_commit=True,
            value_deserializer=lambda v: json.loads(v.decode("utf-8")),
            key_deserializer=lambda k: k.decode("utf-8") if k else None
        )
        print("✔ Consumer Kafka connecté", flush=True)

        # boucle infinie de lecture
        for msg in consumer:
            data = msg.value
            data['received_at'] = datetime.utcnow().isoformat()
            print(f"📨 Message reçu depuis Kafka : {data}", flush=True)

            # si aucun client connecté, on bufferise
            if not socketio.server.manager.rooms.get('/', {}):
                message_buffer.append(data)
                if len(message_buffer) > BUFFER_SIZE:
                    message_buffer.pop(0)
            else:
                socketio.emit("crypto_update", data)

    except Exception as e:
        print(f"❌ Erreur dans le consumer Kafka : {e}", flush=True)

def consume_rss():
    """
    Consumer dédié aux flux RSS sur Kafka.
    On garde en mémoire uniquement les derniers événements pour le front.
    """
    consumer = KafkaConsumer(
        RSS_TOPIC,
        bootstrap_servers="redpanda:9092",
        value_deserializer=lambda v: json.loads(v.decode("utf-8"))
    )
    print(f"✅ RSS consumer connected to Redpanda (topic={RSS_TOPIC})")
    global rss_events
    for msg in consumer:
        data = msg.value
        with rss_lock:
            rss_events.append(data)
            if len(rss_events) > RSS_MAX_EVENTS:
                rss_events = rss_events[-RSS_MAX_EVENTS:]
        print("Inserted RSS event:", data.get("title", "Sans titre"))


# ----------------------------
# Lancement du thread Kafka
# ----------------------------
def start_kafka_thread():
    prices = threading.Thread(target=kafka_listener, daemon=True)
    rss = threading.Thread(target=consume_rss, daemon=True)
    rss.start()
    prices.start()
    print("🚀 Thread Kafka lancé", flush=True)

start_kafka_thread()

@app.route("/rss/latest")
def rss_latest():
    """Retourne les derniers événements RSS pour debug / fallback."""
    with rss_lock:
        latest = list(rss_events)
    return jsonify(latest)


@app.route("/rss/stream")
def rss_stream():
    """
    Flux Server-Sent Events (SSE) pour pousser les news/alertes RSS en continu.
    Le front se connecte dessus avec EventSource.
    """

    @stream_with_context
    def event_stream():
        last_index = 0
        while True:
            with rss_lock:
                new_events = rss_events[last_index:]
                last_index = len(rss_events)

            for event in new_events:
                yield f"data: {json.dumps(event)}\n\n"

            time.sleep(1)

    return Response(event_stream(), mimetype="text/event-stream")

# ----------------------------
# WebSocket Events
# ----------------------------
@socketio.on("connect")
def on_connect():
    print("🔌 Client WebSocket connecté", flush=True)
    global message_buffer
    if message_buffer:
        print(f"📦 Envoi de {len(message_buffer)} messages bufferisés au client", flush=True)
        for msg in message_buffer:
            socketio.emit("crypto_update", msg)
        message_buffer = []

@socketio.on("disconnect")
def on_disconnect():
    print("❌ Client WebSocket déconnecté", flush=True)

# ----------------------------
# Lancement du serveur
# ----------------------------
if __name__ == "__main__":
    print("🌐 WebSocket Server en démarrage sur port 5000...")
    socketio.run(app, host="0.0.0.0", port=5000, allow_unsafe_werkzeug=True)
