import React from 'react';

const PaymentSuccess = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        {/* Icône de succès */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>

        {/* Titre */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          🎉 Paiement réussi !
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          Votre commande a été confirmée et sera traitée dans les plus brefs délais.
        </p>

        {/* Informations */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">📧 Confirmation email</span>
            <span className="text-green-600 font-semibold">Envoyé</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">🚚 Livraison</span>
            <span className="text-blue-600 font-semibold">6-10 jours</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">📱 Support</span>
            <span className="text-purple-600 font-semibold">24h/7j</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            🏠 Retour à l'accueil
          </button>
          
          <button 
            onClick={() => window.location.href = '/?section=contact'}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors"
          >
            📞 Nous contacter
          </button>
        </div>

        {/* Message de remerciement */}
        <div className="mt-6 p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
          <p className="text-sm text-gray-700">
            ✨ <strong>Merci de votre confiance !</strong><br/>
            L'équipe D&S Parfum vous remercie pour votre achat.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
