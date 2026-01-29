import time
import json
import os
from typing import List

import feedparser
from kafka import KafkaProducer


RSS_TOPIC = os.getenv("RSS_TOPIC", "rss_alerts")
KAFKA_BROKER = os.getenv("KAFKA_BROKER", "redpanda:9092")


def get_feeds() -> List[str]:
    """
    Liste des flux RSS à suivre.
    On garde ça simple et configurable plus tard si besoin.
    """
    default_feeds = [
        # 🔹 Crypto / blockchain
        "https://www.coindesk.com/arc/outboundfeeds/rss/",
        "https://cointelegraph.com/rss",
        "https://news.bitcoin.com/feed/",
        "https://www.cryptonewsz.com/feed/",
        "https://rss.app/feeds/1dH5gN4zQk4eWJvG.xml",  # Binance Blog (via rss.app)
        "https://rss.app/feeds/5b9c1P3smgI0zqW2.xml",  # Coinbase Blog (via rss.app)

        # 🔹 Marchés / finance
        "https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best",
        "https://www.investing.com/rss/news_25.rss",  # Crypto investing
        "https://www.investing.com/rss/news_1.rss",   # Marchés globaux

        # 🔹 Macro / éco (pour contexte marché)
        "https://www.ft.com/?format=rss",
        "https://www.bloomberg.com/feed/podcast/etf-report.xml",
    ]
    extra = os.getenv("EXTRA_RSS_FEEDS")
    if extra:
        default_feeds.extend([u.strip() for u in extra.split(",") if u.strip()])
    return default_feeds


def create_producer() -> KafkaProducer:
    return KafkaProducer(
        bootstrap_servers=KAFKA_BROKER,
        value_serializer=lambda v: json.dumps(v).encode("utf-8"),
        acks="all",
        retries=5,
        linger_ms=50,
    )


def main() -> None:
    feeds = get_feeds()
    producer = create_producer()

    print(f"RSS Scraper connected to Redpanda ✅ (topic={RSS_TOPIC})")
    print("Following feeds:")
    for f in feeds:
        print(" -", f)

    # On garde un petit cache des IDs déjà vus pour éviter les doublons
    seen_ids = set()

    poll_interval = int(os.getenv("RSS_POLL_INTERVAL", "60"))

    while True:
        try:
            for feed_url in feeds:
                parsed = feedparser.parse(feed_url)
                if parsed.bozo:
                    # flux invalide ou temporairement cassé
                    print(f"[RSS] Problème avec le flux {feed_url}: {parsed.bozo_exception}")
                    continue

                for entry in parsed.entries:
                    # On essaie de construire un identifiant stable
                    entry_id = getattr(entry, "id", None) or getattr(entry, "link", None)
                    if not entry_id:
                        # on fallback sur titre+date
                        entry_id = f"{getattr(entry, 'title', '')}_{getattr(entry, 'published', '')}"

                    if entry_id in seen_ids:
                        continue
                    seen_ids.add(entry_id)

                    msg = {
                        "id": entry_id,
                        "title": getattr(entry, "title", "Sans titre"),
                        "summary": getattr(entry, "summary", "")[:500],
                        "link": getattr(entry, "link", ""),
                        "published": getattr(entry, "published", ""),
                        "source": parsed.feed.get("title", feed_url),
                        "time": time.time(),
                    }

                    try:
                        producer.send(RSS_TOPIC, msg)
                        print("[RSS] Sent:", msg["title"])
                    except Exception as e:
                        print("[RSS] Erreur Kafka pour", msg.get("title"), e)

            producer.flush()
            time.sleep(poll_interval)
        except Exception as e:
            print("[RSS] Erreur générale:", e)
            time.sleep(10)


if __name__ == "__main__":
    main()
