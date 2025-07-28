import React from 'react';

export default function StatsPanel({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-gray-500 text-sm">Total clients</h3>
        <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-gray-500 text-sm">Ce mois</h3>
        <p className="text-2xl font-bold text-blue-600">{stats.thisMonth}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-gray-500 text-sm">En attente</h3>
        <p className="text-2xl font-bold text-amber-500">{stats.pending}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-gray-500 text-sm">Complétés</h3>
        <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
      </div>
    </div>
  );
}
