import React, { useState, useEffect } from 'react';

export default function PrivateVisitCounter() {
  const [visitCount, setVisitCount] = useState(0);
  const [todayVisits, setTodayVisits] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [uniqueVisitors, setUniqueVisitors] = useState(0);
  const [avgSessionTime, setAvgSessionTime] = useState(0);
  const [peakTime, setPeakTime] = useState('');
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [browserInfo, setBrowserInfo] = useState('');
  const [sessionStart] = useState(Date.now());
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);

  useEffect(() => {
    // Vérifier si on est en mode administrateur (localStorage secret)
    const isAdmin = localStorage.getItem('admin_mode') === 'true';
    setAdminMode(isAdmin);

    // Récupérer le nombre total de visites
    const totalVisits = localStorage.getItem('ds_parfum_total_visits') || '0';
    setVisitCount(parseInt(totalVisits));

    // Gestion des visiteurs uniques
    const visitorId = localStorage.getItem('ds_parfum_visitor_id');
    if (!visitorId) {
      const newVisitorId = Date.now().toString(36) + Math.random().toString(36);
      localStorage.setItem('ds_parfum_visitor_id', newVisitorId);
      
      const uniqueCount = localStorage.getItem('ds_parfum_unique_visitors') || '0';
      const newUniqueCount = parseInt(uniqueCount) + 1;
      localStorage.setItem('ds_parfum_unique_visitors', newUniqueCount.toString());
      setUniqueVisitors(newUniqueCount);
    } else {
      setUniqueVisitors(parseInt(localStorage.getItem('ds_parfum_unique_visitors') || '0'));
    }

    // Informations du navigateur
    const browser = navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                   navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                   navigator.userAgent.includes('Safari') ? 'Safari' : 
                   navigator.userAgent.includes('Edge') ? 'Edge' : 'Autre';
    setBrowserInfo(`${browser} - ${navigator.platform}`);

    // Gestion des visites du jour
    const today = new Date().toDateString();
    const lastVisitDate = localStorage.getItem('ds_parfum_last_visit_date');
    const todayCount = localStorage.getItem('ds_parfum_today_visits') || '0';

    // Statistiques hebdomadaires
    updateWeeklyStats();

    // Heure de pointe
    updatePeakTime();

    if (lastVisitDate !== today) {
      // Nouveau jour, reset compteur du jour
      localStorage.setItem('ds_parfum_today_visits', '1');
      localStorage.setItem('ds_parfum_last_visit_date', today);
      setTodayVisits(1);
    } else {
      // Même jour, incrémenter
      const newTodayCount = parseInt(todayCount) + 1;
      localStorage.setItem('ds_parfum_today_visits', newTodayCount.toString());
      setTodayVisits(newTodayCount);
    }

    // Incrémenter le compteur total
    const newTotal = parseInt(totalVisits) + 1;
    localStorage.setItem('ds_parfum_total_visits', newTotal.toString());
    setVisitCount(newTotal);

    // Enregistrer l'heure de la visite
    localStorage.setItem('ds_parfum_last_visit_time', new Date().toLocaleString());

    // Calculer temps de session moyen
    updateSessionTime();
  }, []);

  // Fonction pour activer le mode admin (combinaison de touches secrète)
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Combinaison Ctrl + Shift + A pour activer/désactiver le mode admin
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        const newAdminMode = !adminMode;
        setAdminMode(newAdminMode);
        localStorage.setItem('admin_mode', newAdminMode.toString());
        setIsVisible(newAdminMode);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [adminMode]);

  // Fonction pour détecter les taps multiples sur mobile (coin supérieur droit)
  useEffect(() => {
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      
      // Zone d'activation : coin supérieur droit (20% de la largeur, 10% de la hauteur)
      const isInCorner = touch.clientX > screenWidth * 0.8 && touch.clientY < screenHeight * 0.1;
      
      if (isInCorner) {
        const now = Date.now();
        const timeBetweenTaps = now - lastTapTime;
        
        if (timeBetweenTaps < 500) { // Moins de 500ms entre les taps
          setTapCount(prev => prev + 1);
          
          // 5 taps rapides pour activer
          if (tapCount >= 4) {
            const newAdminMode = !adminMode;
            setAdminMode(newAdminMode);
            localStorage.setItem('admin_mode', newAdminMode.toString());
            setIsVisible(newAdminMode);
            setTapCount(0);
            
            // Vibration si disponible
            if (navigator.vibrate) {
              navigator.vibrate([100, 50, 100]);
            }
          }
        } else {
          setTapCount(1); // Reset si trop de temps entre les taps
        }
        
        setLastTapTime(now);
        
        // Reset automatique après 2 secondes
        setTimeout(() => setTapCount(0), 2000);
      }
    };

    // Ajouter l'événement touch seulement sur mobile
    if ('ontouchstart' in window) {
      window.addEventListener('touchstart', handleTouchStart);
      return () => window.removeEventListener('touchstart', handleTouchStart);
    }
  }, [adminMode, tapCount, lastTapTime]);

  const updateWeeklyStats = () => {
    const today = new Date();
    const weekData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const visits = localStorage.getItem(`ds_parfum_visits_${dateStr}`) || '0';
      weekData.push({
        day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        visits: parseInt(visits)
      });
    }
    
    setWeeklyStats(weekData);
  };

  const updatePeakTime = () => {
    const hours = Array.from({length: 24}, (_, i) => i);
    const hourCounts = hours.map(hour => {
      const count = localStorage.getItem(`ds_parfum_hour_${hour}`) || '0';
      return { hour, count: parseInt(count) };
    });
    
    const currentHour = new Date().getHours();
    const currentHourCount = localStorage.getItem(`ds_parfum_hour_${currentHour}`) || '0';
    localStorage.setItem(`ds_parfum_hour_${currentHour}`, (parseInt(currentHourCount) + 1).toString());
    
    const peak = hourCounts.reduce((max, current) => 
      current.count > max.count ? current : max
    );
    
    setPeakTime(`${peak.hour}h (${peak.count} visites)`);
  };

  const updateSessionTime = () => {
    // Enregistrer le début de session lors du chargement
    const sessions = JSON.parse(localStorage.getItem('ds_parfum_sessions') || '[]');
    const avgTime = sessions.length > 0 ? 
      sessions.reduce((sum, time) => sum + time, 0) / sessions.length : 0;
    setAvgSessionTime(Math.round(avgTime / 1000)); // en secondes
  };

  // Enregistrer la fin de session quand l'utilisateur quitte
  useEffect(() => {
    const handleBeforeUnload = () => {
      const sessionDuration = Date.now() - sessionStart;
      const sessions = JSON.parse(localStorage.getItem('ds_parfum_sessions') || '[]');
      sessions.push(sessionDuration);
      
      // Garder seulement les 50 dernières sessions
      if (sessions.length > 50) sessions.shift();
      
      localStorage.setItem('ds_parfum_sessions', JSON.stringify(sessions));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionStart]);

  const resetCounters = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les statistiques ?')) {
      // Reset compteurs principaux
      localStorage.setItem('ds_parfum_total_visits', '0');
      localStorage.setItem('ds_parfum_today_visits', '0');
      localStorage.setItem('ds_parfum_unique_visitors', '0');
      localStorage.setItem('ds_parfum_sessions', '[]');
      
      // Reset visiteur unique
      localStorage.removeItem('ds_parfum_visitor_id');
      
      // Reset statistiques horaires
      for (let i = 0; i < 24; i++) {
        localStorage.removeItem(`ds_parfum_hour_${i}`);
      }
      
      // Reset statistiques journalières de la semaine
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        localStorage.removeItem(`ds_parfum_visits_${date.toDateString()}`);
      }
      
      setVisitCount(0);
      setTodayVisits(0);
      setUniqueVisitors(0);
      setAvgSessionTime(0);
      setPeakTime('');
      setWeeklyStats([]);
    }
  };

  if (!adminMode) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Indicateur de taps sur mobile (discret) */}
      {tapCount > 0 && tapCount < 5 && (
        <div className="absolute -top-8 -right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-70">
          {tapCount}/5
        </div>
      )}
      
      {/* Bouton pour afficher/masquer */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors mb-2"
        title="Statistiques admin (Ctrl+Shift+A ou 5 taps coin supérieur droit)"
      >
        📊
      </button>

      {/* Panneau des statistiques */}
      {isVisible && (
        <div className="bg-gray-900 text-white p-4 rounded-lg shadow-xl border border-gray-700 min-w-[300px] max-w-[350px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-yellow-400">📈 Admin Dashboard</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-white text-sm"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-3 text-xs max-h-[400px] overflow-y-auto">
            {/* Statistiques principales */}
            <div className="bg-gray-800 p-3 rounded border border-gray-600">
              <h4 className="text-yellow-300 font-semibold mb-2">📊 Visites</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total:</span>
                  <span className="text-yellow-400 font-bold">{visitCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Aujourd'hui:</span>
                  <span className="text-green-400 font-bold">{todayVisits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Visiteurs uniques:</span>
                  <span className="text-blue-400 font-bold">{uniqueVisitors}</span>
                </div>
              </div>
            </div>

            {/* Temps de session */}
            <div className="bg-gray-800 p-3 rounded border border-gray-600">
              <h4 className="text-purple-300 font-semibold mb-2">⏱️ Sessions</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-300">Temps moyen:</span>
                  <span className="text-purple-400 font-bold">
                    {avgSessionTime > 0 ? `${Math.floor(avgSessionTime / 60)}m ${avgSessionTime % 60}s` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Heure de pointe:</span>
                  <span className="text-orange-400 font-bold text-[10px]">{peakTime || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Statistiques de la semaine */}
            <div className="bg-gray-800 p-3 rounded border border-gray-600">
              <h4 className="text-green-300 font-semibold mb-2">📅 Semaine</h4>
              <div className="grid grid-cols-7 gap-1 text-[10px]">
                {weeklyStats.map((day, index) => (
                  <div key={index} className="text-center">
                    <div className="text-gray-400">{day.day}</div>
                    <div className="text-green-400 font-bold">{day.visits}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Informations techniques */}
            <div className="bg-gray-800 p-3 rounded border border-gray-600">
              <h4 className="text-cyan-300 font-semibold mb-2">🔧 Technique</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-300">Navigateur:</span>
                  <span className="text-cyan-400 text-[10px]">{browserInfo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Dernière visite:</span>
                  <span className="text-blue-400 text-[10px]">
                    {localStorage.getItem('ds_parfum_last_visit_time')?.split(' ')[1] || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Session actuelle:</span>
                  <span className="text-pink-400 text-[10px]">
                    {Math.floor((Date.now() - sessionStart) / 60000)}m
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-700 pt-3 space-y-2">
              <button
                onClick={resetCounters}
                className="w-full bg-red-600 hover:bg-red-500 text-white text-xs py-2 px-3 rounded transition-colors"
              >
                🗑️ Reset toutes les stats
              </button>
              
              <button
                onClick={() => {
                  updateWeeklyStats();
                  updatePeakTime();
                  updateSessionTime();
                }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs py-1 px-3 rounded transition-colors"
              >
                🔄 Actualiser
              </button>
            </div>

            <div className="text-[10px] text-gray-500 text-center mt-2">
              Ctrl+Shift+A pour désactiver
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
