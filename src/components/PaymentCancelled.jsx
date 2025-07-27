import React from 'react';

const PaymentCancelled = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        {/* Icône d'annulation */}
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>

        {/* Titre */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          😔 Paiement annulé
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          Votre paiement a été annulé. Aucun montant n'a été débité de votre compte.
        </p>

        {/* Raisons possibles */}
        <div className="bg-orange-50 rounded-lg p-4 mb-6 text-sm text-left">
          <h3 className="font-semibold text-orange-800 mb-2">Raisons possibles :</h3>
          <ul className="space-y-1 text-orange-700">
            <li>• Annulation volontaire</li>
            <li>• Problème avec la carte bancaire</li>
            <li>• Session expirée</li>
            <li>• Connexion interrompue</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            🛒 Reprendre mes achats
          </button>
          
          <button 
            onClick={() => window.history.back()}
            className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors"
          >
            🔄 Réessayer le paiement
          </button>
          
          <button 
            onClick={() => window.location.href = '/?section=contact'}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors"
          >
            🆘 Besoin d'aide ?
          </button>
        </div>

        {/* Message d'encouragement */}
        <div className="mt-6 p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
          <p className="text-sm text-gray-700">
            💡 <strong>Pas de souci !</strong><br/>
            Vous pouvez reprendre votre commande à tout moment. Vos articles vous attendent.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelled;
