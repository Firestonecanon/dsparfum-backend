import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { usePromo } from '../context/PromoContext';
import PromoCode from './PromoCode';
import StripeCheckout from './StripeCheckout';

export default function CartModal({ isOpen, onClose }) {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice, getCartSummary } = useCart();
  const { getFinalPrice, calculateDiscount, appliedPromo } = usePromo();
  const [showCheckout, setShowCheckout] = useState(false);
  const [isWaitingStripe, setIsWaitingStripe] = useState(false);

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

  // Déclare cartForStripe UNE SEULE FOIS ici !
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

  const handleProceedToOrder = () => {
    const summary = getCartSummary();
    const cartTotal = getTotalPrice();
    const discount = calculateDiscount(cartTotal);
    const finalPrice = getFinalPrice(cartTotal);

    let orderMessage = summary.internalSummary;
    if (appliedPromo) {
      orderMessage = orderMessage.replace(
        `TOTAL COMMANDE: ${summary.total}€`,
        `SOUS-TOTAL: ${cartTotal.toFixed(2)}€\n` +
        `CODE PROMO: ${appliedPromo.name} (-${discount.toFixed(2)}€)\n` +
        `TOTAL COMMANDE: ${finalPrice.toFixed(2)}€`
      );
    }

    const orderData = {
      subject: `Commande D&S Parfum - ${summary.totalItems} article(s)`,
      message: orderMessage,
      timestamp: Date.now()
    };

    console.log('📦 Préparation de la commande:', orderData);
    sessionStorage.setItem('dsparfum-pending-order', JSON.stringify(orderData));
    onClose();

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('newOrderReady', { detail: orderData }));
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          const messageTextarea = document.getElementById('message');
          if (messageTextarea) {
            messageTextarea.focus();
          }
        }, 1000);
      }
    }, 300);
  };

  const handlePaymentSuccess = (paymentData) => {
    setIsWaitingStripe(false);  
    console.log('✅ Paiement réussi:', paymentData);
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
    alert(`🎉 Paiement réussi !\n\nMerci pour votre commande.\nUn email de confirmation a été envoyé à ${paymentData.customer_email}`);
    setShowCheckout(false);
    onClose();
  };

  const handlePaymentCancel = () => {
    setShowCheckout(false);
    setIsWaitingStripe(false);
  };

  // Overlay d'attente AVANT StripeCheckout (optionnel)
  if (isWaitingStripe && !showCheckout) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <svg className="animate-spin h-12 w-12 text-yellow-400 mb-6" viewBox="0 0 24 24">
            <path fill="currentColor" d="M6 2v2h1v2.5c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V4h1V2H6zm1 4V4h10v2c0 .55-.45 1-1 1H8c-.55 0-1-.45-1-1zm10 14v-2h-1v-2.5c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2V18H5v2h14zm-1-4v2H7v-2c0-.55.45-1 1-1h6c.55 0 1 .45 1 1z"/>
          </svg>
          <span className="text-white text-lg font-semibold text-center">
            Veuillez patienter,<br />
            la fenêtre de paiement peut mettre jusqu'à 30 secondes à s'ouvrir...
          </span>
        </div>
      </div>
    );
  }

  // StripeCheckout affiché (UN SEUL BLOC !)
  if (showCheckout) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div className="flex items-center justify-center min-h-screen p-4 relative">
          <div className="relative z-20 w-full">
            <StripeCheckout
              cart={cartForStripe}
              total={getFinalPrice(getTotalPrice())}
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
    );
  }

  // Modal classique
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
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
                <li key={item.ref} className="flex items-center justify-between py-2 border-b border-gray-300">
                  <span className="text-black">{item.name}</span>
                  <span className="text-yellow-600 font-semibold">{parseFloat(item.price).toFixed(2)} €</span>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={e => updateQuantity(item.ref, parseInt(e.target.value))}
                    className="w-12 mx-2 text-center rounded"
                  />
                  <button
                    className="text-red-500 ml-2"
                    onClick={() => removeFromCart(item.ref)}
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
                onClick={clearCart}
              >
                Vider le panier
              </button>
              <button
                className="bg-yellow-400 text-black px-4 py-2 rounded font-bold hover:bg-yellow-300"
                onClick={() => {
                  setShowCheckout(true);
                }}
              >
                Paiement
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded font-bold hover:bg-blue-400"
                onClick={handleProceedToOrder}
              >
                Commander
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}