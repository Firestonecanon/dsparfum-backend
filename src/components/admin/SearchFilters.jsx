import React from 'react';
import { FiDownload } from 'react-icons/fi';

export default function SearchFilters({ search, setSearch, filter, setFilter, onExportCsv }) {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Recherche nom ou email"
        className="flex-grow p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <select
        value={filter}
        onChange={e => setFilter(e.target.value)}
        className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Tous les clients</option>
        <option value="contact">Contacts</option>
        <option value="stripe">Commandes Stripe</option>
        <option value="pending">En attente</option>
        <option value="completed">Complétés</option>
      </select>
      <button
        onClick={onExportCsv}
        className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2 hover:bg-green-600 transition-colors"
      >
        <FiDownload className="w-4 h-4" />
        Exporter CSV
      </button>
    </div>
  );
}
