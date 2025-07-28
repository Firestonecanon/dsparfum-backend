import React, { useEffect, useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import StatsPanel from './admin/StatsPanel';
import ClientsTable from './admin/ClientsTable';
import SearchFilters from './admin/SearchFilters';
import EditModal from './admin/EditModal';
import Pagination from './admin/Pagination';
import { useClientApi } from '../hooks/useClientApi';

const ITEMS_PER_PAGE = 10;

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [stats, setStats] = useState({ total: 0 });

  const { 
    loading, 
    error, 
    success, 
    fetchClients, 
    updateClient, 
    deleteClient,
    clearMessages 
  } = useClientApi();

  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await fetchClients();
        setClients(data.clients);
        setStats({ total: data.total });
      } catch (err) {
        console.error('Erreur lors du chargement des clients:', err);
      }
    };
    loadClients();
  }, [fetchClients]);

  const handleEdit = (client) => {
    setSelectedClient(client);
    setShowEditModal(true);
  };

  const handleUpdate = async (updatedData) => {
    try {
      const res = await fetch(`/api/clients/${selectedClient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.error || 'Échec de la mise à jour');
      setSuccess('Client mis à jour avec succès');
      setShowEditModal(false);
      fetchClients();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce client ?')) return;
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.error || 'Échec de la suppression');
      setSuccess('Client supprimé avec succès');
      fetchClients();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Gestion des clients</h2>
        <button onClick={fetchClients} className="text-gray-600 hover:text-black">
          <FiRefreshCw size={20} />
        </button>
      </div>

      {success && <div className="text-green-600 mb-2">{success}</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}

      <SearchFilters filter={filter} onFilterChange={setFilter} search={search} onSearchChange={setSearch} />
      <StatsPanel stats={stats} />

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <ClientsTable
          clients={clients}
          page={page}
          setPage={setPage}
          sortField={sortField}
          sortOrder={sortOrder}
          onSortChange={(field, order) => {
            setSortField(field);
            setSortOrder(order);
          }}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {showEditModal && (
        <EditModal
          client={selectedClient}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
}