import React, { createContext, useContext, useState, useEffect } from 'react';

const PromoContext = createContext();

// Base de données des codes promo
const PROMO_CODES = {
  'BIENVENUE10': {
    id: 'BIENVENUE10',
    name: 'Bienvenue',
    discount: 10,
    type: 'percentage', // 'percentage' ou 'fixed'
    minAmount: 50, // Montant minimum pour utiliser le code
    maxUsage: 100, // Nombre maximum d'utilisations
    currentUsage: 0,
    active: true,
    description: '10% de réduction sur votre première commande'
  },
  'TEST50CTS': {
    id: 'TEST50CTS',
    name: 'Test Paiement',
    discount: 0.5, // Affichage pour cohérence, la logique force le total à 0,50€
    type: 'fixed',
    minAmount: 0,
    maxUsage: 1000,
    currentUsage: 0,
    active: true,
    description: 'Code de test : le total du panier sera automatiquement fixé à 0,50€ pour tester le paiement (minimum Stripe).'
  },
  'NOEL25': {
    id: 'NOEL25',
    name: 'Noël 2024',
    discount: 25,
    type: 'percentage',
    minAmount: 100,
    maxUsage: 50,
    currentUsage: 0,
    active: true,
    description: '25% de réduction pour les fêtes'
  },
  'LIVRAISON': {
    id: 'LIVRAISON',
    name: 'Livraison offerte',
    discount: 5,
    type: 'fixed',
    minAmount: 30,
    maxUsage: 200,
    currentUsage: 0,
    active: true,
    description: '5€ de réduction (frais de port offerts)'
  },
  'VIP50': {
    id: 'VIP50',
    name: 'VIP Privilège',
    discount: 50,
    type: 'percentage',
    minAmount: 200,
    maxUsage: 10,
    currentUsage: 0,
    active: true,
    description: '50% de réduction - Code VIP exclusif'
  }
};

export const PromoProvider = ({ children }) => {
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  // Charger le code promo depuis localStorage
  useEffect(() => {
    const savedPromo = localStorage.getItem('dsparfum-promo');
    if (savedPromo) {
      try {
        const promoData = JSON.parse(savedPromo);
        setAppliedPromo(promoData);
      } catch (error) {
        console.error('Erreur lors du chargement du code promo:', error);
      }
    }
  }, []);

  // Sauvegarder le code promo dans localStorage
  useEffect(() => {
    if (appliedPromo) {
      localStorage.setItem('dsparfum-promo', JSON.stringify(appliedPromo));
    } else {
      localStorage.removeItem('dsparfum-promo');
    }
  }, [appliedPromo]);

  const validatePromoCode = (code, cartTotal) => {
    const promoCode = PROMO_CODES[code.toUpperCase()];
    
    if (!promoCode) {
      return { valid: false, error: 'Code promo invalide' };
    }

    if (!promoCode.active) {
      return { valid: false, error: 'Ce code promo n\'est plus actif' };
    }

    if (promoCode.currentUsage >= promoCode.maxUsage) {
      return { valid: false, error: 'Ce code promo a atteint sa limite d\'utilisation' };
    }

    if (cartTotal < promoCode.minAmount) {
      return { 
        valid: false, 
        error: `Montant minimum de ${promoCode.minAmount}€ requis pour ce code` 
      };
    }

    return { valid: true, promo: promoCode };
  };

  const applyPromoCode = (code, cartTotal) => {
    setPromoError('');
    setPromoSuccess('');

    const validation = validatePromoCode(code, cartTotal);
    
    if (!validation.valid) {
      setPromoError(validation.error);
      return false;
    }

    setAppliedPromo(validation.promo);
    setPromoSuccess(`Code "${validation.promo.name}" appliqué avec succès !`);
    return true;
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoError('');
    setPromoSuccess('');
  };

  const calculateDiscount = (cartTotal) => {
    if (!appliedPromo) return 0;

    if (appliedPromo.type === 'percentage') {
      return (cartTotal * appliedPromo.discount) / 100;
    } else {
      return Math.min(appliedPromo.discount, cartTotal);
    }
  };

  const getFinalPrice = (cartTotal) => {
    if (appliedPromo && appliedPromo.id === 'TEST50CTS') {
      return 0.5;
    }
    const discount = calculateDiscount(cartTotal);
    return Math.max(0, cartTotal - discount);
  };

  const clearMessages = () => {
    setPromoError('');
    setPromoSuccess('');
  };

  return (
    <PromoContext.Provider value={{
      appliedPromo,
      promoError,
      promoSuccess,
      applyPromoCode,
      removePromoCode,
      calculateDiscount,
      getFinalPrice,
      clearMessages,
      availablePromoCodes: Object.values(PROMO_CODES).filter(promo => promo.active)
    }}>
      {children}
    </PromoContext.Provider>
  );
};

export const usePromo = () => {
  const context = useContext(PromoContext);
  if (!context) {
    throw new Error('usePromo must be used within a PromoProvider');
  }
  return context;
};
