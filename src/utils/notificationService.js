const NOTIFICATION_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error'
};

class NotificationService {
  constructor() {
    this.handlers = new Set();
    this.errorCount = 0;
    this.lastNotificationTime = 0;
    this.MIN_NOTIFICATION_INTERVAL = 5000; // 5 secondes entre les notifications
  }

  subscribe(handler) {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  notify(message, level = NOTIFICATION_LEVELS.INFO) {
    // Éviter les notifications trop fréquentes
    const now = Date.now();
    if (now - this.lastNotificationTime < this.MIN_NOTIFICATION_INTERVAL) {
      return;
    }
    
    this.lastNotificationTime = now;

    // Incrémenter le compteur d'erreurs si nécessaire
    if (level === NOTIFICATION_LEVELS.ERROR) {
      this.errorCount++;
    }

    // Notifier tous les handlers
    this.handlers.forEach(handler => handler({
      message,
      level,
      timestamp: new Date().toISOString(),
      errorCount: this.errorCount
    }));

    // Log dans la console avec le style approprié
    const styles = {
      [NOTIFICATION_LEVELS.INFO]: 'color: #2196F3',
      [NOTIFICATION_LEVELS.WARNING]: 'color: #FFC107',
      [NOTIFICATION_LEVELS.ERROR]: 'color: #F44336'
    };

    console.log(`%c${level.toUpperCase()}: ${message}`, styles[level]);

    // Envoyer à un service externe si c'est une erreur
    if (level === NOTIFICATION_LEVELS.ERROR) {
      this.sendToExternalService({
        message,
        level,
        timestamp: new Date().toISOString(),
        errorCount: this.errorCount
      });
    }
  }

  // Méthode pour envoyer les erreurs à un service externe
  async sendToExternalService(notification) {
    try {
      // Vérifier si le navigateur est en ligne
      if (!navigator.onLine) {
        this.queueNotification(notification);
        return;
      }

      // Envoyer l'erreur au service approprié (à configurer)
      const response = await fetch('https://api.dsparfum.fr/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification)
      });

      if (!response.ok) {
        throw new Error('Échec de l\'envoi de la notification');
      }
    } catch (err) {
      console.error('Erreur lors de l\'envoi de la notification:', err);
      this.queueNotification(notification);
    }
  }

  // File d'attente pour les notifications en échec
  queueNotification(notification) {
    try {
      const queue = JSON.parse(localStorage.getItem('notification-queue') || '[]');
      queue.push(notification);
      localStorage.setItem('notification-queue', JSON.stringify(queue));
    } catch (err) {
      console.error('Erreur lors de la mise en file d\'attente:', err);
    }
  }

  // Tenter de renvoyer les notifications en échec
  async processQueue() {
    try {
      const queue = JSON.parse(localStorage.getItem('notification-queue') || '[]');
      if (queue.length === 0) return;

      const successfulNotifications = [];
      
      for (const notification of queue) {
        try {
          await this.sendToExternalService(notification);
          successfulNotifications.push(notification);
        } catch (err) {
          console.error('Échec du renvoi de la notification:', err);
        }
      }

      // Retirer les notifications envoyées avec succès de la file d'attente
      const remainingQueue = queue.filter(
        n => !successfulNotifications.some(
          sn => sn.timestamp === n.timestamp
        )
      );

      localStorage.setItem('notification-queue', JSON.stringify(remainingQueue));
    } catch (err) {
      console.error('Erreur lors du traitement de la file d\'attente:', err);
    }
  }
}

// Créer une instance singleton
const notificationService = new NotificationService();

// Vérifier la file d'attente périodiquement
setInterval(() => {
  if (navigator.onLine) {
    notificationService.processQueue();
  }
}, 60000); // Vérifier toutes les minutes

// Réessayer d'envoyer les notifications quand la connexion est rétablie
window.addEventListener('online', () => {
  notificationService.processQueue();
});

export default notificationService;
