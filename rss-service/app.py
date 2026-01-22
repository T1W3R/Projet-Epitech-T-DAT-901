import requests, json, time
from kafka import KafkaProducer
import feedparser
from datetime import datetime

TOPIC = "rss_articles"

producer = KafkaProducer(
    bootstrap_servers="redpanda:9092",
    value_serializer=lambda v: json.dumps(v).encode("utf-8"),
    acks='all',
    retries=5,
    linger_ms=10
)

print("RSS Service connected to Redpanda ✅")

# Flux RSS crypto populaires
RSS_FEEDS = [
    "https://cointelegraph.com/rss",
    "https://www.coindesk.com/arc/outboundfeeds/rss/",
    "https://decrypt.co/feed",
]

# Fonction pour récupérer et envoyer les articles
def fetch_and_send_articles():
    """Récupère les articles RSS et les envoie vers Kafka"""
    try:
        all_articles = []
        
        # Récupérer les articles de tous les flux RSS
        for feed_url in RSS_FEEDS:
            print(f"Fetching RSS feed: {feed_url}")
            articles = parse_rss_feed(feed_url)
            all_articles.extend(articles)
            print(f"Found {len(articles)} articles from {feed_url}")
        
        # Envoyer chaque article vers Kafka
        for article in all_articles:
            try:
                producer.send(TOPIC, article)
                print(f"Sent article: {article['title'][:50]}...")
            except Exception as e:
                print(f"Erreur Kafka pour l'article {article.get('title', 'unknown')}: {e}")
        
        producer.flush()
        print(f"✅ Sent {len(all_articles)} articles to Kafka")
        return len(all_articles)
    except Exception as e:
        print(f"Error fetching RSS feeds: {e}")
        return 0

def parse_rss_feed(url):
    """Parse un flux RSS et retourne les articles"""
    try:
        feed = feedparser.parse(url)
        articles = []
        
        for entry in feed.entries:
            # Convertir la date en timestamp ISO
            pub_date = None
            if hasattr(entry, 'published_parsed') and entry.published_parsed:
                try:
                    pub_date = datetime(*entry.published_parsed[:6]).isoformat()
                except:
                    pub_date = datetime.now().isoformat()
            elif hasattr(entry, 'published') and entry.published:
                try:
                    # Essayer différents formats de date RSS
                    date_str = entry.published
                    # Format RSS standard: "Mon, 01 Jan 2024 12:00:00 +0000"
                    formats = [
                        '%a, %d %b %Y %H:%M:%S %Z',
                        '%a, %d %b %Y %H:%M:%S %z',
                        '%Y-%m-%d %H:%M:%S',
                        '%Y-%m-%dT%H:%M:%S',
                        '%Y-%m-%dT%H:%M:%SZ',
                    ]
                    parsed = False
                    for fmt in formats:
                        try:
                            pub_date = datetime.strptime(date_str, fmt).isoformat()
                            parsed = True
                            break
                        except:
                            continue
                    if not parsed:
                        pub_date = datetime.now().isoformat()
                except Exception as e:
                    print(f"Erreur parsing date: {e}, date: {entry.published}")
                    pub_date = datetime.now().isoformat()
            else:
                pub_date = datetime.now().isoformat()
            
            article = {
                "title": entry.get("title", ""),
                "link": entry.get("link", ""),
                "description": entry.get("description", ""),
                "published": pub_date,
                "guid": entry.get("id", entry.get("link", "")),
                "source": url,
                "time": time.time()
            }
            articles.append(article)
        
        return articles
    except Exception as e:
        print(f"Erreur lors du parsing du flux RSS {url}: {e}")
        return []

# Récupérer immédiatement au démarrage
print("🚀 Démarrage de la récupération RSS...")
fetch_and_send_articles()

# Puis continuer en boucle toutes les heures
while True:
    try:
        # Attendre 1 heure avant de récupérer à nouveau
        print("⏳ Attente de 1 heure avant la prochaine récupération...")
        time.sleep(3600)
        fetch_and_send_articles()
    except Exception as e:
        print(f"Error in main loop: {e}")
        time.sleep(60)
