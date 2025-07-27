import React from 'react';
import { useCart } from '../context/CartContext';

export default function CartBadge({ onClick }) {
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  if (totalItems === 0) return null;

  return (
    <span 
      className="absolute -top-2 -right-2 bg-gradient-to-br from-yellow-400 to-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow animate-badge-glow border-2 border-white cursor-pointer"
      onClick={onClick}
      title="Voir le panier"
    >
      {totalItems > 99 ? '99+' : totalItems}
    </span>
  );
}
