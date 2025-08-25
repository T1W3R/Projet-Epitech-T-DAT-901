from kafka import KafkaProducer
import json
import time

producer = KafkaProducer(
    bootstrap_servers="kafka:9092",
    value_serializer=lambda v: json.dumps(v).encode("utf-8")
)

TOPIC = "crypto_news"

while True:
    msg = {"crypto": "BTC", "price": 68000, "time": time.time()}
    producer.send(TOPIC, msg)
    time.sleep(5)
