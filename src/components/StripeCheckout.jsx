import React, { useState } from 'react';
import { CHECKOUT_URL } from '../config/api';

const StripeCheckout = ({ cart, total, onSuccess, onCancel, setIsWaitingStripe }) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    name: '',
    address: '',
    city: '',
    postal: '',
    phone: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerInfo.email) {
      setError('Veuillez saisir votre email');
      return;
    }

    setProcessing(true);
    setError(null);

    // Affiche le message d'attente dans CartModal
    if (setIsWaitingStripe) setIsWaitingStripe(true);

    // 🔥 Paiement Stripe dynamique via backend
    const cartFiltered = cart.map(item => {
      const newItem = { ...item };
      if ('description' in newItem && (!newItem.description || newItem.description.trim() === '')) {
        delete newItem.description;
      }
      return newItem;
    });
    fetch(CHECKOUT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cart: cartFiltered,
        total,
        customerInfo
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.url) {
          window.location.href = data.url;
        } else {
          setError('Erreur lors de la création de la session Stripe.');
          setProcessing(false);
          if (setIsWaitingStripe) setIsWaitingStripe(false);
        }
      })
      .catch(() => {
        setError('Erreur de connexion au serveur.');
        setProcessing(false);
        if (setIsWaitingStripe) setIsWaitingStripe(false);
      });
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Finaliser la commande</h2>
      
      {/* Résumé de commande */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-gray-700 mb-2">Résumé</h3>
        <div className="space-y-2">
          {cart.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>{item.name} x{item.quantity}</span>
              <span>{(item.price * item.quantity).toFixed(2)}€</span>
            </div>
          ))}
          <div className="border-t pt-2 font-semibold">
            <div className="flex justify-between">
              <span>Total:</span>
              <span>{total.toFixed(2)}€</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Informations client */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            required
            value={customerInfo.email}
            onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="votre@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom complet
          </label>
          <input
            type="text"
            value={customerInfo.name}
            onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Prénom Nom"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={processing}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-md hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50"
          >
            {processing ? 'Redirection...' : `Payer ${total.toFixed(2)}€`}
          </button>
        </div>
      </form>

      <div className="mt-4 text-xs text-gray-500 text-center">
        🔒 Paiement sécurisé par Stripe
      </div>
    </div>
  );
};

export default StripeCheckout;