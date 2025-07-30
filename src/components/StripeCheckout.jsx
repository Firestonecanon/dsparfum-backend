import React, { useState } from 'react';
import { CHECKOUT_URL } from '../config/api';
// ⚠️ SUPPRESSION: import { useContact } from '../context/ContactContext';
// ❌ StripeCheckout ne doit JAMAIS utiliser ContactContext pour éviter contamination

const StripeCheckout = ({ cart, total, customerInfo, onSuccess, onCancel, setIsWaitingStripe }) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  // ⚠️ SUPPRESSION: const { contactInfo } = useContact();
  // ❌ Les informations client doivent venir du prop customerInfo, PAS de ContactContext

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validation: Les infos client doivent être passées en prop, pas depuis ContactContext
    if (!customerInfo || !customerInfo.email) {
      setError('Informations client manquantes. Veuillez remplir le formulaire client dans le panier.');
      return;
    }

    setProcessing(true);
    setError(null);

    // Affiche le message d'attente dans CartModal
    if (setIsWaitingStripe) setIsWaitingStripe(true);

    // ✅ SÉCURISÉ: utilisation des données client passées en prop (pas de ContactContext)
    const customerData = {
      email: customerInfo.email,
      name: `${customerInfo.firstName || ''} ${customerInfo.lastName || ''}`.trim(),
      address: customerInfo.street || '',
      city: customerInfo.city || '',
      postal: customerInfo.postalCode || '',
      phone: customerInfo.phone || ''
    };

    // 🔥 Paiement Stripe dynamique via backend
    const cartFiltered = cart.map(item => {
      const newItem = { ...item };
      if ('description' in newItem && (!newItem.description || newItem.description.trim() === '')) {
        delete newItem.description;
      }
      return newItem;
    });
    
    console.log('🛒 StripeCheckout - URL utilisée:', CHECKOUT_URL);
    console.log('🛒 StripeCheckout - Données envoyées:', { cart: cartFiltered, total, customerInfo: customerData });
    
    fetch(CHECKOUT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cart: cartFiltered,
        total,
        customerInfo: customerData
      })
    })
      .then(res => {
        console.log('🛒 StripeCheckout - Réponse reçue, status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('🛒 StripeCheckout - Données reçues:', data);
        if (data.url) {
          console.log('🛒 StripeCheckout - Redirection vers:', data.url);
          window.location.href = data.url;
        } else {
          console.error('🛒 StripeCheckout - Pas d\'URL dans la réponse:', data);
          setError('Erreur lors de la création de la session Stripe.');
          setProcessing(false);
          if (setIsWaitingStripe) setIsWaitingStripe(false);
        }
      })
      .catch(error => {
        console.error('🛒 StripeCheckout - Erreur fetch:', error);
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

      {/* Informations client (affichage uniquement) */}
      <div className="bg-amber-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-amber-700 mb-2">Vos informations</h3>
        <div className="space-y-1 text-sm text-amber-800">
          <div><strong>Nom :</strong> {customerInfo.firstName} {customerInfo.lastName}</div>
          <div><strong>Email :</strong> {customerInfo.email}</div>
          <div><strong>Téléphone :</strong> {customerInfo.phone}</div>
          <div><strong>Adresse :</strong> {customerInfo.street}, {customerInfo.postalCode} {customerInfo.city}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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