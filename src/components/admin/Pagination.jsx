import React from 'react';

export default function Pagination({ page, totalPages, itemsPerPage, totalItems, onPageChange }) {
  return (
    <div className="mt-4 flex justify-between items-center">
      <div className="text-sm text-gray-700">
        Affichage de {Math.min((page - 1) * itemsPerPage + 1, totalItems)} à{' '}
        {Math.min(page * itemsPerPage, totalItems)} sur {totalItems} résultats
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className={`px-3 py-1 border rounded-md ${
            page === 1 ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-50'
          }`}
        >
          Précédent
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className={`px-3 py-1 border rounded-md ${
            page === totalPages ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-50'
          }`}
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
