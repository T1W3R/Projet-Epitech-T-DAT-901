import requests, json, time
from kafka import KafkaProducer

TOPIC = "crypto_prices"

producer = KafkaProducer(
    bootstrap_servers="redpanda:9092",
    value_serializer=lambda v: json.dumps(v).encode("utf-8"),
    acks='all',       # attendre la confirmation
    retries=5,
    linger_ms=10
)

print("Scraper connected to Redpanda ✅")

while True:
    try:
        response = requests.get(
            "https://api.coingecko.com/api/v3/coins/markets",
            params={
                "vs_currency": "usd",
                "order": "market_cap_desc",
                "per_page": 100,
                "page": 1,
                "sparkline": "false"
            }
        ).json()

        for coin in response:
            msg = {
                "crypto": coin["symbol"].upper(),
                "price": coin["current_price"],
                "market_cap": coin["market_cap"],
                "volume": coin["total_volume"],
                "time": time.time()
            }
            print("Message:", msg, flush=True)
            try:
                producer.send(TOPIC, msg)
            except Exception as e:
                print("Erreur Kafka pour", coin["symbol"], e)

        producer.flush()
        print(f"Sent {len(response)} coins to Kafka")
        time.sleep(60)  # update toutes les minutes
    except Exception as e:
        print("Error fetching data:", e)
        time.sleep(10)
