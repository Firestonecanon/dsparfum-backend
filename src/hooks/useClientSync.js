import { useState } from 'react';

export const useClientSync = () => {
  const [error, setError] = useState(null);

  const createClient = async (clientData, source) => {
    try {
      // En mode développement, si l'API n'est pas disponible, on simule un succès
      if (process.env.NODE_ENV === 'development') {
        console.log('Mode développement : simulation création client', { clientData, source });
        return { id: 'dev_' + Date.now(), ...clientData };
      }

      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...clientData,
          source: source,
          created_at: new Date().toISOString(),
          status: 'pending'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création du client');
        throw new Error(error.message || 'Erreur lors de la création du client');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur de synchronisation client:', error);
      throw error;
    }
  };

  const updateClientStatus = async (clientId, status) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la mise à jour du statut');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur de mise à jour du statut:', error);
      throw error;
    }
  };

  return {
    createClient,
    updateClientStatus,
  };
};
