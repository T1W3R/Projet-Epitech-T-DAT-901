import { useCallback, useEffect, useMemo, useState } from "react";
import './PriceNotifications.css';

// Type pour les notifications
interface PriceNotification {
  id: string;
  crypto: string;
  price: number;
  change: number;
  timestamp: Date;
}

const PriceNotifications = () => {
  const [notifications, setNotifications] = useState<PriceNotification[]>([]);
  
  // Données fake pour les cryptos
  const cryptoData = useMemo(() => [
    { name: "BTC", minPrice: 40000, maxPrice: 50000 },
    { name: "ETH", minPrice: 2000, maxPrice: 3000 },
    { name: "XRP", minPrice: 0.5, maxPrice: 1.5 },
    { name: "SOL", minPrice: 80, maxPrice: 150 },
    { name: "ADA", minPrice: 0.4, maxPrice: 0.8 },
    { name: "LINK", minPrice: 10, maxPrice: 20 },
    { name: "MANA", minPrice: 0.5, maxPrice: 1.2 },
    { name: "AVAX", minPrice: 20, maxPrice: 40 },
    { name: "POLY", minPrice: 0.6, maxPrice: 1.4 },
  ], []);
  
  // Fonction pour générer une notification aléatoire
  const generateRandomNotification = useCallback(() => {
    const crypto = cryptoData[Math.floor(Math.random() * cryptoData.length)];
    const price = crypto.minPrice + Math.random() * (crypto.maxPrice - crypto.minPrice);
    const change = (Math.random() - 0.5) * 10; // Entre -5% et +5%
    
    const notification: PriceNotification = {
      id: `${Date.now()}-${Math.random()}`,
      crypto: crypto.name,
      price: parseFloat(price.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      timestamp: new Date()
    };
    
    setNotifications(prev => {
      // Garder seulement les 5 dernières notifications
      const updated = [notification, ...prev].slice(0, 5);
      return updated;
    });
    
    // Supprimer la notification après 3 secondes
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 3000);
  }, [cryptoData]);
  
  // Générer des notifications périodiquement
  useEffect(() => {
    const interval = setInterval(() => {
      generateRandomNotification();
    }, 4000); // Toutes les 4 secondes
    
    // Générer une notification initiale
    generateRandomNotification();
    
    return () => clearInterval(interval);
  }, [generateRandomNotification]);

  return (
    <div className="holo-notifications-zone">
      {notifications.map(notification => (
        <div key={notification.id} className="holo-notification">
          <div className="holo-notification-header">
            <span className="holo-notification-crypto">
              {notification.crypto}
            </span>
            <span className="holo-notification-time">
              {notification.timestamp.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
              })}
            </span>
          </div>
          <div className="holo-notification-content">
            <span className="holo-notification-price">
              ${notification.price.toLocaleString('fr-FR', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </span>
            <span className={`holo-notification-change ${notification.change >= 0 ? 'positive' : 'negative'}`}>
              {notification.change >= 0 ? '▲' : '▼'} {Math.abs(notification.change).toFixed(2)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PriceNotifications;

