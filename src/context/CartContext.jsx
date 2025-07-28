import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { convertMessageToInternal } from '../utils/referenceConverter';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
case 'ADD_TO_CART':
  const existingItem = state.items.find(item => item.id === action.payload.id);
  if (existingItem) {
    return {
      ...state,
      items: state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    };
  }
  
  return {
    ...state,
    items: [...state.items, { ...action.payload, quantity: 1 }]
  };

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(0, action.payload.quantity) }
            : item
        ).filter(item => item.quantity > 0)
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };

    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload || []
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Charger le panier depuis localStorage au démarrage
  useEffect(() => {
    const savedCart = localStorage.getItem('dsparfum-cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: cartData });
      } catch (error) {
        console.error('Erreur lors du chargement du panier:', error);
      }
    }
  }, []);

  // Sauvegarder le panier dans localStorage à chaque modification
  useEffect(() => {
    localStorage.setItem('dsparfum-cart', JSON.stringify(state.items));
  }, [state.items]);

  const addToCart = (product) => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const updateQuantity = (productId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => {
      const price = parseFloat(item.price.replace('€', '').replace(',', '.').trim());
      console.log(`Prix item ${item.name}:`, item.price, '-> parsed:', price);
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartSummary = () => {
    const items = state.items.map(item => ({
      name: item.name,
      brand: item.brand,
      ref: item.ref || item.id,
      publicRef: item.publicRef, 
      price: item.price,
      quantity: item.quantity,
      contenance: item.contenance || '70ml'
  }));

    const total = getTotalPrice();
    const totalItems = getTotalItems();

    return {
      items,
      total: total.toFixed(2),
      totalItems,
      formattedSummary: formatCartForEmail(items, total, totalItems),
      internalSummary: formatCartForInternalEmail(items, total, totalItems)
    };
  };

  const formatCartForEmail = (items, total, totalItems) => {
    let summary = `COMMANDE D&S PARFUM\n`;
    summary += `========================\n\n`;
    
    items.forEach((item, index) => {
      summary += `${index + 1}. ${item.name}\n`;
      summary += `   Marque: ${item.brand}\n`;
      summary += `   Référence: ${item.publicRef || item.ref}\n`;
      summary += `   Contenance: ${item.contenance}\n`;
      summary += `   Prix unitaire: ${item.price}\n`;
      summary += `   Quantité: ${item.quantity}\n`;
      summary += `   Sous-total: ${(parseFloat(item.price.replace('€', '').replace(',', '.')) * item.quantity).toFixed(2)}€\n\n`;
    });

    summary += `========================\n`;
    summary += `TOTAL ARTICLES: ${totalItems}\n`;
    summary += `TOTAL COMMANDE: ${total.toFixed(2)}€\n\n`;
    
    summary += `MODES DE PAIEMENT ACCEPTÉS:\n`;
    summary += `• PayPal\n`;
    summary += `• Wero\n`;
    summary += `• Virement bancaire\n`;
    summary += `• Carte bancaire (nous vous guiderons)\n\n`;
    
    summary += `Merci de préciser votre mode de paiement préféré dans votre message.\n`;
    summary += `Nous vous recontacterons rapidement pour finaliser votre commande.`;

    return summary;
  };

  // Format pour email interne automatique (avec conversion des références)
  const formatCartForInternalEmail = (items, total, totalItems) => {
    let summary = `COMMANDE D&S PARFUM - GESTION INTERNE\n`;
    summary += `=====================================\n\n`;
    
    items.forEach((item, index) => {
      summary += `${index + 1}. ${item.name}\n`;
      summary += `   Marque: ${item.brand}\n`;
      summary += `   Réf. Client: ${item.publicRef || item.ref}\n`;
      summary += `   Code Interne: ${item.ref}\n`;
      summary += `   Contenance: ${item.contenance}\n`;
      summary += `   Prix unitaire: ${item.price}\n`;
      summary += `   Quantité: ${item.quantity}\n`;
      summary += `   Sous-total: ${(parseFloat(item.price.replace('€', '').replace(',', '.')) * item.quantity).toFixed(2)}€\n\n`;
    });

    summary += `=====================================\n`;
    summary += `TOTAL ARTICLES: ${totalItems}\n`;
    summary += `TOTAL COMMANDE: ${total.toFixed(2)}€\n\n`;
    
    summary += `--- CODES POUR PRÉPARATION ---\n`;
    items.forEach((item) => {
      summary += `${item.name} → Code: ${item.ref}\n`;
    });

    return summary;
  };

  return (
    <CartContext.Provider value={{
      items: state.items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      getCartSummary
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};