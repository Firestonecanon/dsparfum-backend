import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import CartModal from './CartModal';

export default function CartIcon() {
  const { getTotalItems } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const totalItems = getTotalItems();

  return (
    <>
      <button
  onClick={() => setIsModalOpen(true)}
  className="fixed bottom-5 right-5 z-[100] bg-gray-900/90 border-2 border-yellow-400 shadow-xl rounded-full p-4 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
  style={{
    boxShadow: '0 4px 32px 0 rgba(255, 215, 0, 0.25), 0 1.5px 8px 0 rgba(0,0,0,0.15)',
    minWidth: 56,
    minHeight: 56,
  }}
  aria-label="Ouvrir le panier"
>
  <svg className="w-7 h-7 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0V19a2 2 0 002 2h7a2 2 0 002-2v-.5" />
  </svg>
  {totalItems > 0 && (
    <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse shadow-lg">
      {totalItems > 99 ? '99+' : totalItems}
    </span>
  )}
</button>

      <CartModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}