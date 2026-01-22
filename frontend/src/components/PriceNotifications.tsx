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
  const [isManualNavigation, setIsManualNavigation] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Récupérer les articles RSS depuis l'API
  const fetchRSSArticles = async () => {
    try {
      console.log('🔄 Récupération des articles RSS...');
      const response = await fetch('http://localhost:5000/rss/articles?limit=20');
      
      if (!response.ok) {
        console.error(`❌ HTTP error! status: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📰 Données reçues:', data);
      console.log(`📊 Nombre d'articles: ${data.count || 0}`);
      
      // Toujours essayer d'afficher quelque chose, même si c'est vide
      if (data.articles && data.articles.length > 0) {
        console.log(`✅ ${data.articles.length} articles chargés`);
        setArticles(data.articles);
        setIsLoading(false);
      } else {
        // Si aucun article, essayer de récupérer au moins le dernier
        console.log('⚠️ Aucun article dans la réponse, tentative de récupération du dernier article...');
        try {
          const fallbackResponse = await fetch('http://localhost:5000/rss/articles?limit=1');
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            console.log('📰 Données fallback reçues:', fallbackData);
            if (fallbackData.articles && fallbackData.articles.length > 0) {
              console.log('✅ Dernier article disponible chargé');
              setArticles(fallbackData.articles);
              setIsLoading(false);
            } else {
              console.warn('⚠️ Aucun article disponible dans la base de données');
              setArticles([]);
              setIsLoading(false);
            }
          } else {
            console.error(`❌ Fallback HTTP error! status: ${fallbackResponse.status}`);
            setArticles([]);
            setIsLoading(false);
          }
        } catch (fallbackError) {
          console.error('❌ Erreur lors de la récupération de fallback:', fallbackError);
          setArticles([]);
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des articles RSS:', error);
      console.error('Détails de l\'erreur:', error instanceof Error ? error.message : String(error));
      
      // En cas d'erreur, essayer de récupérer au moins le dernier article
      try {
        console.log('🔄 Tentative de récupération du dernier article en fallback...');
        const fallbackResponse = await fetch('http://localhost:5000/rss/articles?limit=1');
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          console.log('📰 Données fallback reçues:', fallbackData);
          if (fallbackData.articles && fallbackData.articles.length > 0) {
            console.log('✅ Dernier article récupéré en fallback');
            setArticles(fallbackData.articles);
            setIsLoading(false);
          } else {
            console.warn('⚠️ Aucun article disponible même en fallback');
            setArticles([]);
            setIsLoading(false);
          }
        } else {
          console.error(`❌ Fallback HTTP error! status: ${fallbackResponse.status}`);
          setArticles([]);
          setIsLoading(false);
        }
      } catch (fallbackError) {
        console.error('❌ Erreur lors de la récupération de fallback:', fallbackError);
        setArticles([]);
        setIsLoading(false);
      }
    }
  };

  // Charger les articles au démarrage et toutes les 5 minutes
  useEffect(() => {
    fetchRSSArticles();
    const refreshInterval = setInterval(fetchRSSArticles, 5 * 60 * 1000); // Rafraîchir toutes les 5 minutes
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Réessayer automatiquement si aucun article après le chargement
  useEffect(() => {
    if (articles.length === 0 && !isLoading) {
      console.log('🔄 Aucun article trouvé, nouvelle tentative dans 2 secondes...');
      const retryTimeout = setTimeout(() => {
        console.log('🔄 Nouvelle tentative de récupération...');
        fetchRSSArticles();
      }, 2000);
      return () => clearTimeout(retryTimeout);
    }
  }, [articles.length, isLoading]);

  // Rotation automatique des articles (seulement si navigation manuelle inactive)
  useEffect(() => {
    if (articles.length === 0 || isManualNavigation) return;

    // Changer d'article toutes les 8 secondes avec animation
    intervalRef.current = setInterval(() => {
      setIsTransitioning(true);
      // Après la transition, changer d'article
      setTimeout(() => {
        setCurrentIndex((prevIndex: number) => (prevIndex + 1) % articles.length);
        setIsTransitioning(false);
      }, 300);
    }, 8000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [articles.length, isManualNavigation]);

  // Réactiver la navigation automatique après 30 secondes d'inactivité manuelle
  useEffect(() => {
    if (isManualNavigation) {
      const timeout = setTimeout(() => {
        setIsManualNavigation(false);
      }, 30000); // 30 secondes
      return () => clearTimeout(timeout);
    }
  }, [isManualNavigation, currentIndex]);

  // Fonction pour naviguer vers l'article précédent
  const goToPrevious = () => {
    if (articles.length <= 1) return;
    setIsManualNavigation(true);
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex: number) => 
        prevIndex === 0 ? articles.length - 1 : prevIndex - 1
      );
      setIsTransitioning(false);
    }, 300);
  };

  // Fonction pour naviguer vers l'article suivant
  const goToNext = () => {
    if (articles.length <= 1) return;
    setIsManualNavigation(true);
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex: number) => 
        (prevIndex + 1) % articles.length
      );
      setIsTransitioning(false);
    }, 300);
  };

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

  // Si aucun article après le chargement, afficher un message
  if (articles.length === 0 && !isLoading) {
    return (
      <div className="holo-notifications-zone">
        <div className="holo-notification">
          <div className="holo-notification-content">
            <span>Récupération des actualités...</span>
            <div style={{ fontSize: '10px', marginTop: '5px', color: 'rgba(0, 255, 255, 0.5)' }}>
              Vérifiez la console (F12) pour plus d'infos
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si on a au moins un article, l'afficher (même si c'est le seul)
  if (articles.length === 0) {
    return null; // Pendant le chargement initial
  }

  const currentArticle = articles[currentIndex];

  return (
    <div className="holo-notifications-zone">
      <div className={`holo-notification rss-article ${isTransitioning ? 'transitioning' : ''}`}>
        {/* Flèche précédente */}
        {articles.length > 1 && (
          <button 
            className="rss-nav-button rss-nav-prev"
            onClick={goToPrevious}
            aria-label="Article précédent"
            title="Article précédent"
          >
            ‹
          </button>
        )}
        
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
        {articles.length > 1 ? (
          <div className="rss-indicator">
            {currentIndex + 1} / {articles.length}
          </div>
        ) : (
          <div className="rss-indicator" style={{ fontSize: '8px', color: 'rgba(0, 255, 255, 0.4)' }}>
            Dernière actualité disponible
          </div>
        )}
        
        {/* Flèche suivante */}
        {articles.length > 1 && (
          <button 
            className="rss-nav-button rss-nav-next"
            onClick={goToNext}
            aria-label="Article suivant"
            title="Article suivant"
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
};

export default PriceNotifications;

