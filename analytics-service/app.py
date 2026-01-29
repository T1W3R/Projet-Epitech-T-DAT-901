# app.py
import json
import threading
import time
from datetime import datetime
from flask import Flask
from flask_socketio import SocketIO
from kafka import KafkaConsumer
import os

# ----------------------------
# CONFIG
# ----------------------------
REDPANDA_HOST = os.environ.get("REDPANDA_HOST", "localhost:19092")
TOPIC = "crypto-prices"
GROUP_ID = "crypto-consumers-ws"
BUFFER_SIZE = 100  # nombre max de messages à bufferiser si aucun client n'est connecté

# ----------------------------
# APP + SOCKET.IO
# ----------------------------
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")

# ----------------------------
# BUFFER pour messages avant qu'un client se connecte
# ----------------------------
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


# ----------------------------
# Lancement du thread Kafka
# ----------------------------
def start_kafka_thread():
    t = threading.Thread(target=kafka_listener, daemon=True)
    t.start()
    print("🚀 Thread Kafka lancé", flush=True)

start_kafka_thread()

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
