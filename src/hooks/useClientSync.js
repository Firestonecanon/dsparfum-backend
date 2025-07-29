import { useState } from 'react';
import { CLIENTS_URL } from '../config/api';

export const useClientSync = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createClient = async (clientData) => {
    setLoading(true);
    setError(null);
    
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
      setLoading(false);
      return result;
    } catch (err) {
      console.error('🔗 useClientSync - Erreur catch:', err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
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
