import React from 'react';
import { useCart } from '../context/CartContext';

const FloatingCartMobile = ({ onClick, isModalOpen = false }) => {
  const { getTotalItems, getTotalPrice } = useCart();
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  // Cacher la barre si le modal est ouvert ou si le panier est vide
  if (totalItems === 0 || isModalOpen) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 lg:hidden">
      <button
        onClick={onClick}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl shadow-2xl flex items-center justify-between animate-bounce-once"
        style={{
          backdropFilter: 'blur(10px)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div className="flex items-center">
          <div className="bg-white bg-opacity-20 rounded-full p-2 mr-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0V19a2 2 0 002 2h7a2 2 0 002-2v-.5" />
            </svg>
          </div>
          <div className="text-left">
            <div className="font-semibold">
              {totalItems} article{totalItems > 1 ? 's' : ''}
            </div>
            <div className="text-sm opacity-90">
              {totalPrice.toFixed(2)}�
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <span className="font-bold mr-2">Voir le panier</span>
          <div className="bg-yellow-400 text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            {totalItems > 9 ? '9+' : totalItems}
          </div>
        </div>
      </button>
      <style>
        {`
        @keyframes bounce-once {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-once {
          animation: bounce-once 0.6s ease-in-out;
        }
        `}
      </style>
    </div>
  );
};

export default FloatingCartMobile;