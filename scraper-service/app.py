"""
Producer: Scrape les prix crypto en parallèle et envoie vers Redpanda
Fichier: producer.py
Utilise APScheduler + ThreadPoolExecutor pour scraper toutes les cryptos simultanément
"""
from kafka import KafkaProducer
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from apscheduler.schedulers.background import BackgroundScheduler
from concurrent.futures import ThreadPoolExecutor, as_completed
import json
import time
import os
import signal
import sys
from datetime import datetime

class CryptoScraper:
    def __init__(self, redpanda_host='redpanda:19092'):
        # Connexion au producer Kafka
        print(f"Connexion à Redpanda: {redpanda_host}", flush=True)
        self.producer = KafkaProducer(
            bootstrap_servers=[redpanda_host],
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            key_serializer=lambda k: k.encode('utf-8') if k else None,
            acks='all',
            retries=3
        )
        self.topic = 'crypto-prices'
        
        # Liste des cryptos à scraper
        self.coins = ["bitcoin", "ethereum", "cardano", "solana", "polygon", "xrp", "decentraland", "avalanche", "chainlink"]
        
        # Intervalle de scraping (toutes les X secondes)
        self.scraping_interval = 60
        
        # Thread pool pour le scraping parallèle
        self.executor = ThreadPoolExecutor(max_workers=len(self.coins))
                
        # Scheduler pour déclencher les cycles de scraping
        self.scheduler = BackgroundScheduler()
        self.is_running = True
        
        # Compteur de cycles
        self.cycle_count = 0
    
    def create_driver(self):
        """Crée une instance de driver Selenium (un par thread)"""
        options = webdriver.ChromeOptions()
        options.binary_location = "/usr/bin/chromium"
        options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--window-size=1920,1080")
        options.add_argument(
            "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/142.0.0.0 Safari/537.36"
        )
        
        return webdriver.Chrome(options=options)
    
    def scrape_coin(self, coin):
        """Scrape le prix d'une crypto (chaque thread a son propre driver)"""
        url = f"https://www.coingecko.com/en/coins/{coin}"
        driver = None
        
        try:
            # Créer un driver dédié pour ce thread
            driver = self.create_driver()
            
            print(f"📊 [{datetime.now().strftime('%H:%M:%S')}] Scraping {coin}...", flush=True)
            
            driver.get(url)
            
            # Attendre que la page soit chargée
            WebDriverWait(driver, 15).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            
            # Extraire le prix
            price_element = WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((
                    By.XPATH,
                    '//span[@data-converter-target="price"][@data-price-usd]'
                ))
            )
            price = price_element.get_attribute("data-price-usd")
            
            data = {
                'coin': coin,
                'price': float(price),
                'price_str': price,
                'timestamp': datetime.utcnow().isoformat(),
                'status': 'success',
                'source': 'coingecko'
            }
            
            print(f"  ✓ {coin}: ${price}", flush=True)
            return data
            
        except Exception as e:
            print(f"  ✗ Erreur pour {coin}: {e}", flush=True)
            return {
                'coin': coin,
                'price': None,
                'price_str': 'N/A',
                'timestamp': datetime.utcnow().isoformat(),
                'status': 'error',
                'error': str(e),
                'source': 'coingecko'
            }
        
        finally:
            # Fermer le driver de ce thread
            if driver:
                try:
                    driver.quit()
                except:
                    pass
    
    def produce_price(self, data):
        """Envoie les données vers Redpanda"""
        try:
            future = self.producer.send(
                self.topic,
                key=data['coin'],
                value=data
            )
            
            # Attendre la confirmation d'envoi
            record_metadata = future.get(timeout=10)
            
            print(f"  → Kafka [{data['coin']}]: partition={record_metadata.partition}, "
                  f"offset={record_metadata.offset}", flush=True)
            return True
            
        except Exception as e:
            print(f"  ✗ Erreur Kafka [{data['coin']}]: {e}", flush=True)
            return False
    
    def scrape_all_coins_parallel(self):
        """Scrape toutes les cryptos en parallèle"""
        if not self.is_running:
            return
        
        self.cycle_count += 1
        print(f"\n{'='*70}")
        print(f"🔄 Cycle #{self.cycle_count} - {datetime.now().strftime('%H:%M:%S')}")
        print(f"{'='*70}\n")
        
        start_time = time.time()
        
        # Lancer tous les scrapings en parallèle
        futures = {
            self.executor.submit(self.scrape_coin, coin): coin 
            for coin in self.coins
        }
        
        # Attendre que tous les scrapings soient terminés
        results = []
        for future in as_completed(futures):
            coin = futures[future]
            try:
                data = future.result()
                results.append(data)
                
                # Envoyer immédiatement vers Kafka dès que disponible
                self.produce_price(data)
                
            except Exception as e:
                print(f"❌ Exception pour {coin}: {e}", flush=True)
        
        elapsed = time.time() - start_time
        
        print(f"\n✓ Cycle #{self.cycle_count} terminé en {elapsed:.2f}s")
        print(f"  {len(results)}/{len(self.coins)} cryptos scrapées avec succès")
        print(f"{'='*70}\n")
    
    def start_scheduling(self):
        """Configure et démarre le scheduler"""
        print(f"\n🚀 Configuration du scheduler\n", flush=True)
        print(f"  • Cryptos: {', '.join(self.coins)}")
        print(f"  • Intervalle: {self.scraping_interval}s")
        print(f"  • Mode: Scraping parallèle\n")
        
        # Ajouter le job de scraping périodique
        self.scheduler.add_job(
            func=self.scrape_all_coins_parallel,
            trigger='interval',
            seconds=self.scraping_interval,
            id='scrape_all',
            name='Scrape all coins in parallel',
            max_instances=1,
            coalesce=True
        )
        
        # Démarrer le scheduler
        self.scheduler.start()
        print("✓ Scheduler démarré\n")
        
        # Lancer immédiatement le premier scraping
        print("🔄 Premier scraping...\n")
        self.scrape_all_coins_parallel()
    
    def run(self):
        """Démarre le producer et attend l'arrêt"""
        # Configurer la gestion des signaux pour un arrêt propre
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
        
        try:
            # Démarrer le scheduling
            self.start_scheduling()
            
            # Garder le programme actif
            print(f"🎯 Producer actif. Appuyez sur Ctrl+C pour arrêter.\n")
            print("=" * 70)
            
            while self.is_running:
                time.sleep(1)
                
        except Exception as e:
            print(f"\n❌ Erreur fatale: {e}", flush=True)
        finally:
            self.cleanup()
    
    def _signal_handler(self, signum, frame):
        """Gestion des signaux d'arrêt"""
        print("\n\n⚠ Signal d'arrêt reçu", flush=True)
        self.is_running = False
    
    def cleanup(self):
        """Nettoyage des ressources"""
        print("\n🧹 Nettoyage...", flush=True)
        
        self.is_running = False
        
        try:
            if self.scheduler.running:
                self.scheduler.shutdown(wait=False)
                print("  ✓ Scheduler arrêté", flush=True)
        except:
            pass
        
        try:
            self.executor.shutdown(wait=False)
            print("  ✓ Thread pool fermé", flush=True)
        except:
            pass
        
        try:
            self.producer.flush()
            self.producer.close()
            print("  ✓ Producer Kafka fermé", flush=True)
        except:
            pass
        
        print("✓ Nettoyage terminé\n", flush=True)
        sys.exit(0)


if __name__ == "__main__":
    # Récupérer l'host depuis la variable d'environnement ou utiliser localhost
    redpanda_host = os.environ.get('REDPANDA_HOST', 'localhost:19092')
    
    print("=" * 70)
    print("  CRYPTO SCRAPER PRODUCER (PARALLEL MODE)")
    print("=" * 70)
    print(f"Redpanda: {redpanda_host}")
    print("=" * 70 + "\n")
    
    scraper = CryptoScraper(redpanda_host=redpanda_host)
    scraper.run()