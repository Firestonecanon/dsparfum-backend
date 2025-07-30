import { useState, useRef } from 'react';
import { CLIENTS_URL } from '../config/api';

export const useClientSync = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const pendingRequests = useRef(new Map());

  const createClient = async (clientData) => {
    // Créer une clé unique basée sur email et timestamp
    const requestKey = `${clientData.email}_${clientData.timestamp}`;
    
    // Si une requête identique est déjà en cours, attendre son résultat
    if (pendingRequests.current.has(requestKey)) {
      console.log('🔗 useClientSync - Requête déjà en cours, réutilisation:', requestKey);
      return await pendingRequests.current.get(requestKey);
    }

    setLoading(true);
    setError(null);
    
    const requestPromise = (async () => {
      try {
        console.log('🔗 useClientSync - URL utilisée:', CLIENTS_URL);
        console.log('🔗 useClientSync - Données envoyées:', clientData);
        
        const response = await fetch(CLIENTS_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(clientData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('🔗 useClientSync - Erreur response:', response.status, errorText);
          throw new Error('Erreur lors de la création du client');
        }

        const result = await response.json();
        console.log('🔗 useClientSync - Résultat:', result);
        return result;
      } catch (err) {
        console.error('🔗 useClientSync - Erreur catch:', err);
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
        // Nettoyer la requête du cache après 5 secondes
        setTimeout(() => {
          pendingRequests.current.delete(requestKey);
        }, 5000);
      }
    })();

    // Mettre en cache la promesse
    pendingRequests.current.set(requestKey, requestPromise);
    
    return await requestPromise;
  };

  const updateClientStatus = async (clientId, status) => {
    setLoading(true);
    setError(null);
    
    try {
      const updateUrl = `${CLIENTS_URL}/${clientId}/status`;
      console.log('🔗 useClientSync - Update URL utilisée:', updateUrl);
      
      const response = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔗 useClientSync - Erreur update:', response.status, errorText);
        throw new Error('Erreur lors de la mise à jour du statut');
      }

      const result = await response.json();
      console.log('🔗 useClientSync - Update résultat:', result);
      setLoading(false);
      return result;
    } catch (err) {
      console.error('🔗 useClientSync - Erreur update catch:', err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return {
    createClient,
    updateClientStatus,
    loading,
    error,
  };
};
