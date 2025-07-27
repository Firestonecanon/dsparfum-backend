import React, { useState, useEffect } from 'react';
import { usePromo } from '../context/PromoContext';

export default function PromoCode({ cartTotal, onPromoChange }) {
  const { 
    appliedPromo, 
    promoError, 
    promoSuccess, 
    applyPromoCode, 
    removePromoCode, 
    calculateDiscount,
    clearMessages 
  } = usePromo();
  
  const [promoInput, setPromoInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Nettoyer les messages après 5 secondes
  useEffect(() => {
    if (promoError || promoSuccess) {
      const timer = setTimeout(() => {
        clearMessages();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [promoError, promoSuccess, clearMessages]);

  // Notifier le parent des changements
  useEffect(() => {
    if (onPromoChange) {
      onPromoChange(calculateDiscount(cartTotal));
    }
  }, [appliedPromo, cartTotal, calculateDiscount, onPromoChange]);

  const handleApplyPromo = () => {
    if (!promoInput.trim()) {
      clearMessages();
      setPromoError('Veuillez entrer un code promo');
      return;
    }
    
    // Convertir en majuscules pour une meilleure UX
    const formattedCode = promoInput.trim().toUpperCase();
    const success = applyPromoCode(formattedCode, cartTotal);
    if (success) {
      setPromoInput('');
      setIsExpanded(false);
      // Afficher une notification de succès
      const discount = calculateDiscount(cartTotal);
      console.log(`✨ Code promo ${formattedCode} appliqué! Réduction: ${discount.toFixed(2)}€`);
    }
  };

  const handleRemovePromo = () => {
    removePromoCode();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleApplyPromo();
    }
  };

  const discount = calculateDiscount(cartTotal);

  return (
    <div className="bg-gray-800/30 rounded-xl border border-gray-700/30 overflow-hidden">
      {/* Header avec code appliqué ou bouton pour ajouter */}
      {appliedPromo ? (
        <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-b border-green-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-white font-semibold">Code promo appliqué</h4>
                <p className="text-green-300 text-sm">{appliedPromo.name} - {appliedPromo.description}</p>
              </div>
            </div>
            <button
              onClick={handleRemovePromo}
              className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-all duration-300 flex items-center justify-center"
              title="Supprimer le code promo"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Affichage de la réduction */}
          <div className="mt-3 p-3 bg-green-500/10 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-green-300 font-medium">Réduction appliquée:</span>
              <span className="text-green-400 font-bold text-lg">
                -{discount.toFixed(2)}€
                {appliedPromo.type === 'percentage' && (
                  <span className="text-sm text-green-300 ml-1">({appliedPromo.discount}%)</span>
                )}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <h4 className="text-white font-semibold">Code promo</h4>
                <p className="text-gray-400 text-sm">Avez-vous un code de réduction ?</p>
              </div>
            </div>
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}

      {/* Formulaire de saisie */}
      {isExpanded && !appliedPromo && (
        <div className="p-4 border-t border-gray-700/30 bg-gray-800/20">
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                placeholder="Saisissez votre code promo"
                className="flex-1 bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20"
              />
              <button
                onClick={handleApplyPromo}
                disabled={!promoInput.trim()}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-black font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
              >
                Appliquer
              </button>
            </div>

            {/* Messages */}
            {promoError && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-300 text-sm">{promoError}</span>
                </div>
              </div>
            )}

            {promoSuccess && (
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-300 text-sm">{promoSuccess}</span>
                </div>
              </div>
            )}

            {/* Message d'aide discret */}
            <div className="text-xs text-gray-500 text-center mt-2">
              <p>💡 Les codes promo sont communiqués par email, sur nos réseaux sociaux ou lors d'événements spéciaux</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
