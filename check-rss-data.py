#!/usr/bin/env python3
"""
Script pour vérifier les données RSS stockées dans la base de données
"""
import requests
import json

def check_rss_api():
    """Vérifier l'API RSS"""
    print("=" * 60)
    print("🔍 Vérification de l'API RSS")
    print("=" * 60)
    
    try:
        response = requests.get('http://localhost:5000/rss/articles?limit=10')
        response.raise_for_status()
        data = response.json()
        
        print(f"✅ API accessible")
        print(f"📊 Nombre d'articles: {data.get('count', 0)}")
        print()
        
        if data.get('articles') and len(data['articles']) > 0:
            print("📰 Articles trouvés:")
            print("-" * 60)
            for i, article in enumerate(data['articles'][:5], 1):
                print(f"\n{i}. {article.get('title', 'Sans titre')[:60]}...")
                print(f"   Source: {article.get('source', 'Unknown')}")
                print(f"   Publié: {article.get('published', 'Unknown')}")
                print(f"   Lien: {article.get('link', 'No link')[:50]}...")
        else:
            print("❌ Aucun article trouvé dans la base de données")
            print("\n💡 Vérifiez:")
            print("   1. Le service RSS récupère-t-il les flux?")
            print("   2. Les articles sont-ils envoyés vers Kafka?")
            print("   3. Le service analytics consomme-t-il les messages?")
        
    except requests.exceptions.ConnectionError:
        print("❌ Impossible de se connecter à l'API")
        print("   Vérifiez que le service analytics-service est démarré")
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    check_rss_api()
