import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

export default function ClientsTable({ clients, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {clients.map(client => (
            <tr key={client.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">{client.name}</div>
                <div className="text-sm text-gray-500">{client.email}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{client.phone}</div>
                <div className="text-sm text-gray-500 truncate max-w-xs">{client.address}</div>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${client.status === 'completed' ? 'bg-green-100 text-green-800' : 
                    client.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                  {client.status || 'Non défini'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {new Date(client.created_at).toLocaleString()}
              </td>
              <td className="px-6 py-4 text-sm font-medium">
                <div className="flex space-x-3">
                  <button onClick={() => onEdit(client)} className="text-indigo-600 hover:text-indigo-900">
                    <FiEdit2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => onDelete(client)} className="text-red-600 hover:text-red-900">
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
