import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';

// Import de tous les parfums et étuis
import { parfumsHomme } from '../data/parfumsHomme';
import { parfumsFemme } from '../data/parfumsFemme';
import { parfumsMixte } from '../data/parfumsMixte';
import { parfumsEnfant, parfumsCreation } from '../data/parfumsEnfantCreation';
import { parfumsLuxe } from '../data/parfumsLuxe';
import { parfumsLuxury } from '../data/parfumsLuxury';
import { etuis } from '../data/etuis';

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const resultsRef = useRef(null);
  const { addToCart } = useCart();

  // Compilation de tous les produits
  const allProducts = [
    ...parfumsHomme.map(p => ({ ...p, category: 'Homme', contenance: '70ml' })),
    ...parfumsFemme.map(p => ({ ...p, category: 'Femme', contenance: '70ml' })),
    ...parfumsMixte.map(p => ({ ...p, category: 'Mixte', contenance: '70ml' })),
    ...parfumsEnfant.map(p => ({ ...p, category: 'Enfant' })),
    ...parfumsCreation.map(p => ({ ...p, category: 'Création' })),
    ...parfumsLuxe.map(p => ({ ...p, category: p.category })),
    ...parfumsLuxury.map(p => ({ ...p, category: p.category })),
    ...etuis.map(p => ({ ...p, category: 'Étuis' }))
  ];

  // Debug : vérifier si les données sont chargées
  useEffect(() => {
    console.log('SearchBar - Nombre total de produits:', allProducts.length);
    console.log('SearchBar - Exemple de produits:', allProducts.slice(0, 3));
  }, []);

  // Fonction de recherche améliorée
  const searchProducts = (term) => {
    if (!term.trim()) return [];
    
    const searchLower = term.toLowerCase();
    const filtered = allProducts.filter(product => {
      try {
        return (
          (product.name && product.name.toLowerCase().includes(searchLower)) ||
          (product.brand && product.brand.toLowerCase().includes(searchLower)) ||
          (product.ref && product.ref.toLowerCase().includes(searchLower)) ||
          (product.category && product.category.toLowerCase().includes(searchLower)) ||
          (product.id && product.id.toString().toLowerCase().includes(searchLower))
        );
      } catch (error) {
        console.error('Erreur lors de la recherche:', error, product);
        return false;
      }
    });
    
    return filtered.slice(0, 8); // Limiter à 8 résultats
  };

  // Mise à jour des résultats
  useEffect(() => {
    const filteredResults = searchProducts(searchTerm);
    setResults(filteredResults);
    setSelectedIndex(-1);
  }, [searchTerm]);

  // Gestion du clavier
  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectProduct(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Sélection d'un produit
  const handleSelectProduct = (product) => {
    const productToAdd = {
      id: `${product.category.toLowerCase()}-${product.ref || product.id}`,
      ref: product.ref || product.id,
      publicRef: product.publicRef,
      name: product.name,
      brand: product.brand,
      price: product.price,
      contenance: product.contenance || '70ml',
      category: product.category
    };
    
    addToCart(productToAdd);
    setSearchTerm('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  // Navigation vers la section
  const handleNavigateToSection = (category) => {
    const sectionMap = {
      'Homme': 'hommes',
      'Femme': 'femmes',
      'Mixte': 'mixte',
      'Enfant': 'enfant',
      'Création': 'creation',
      'Luxe': 'luxe',
      'Luxury': 'luxury',
      'Étuis': 'etuis'
    };
    
    const sectionId = sectionMap[category];
    if (sectionId) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  // Fermeture au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Couleurs par catégorie
  const getCategoryColor = (category) => {
    const colors = {
      'Homme': 'bg-blue-900/30 text-blue-300 border-blue-500/30',
      'Femme': 'bg-pink-900/30 text-pink-300 border-pink-500/30',
      'Mixte': 'bg-violet-900/30 text-violet-300 border-violet-500/30',
      'Enfant': 'bg-orange-900/30 text-orange-300 border-orange-500/30',
      'Création': 'bg-purple-900/30 text-purple-300 border-purple-500/30',
      'Luxe': 'bg-emerald-900/30 text-emerald-300 border-emerald-500/30',
      'Luxury': 'bg-red-900/30 text-red-300 border-red-500/30',
      'Étuis': 'bg-teal-900/30 text-teal-300 border-teal-500/30'
    };
    return colors[category] || 'bg-gray-900/30 text-gray-300 border-gray-500/30';
  };

  const getButtonColor = (category) => {
    const colors = {
      'Homme': 'bg-blue-500 hover:bg-blue-400',
      'Femme': 'bg-pink-500 hover:bg-pink-400',
      'Mixte': 'bg-violet-500 hover:bg-violet-400',
      'Enfant': 'bg-orange-500 hover:bg-orange-400',
      'Création': 'bg-purple-500 hover:bg-purple-400',
      'Luxe': 'bg-emerald-500 hover:bg-emerald-400',
      'Luxury': 'bg-red-500 hover:bg-red-400',
      'Étuis': 'bg-teal-500 hover:bg-teal-400'
    };
    return colors[category] || 'bg-gray-500 hover:bg-gray-400';
  };

  const getImageForProduct = (product) => {
    if (product.category === 'Étuis') {
      return product.image || '/images/Render_Cover.webp';
    }
    return 'https://raw.githubusercontent.com/Firestonecanon/dsparfum-images/main/ChatGPT%20Image%2025%20juin%202025%2C%2017_14_18.png';
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      {/* Barre de recherche */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher un parfum, une marque..."
          className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors duration-300"
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              setIsOpen(false);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Résultats de recherche */}
      {isOpen && searchTerm && (
        <div 
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto"
        >
          {results.length > 0 ? (
            <>
              <div className="p-3 border-b border-gray-700/50">
                <p className="text-xs text-gray-400">
                  {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
                </p>
              </div>
              
              {results.map((product, index) => {
                const categoryColorClass = getCategoryColor(product.category);
                const buttonColorClass = getButtonColor(product.category);
                const isSelected = index === selectedIndex;
                
                return (
                  <div
                    key={`search-${product.id}`}
                    className={`p-3 hover:bg-gray-800/50 cursor-pointer transition-colors duration-200 border-b border-gray-800/30 last:border-b-0 ${
                      isSelected ? 'bg-gray-800/70' : ''
                    }`}
                    onClick={() => handleSelectProduct(product)}
                  >
                    <div className="flex items-center gap-3">
                      {/* Image miniature */}
                      <div className="w-12 h-16 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                        <img 
                          src={getImageForProduct(product)}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      
                      {/* Informations */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-white truncate">
                            {product.name}
                          </h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${categoryColorClass} flex-shrink-0`}>
                            {product.category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mb-1">
                          {product.brand} • Réf: {product.publicRef || product.ref || product.id}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-amber-400">
                            {product.price}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectProduct(product);
                            }}
                            className={`text-xs px-2 py-1 rounded-full ${buttonColorClass} text-white transition-colors duration-200`}
                          >
                            Ajouter
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Voir toute la collection */}
              {results.length > 0 && (
                <div className="p-3 border-t border-gray-700/50">
                  <button
                    onClick={() => handleNavigateToSection(results[0].category)}
                    className="w-full text-xs text-amber-400 hover:text-amber-300 transition-colors duration-200"
                  >
                    Voir toute la collection {results[0].category} →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="p-6 text-center">
              <div className="text-gray-500 mb-2">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">
                Aucun résultat pour "{searchTerm}"
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Essayez avec un nom de parfum, une marque ou une référence
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}