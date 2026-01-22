import { useEffect, useState, useRef } from "react";
import './PriceNotifications.css';

// Type pour les articles RSS
interface RSSArticle {
  title: string;
  link: string;
  description: string;
  published: string;
  source: string;
  stored_at: string;
}

const PriceNotifications = () => {
  const [articles, setArticles] = useState<RSSArticle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Récupérer les articles RSS depuis l'API
  const fetchRSSArticles = async () => {
    try {
      const response = await fetch('http://localhost:5000/rss/articles?limit=20');
      const data = await response.json();
      if (data.articles && data.articles.length > 0) {
        setArticles(data.articles);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des articles RSS:', error);
      setIsLoading(false);
    }
  };

  // Charger les articles au démarrage et toutes les 5 minutes
  useEffect(() => {
    fetchRSSArticles();
    const refreshInterval = setInterval(fetchRSSArticles, 5 * 60 * 1000); // Rafraîchir toutes les 5 minutes
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Rotation automatique des articles
  useEffect(() => {
    if (articles.length === 0) return;

    // Changer d'article toutes les 8 secondes avec animation
    intervalRef.current = setInterval(() => {
      setIsTransitioning(true);
      // Après la transition, changer d'article
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % articles.length);
        setIsTransitioning(false);
      }, 300);
    }, 8000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [articles.length]);

  // Fonction pour obtenir le nom de la source (plus court)
  const getSourceName = (source: string) => {
    if (source.includes('cointelegraph')) return 'CoinTelegraph';
    if (source.includes('coindesk')) return 'CoinDesk';
    if (source.includes('decrypt')) return 'Decrypt';
    return 'Crypto News';
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'À l\'instant';
      if (diffMins < 60) return `Il y a ${diffMins} min`;
      if (diffHours < 24) return `Il y a ${diffHours}h`;
      if (diffDays < 7) return `Il y a ${diffDays}j`;
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  // Fonction pour tronquer le texte
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  if (isLoading) {
    return (
      <div className="holo-notifications-zone">
        <div className="holo-notification">
          <div className="holo-notification-content">
            <span>Chargement des actualités...</span>
          </div>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="holo-notifications-zone">
        <div className="holo-notification">
          <div className="holo-notification-content">
            <span>Aucune actualité disponible</span>
          </div>
        </div>
      </div>
    );
  }

  const currentArticle = articles[currentIndex];

  return (
    <div className="holo-notifications-zone">
      <div className={`holo-notification rss-article ${isTransitioning ? 'transitioning' : ''}`}>
        <div className="holo-notification-header">
          <span className="holo-notification-source">
            📰 {getSourceName(currentArticle.source)}
          </span>
          <span className="holo-notification-time">
            {formatDate(currentArticle.published)}
          </span>
        </div>
        <div className="holo-notification-content rss-content">
          <a 
            href={currentArticle.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="rss-link"
            title={currentArticle.title}
          >
            <span className="rss-title">
              {truncateText(currentArticle.title, 80)}
            </span>
          </a>
        </div>
        {currentArticle.description && (
          <div className="rss-description">
            {truncateText(currentArticle.description.replace(/<[^>]*>/g, ''), 100)}
          </div>
        )}
        {articles.length > 1 && (
          <div className="rss-indicator">
            {currentIndex + 1} / {articles.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceNotifications;

