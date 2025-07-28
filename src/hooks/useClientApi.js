import { useState, useCallback } from 'react';

export const useClientApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/clients');
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Erreur lors du chargement des clients');
      return { clients: data.clients || [], total: data.clients?.length || 0 };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateClient = async (id, data) => {
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.error || 'Échec de la mise à jour');
      setSuccess('Client mis à jour avec succès');
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteClient = async (id) => {
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.error || 'Échec de la suppression');
      setSuccess('Client supprimé avec succès');
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return {
    loading,
    error,
    success,
    fetchClients,
    updateClient,
    deleteClient,
    clearMessages
  };
};
