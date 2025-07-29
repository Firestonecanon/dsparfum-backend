import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

// ⚠️ Remplacez par votre clé publique Stripe ou utilisez une variable d'environnement
// const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
const stripePromise = loadStripe('pk_test_51RnSNyJKvsgH9OAT0mXpkMdnAs4fEEYQTwiPMP7YJZFGcOMnA3ydNdthDG1hvkRgDyV9nf8lLfQFrLekDdDva7qE00oKqrJa9L'); // 🧪 Clé TEST pour développement

const CheckoutForm = ({ cart, total, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Pas besoin de Stripe pour la simulation !
    // if (!stripe || !elements) {
    //   return;
    // }

    if (!customerInfo.email) {
      setError('Veuillez saisir votre email');
      return;
    }

    setProcessing(true);
    setError(null);

    // � Paiement Stripe dynamique via backend
    fetch('https://dsparfum-backend-go.onrender.com/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cart,
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
        }
      })
      .catch(() => {
        setError('Erreur de connexion au serveur.');
        setProcessing(false);
      });
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Finaliser la commande</h2>
      
      {/* Résumé de commande */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-gray-700 mb-2">Votre commande</h3>
        {cart.map((item, index) => (
          <div key={index} className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{item.name} x{item.quantity}</span>
            <span>{(item.price * item.quantity).toFixed(2)}€</span>
          </div>
        ))}
        <div className="border-t pt-2 mt-2 font-bold text-gray-800">
          Total: {total.toFixed(2)}€
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Informations client - Simplifiées pour Checkout */}
        <div className="space-y-4 mb-6">
          <h3 className="font-semibold text-gray-700">Informations client</h3>
          
          <input
            type="email"
            placeholder="Email (obligatoire)"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            value={customerInfo.email}
            onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
            required
          />
          
          <p className="text-sm text-gray-600">
            📝 Les informations de livraison seront demandées lors du paiement sécurisé Stripe
          </p>
        </div>

        {/* Plus besoin du CardElement avec Stripe Checkout */}

        {error && (
          <div className="text-red-600 text-sm mb-4 p-2 bg-red-50 rounded">
            {error}
          </div>
        )}

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={!stripe || processing || !customerInfo.email}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {processing ? 'Redirection...' : `🔒 Payer ${total.toFixed(2)}€ avec Stripe`}
          </button>
        </div>
      </form>

      <div className="mt-4 text-xs text-gray-500 text-center">
        🔒 Paiement sécurisé par Stripe Checkout<br/>
        ✅ Vous serez redirigé vers la page de paiement officielle Stripe
      </div>
    </div>
  );
};

const StripeCheckout = ({ cart, total, onSuccess, onCancel }) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm 
        cart={cart} 
        total={total} 
        onSuccess={onSuccess} 
        onCancel={onCancel} 
      />
    </Elements>
  );
};

export default StripeCheckout;
