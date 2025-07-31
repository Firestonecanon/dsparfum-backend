import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { usePromo } from '../context/PromoContext';
import { useClientSync } from '../hooks/useClientSync';
// ⚠️ SUPPRESSION: import { useContact } from '../context/ContactContext';
// ❌ CartModal ne doit JAMAIS utiliser ContactContext pour éviter la contamination
import CustomerInfoForm from './CustomerInfoForm';
import { CLIENTS_URL, CHECKOUT_URL } from '../config/api';
import PromoCode from './PromoCode';
import StripeCheckout from './StripeCheckout';

export default function CartModal({ isOpen, onClose }) {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice, getCartSummary } = useCart();
  const { getFinalPrice, calculateDiscount, appliedPromo } = usePromo();
  const { createClient, updateClientStatus } = useClientSync();
  // ⚠️ SUPPRESSION: const { contactInfo, setContactInfo } = useContact();
  
  // ✅ État local SÉPARÉ pour les informations client du panier (pas de ContactContext)
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    postalCode: '',
    city: ''
  });
  
  const [showCheckout, setShowCheckout] = useState(false);
  const [isWaitingStripe, setIsWaitingStripe] = useState(false);
  const [clientId, setClientId] = useState(null);
  const [error, setError] = useState(null);
  const [showPrePaymentForm, setShowPrePaymentForm] = useState(false);

// ⚠️ IMPORTANT: customerInfo est local au panier, séparé du formulaire de contact
// Cela évite la contamination croisée entre contact et clients

// Synchronisation des données du panier avec le stockage
useEffect(() => {
  if (items.length > 0) {
    sessionStorage.setItem('dsparfum-pending-order', JSON.stringify({
      firstName: customerInfo.firstName,
      lastName: customerInfo.lastName,
      email: customerInfo.email,
      phone: customerInfo.phone,
      street: customerInfo.street,
      postalCode: customerInfo.postalCode,
      city: customerInfo.city,
      items,
      total: getFinalPrice(),
      promo: appliedPromo,
      timestamp: Date.now()
    }));
  }
}, [items, customerInfo, getFinalPrice, appliedPromo]);

React.useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
  return () => {
    document.body.style.overflow = '';
  };
}, [isOpen]);

  if (!isOpen) return null;

  // Préparation panier Stripe
  const cartForStripe = items
    .map(item => {
      const basePrice = parseFloat(item.price);
      if (isNaN(basePrice)) {
        console.error(`❌ Prix invalide pour ${item.name}:`, item.price);
        return null;
      }
      const finalPrice = getFinalPrice(basePrice);
      const stripeItem = {
        name: item.name || 'Produit sans nom',
        price: finalPrice,
        quantity: parseInt(item.quantity) || 1,
        description: `${item.name} - Parfum D&S`,
        ref: item.ref,
        publicRef: item.publicRef
      };
      if (item.image) {
        stripeItem.image = item.image;
      }
      return stripeItem;
    })
    .filter(Boolean);

  // Gérer la soumission du formulaire client AVANT paiement
  const handlePrePaymentFormSubmit = async (customerData) => {
    try {
      console.log('🛒 CartModal - Données client reçues:', customerData);
      
      // ✅ Mettre à jour UNIQUEMENT customerInfo local (pas ContactContext)
      setCustomerInfo({
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        email: customerData.email,
        phone: customerData.phone,
        street: customerData.street,
        postalCode: customerData.postalCode,
        city: customerData.city
      });

      console.log('🛒 CartModal - customerInfo mis à jour localement (séparé du contact)');

      // Créer le client avec les données complètes et champs séparés
      const clientData = {
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        email: customerData.email,
        phone: customerData.phone,
        street: customerData.street,
        postalCode: customerData.postalCode,
        city: customerData.city,
        message: customerData.message || '',
        cart: items.map(item => ({
          id: item.id,
          ref: item.ref,
          publicRef: item.publicRef,
          name: item.name,
          brand: item.brand,
          price: item.price,
          contenance: item.contenance,
          category: item.category,
          quantity: item.quantity
        })),
        total: getTotalPrice(),
        promo: appliedPromo ? appliedPromo.name : null,
        timestamp: Date.now() // Timestamp unique pour éviter les doublons
      };
      
      console.log('🛒 CartModal - Tentative création client avec:', clientData);
      console.log('🛒 CartModal - Items dans le panier:', items.length);
      const result = await createClient(clientData);
      console.log('🛒 CartModal - Client créé avec succès:', result);
      setClientId(result.id);
      
      // Fermer le formulaire et ouvrir Stripe
      setShowPrePaymentForm(false);
      setShowCheckout(true);
      
    } catch (error) {
      console.error('❌ Erreur lors de la création du client:', error);
      alert('Erreur lors de la préparation du paiement. Veuillez réessayer.');
    }
  };

  // Paiement Stripe réussi
  const [isWakingUpServer, setIsWakingUpServer] = useState(false);

  // Fonction pour réveiller le serveur dès qu'on ouvre le panier
  const wakeUpServer = async () => {
    if (isWakingUpServer) return; // Éviter les appels multiples
    
    setIsWakingUpServer(true);
    try {
      console.log('🔄 Réveil du serveur Render...');
      // Appel simple pour réveiller le serveur
      const response = await fetch('https://api.dsparfum.fr/api/health', {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // Timeout de 5 secondes
      });
      console.log('✅ Serveur réveillé:', response.status);
    } catch (error) {
      console.log('⚠️ Réveil serveur en cours:', error.message);
    } finally {
      setIsWakingUpServer(false);
    }
  };

  // Réveiller le serveur dès l'ouverture du panier
  React.useEffect(() => {
    if (isOpen && items.length > 0) {
      wakeUpServer();
    }
  }, [isOpen]);

  // Réveiller le serveur quand on commence à remplir les infos
  React.useEffect(() => {
    if (clientData.email && clientData.email.includes('@')) {
      wakeUpServer();
    }
  }, [clientData.email]);

  // Fonction sécurisée pour vider le panier
  const handleClearCart = () => {
    try {
      // Confirmation avant de vider
      if (window.confirm('Êtes-vous sûr de vouloir vider le panier ?')) {
        clearCart();
        
        // Reset des states pour éviter les bugs
        setShowPrePaymentForm(false);
        setShowCheckout(false);
        setIsWaitingStripe(false);
        setPaymentStatus(null);
        
        // Fermer la modal proprement
        setTimeout(() => {
          if (onClose) onClose();
        }, 100);
      }
    } catch (error) {
      console.error('Erreur lors du vidage du panier:', error);
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    setIsWaitingStripe(false);  
    const summary = getCartSummary();
    const cartTotal = getTotalPrice();
    const finalPrice = getFinalPrice(cartTotal);

    const emailData = {
      subject: `🎉 Confirmation de commande - D&S Parfum`,
      message: `
        Bonjour,
        Nous avons bien reçu votre commande. Voici le récapitulatif :
        ${summary.internalSummary}
        ${appliedPromo ? `
        Code promo appliqué : ${appliedPromo.name}
        Réduction : -${calculateDiscount(cartTotal).toFixed(2)}€
        ` : ''}
        Total payé : ${finalPrice.toFixed(2)}€
        Numéro de commande : ${paymentData.id}
        Merci de votre confiance !
        L'équipe D&S Parfum
      `.trim(),
      timestamp: Date.now()
    };

    // Mettre à jour le client existant avec l'orderId Stripe au lieu d'en créer un nouveau
    if (clientId) {
      const updateData = {
        orderId: paymentData.id,
        paymentStatus: 'completed',
        finalTotal: finalPrice
      };

      fetch(`${CLIENTS_URL}/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })
        .then(res => res.json())
        .then(data => {
          console.log('✅ Client mis à jour avec orderId:', data);
        })
        .catch(err => {
          console.error('❌ Erreur mise à jour client:', err);
        });
    }

    window.emailjs.send(
      'service_dsparfum',
      'template_confirmation',
      {
        to_email: paymentData.customer_email,
        subject: emailData.subject,
        message: emailData.message
      }
    ).then(
      (response) => console.log('📧 Email de confirmation envoyé:', response),
      (error) => console.error('❌ Erreur envoi email:', error)
    );

    clearCart();
    
    // Reset tous les states pour éviter les bugs
    setShowCheckout(false);
    setIsWaitingStripe(false);
    setPaymentStatus(null);
    setClientData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      street: '',
      postalCode: '',
      city: ''
    });
    
    // Fermer la modal avec un petit délai pour éviter les conflits
    setTimeout(() => {
      onClose();
    }, 100);
    
    // Message de confirmation du paiement
    alert(`🎉 Paiement réussi !\n\nMerci pour votre commande.\nNous vous contacterons bientôt pour la livraison.\n\nNuméro de commande : ${paymentData.id}`);
  };

  const handlePaymentCancel = () => {
    setShowCheckout(false);
    setIsWaitingStripe(false);
  };

  // Overlay d'attente AVANT StripeCheckout avec infos utiles
  if (isWaitingStripe && !showCheckout) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
        <div className="flex flex-col items-center justify-center min-h-screen p-6 max-w-md text-center">
          <div className="relative mb-8">
            <svg className="animate-spin h-16 w-16 text-yellow-400 mb-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M6 2v2h1v2.5c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V4h1V2H6zm1 4V4h10v2c0 .55-.45 1-1 1H8c-.55 0-1-.45-1-1zm10 14v-2h-1v-2.5c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2V18H5v2h14zm-1-4v2H7v-2c0-.55.45-1 1-1h6c.55 0 1 .45 1 1z"/>
            </svg>
            {isWakingUpServer && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-pulse flex items-center justify-center">
                <span className="text-xs text-white">🔄</span>
              </div>
            )}
          </div>
          
          <h3 className="text-white text-xl font-bold mb-4">🔐 Préparation du paiement sécurisé</h3>
          
          <div className="space-y-3 text-white/90">
            <p className="text-lg font-semibold">
              ⏳ Veuillez patienter...
            </p>
            <p className="text-sm">
              La fenêtre de paiement Stripe peut prendre <strong>jusqu'à 30 secondes</strong> à s'afficher
            </p>
            {isWakingUpServer && (
              <p className="text-sm text-green-400 animate-pulse">
                🚀 Optimisation en cours : réveil du serveur pour accélérer le processus
              </p>
            )}
            <div className="mt-6 p-4 bg-white/10 rounded-lg">
              <p className="text-xs text-white/80">
                💡 <strong>Pourquoi cette attente ?</strong><br/>
                Nous utilisons des serveurs écologiques qui se mettent en veille pour économiser l'énergie. 
                Cette attente garantit un paiement 100% sécurisé.
              </p>
            </div>
          </div>
          
          <button 
            onClick={handlePaymentCancel}
            className="mt-6 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ❌ Annuler
          </button>
        </div>
      </div>
    );
  }

  // StripeCheckout affiché
  if (showCheckout) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70">
        {/* Version mobile - plein écran */}
        <div className="lg:hidden h-full overflow-auto">
          <div className="min-h-full bg-white p-4 pt-16">
            <div className="relative z-20 w-full">
              <StripeCheckout
                cart={cartForStripe}
                total={getFinalPrice(getTotalPrice())}
                customerInfo={customerInfo}
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
                setIsWaitingStripe={setIsWaitingStripe}
              />
            </div>
            {isWaitingStripe && (
              <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-50">
                <svg className="animate-spin h-12 w-12 text-yellow-400 mb-6" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M6 2v2h1v2.5c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V4h1V2H6zm1 4V4h10v2c0 .55-.45 1-1 1H8c-.55 0-1-.45-1-1zm10 14v-2h-1v-2.5c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2V18H5v2h14zm-1-4v2H7v-2c0-.55.45-1 1-1h6c.55 0 1 .45 1 1z"/>
                </svg>
                <span className="text-white text-lg font-semibold text-center px-4">
                  Veuillez patienter,<br />
                  la fenêtre de paiement peut mettre jusqu'à 30 secondes à s'ouvrir...
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Version desktop */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="flex items-center justify-center min-h-screen p-4 relative">
            <div className="relative z-20 w-full">
              <StripeCheckout
                cart={cartForStripe}
                total={getFinalPrice(getTotalPrice())}
                customerInfo={customerInfo}
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
                setIsWaitingStripe={setIsWaitingStripe}
              />
            </div>
            {isWaitingStripe && (
              <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-50">
                <svg className="animate-spin h-12 w-12 text-yellow-400 mb-6" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M6 2v2h1v2.5c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V4h1V2H6zm1 4V4h10v2c0 .55-.45 1-1 1H8c-.55 0-1-.45-1-1zm10 14v-2h-1v-2.5c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2V18H5v2h14zm-1-4v2H7v-2c0-.55.45-1 1-1h6c.55 0 1 .45 1 1z"/>
                </svg>
                <span className="text-white text-lg font-semibold text-center">
                  Veuillez patienter,<br />
                  la fenêtre de paiement peut mettre jusqu'à 30 secondes à s'ouvrir...
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Affichage du formulaire client AVANT paiement
  if (showPrePaymentForm) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70">
        {/* Version mobile optimisée */}
        <div className="lg:hidden h-full overflow-auto">
          <div className="min-h-full bg-gradient-to-br from-amber-50 to-yellow-50 p-4 pt-16">
            <button
              className="fixed top-4 right-4 z-60 bg-white rounded-full w-10 h-10 flex items-center justify-center text-amber-900 text-xl hover:text-amber-700 shadow-lg"
              onClick={() => {
                setShowPrePaymentForm(false);
              }}
              aria-label="Fermer"
            >
              &times;
            </button>
            
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-amber-900 mb-2">Finaliser la commande</h2>
              <p className="text-amber-700 text-sm">
                Remplissez vos informations pour procéder au paiement sécurisé.
              </p>
            </div>
            
            <CustomerInfoForm 
              onSubmit={handlePrePaymentFormSubmit}
              submitButtonText="Procéder au paiement"
              title="Vos informations"
            />
          </div>
        </div>

        {/* Version desktop */}
        <div className="hidden lg:flex items-center justify-center h-full">
          <div className="relative z-10 max-w-2xl mx-auto bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-8 shadow-2xl">
            <button
              className="absolute top-4 right-4 text-amber-900 text-2xl hover:text-amber-700"
              onClick={() => {
                setShowPrePaymentForm(false);
              }}
              aria-label="Fermer"
            >
              &times;
            </button>
            
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold text-amber-900 mb-2">Finaliser la commande</h2>
              <p className="text-amber-700">
                Remplissez vos informations pour procéder au paiement sécurisé.
              </p>
            </div>
            
            <CustomerInfoForm 
              onSubmit={handlePrePaymentFormSubmit}
              submitButtonText="Procéder au paiement"
              title="Vos informations"
            />
          </div>
        </div>
      </div>
    );
  }

  // Modal classique
  return (
    <div className="fixed inset-0 z-50 bg-black/70">
      {/* Version mobile - plein écran */}
      <div className="lg:hidden h-full overflow-auto">
        <div className="min-h-full bg-white p-4 pt-16">
          <button
            className="fixed top-4 right-4 z-60 bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center text-black text-xl hover:bg-gray-200"
            onClick={onClose}
            aria-label="Fermer"
          >
            &times;
          </button>
          
          <h2 className="text-2xl font-bold text-black mb-6">Votre panier</h2>
          
          {items.length === 0 ? (
            <div className="text-black text-center py-8">
              Votre panier est vide.
            </div>
          ) : (
            <div>
              <ul className="mb-6 space-y-4">
                {items.map(item => (
                  <li key={item.id} className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-black font-medium flex-1 mr-2">{item.name}</span>
                      <span className="text-yellow-600 font-semibold">{parseFloat(item.price).toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 mr-2">Quantité :</span>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => updateQuantity(item.id, parseInt(e.target.value))}
                          className="w-16 p-1 text-center border rounded"
                        />
                      </div>
                      <button
                        className="text-red-500 text-sm"
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Retirer ${item.name}`}
                      >
                        Retirer
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              
              <PromoCode />
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-black font-bold text-lg">Total :</span>
                  <span className="text-yellow-600 font-bold text-xl">{getFinalPrice(getTotalPrice()).toFixed(2)} €</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  className="w-full bg-yellow-400 text-black py-3 px-4 rounded-lg font-bold hover:bg-yellow-300 transition-colors"
                  onClick={() => {
                    console.log('🛒 Ouverture du formulaire de pré-paiement');
                    setShowPrePaymentForm(true);
                  }}
                >
                  Procéder au paiement
                </button>
                
                <button
                  className="w-full bg-gray-200 text-black py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  onClick={handleClearCart}
                >
                  Vider le panier
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Version desktop - modal classique */}
      <div className="hidden lg:flex items-center justify-center">
        <div className="relative z-10 max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow-2xl">
          <button
            className="absolute top-4 right-4 text-black text-2xl"
            onClick={onClose}
            aria-label="Fermer"
          >
            &times;
          </button>
          <h2 className="text-2xl font-bold text-black mb-4">Votre panier</h2>
          {items.length === 0 ? (
            <div className="text-black text-center py-8">
              Votre panier est vide.
            </div>
          ) : (
            <div>
              <ul className="mb-4">
                {items.map(item => (
                  <li key={item.id} className="flex items-center justify-between py-2 border-b border-gray-300">
                    <span className="text-black">{item.name}</span>
                    <span className="text-yellow-600 font-semibold">{parseFloat(item.price).toFixed(2)} €</span>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => updateQuantity(item.id, parseInt(e.target.value))}
                      className="w-12 mx-2 text-center rounded"
                    />
                    <button
                      className="text-red-500 ml-2"
                      onClick={() => removeFromCart(item.id)}
                      aria-label={`Retirer ${item.name}`}
                    >
                      Retirer
                    </button>
                  </li>
                ))}
              </ul>
              <PromoCode />
              <div className="flex justify-between items-center mt-4">
                <span className="text-black font-bold">Total :</span>
                <span className="text-yellow-600 font-bold text-lg">{getFinalPrice(getTotalPrice()).toFixed(2)} €</span>
              </div>

              <div className="flex justify-end mt-6 space-x-4">
                <button
                  className="bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300"
                  onClick={handleClearCart}
                >
                  Vider le panier
                </button>
                <button
                  className="bg-yellow-400 text-black px-4 py-2 rounded font-bold hover:bg-yellow-300"
                  onClick={() => {
                    console.log('🛒 Ouverture du formulaire de pré-paiement');
                    setShowPrePaymentForm(true);
                  }}
                >
                  Paiement
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}