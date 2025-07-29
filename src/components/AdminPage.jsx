import React, { useState, useEffect } from 'react';
import { CLIENTS_URL, ADMIN_CLIENTS_URL, ADMIN_EXPORT_URL, API_BASE_URL } from '../config/api';

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('En attente...');
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'manual',
    notes: ''
  });

  const ADMIN_PASSWORD = 'Sam230385bs';

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const savedAuth = localStorage.getItem('admin_authenticated');
    const authTime = localStorage.getItem('admin_auth_time');
    const now = Date.now();
    
    // Session de 4 heures
    if (savedAuth === 'true' && authTime && (now - parseInt(authTime)) < 4 * 60 * 60 * 1000) {
      setIsAuthenticated(true);
      loadClients();
    }
    
    // Test de connexion au backend
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      console.log('🔍 Test de connexion vers:', API_BASE_URL);
      const response = await fetch(`${API_BASE_URL}/api/clients`);
      if (response.ok) {
        setConnectionStatus('✅ Connecté');
        console.log('✅ Backend accessible');
      } else {
        setConnectionStatus(`❌ Erreur ${response.status}`);
        console.log('❌ Backend erreur:', response.status);
      }
    } catch (error) {
      setConnectionStatus('❌ Déconnecté');
      console.log('❌ Backend inaccessible:', error);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('admin_authenticated', 'true');
      localStorage.setItem('admin_auth_time', Date.now().toString());
      loadClients();
    } else {
      alert('Mot de passe incorrect');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_auth_time');
    setPassword('');
  };

  const loadClients = async () => {
    setLoading(true);
    console.log('🔍 Tentative de chargement des clients depuis:', CLIENTS_URL);
    try {
      const response = await fetch(CLIENTS_URL);
      console.log('📡 Réponse reçue:', response.status, response.statusText);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Données reçues:', data);
        setClients(data.data || []);
      } else {
        console.error('❌ Erreur lors du chargement des clients:', response.status);
        console.error('📝 Détails de l\'erreur:', await response.text());
      }
    } catch (error) {
      console.error('❌ Erreur chargement clients:', error);
      console.error('🔗 URL utilisée:', CLIENTS_URL);
    } finally {
      setLoading(false);
    }
  };

  const saveClient = async (clientData) => {
    try {
      const method = clientData.id ? 'PUT' : 'POST';
      const url = clientData.id 
        ? `${ADMIN_CLIENTS_URL}/${clientData.id}` 
        : ADMIN_CLIENTS_URL;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });

      if (response.ok) {
        loadClients();
        setShowAddModal(false);
        setSelectedClient(null);
        setNewClient({ name: '', email: '', phone: '', source: 'manual', notes: '' });
      } else {
        console.error('Erreur sauvegarde client:', response.status);
      }
    } catch (error) {
      console.error('Erreur sauvegarde client:', error);
    }
  };

  const deleteClient = async (clientId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        const response = await fetch(`${ADMIN_CLIENTS_URL}/${clientId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          loadClients();
        } else {
          console.error('Erreur suppression client:', response.status);
        }
      } catch (error) {
        console.error('Erreur suppression client:', error);
      }
    }
  };

  const exportClients = async () => {
    try {
      const response = await fetch(ADMIN_EXPORT_URL);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clients_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } catch (error) {
      console.error('Erreur export:', error);
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          client.phone.includes(searchTerm);
    const matchesFilter = filterSource === 'all' || client.source === filterSource;
    return matchesSearch && matchesFilter;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            🔐 Administration D&S Parfum
          </h2>
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Statut Backend:</strong> {connectionStatus}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              URL: {API_BASE_URL}
            </p>
            <button 
              onClick={testConnection}
              className="mt-2 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
            >
              Tester la connexion
            </button>
          </div>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500"
                placeholder="Entrez le mot de passe"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-200"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              👨‍💼 Administration Clients
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={exportClients}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
              >
                📥 Exporter
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
              >
                🚪 Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filtres et recherche */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <input
                type="text"
                placeholder="🔍 Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-500"
              />
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-500"
              >
                <option value="all">Toutes les sources</option>
                <option value="stripe">Commandes Stripe</option>
                <option value="contact">Formulaire contact</option>
                <option value="manual">Ajout manuel</option>
              </select>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-200"
            >
              ➕ Nouveau client
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-purple-600">{clients.length}</div>
            <div className="text-gray-600">Total clients</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-green-600">
              {clients.filter(c => c.source === 'stripe').length}
            </div>
            <div className="text-gray-600">Commandes</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-blue-600">
              {clients.filter(c => c.source === 'contact').length}
            </div>
            <div className="text-gray-600">Contacts</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-orange-600">
              {clients.filter(c => c.source === 'manual').length}
            </div>
            <div className="text-gray-600">Manuels</div>
          </div>
        </div>

        {/* Table des clients */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{client.name}</div>
                      {client.notes && (
                        <div className="text-sm text-gray-500">📝 {client.notes}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{client.email}</div>
                      {client.phone && (
                        <div className="text-sm text-gray-500">{client.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        client.source === 'stripe' ? 'bg-green-100 text-green-800' :
                        client.source === 'contact' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {client.source === 'stripe' ? '💳 Commande' :
                         client.source === 'contact' ? '📧 Contact' : '✍️ Manuel'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedClient(client);
                          setNewClient(client);
                          setShowAddModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        ✏️ Éditer
                      </button>
                      <button
                        onClick={() => deleteClient(client.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        🗑️ Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun client trouvé
          </div>
        )}
      </div>

      {/* Modal Ajout/Édition */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">
              {selectedClient ? '✏️ Éditer le client' : '➕ Nouveau client'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              saveClient(newClient);
            }}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nom complet"
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
                <input
                  type="tel"
                  placeholder="Téléphone"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <select
                  value={newClient.source}
                  onChange={(e) => setNewClient({...newClient, source: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="manual">Ajout manuel</option>
                  <option value="stripe">Commande Stripe</option>
                  <option value="contact">Formulaire contact</option>
                </select>
                <textarea
                  placeholder="Notes privées..."
                  value={newClient.notes}
                  onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="3"
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                >
                  Sauvegarder
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedClient(null);
                    setNewClient({ name: '', email: '', phone: '', source: 'manual', notes: '' });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
