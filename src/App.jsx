import React, { useState, useEffect, useRef } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { PromoProvider } from './context/PromoContext';
import { ContactProvider } from './context/ContactContext';
import HommeSection from './components/HommeSection';
import FemmeSection from './components/FemmeSection';
import MixteSection from './components/MixteSection';
import { EnfantSection, CreationSection } from './components/EnfantCreationSection';
import LuxeSection from './components/LuxeSection';
import LuxurySection from './components/LuxurySection';
import EtuisSection from './components/EtuisSection';
import CartBadge from './components/CartBadge';
import FloatingCartMobile from './components/FloatingCartMobile';
import CartModal from './components/CartModal';
import ContactSection from './components/ContactSection';
import SearchBar from './components/SearchBar';
import PrivateVisitCounter from './components/PrivateVisitCounter';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentCancelled from './components/PaymentCancelled';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminPage from './components/AdminPage';
import { parfumsHomme } from './data/parfumsHomme';
import { parfumsFemme } from './data/parfumsFemme';
import { parfumsMixte } from './data/parfumsMixte';
import { parfumsLuxe } from './data/parfumsLuxe';
import { parfumsLuxury } from './data/parfumsLuxury';
import { parfumsEnfant, parfumsCreation } from './data/parfumsEnfantCreation';

// Fonction pour détecter les paramètres URL
function useURLParams() {
  const [urlParams, setUrlParams] = useState(new URLSearchParams());
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUrlParams(params);
    
    // Gestion des paramètres de simulation de paiement
    if (params.get('payment') === 'simulation') {
      const total = params.get('total');
      const email = params.get('email');
      
      console.log('🎭 Mode simulation de paiement détecté:', { total, email });
      
      // Afficher une notification de simulation
      setTimeout(() => {
        alert(`🎭 SIMULATION PAIEMENT\n\nTotal: ${total}€\nEmail: ${decodeURIComponent(email)}\n\nCeci est une simulation pour le développement.`);
        
        // Nettoyer l'URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 1000);
    }
  }, []);
  
  return urlParams;
}

// Fonction utilitaire pour le smooth scroll cross-browser optimisée mobile
function smoothScrollTo(targetPosition, duration = 600) {
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime = null;

  // Si la distance est très petite, on scroll directement
  if (Math.abs(distance) < 10) {
    window.scrollTo(0, targetPosition);
    return;
  }

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = ease(timeElapsed, startPosition, distance, duration);
    
    // Utiliser scrollTo avec coordonnées uniquement pour éviter les problèmes de comportement
    window.scrollTo(0, Math.round(run));
    
    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    } else {
      // S'assurer qu'on arrive exactement à la position finale
      window.scrollTo(0, targetPosition);
    }
  }

  function ease(t, b, c, d) {
    // Fonction d'easing plus douce pour mobile
    t /= d;
    t--;
    return c * (t * t * t + 1) + b;
  }

  requestAnimationFrame(animation);
}

// Fonction de scroll optimisée pour mobile
function scrollToPosition(targetPosition) {
  // Détecter si on est sur mobile
  const isMobile = window.innerWidth <= 768;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  
  // Debug en mode développement
  if (import.meta.env.DEV) {
    console.log('📱 Scroll mobile - Target:', targetPosition, 'Mobile:', isMobile, 'iOS:', isIOS, 'Safari:', isSafari);
  }
  
  // Pour iOS Safari, utiliser une approche différente
  if (isIOS || isSafari) {
    // Scroll immédiat pour iOS Safari qui a des problèmes avec smooth scroll
    window.scrollTo(0, targetPosition);
    return;
  }
  
  // Test de support du smooth scroll
  const supportsNativeSmooth = 'scrollBehavior' in document.documentElement.style;
  
  if (supportsNativeSmooth && !isMobile) {
    // Utiliser le smooth scroll natif sur desktop
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  } else {
    // Utiliser l'animation personnalisée pour mobile et les navigateurs sans support
    smoothScrollTo(targetPosition);
  }
}

// Composant Pack Découverte avec sélection optimisée
function PackDecouverteSection() {
  const [selectedSamples, setSelectedSamples] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const { addToCart } = useCart();

  // Combiner tous les parfums disponibles avec leurs catégories
  const allSamples = [
    ...parfumsHomme.map(p => ({ ...p, category: 'Homme' })),
    ...parfumsFemme.map(p => ({ ...p, category: 'Femme' })),
    ...parfumsMixte.map(p => ({ ...p, category: 'Mixte' })),
    ...parfumsLuxe.map(p => ({ ...p, category: 'Luxe' })),
    ...parfumsLuxury.map(p => ({ ...p, category: 'Luxury' })),
    ...parfumsEnfant.map(p => ({ ...p, category: 'Enfant' })),
    ...parfumsCreation.map(p => ({ ...p, category: 'Création' }))
  ];

  // Filtrer les échantillons selon la catégorie et la recherche
  const filteredSamples = allSamples.filter(sample => {
    let matchesCategory = false;
    if (selectedCategory === 'Tous') {
      matchesCategory = true;
    } else if (selectedCategory === 'Enfant') {
      matchesCategory = sample.category === 'Enfant' || sample.category?.toLowerCase().includes('enfant');
    } else if (selectedCategory === 'Création') {
      matchesCategory = sample.category === 'Création' || sample.category?.toLowerCase().includes('création');
    } else {
      matchesCategory = sample.category === selectedCategory;
    }
    
    const matchesSearch = searchTerm === '' || 
      sample.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.brand.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['Tous', 'Homme', 'Femme', 'Mixte', 'Luxe', 'Luxury', 'Enfant', 'Création'];

  // Statistiques par catégorie
  const categoryStats = categories.reduce((acc, cat) => {
    if (cat === 'Tous') {
      acc[cat] = allSamples.length;
    } else if (cat === 'Enfant') {
      acc[cat] = allSamples.filter(s => s.category === 'Enfant' || s.category?.toLowerCase().includes('enfant')).length;
    } else if (cat === 'Création') {
      acc[cat] = allSamples.filter(s => s.category === 'Création' || s.category?.toLowerCase().includes('création')).length;
    } else {
      acc[cat] = allSamples.filter(s => s.category === cat).length;
    }
    return acc;
  }, {});

  const toggleSampleSelection = (parfum, index) => {
    const sampleId = `sample-${parfum.ref}`;
    const isSelected = selectedSamples.some(sample => sample.id === sampleId);
    
    if (isSelected) {
      setSelectedSamples(prev => prev.filter(sample => sample.id !== sampleId));
    } else if (selectedSamples.length < 3) {
      const newSample = {
        id: sampleId,
        name: `${parfum.name} (Échantillon 3ml)`,
        brand: parfum.brand,
        category: parfum.category,
        originalName: parfum.name,
        ref: parfum.ref,
        publicRef: parfum.publicRef
      };
      setSelectedSamples(prev => [...prev, newSample]);
    }
  };

  const addPackToCart = () => {
    if (selectedSamples.length === 3) {
      const packProduct = {
        id: 'pack-decouverte',
        ref: 'PACK-3ML',
        publicRef: 'DSP-001',
        name: 'Pack Découverte 3 échantillons',
        brand: 'D&S Parfum',
        price: '14,90 €',
        contenance: '3x3ml',
        category: 'Pack Découverte',
        samples: selectedSamples.map(s => s.originalName),
        description: `Pack contenant: ${selectedSamples.map(s => s.originalName).join(', ')}`
      };
      
      addToCart(packProduct);
      setSelectedSamples([]);
      alert('Pack Découverte ajouté au panier !');
    }
  };

  return (
    <section id="pack-decouverte" className="py-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-y border-blue-200/40 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="glass-premium w-full flex items-center justify-between p-6 rounded-2xl shadow-luxury border-0 hover:shadow-2xl transition-all duration-300 mb-6"
        >
          <div className="flex items-center gap-4">
            <h2 className="font-luxury text-3xl text-gradient-gold">Pack Découverte Prestige</h2>
            {selectedSamples.length > 0 && (
              <span className="glass-premium text-slate-700 px-4 py-2 rounded-full text-sm font-medium shadow-luxury">
                {selectedSamples.length}/3 sélectionnés
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {selectedSamples.map((sample, index) => (
                <div 
                  key={sample.id}
                  className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center shadow-sm"
                  title={sample.originalName}
                >
                  <span className="text-xs font-bold text-blue-700">{index + 1}</span>
                </div>
              ))}
              {[...Array(3 - selectedSamples.length)].map((_, i) => (
                <div 
                  key={`empty-${i}`}
                  className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center shadow-sm"
                >
                  <span className="text-xs font-bold text-gray-400">+</span>
                </div>
              ))}
            </div>
            <span className="text-gray-700">14,90€ fdp inclus</span>
            <svg 
              className={`w-6 h-6 text-blue-600 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        
        <div className={`transition-all duration-500 ease-in-out overflow-hidden transform ${isExpanded ? 'max-h-[2000px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-4'}`}>
          <div className="text-center mb-8 pt-6">
            <p className="text-gray-600 mb-3">Choisissez 3 mini-flacons parmi notre sélection pour découvrir nos best-sellers</p>
            
            {/* Offre spéciale */}
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 rounded-lg p-4 mb-4 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl">🎁</span>
                <span className="font-bold text-green-800">OFFRE SPÉCIALE</span>
              </div>
              <p className="text-green-700 font-semibold">
                Pour l'achat d'un Pack Découverte, recevez un <strong>code promo de 10%</strong> pour votre prochaine commande !
              </p>
              <p className="text-green-600 text-sm mt-1">
                Code promo envoyé par email après votre commande
              </p>
            </div>
            
            {/* Indicateur de sélection amélioré */}
            <div className="mt-4 mb-6">
              <div className="inline-flex items-center gap-4 bg-white px-6 py-3 rounded-full shadow-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <span className="text-blue-700 font-semibold">Sélectionnés: {selectedSamples.length}/3</span>
                  <div className="flex gap-2">
                    {[1, 2, 3].map(num => (
                      <div 
                        key={num} 
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                          num <= selectedSamples.length 
                            ? 'bg-blue-500 scale-110' 
                            : 'bg-gray-300 scale-90'
                        }`} 
                      />
                    ))}
                  </div>
                  {selectedSamples.length === 3 && (
                    <div className="flex items-center gap-2 text-green-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold">Prêt à commander !</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

          <div className="bg-white/95 rounded-2xl shadow-xl border border-blue-100 p-8 mb-8 backdrop-blur-sm">
          {/* Header avec recherche et stats */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-blue-700 mb-2">Sélectionnez vos 3 échantillons</h3>
              <p className="text-gray-600">Plus de {allSamples.length} parfums disponibles dans toutes nos collections</p>
            </div>
            
            {/* Barre de recherche améliorée */}
            <div className="relative max-w-sm mt-4 lg:mt-0">
              <input
                type="text"
                placeholder="Rechercher un parfum ou une marque..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white"
              />
              <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
          </div>
          
          {/* Filtres par catégorie avec design amélioré */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-700 mb-4">Filtrer par collection :</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 text-sm border-2 ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg transform scale-105'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span className="font-semibold">{category}</span>
                    <span className="text-xs opacity-75 mt-1">({categoryStats[category]})</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Info section et sélection en cours */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="text-sm text-gray-700">
              <span className="font-semibold text-blue-700">{filteredSamples.length}</span> parfum{filteredSamples.length > 1 ? 's' : ''} 
              {searchTerm && <span> trouvé{filteredSamples.length > 1 ? 's' : ''} pour "{searchTerm}"</span>}
              {selectedCategory !== 'Tous' && <span> dans la collection "{selectedCategory}"</span>}
            </div>
            
            {/* Échantillons sélectionnés - Version détaillée */}
            {selectedSamples.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <span className="text-sm font-semibold text-blue-700">Votre sélection :</span>
                <div className="flex flex-wrap gap-2">
                  {selectedSamples.map((sample, index) => (
                    <span key={sample.id} className="bg-white border border-blue-300 text-blue-800 px-3 py-1 rounded-lg text-sm flex items-center gap-2 shadow-sm">
                      <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="max-w-24 truncate">{sample.originalName}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSamples(prev => prev.filter(s => s.id !== sample.id));
                        }}
                        className="text-blue-600 hover:text-red-600 font-bold ml-1"
                        title="Retirer de la sélection"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
              {/* Grille de parfums optimisée et plus spacieuse */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 max-h-96 overflow-y-auto border-2 border-dashed border-blue-200 rounded-xl p-6 bg-gradient-to-br from-blue-50/50 to-white">
            {filteredSamples.map((parfum, index) => {
              const sampleId = `sample-${parfum.ref}`;
              const isSelected = selectedSamples.some(sample => sample.id === sampleId);
              const canSelect = selectedSamples.length < 3 || isSelected;
              
              // Couleurs par catégorie
              const categoryColors = {
                'Homme': 'blue',
                'Femme': 'pink', 
                'Mixte': 'purple',
                'Luxe': 'amber',
                'Luxury': 'red',
                'Enfant': 'green',
                'Création': 'indigo'
              };
              const colorClass = categoryColors[parfum.category] || 'gray';
              
              return (
                <div 
                  key={`${parfum.category}-${parfum.ref}`} 
                  onClick={() => canSelect && toggleSampleSelection(parfum, index)}
                  className={`border-2 rounded-xl p-4 transition-all duration-300 cursor-pointer relative hover:shadow-lg ${
                    isSelected 
                      ? `border-${colorClass}-500 bg-${colorClass}-50 shadow-xl scale-105 ring-2 ring-${colorClass}-300` 
                      : canSelect 
                        ? `border-gray-200 hover:border-${colorClass}-400 hover:bg-${colorClass}-50/50 bg-white hover:scale-102` 
                        : 'border-gray-200 opacity-50 cursor-not-allowed bg-gray-50'
                  }`}
                >
                  {/* Badge de sélection amélioré */}
                  {isSelected && (
                    <div className={`absolute -top-2 -right-2 w-7 h-7 bg-${colorClass}-500 text-white rounded-full flex items-center justify-center text-sm font-bold z-10 shadow-lg border-2 border-white`}>
                      {selectedSamples.findIndex(s => s.id === sampleId) + 1}
                    </div>
                  )}
                  
                  {/* Indicateur de capacité de sélection */}
                  {!canSelect && !isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-xs">
                      ✕
                    </div>
                  )}
                  
                  <div className="text-center">
                    {/* Flacon symbolique amélioré */}
                    <div className={`w-10 h-14 rounded-lg mx-auto mb-3 flex items-center justify-center transition-all text-xs font-bold relative ${
                      isSelected 
                        ? `bg-gradient-to-b from-${colorClass}-500 to-${colorClass}-600 text-white shadow-lg` 
                        : `bg-gradient-to-b from-${colorClass}-100 to-${colorClass}-200 text-${colorClass}-600 hover:from-${colorClass}-200 hover:to-${colorClass}-300`
                    }`}>
                      <div className="text-center">
                        <div className="text-xs font-bold">3ml</div>
                        <div className="text-xs opacity-75">sample</div>
                      </div>
                      {/* Reflet du flacon */}
                      <div className="absolute top-1 left-1 w-2 h-4 bg-white/30 rounded-sm"></div>
                    </div>
                    
                    {/* Nom du parfum */}
                    <h4 className="font-bold text-sm text-gray-900 mb-2 line-clamp-2 leading-tight min-h-[2.5rem]">
                      {parfum.name}
                    </h4>
                    
                    {/* Marque */}
                    <p className="text-xs text-gray-600 mb-2 font-medium">{parfum.brand}</p>
                    
                    {/* Badge catégorie amélioré */}
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold bg-${colorClass}-100 text-${colorClass}-700 border border-${colorClass}-200`}>
                      {parfum.category}
                    </span>
                    
                    {/* Indication de sélection */}
                    {isSelected && (
                      <div className="mt-2 text-xs text-green-600 font-semibold">
                        ✓ Sélectionné
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
              {/* Message si aucun résultat */}
              {filteredSamples.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">🔍</div>
                  <h4 className="text-lg font-semibold mb-2">Aucun parfum trouvé</h4>
                  <p className="text-gray-400 mb-4">
                    {searchTerm ? `Aucun résultat pour "${searchTerm}"` : 'Aucun parfum dans cette catégorie'}
                  </p>
                  <div className="space-y-2">
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm mr-2"
                      >
                        Effacer la recherche
                      </button>
                    )}
                    <button 
                      onClick={() => setSelectedCategory('Tous')}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      Voir tous les parfums
                    </button>
                  </div>
                </div>
              )}

              {/* Bouton d'ajout au panier amélioré */}
              <div className="text-center mt-8">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 mb-6">
                  <h4 className="text-lg font-semibold text-blue-700 mb-2">Récapitulatif de votre Pack Découverte</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl mb-1">📦</div>
                  <div className="font-semibold text-gray-700">3 échantillons</div>
                  <div className="text-gray-600">3ml chacun</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">🚚</div>
                  <div className="font-semibold text-gray-700">Livraison gratuite</div>
                  <div className="text-gray-600">Délai: 8-10 jours</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">💰</div>
                  <div className="font-semibold text-gray-700">14,90€ TTC</div>
                  <div className="text-gray-600">+ code promo 10%</div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={addPackToCart}
              disabled={selectedSamples.length !== 3}
              className={`font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 shadow-lg border-2 min-w-[250px] ${
                selectedSamples.length === 3
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-blue-700 hover:scale-105 cursor-pointer shadow-xl hover:shadow-2xl'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300 opacity-60'
              }`}
            >
              {selectedSamples.length === 3 ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6.5M7 13h10m-10 0l-1.5 6.5m12-6.5v6.5" />
                  </svg>
                  <span>Ajouter au panier - 14,90€</span>
                </div>
              ) : (
                <span>Sélectionnez {3 - selectedSamples.length} échantillon{3 - selectedSamples.length > 1 ? 's' : ''} de plus</span>
              )}
            </button>
            
            <div className="mt-4 text-sm text-gray-600">
              <p>🔒 Paiement sécurisé • 🎁 Cadeau de bienvenue inclus</p>
            </div>
                </div>
              </div>
              
              {/* Section informations complémentaires */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-white/90 rounded-xl p-6 border border-blue-100 shadow-lg">
                  <h4 className="text-lg font-semibold text-blue-700 mb-3 flex items-center gap-2">
                    <span className="text-xl">ℹ️</span>
                    Pourquoi choisir le Pack Découverte ?
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>Découvrez nos meilleures fragrances avant d'acheter en grand format</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>Échantillons généreux de 3ml chacun (plusieurs utilisations)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>Livraison gratuite et rapide partout en France</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span><strong>Bonus :</strong> Code promo de 10% offert pour votre prochaine commande</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white/90 rounded-xl p-6 border border-blue-100 shadow-lg">
                  <h4 className="text-lg font-semibold text-blue-700 mb-3 flex items-center gap-2">
                    <span className="text-xl">🎯</span>
                    Comment bien choisir ?
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">💡</span>
                      <span>Variez les collections : Homme, Femme, Mixte, Luxe...</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">💡</span>
                      <span>Explorez différents types : frais, boisé, oriental, floral</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">💡</span>
                      <span>Testez nos exclusivités de la collection Création</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">💡</span>
                      <span>Découvrez nos parfums Luxe et Luxury pour les occasions spéciales</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function App() {
  // Vérifier les paramètres URL pour les pages de paiement
  const urlParams = new URLSearchParams(window.location.search);
  const paymentStatus = urlParams.get('payment');

  // Si c'est une page de résultat de paiement, afficher la page correspondante
  if (paymentStatus === 'success') {
    return <PaymentSuccess />;
  }
  
  if (paymentStatus === 'cancelled') {
    return <PaymentCancelled />;
  }
  
  // Gestion de la simulation de paiement (mode développement)
  if (paymentStatus === 'simulation') {
    const total = urlParams.get('total');
    const email = urlParams.get('email');
    
    useEffect(() => {
      console.log('🎭 Mode simulation de paiement détecté:', { total, email });
      
      // Afficher une notification de simulation
      const timer = setTimeout(() => {
        alert(`🎭 SIMULATION PAIEMENT RÉUSSIE!\n\nTotal: ${total}€\nEmail: ${decodeURIComponent(email || '')}\n\nCeci est une simulation pour le développement.\nLe paiement réel nécessite une clé Stripe valide.`);
        
        // Nettoyer l'URL et rediriger vers la page d'accueil
        window.history.replaceState({}, document.title, window.location.pathname);
        window.location.reload();
      }, 500);
      
      return () => clearTimeout(timer);
    }, [total, email]);
    
    // Afficher temporairement un message de chargement
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">🎭 Simulation de paiement</h2>
          <p className="text-gray-600">Traitement de la simulation...</p>
        </div>
      </div>
    );
  }

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCollection, setActiveCollection] = useState('homme'); // État pour l'onglet actif
  const [isCartModalOpen, setIsCartModalOpen] = useState(false); // État pour le modal du panier

  // État partagé pour les coordonnées client (nom, email, téléphone, adresse)
  // Il sera passé au panier et au formulaire de contact afin de synchroniser les champs
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  // Fonction pour changer d'onglet et scroller vers la collection
  const handleTabClick = (collectionKey) => {
    setActiveCollection(collectionKey);
    
    // Scroll vers la zone des produits après un court délai pour permettre le changement d'état
    setTimeout(() => {
      const collectionsContent = document.getElementById('collections-content');
      if (collectionsContent) {
        const isMobile = window.innerWidth <= 768;
        // Augmenter l'offset pour mobile pour éviter que le header ne cache le contenu
        const offset = isMobile ? 120 : 100;
        
        const elementPosition = collectionsContent.getBoundingClientRect().top + window.pageYOffset;
        const targetPosition = Math.max(0, elementPosition - offset);
        
        // Utiliser la nouvelle fonction de scroll optimisée
        scrollToPosition(targetPosition);
      }
    }, 150); // Augmenter légèrement le délai pour les appareils plus lents
  };
  const [selectedSamples, setSelectedSamples] = useState([]); // État pour les échantillons sélectionnés
  const [isSamplesMenuOpen, setIsSamplesMenuOpen] = useState(false); // État pour le menu déroulant des échantillons

  // Fonction pour gérer la sélection des échantillons
  const toggleSampleSelection = (parfum, index) => {
    const sampleId = `sample-${index}`;
    const isSelected = selectedSamples.some(sample => sample.id === sampleId);
    
    if (isSelected) {
      // Désélectionner
      setSelectedSamples(prev => prev.filter(sample => sample.id !== sampleId));
    } else if (selectedSamples.length < 3) {
      // Sélectionner (max 3)
      const newSample = {
        id: sampleId,
        name: `${parfum.name} (Échantillon 3ml)`,
        brand: parfum.brand,
        category: parfum.category,
        price: "3,30 €",
        contenance: "3ml"
      };
      setSelectedSamples(prev => [...prev, newSample]);
    }
  };
  // Parallax dynamique pour le smoke
  const smokeRef = useRef(null);
  const [parallaxImage, setParallaxImage] = useState("smoke");
  const [smokeStyle, setSmokeStyle] = useState({
    backgroundImage: "url('https://raw.githubusercontent.com/Firestonecanon/dsparfum-images/main/smoke-1830840.jpg')",
    backgroundAttachment: 'fixed',
    backgroundPosition: 'center 0px',
    backgroundSize: 'cover',
    transition: 'background-position 0.3s, background-image 0.7s',
  });

  useEffect(() => {
    function handleScroll() {
      const y = window.scrollY;
      // Détecter si la section collections est visible
      const collections = document.getElementById('collections');
      let isCollections = false;
      if (collections) {
        const rect = collections.getBoundingClientRect();
        // On considère la section active si elle occupe au moins 40% de la hauteur du viewport
        isCollections = rect.top < window.innerHeight * 0.6 && rect.bottom > window.innerHeight * 0.4;
      }
      const imageUrl = isCollections
        ? "url('https://raw.githubusercontent.com/Firestonecanon/dsparfum-images/main/marbre-noir-collections.jpg')"
        : "url('https://raw.githubusercontent.com/Firestonecanon/dsparfum-images/main/smoke-1830840.jpg')";
      setSmokeStyle((prev) => ({
        ...prev,
        backgroundImage: imageUrl,
        backgroundPosition: `center ${Math.round(y * 0.12)}px`,
      }));
    }
    window.addEventListener('scroll', handleScroll);
    // Appel initial pour le cas où la page s'ouvre sur la section collections
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleScroll() {
      const y = window.scrollY;
      setSmokeStyle((prev) => ({
        ...prev,
        backgroundPosition: `center ${Math.round(y * 0.3)}px`,
      }));
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const isMobile = window.innerWidth <= 768;
      // Augmenter l'offset pour mobile pour éviter que le header ne cache le contenu
      const offset = isMobile ? 120 : 100;
      
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const targetPosition = Math.max(0, elementPosition - offset);
      
      // Utiliser la nouvelle fonction de scroll optimisée
      scrollToPosition(targetPosition);
    }
    setIsMenuOpen(false);
  };

  // Fermer le menu avec la touche Échap
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isMenuOpen]);

  const openHommeCollection = () => {
    setActiveCollection('homme');
    scrollToSection('collections');
  };

  const openFemmeCollection = () => {
    setActiveCollection('femme');
    scrollToSection('collections');
  };

  const openMixteCollection = () => {
    setActiveCollection('mixte');
    scrollToSection('collections');
  };

  const openEnfantCollection = () => {
    setActiveCollection('enfant');
    scrollToSection('collections');
  };

  const openCreationCollection = () => {
    setActiveCollection('creation');
    scrollToSection('collections');
  };

  const openLuxeCollection = () => {
    setActiveCollection('luxe');
    scrollToSection('collections');
  };

  const openLuxuryCollection = () => {
    setActiveCollection('luxury');
    scrollToSection('collections');
  };

  const openEtuisCollection = () => {
    setActiveCollection('etuis');
    scrollToSection('collections');
  };

  // Carrousel d'avis clients (auto défilement)
  const testimonials = [
    {
      author: "Sophie L.",
      text: "Une découverte incroyable ! Les parfums tiennent toute la journée et sentent divinement bon. Je recommande à 100%.",
      rating: 5
    },
    {
      author: "Marc D.",
      text: "Qualité équivalente aux grandes marques, mais à un prix imbattable. Livraison rapide et service client au top.",
      rating: 5
    },
    {
      author: "Julie P.",
      text: "J'adore le concept et la possibilité d'avoir un mini-flacon offert. Parfait pour le sac à main !",
      rating: 5
    }
  ];
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

return (
  <BrowserRouter>
    <Routes>
      <Route path="/admin" element={<AdminPage />} />
      <Route
        path="*"
        element={
          <ContactProvider>
            <PromoProvider>
              <CartProvider>
                <div className="min-h-screen text-gray-900 relative overflow-x-hidden">
                {/* Styles CSS pour le luxe */}
                <style>{`
                  @keyframes luxuryGlow {
                    0% { opacity: 0.3; }
              50% { opacity: 0.6; }
              100% { opacity: 0.3; }
            }
            @keyframes floatGold {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-10px) rotate(180deg); }
            }
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
            .luxury-gradient {
              background: linear-gradient(135deg, 
                rgba(255, 215, 0, 0.15) 0%, 
                rgba(255, 248, 220, 0.08) 25%,
                rgba(218, 165, 32, 0.12) 50%,
                rgba(255, 215, 0, 0.08) 75%,
                rgba(255, 255, 255, 0.05) 100%
              );
            }
            .gold-shimmer {
              background: linear-gradient(
                90deg,
                transparent 0%,
                rgba(255, 215, 0, 0.1) 50%,
                transparent 100%
              );
              background-size: 200% 100%;
              animation: shimmer 3s ease-in-out infinite;
            }
            .floating-particle {
              animation: floatGold 6s ease-in-out infinite;
            }
            .nav-link-luxury {
              color: #1f2937; /* Gris foncé au lieu de blanc */
              text-decoration: none;
              padding: 8px 16px;
              border-radius: 8px;
              font-weight: 600; /* Plus gras pour plus de lisibilité */
              transition: all 0.3s ease;
              position: relative;
              background: linear-gradient(135deg, 
                rgba(255, 255, 255, 0.9) 0%, 
                rgba(249, 239, 218, 0.85) 50%,
                rgba(255, 255, 255, 0.9) 100%
              );
              backdrop-filter: blur(10px);
              border: 1px solid rgba(249, 115, 22, 0.3);
              text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8); /* Ombre blanche pour le contraste */
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            .nav-link-luxury:hover {
              background: linear-gradient(135deg, 
                rgba(249, 115, 22, 0.9) 0%, 
                rgba(251, 146, 60, 0.85) 50%,
                rgba(249, 115, 22, 0.9) 100%
              );
              color: white; /* Blanc sur fond orange pour bon contraste */
              transform: translateY(-2px);
              box-shadow: 
                0 6px 20px rgba(249, 115, 22, 0.4),
                0 2px 10px rgba(0, 0, 0, 0.2);
              border-color: rgba(249, 115, 22, 0.6);
              text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5); /* Ombre noire sur fond orange */
            }
            .nav-link-luxury::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: linear-gradient(90deg, 
                transparent 0%, 
                rgba(249, 115, 22, 0.05) 50%, 
                transparent 100%
              );
              opacity: 0;
              transition: opacity 0.3s ease;
            }
            .nav-link-luxury:hover::before {
              opacity: 1;
            }
          `}</style>
          
          {/* Background propre et élégant */}
          <div
            ref={smokeRef}
            className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('https://raw.githubusercontent.com/Firestonecanon/dsparfum-images/main/smoke-1830840.jpg')",
              filter: 'brightness(1.1) contrast(1.1)',
            }}
          />
          
          {/* Overlay très subtil pour la profondeur */}
          <div 
            className="fixed inset-0 z-10 pointer-events-none"
            style={{
              background: `
                linear-gradient(135deg, 
                  rgba(0, 0, 0, 0.1) 0%, 
                  rgba(0, 0, 0, 0.05) 50%,
                  rgba(0, 0, 0, 0.1) 100%
                )
              `,
            }}
          />
        {/* --- BLOC FIXE GLOBAL EN HAUT DE PAGE --- */}
        <div id="top-fixed-bar" style={{position:'fixed',top:0,left:0,width:'100%',zIndex:60}}>
          {/* Bannière d'annonce (promo) - Version lisible et élégante */}
          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-xl overflow-hidden border-b border-amber-400/30">
            {/* Version desktop */}
            <div className="hidden md:block py-3 px-6 text-center text-sm font-medium">
              <div className="flex items-center justify-center gap-6 flex-wrap">
                <span className="flex items-center gap-1">✨ <strong className="text-amber-300">Format 70ml + 15ml offert</strong></span>
                <span className="text-amber-400">•</span>
                <span className="flex items-center gap-1">🎁 <strong className="text-amber-300">FDP :</strong> 9€ / -50% / Offert</span>
                <span className="text-amber-400">•</span>
                <span className="flex items-center gap-1">👜 <strong className="text-amber-300">Étui 15ml :</strong> 15€ (recommandé)</span>
                <span className="text-amber-400">•</span>
                <span className="flex items-center gap-1">💎 <strong className="text-amber-300">Qualité premium garantie</strong></span>
              </div>
            </div>
            {/* Version mobile avec défilement (texte déroulant) */}
            <div className="md:hidden py-1.5 relative">
              <div className="animate-scroll-mobile whitespace-nowrap text-xs font-medium">
                <span className="inline-block px-4">🧴 <strong>Format 70ml + 15ml offert</strong></span>
                <span className="inline-block px-4">•</span>
                <span className="inline-block px-4">📦 <strong>FDP :</strong> 9€ / -50% / Offert</span>
                <span className="inline-block px-4">•</span>
                <span className="inline-block px-4">👜 <strong>Étui 15ml :</strong> 15€ (recommandé)</span>
                <span className="inline-block px-4">•</span>
                <span className="inline-block px-4">🧴 <strong>Format 70ml + 15ml offert</strong></span>
                <span className="inline-block px-4">•</span>
                <span className="inline-block px-4">📦 <strong>FDP :</strong> 9€ / -50% / Offert</span>
              </div>
            </div>
          </div>
          {/* Barre supérieure d'infos (desktop) - Version luxe */}
          <div className="hidden md:flex bg-gradient-to-r from-slate-800/95 via-slate-700/90 to-slate-800/95 text-white shadow-xl text-xs font-medium py-2 px-6 justify-between items-center gap-6 backdrop-blur-sm">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">🚚 <span className="font-semibold">Livraison sous 5-10 jours</span></span>
              <span className="hidden lg:inline text-blue-200">|</span>
              <span className="flex items-center gap-2">⭐ <a href="#avis" className="underline hover:text-blue-200 font-semibold">Avis clients 5/5</a></span>
              <span className="hidden lg:inline text-blue-200">|</span>
              <span className="flex items-center gap-2">🎯 <a href="#offres" className="underline hover:text-blue-200 font-semibold">Offres VIP</a></span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden md:inline font-semibold">Rejoignez-nous :</span>
              <a href="https://www.facebook.com/profile.php?id=61577262944619" target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition-colors flex items-center gap-1" title="Suivez-nous sur Facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="hidden lg:inline text-sm">Facebook</span>
              </a>
              <a href="https://www.instagram.com/d_s_parfum?igsh=YXQ3MG50bDJxM2sx" target="_blank" rel="noopener noreferrer" className="hover:text-pink-200 transition-colors flex items-center gap-1" title="Suivez-nous sur Instagram @d_s_parfum">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span className="hidden lg:inline text-sm">Instagram</span>
              </a>
              <a href="mailto:contact@dsparfum.com" className="hover:text-amber-200 transition-colors flex items-center gap-1" title="Contactez-nous par email">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="hidden lg:inline text-sm">Email</span>
              </a>
            </div>
          </div>
          {/* Header principal - Version élégante et lisible */}
          <header
            className="w-full z-50 flex items-center justify-between px-8 py-4"
            style={{
              background: `
                linear-gradient(135deg, 
                  rgba(17, 24, 39, 0.95) 0%, 
                  rgba(31, 41, 55, 0.90) 50%,
                  rgba(17, 24, 39, 0.95) 100%
                )
              `,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(249, 115, 22, 0.3)',
              boxShadow: `
                0 4px 32px rgba(0, 0, 0, 0.3),
                0 2px 16px rgba(249, 115, 22, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.1)
              `,
              position: 'relative',
            }}
          >
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="relative">
                <img
                  src="https://raw.githubusercontent.com/Firestonecanon/dsparfum-images/main/D%26S.png"
                  alt="D&S Parfum Logo"
                  className="logo transition-transform duration-300 hover:scale-105"
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: `
                      linear-gradient(135deg, 
                        rgba(255, 255, 255, 0.1) 0%, 
                        rgba(255, 255, 255, 0.05) 100%
                      )
                    `,
                    padding: 8,
                    boxShadow: `
                      0 2px 12px rgba(0, 0, 0, 0.2),
                      inset 0 1px 0 rgba(255, 255, 255, 0.2)
                    `,
                    objectFit: 'contain',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                />
              </div>
              
              <div className="flex flex-col">
                <span
                  className="text-3xl font-bold tracking-wider relative"
                  style={{
                    background: `
                      linear-gradient(135deg, 
                        #ffffff 0%, 
                        #fb923c 30%, 
                        #ea580c 60%, 
                        #ffffff 100%
                      )
                    `,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 2px 8px rgba(249, 115, 22, 0.3)',
                    letterSpacing: 3,
                    filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))',
                  }}
                >
                  D&S Parfum
                </span>
                <span 
                  className="text-xs text-orange-200 font-medium tracking-widest"
                  style={{
                    letterSpacing: 2,
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  ✨ FRAGRANCES DE LUXE ✨
                </span>
              </div>
            </div>
            {/* Desktop nav - Version luxe */}
            <nav className="hidden md:flex gap-3 text-base font-medium items-center relative z-10">
              <a className="nav-link-luxury" href="#collections">✨ Collections</a>
              <a className="nav-link-luxury" href="#offres">🎁 Offres VIP</a>
              <a className="nav-link-luxury" href="#faq">💬 FAQ</a>
              <a className="nav-link-luxury" href="#engagements">💎 Engagements</a>
              <a className="nav-link-luxury" href="#contact">📞 Contact</a>
              <button 
                className="nav-link-luxury relative" 
                onClick={() => setIsCartModalOpen(true)}
                title="Voir le panier"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0V19a2 2 0 002 2h7a2 2 0 002-2v-.5" />
                </svg>
                <CartBadge onClick={() => setIsCartModalOpen(true)} />
              </button>
              <span className="ml-3"><SearchBar /></span>
            </nav>
            {/* Mobile burger - Version élégante */}
            <div className="md:hidden flex items-center relative z-10">
              <button
                className="burger-btn flex flex-col justify-center items-center w-12 h-12 rounded-full transition-all duration-300 hover:scale-110"
                style={{
                  background: `
                    linear-gradient(135deg, 
                      rgba(255, 255, 255, 0.1) 0%, 
                      rgba(249, 115, 22, 0.08) 50%,
                      rgba(255, 255, 255, 0.1) 100%
                    )
                  `,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(249, 115, 22, 0.3)',
                  boxShadow: `
                    0 4px 15px rgba(249, 115, 22, 0.15),
                    0 2px 8px rgba(0, 0, 0, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1)
                  `,
                }}
                aria-label="Ouvrir le menu"
                onClick={() => setIsMenuOpen(true)}
              >
                <span className="block w-5 h-0.5 bg-gradient-to-r from-orange-300 to-orange-500 mb-1 rounded-full shadow-sm"></span>
                <span className="block w-5 h-0.5 bg-gradient-to-r from-orange-300 to-orange-500 mb-1 rounded-full shadow-sm"></span>
                <span className="block w-5 h-0.5 bg-gradient-to-r from-orange-300 to-orange-500 rounded-full shadow-sm"></span>
              </button>
            </div>
            {/* Slide-in mobile menu */}
            {isMenuOpen && (
              <div className="fixed inset-0 z-[999] flex">
                <div
                  className="fixed inset-0 z-[998] bg-black/50 transition-opacity duration-300"
                  style={{backdropFilter:'blur(10px) brightness(0.8)', WebkitBackdropFilter:'blur(10px) brightness(0.8)'}}
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Fermer le menu"
                />
                <nav className="relative ml-auto w-80 max-w-[90vw] min-h-[300px] max-h-[60vh] flex flex-col p-6 gap-3 animate-slide-in-right burger-glass-menu-strong overflow-y-auto rounded-bl-2xl z-[1000]">
                <style>{`
                  @keyframes slide-in-right {
                    0% { transform: translateX(100%); opacity: 0; }
                    100% { transform: translateX(0); opacity: 1; }
                  }
                  .animate-slide-in-right { animation: slide-in-right 0.35s cubic-bezier(.23,1.02,.43,1) both; }
                  .burger-glass-menu-strong {
                    background: linear-gradient(120deg, rgba(255,255,255,0.98) 80%, rgba(59, 130, 246, 0.08) 100%);
                    backdrop-filter: blur(40px) saturate(1.7) brightness(1.10);
                    -webkit-backdrop-filter: blur(40px) saturate(1.7) brightness(1.10);
                    border-left: 3.5px solid rgba(59, 130, 246, 0.8);
                    box-shadow: 0 8px 48px 0 rgba(59, 130, 246, 0.3), 0 1px 0 rgba(255,255,255,0.1) inset;
                    min-height: 300px;
                    opacity: 1;
                    position: relative;
                    z-index: 1001;
                    display: flex;
                    flex-direction: column;
                  }
                  .mobile-link {
                    display: block;
                    padding: 0.6em 0;
                    font-size: 1.1em;
                    color: #475569;
                    border-bottom: 1px solid rgba(59, 130, 246, 0.1);
                    font-weight: 600;
                    border-radius: 0.5em;
                    transition: background 0.18s, color 0.18s;
                    text-decoration: none;
                    opacity: 1;
                    z-index: 1002;
                    position: relative;
                  }
                  .mobile-link:hover, .mobile-link:focus {
                    background: rgba(59, 130, 246, 0.1);
                    color: #1e293b;
                  }
                  .mobile-link-cart {
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05));
                    color: #047857;
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    border-radius: 0.75em;
                    padding: 0.7em 1em;
                    margin: 0.2em 0;
                    font-weight: 700;
                    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.1);
                  }
                  .mobile-link-cart:hover, .mobile-link-cart:focus {
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1));
                    color: #065f46;
                    border-color: rgba(16, 185, 129, 0.3);
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
                    transform: translateY(-1px);
                  }
                `}</style>
                  <button
                    className="self-end mb-4 text-slate-700 text-2xl font-bold hover:text-slate-900 focus:outline-none"
                    aria-label="Fermer le menu"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ×
                  </button>
                  <a className="mobile-link" href="#collections" onClick={()=>scrollToSection('collections')}>Collections</a>
                  <button 
                    className="mobile-link mobile-link-cart flex items-center gap-2 relative w-full text-left" 
                    onClick={() => {
                      setIsCartModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0V19a2 2 0 002 2h7a2 2 0 002-2v-.5" />
                    </svg>
                    Panier
                    <CartBadge onClick={() => setIsCartModalOpen(true)} />
                  </button>
                  <a className="mobile-link" href="#offres" onClick={()=>scrollToSection('offres')}>Offres</a>
                  <a className="mobile-link" href="#faq" onClick={()=>scrollToSection('faq')}>FAQ</a>
                  <a className="mobile-link" href="#engagements" onClick={()=>scrollToSection('engagements')}>Engagements</a>
                  <a className="mobile-link font-bold text-blue-700" href="#contact" onClick={()=>scrollToSection('contact')}>📞 Contact</a>
                  <div className="mt-4"><SearchBar /></div>
                </nav>
                <style>{`
                  @keyframes slide-in-right {
                    0% { transform: translateX(100%); opacity: 0; }
                    100% { transform: translateX(0); opacity: 1; }
                  }
                  .animate-slide-in-right { animation: slide-in-right 0.35s cubic-bezier(.23,1.02,.43,1) both; }
                  .mobile-link {
                    display: block;
                    padding: 1em 0;
                    font-size: 1.2em;
                    color: #475569;
                    border-bottom: 1px solid rgba(59, 130, 246, 0.1);
                    font-weight: 600;
                    border-radius: 0.5em;
                    transition: background 0.18s, color 0.18s;
                  }
                  .mobile-link:hover, .mobile-link:focus {
                    background: rgba(59, 130, 246, 0.1);
                    color: #1e293b;
                  }
                `}</style>
              </div>
            )}
            <style>{`
              .nav-link-glass {
                color: #fff;
                padding: 0.4em 1.1em;
                border-radius: 1.5em;
                background: rgba(255,255,255,0.10);
                border: 1.5px solid rgba(59, 130, 246, 0.18);
                box-shadow: 0 2px 12px 0 rgba(59, 130, 246, 0.1), 0 1px 0 rgba(255,255,255,0.1) inset;
                transition: background 0.2s, color 0.2s, box-shadow 0.2s, border 0.2s;
                position: relative;
                overflow: hidden;
                font-weight: 500;
              }
              .nav-link-glass:hover, .nav-link-glass:focus {
                background: rgba(255,255,255,0.22);
                color: #3b82f6;
                border: 1.5px solid #3b82f6;
                box-shadow: 0 0 18px 2px rgba(59, 130, 246, 0.5), 0 1px 0 #fff;
              }
              .nav-link-contact {
                color: #3b82f6;
                font-weight: 700;
                border: 1.5px solid #3b82f6;
                background: rgba(255,255,255,0.18);
              }
              .nav-link-contact:hover {
                background: rgba(59, 130, 246, 0.1);
                color: #1e293b;
              }
              .nav-link-cart svg {
                width: 1.3em;
                height: 1.3em;
                vertical-align: middle;
                color: #3b82f6;
                filter: drop-shadow(0 0 2px rgba(255,255,255,0.5));
              }
            `}</style>
          </header>
        </div>
        {/* Spacer dynamique pour compenser la hauteur du bloc fixe du haut */}
        <div id="spacer-hero" style={{ height: '0px' }} aria-hidden="true"></div>
        {/* Script pour ajuster dynamiquement la hauteur du spacer */}
        {typeof window !== 'undefined' && (
          <script dangerouslySetInnerHTML={{
            __html: `
              function updateHeroSpacer() {
                var topBar = document.getElementById('top-fixed-bar');
                var sp = document.getElementById('spacer-hero');
                if(topBar && sp) sp.style.height = topBar.offsetHeight + 'px';
              }
              window.addEventListener('DOMContentLoaded', updateHeroSpacer);
              window.addEventListener('resize', updateHeroSpacer);
              setTimeout(updateHeroSpacer, 100);
            `
          }} />
        )}
        {/* Hero (section d'accueil) */}
        <section id="accueil" className="w-full relative overflow-visible pt-24 md:pt-32" style={{zIndex:30}}>
          {/* Fond hero premium : marbre noir + reflets dorés subtils (grain SVG) */}
          <div className="absolute inset-0 w-full h-full z-0 pointer-events-none" style={{background:'linear-gradient(120deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)'}}>
            <svg width="100%" height="100%" viewBox="0 0 1440 600" fill="none" xmlns="http://www.w3.org/2000/svg" style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',opacity:0.13}}>
              <defs>
                <linearGradient id="goldgrain" x1="0" y1="0" x2="1440" y2="600" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#e2e8f0" stopOpacity="0.3"/>
                  <stop offset="1" stopColor="#f1f5f9" stopOpacity="0.1"/>
                </linearGradient>
              </defs>
              <ellipse cx="900" cy="200" rx="420" ry="80" fill="url(#goldgrain)"/>
              <ellipse cx="400" cy="400" rx="320" ry="60" fill="url(#goldgrain)"/>
              <ellipse cx="1200" cy="500" rx="180" ry="40" fill="url(#goldgrain)"/>
            </svg>
          </div>
          <div className="w-full max-w-7xl mx-auto px-6 lg:flex lg:items-center lg:gap-12 relative z-50 animate-fade-in-up">
            {/* Colonne gauche : texte premium */}
            <div className="relative z-10 text-center lg:text-left lg:flex-1 lg:max-w-3xl animate-hero-pop">
              <span className="inline-block px-6 py-2 mb-4 rounded-full text-sm font-bold tracking-widest animate-badge-glow glass-premium" style={{background:'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.1))', color:'#1e40af', letterSpacing:3, boxShadow:'0 0 20px 4px rgba(59, 130, 246, 0.25), 0 8px 32px rgba(59, 130, 246, 0.15)'}}>✨ NOUVEAUTÉ EXCLUSIVE</span>
              <h1
                className="text-5xl md:text-6xl font-extrabold leading-tight mb-2 animate-shimmer"
                style={{
                  background: `
                    linear-gradient(135deg, 
                      #1e293b 0%, 
                      #334155 30%, 
                      #475569 60%, 
                      #64748b 100%
                    )
                  `,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                  filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))',
                }}
              >
                Découvrez l’Art du Parfum
              </h1>
              <p className="text-lg md:text-xl text-slate-700 mb-4" style={{textShadow:'0 1px 0 rgba(255,255,255,0.5)'}}>Des fragrances d’exception, pour une expérience sensorielle unique.</p>
              <a
                href="#collections"
                className="hero-btn-glass w-full sm:w-auto block mx-auto sm:inline-block"
                style={{maxWidth:'320px'}}
              >
                Voir les collections
              </a>
              {/* Pictos/avantages */}
              <div className="flex flex-wrap gap-4 justify-center md:justify-start mt-6 mb-8">
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-blue-700 text-xs font-semibold shadow w-full sm:w-auto justify-center"><span>💎</span> 30% essence</div>
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-blue-700 text-xs font-semibold shadow w-full sm:w-auto justify-center"><span>🇮🇹</span> Fabriqué en Italie</div>
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-blue-700 text-xs font-semibold shadow w-full sm:w-auto justify-center"><span>🚚</span> Livraison rapide</div>
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-blue-700 text-xs font-semibold shadow w-full sm:w-auto justify-center"><span>🎯</span> Service personnalisé</div>
              </div>
            </div>
            {/* Colonne droite : image produit élégante */}
            <div className="relative z-10 flex-1 flex items-center justify-center mt-10 md:mt-0">
              <div className="relative group">
                <div className="absolute -inset-6 rounded-full bg-gradient-to-br from-white/10 to-white/5 blur-xl" />
                <img
                  src="https://raw.githubusercontent.com/Firestonecanon/dsparfum-images/main/D%26S.png"
                  alt="Produit phare"
                  className="w-56 h-56 md:w-72 md:h-72 object-contain rounded-full shadow-2xl border-4 border-white/10 animate-img-pop"
                  style={{
                    boxShadow: '0 0 64px 8px rgba(226, 232, 240, 0.3), 0 2px 24px 0 rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.04)',
                    transition: 'transform 0.4s cubic-bezier(.4,2,.6,1)',
                  }}
                />
              </div>
            </div>
          </div>
          {/* Indicateur de défilement (flèche vers le bas) */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
            <svg className="w-6 h-6 text-amber-600/80 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
          {/* Animations CSS premium */}
          <style>{`
            .animate-shimmer {
              background-size: 200% 100%;
              animation: shimmer 2.5s linear infinite;
            }
            @keyframes shimmer {
              0% { background-position: 0% 50%; }
              100% { background-position: 100% 50%; }
            }
            .hero-btn-glass {
              display: inline-block;
              padding: 0.9em 2.2em;
              font-size: 1.2em;
              font-weight: 700;
              border-radius: 2em;
              background: linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(99, 102, 241, 0.8));
              color: white;
              box-shadow: 
                0 4px 24px rgba(0,0,0,0.2), 
                0 2px 12px rgba(59, 130, 246, 0.3),
                inset 0 1px 0 rgba(255,255,255,0.2);
              border: 1px solid rgba(59, 130, 246, 0.4);
              text-shadow: none;
              transition: all 0.3s ease;
              position: relative;
              overflow: hidden;
              backdrop-filter: blur(10px);
            }
            .hero-btn-glass:hover {
              background: linear-gradient(135deg, rgba(59, 130, 246, 1), rgba(99, 102, 241, 0.9));
              color: white;
              box-shadow: 
                0 6px 32px rgba(59, 130, 246, 0.3), 
                0 2px 16px rgba(0,0,0,0.2),
                inset 0 1px 0 rgba(255,255,255,0.3);
              transform: translateY(-2px);
              border-color: rgba(59, 130, 246, 0.4);
            }
            .animate-halo-glow {
              animation: halo-glow 3.5s ease-in-out infinite alternate;
            }
            @keyframes halo-glow {
              0% { opacity: 0.7; filter: blur(32px); }
              100% { opacity: 1; filter: blur(48px); }
            }
            .animate-img-pop {
              animation: img-pop 1.2s cubic-bezier(.4,2,.6,1) 1;
            }
            @keyframes img-pop {
              0% { transform: scale(0.7) rotate(-8deg); opacity: 0; }
              100% { transform: scale(1) rotate(0deg); opacity: 1; }
            }
            .animate-badge-glow {
              animation: badge-glow 2.2s ease-in-out infinite alternate;
            }
            @keyframes badge-glow {
              0% { box-shadow: 0 0 8px 2px rgba(59, 130, 246, 0.2); }
              100% { box-shadow: 0 0 24px 6px rgba(59, 130, 246, 0.6); }
            }
          `}</style>
        </section>
        {/* Animations CSS custom */}
        <style>{`
          @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(40px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up { animation: fade-in-up 1.1s cubic-bezier(.23,1.02,.43,1) both; }
          @keyframes hero-pop {
            0% { opacity: 0; transform: scale(0.96) translateY(30px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          .animate-hero-pop { animation: hero-pop 1.2s cubic-bezier(.23,1.02,.43,1) both; }
          @keyframes gradient-text {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
          }
          .animate-gradient-text {
            background-size: 200% 200%;
            animation: gradient-text 2.5s ease-in-out infinite alternate;
          }
          @keyframes bounce-smooth {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          .animate-bounce-smooth { animation: bounce-smooth 1.6s infinite; }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-18px); }
          }
          .animate-float { animation: float 3.2s ease-in-out infinite; }
          @keyframes pop-in {
            0% { opacity: 0; transform: scale(0.92); }
            100% { opacity: 1; transform: scale(1); }
          }
          .animate-pop-in { animation: pop-in 1.2s cubic-bezier(.23,1.02,.43,1) both; }
        `}</style>
        {/* Toutes les sections principales englobées dans un fragment pour validité JSX */}
        <>
          {/* Offres du moment */}
          <section id="offres" className="py-16 bg-gradient-to-r from-amber-50 via-white to-yellow-50 border-y border-amber-200/40 relative z-10">
            <div className="container mx-auto px-6 max-w-5xl">
              <h2 className="text-2xl md:text-3xl font-bold text-amber-700 mb-8 text-center font-serif drop-shadow-lg">Offres du moment</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white/90 rounded-2xl shadow-lg border border-amber-100 p-6 flex flex-col items-center hover:scale-105 transition-transform duration-300">
                  <span className="text-4xl mb-2">🎁</span>
                  <h3 className="font-luxury text-xl text-gradient-gold mb-3">Pack Découverte Prestige</h3>
                  <p className="text-gray-700 text-sm mb-3 text-center">Échantillon 3 mini-flacons 3ml au choix pour tester nos best-sellers.</p>
                  <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold mb-2">14,90€ fdp inclus</span>
                  <div className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-semibold mb-3 text-center">
                    Recevez un code promo de 10% pour votre prochaine commande !
                  </div>
                  <button 
                    className="bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-all duration-300 hover:scale-105" 
                    onClick={() => scrollToSection('pack-decouverte')}
                  >
                    J'en profite
                  </button>
                </div>
                <div className="bg-white/90 rounded-2xl shadow-lg border border-amber-100 p-6 flex flex-col items-center hover:scale-105 transition-transform duration-300">
                  <span className="text-4xl mb-2">💸</span>
                  <h3 className="font-bold text-lg text-amber-700 mb-2">-10% sur le 2e flacon</h3>
                  <p className="text-gray-700 text-sm mb-4 text-center">Profitez de 10% de réduction immédiate sur le 2<sup>e</sup> flacon acheté (hors promos).</p>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold mb-2">Promo</span>
                  <button 
                    className="bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-all duration-300 hover:scale-105"
                    onClick={() => scrollToSection('collections')}
                  >
                    Voir conditions
                  </button>
                </div>
                <div className="bg-white/90 rounded-2xl shadow-lg border border-amber-100 p-6 flex flex-col items-center hover:scale-105 transition-transform duration-300">
                  <span className="text-4xl mb-2">🚚</span>
                  <h3 className="font-bold text-lg text-amber-700 mb-2">Livraison offerte dès 80€</h3>
                  <p className="text-gray-700 text-sm mb-4 text-center">Frais de port gratuits pour toute commande supérieure à 80€.</p>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold mb-2">Exclu web</span>
                  <button 
                    className="bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-all duration-300 hover:scale-105"
                    onClick={() => scrollToSection('collections')}
                  >
                    En profiter
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Section Pack Découverte - Échantillons */}
          <PackDecouverteSection />

          {/* Collections avec système d'onglets */}
          <section id="collections" className="py-20 relative z-10 overflow-hidden">
            {/* Background marbre noir spécifique à la section collections */}
            <div
              className="pointer-events-none select-none absolute inset-0 w-full h-full z-0 bg-cover bg-center opacity-85 transition-opacity duration-700"
              aria-hidden="true"
              style={{
                backgroundImage: "url('https://raw.githubusercontent.com/Firestonecanon/dsparfum-images/main/marbre-noir-collections.jpg')",
              }}
            ></div>
            <div className="container mx-auto px-6 relative z-10">
              <div className="text-center mb-20">
                <h2 className="glass-premium font-luxury text-4xl md:text-5xl text-gradient-gold p-8 rounded-2xl shadow-luxury mb-6">
                  Collections Prestige
                </h2>
                <p className="mt-4 bg-white/80 text-gray-800 backdrop-blur-lg p-4 rounded-xl border border-amber-500 shadow-md">
                  Huit univers olfactifs d’exception, chacun révélant une facette unique de votre personnalité
                </p>
              </div>
              {/* Onglets visuels avec images */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto mb-12">
                {[
                  { 
                    key: 'femme', 
                    label: 'Femme', 
                    color: 'pink',
                    image: 'https://raw.githubusercontent.com/Firestonecanon/dsparfum-images/main/young-woman-5128864.jpg',
                    description: 'Des fragrances élégantes et envoûtantes'
                  },
                  { 
                    key: 'homme', 
                    label: 'Homme', 
                    color: 'blue',
                    image: 'https://raw.githubusercontent.com/Firestonecanon/dsparfum-images/main/pexels-ushindinamegabe-10482351.jpg',
                    description: 'Des senteurs puissantes et affirmées'
                  },
                  { 
                    key: 'mixte', 
                    label: 'Mixte', 
                    color: 'violet',
                    image: 'https://raw.githubusercontent.com/Firestonecanon/dsparfum-images/main/valentines-day-background-6548045.jpg',
                    description: 'Des fragrances unisexes sophistiquées'
                  },
                  { 
                    key: 'enfant', 
                    label: 'Enfant', 
                    color: 'orange',
                    image: 'https://raw.githubusercontent.com/Firestonecanon/dsparfum-images/main/enfant%20(2).jpg',
                    description: 'Des fragrances douces et ludiques'
                  },
                  { 
                    key: 'creation', 
                    label: 'Création', 
                    color: 'purple',
                    image: 'https://raw.githubusercontent.com/Firestonecanon/dsparfum-images/main/collection.jpg',
                    description: 'Votre parfum unique, créé sur mesure'
                  },
                  { 
                    key: 'luxe', 
                    label: 'Luxe', 
                    color: 'emerald',
                    image: 'https://raw.githubusercontent.com/Firestonecanon/dsparfum-images/main/perfume-6223754.jpg',
                    description: 'Raffinement premium pour connaisseurs'
                  },
                  { 
                    key: 'luxury', 
                    label: 'Luxury', 
                    color: 'red',
                    image: 'https://raw.githubusercontent.com/Firestonecanon/dsparfum-images/main/perfume-6899766.jpg',
                    description: 'L\'excellence absolue pour les connaisseurs'
                  },
                  { 
                    key: 'etuis', 
                    label: 'Étuis', 
                    color: 'teal',
                    image: '/images/Render_Cover.webp',
                    description: 'Protection élégante pour vos parfums 15ml'
                  }
                ].map(tab => (
                  <div
                    key={tab.key}
                    onClick={() => handleTabClick(tab.key)}
                    className={`group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-500 transform hover:scale-105 ${
                      activeCollection === tab.key
                        ? `ring-4 ring-${tab.color}-500 shadow-2xl shadow-${tab.color}-500/30 scale-105`
                        : 'hover:shadow-xl'
                    }`}
                  >
                    <div className="aspect-[4/3] bg-gradient-to-br from-gray-100/30 to-gray-200/30 flex items-center justify-center relative overflow-hidden">
                      <img
                        src={tab.image}
                        alt={`Collection ${tab.label}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className={`absolute inset-0 transition-all duration-500 ${
                        activeCollection === tab.key
                          ? 'bg-gradient-to-t from-black/40 via-black/10 to-transparent'
                          : 'bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/40'
                      }`}></div>
                      
                      {/* Badge de sélection */}
                      {activeCollection === tab.key && (
                        <div className={`absolute top-3 right-3 w-8 h-8 bg-${tab.color}-500 rounded-full flex items-center justify-center animate-pulse`}>
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className={`text-lg md:text-xl font-bold mb-1 text-white font-serif drop-shadow-lg transition-all duration-300 ${
                        activeCollection === tab.key ? 'transform scale-110' : ''
                      }`}>
                        {tab.label}
                      </h3>
                      <p className="text-gray-200 text-xs md:text-sm leading-relaxed drop-shadow-md opacity-90">
                        {tab.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contenu des collections */}
              <div id="collections-content" className="min-h-[600px] bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Collection {[
                      { key: 'femme', label: 'Femme' },
                      { key: 'homme', label: 'Homme' },
                      { key: 'mixte', label: 'Mixte' },
                      { key: 'enfant', label: 'Enfant' },
                      { key: 'creation', label: 'Création' },
                      { key: 'luxe', label: 'Luxe' },
                      { key: 'luxury', label: 'Luxury' },
                      { key: 'etuis', label: 'Étuis' }
                    ].find(t => t.key === activeCollection)?.label}
                  </h3>
                  <p className="text-white/80">Découvrez notre sélection de parfums d'exception</p>
                </div>
                
                {activeCollection === 'homme' && <HommeSection />}
                {activeCollection === 'femme' && <FemmeSection />}
                {activeCollection === 'mixte' && <MixteSection />}
                {activeCollection === 'enfant' && <EnfantSection />}
                {activeCollection === 'creation' && <CreationSection />}
                {activeCollection === 'luxe' && <LuxeSection />}
                {activeCollection === 'luxury' && <LuxurySection />}
                {activeCollection === 'etuis' && <EtuisSection />}
              </div>
            </div>
          </section>

          {/* Section Concept */}
          <section id="concept" className="py-20 relative z-10 bg-gradient-to-br from-gray-50 via-white to-slate-50">
            <div className="container mx-auto px-6 relative">
              <div className="text-center mb-20">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 font-serif tracking-wide drop-shadow-lg">
                  Notre Concept
                </h2>
                <div className="flex items-center justify-center mb-6">
                  <div className="h-px bg-gradient-to-r from-transparent via-amber-500/70 to-transparent w-48"></div>
                  <div className="mx-6 w-2 h-2 bg-amber-500 rounded-full shadow-lg shadow-amber-500/50"></div>
                  <div className="h-px bg-gradient-to-r from-amber-500/70 via-transparent to-transparent w-48"></div>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-6xl mx-auto">
                <div className="bg-white/70 backdrop-blur-md p-8 rounded-2xl border border-gray-300/50 hover:border-amber-500/50 transition-all duration-500">
                  <h3 className="text-2xl font-bold mb-4 text-amber-700 font-serif">Essences d'exception</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Nos essences de parfum proviennent des <strong>mêmes laboratoires prestigieux</strong> qui fournissent les plus grandes maisons de luxe. Cette origine commune garantit une qualité irréprochable et des fragrances d'une richesse olfactive exceptionnelle, élaborées selon les standards les plus exigeants de la haute parfumerie internationale.
                  </p>
                </div>
                <div className="bg-white/70 backdrop-blur-md p-8 rounded-2xl border border-gray-300/50 hover:border-amber-500/50 transition-all duration-500">
                  <h3 className="text-2xl font-bold mb-4 text-amber-700 font-serif">Pureté absolue</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Contrairement aux grandes marques qui diluent leurs parfums avec de l'eau (eau de parfum), nous utilisons exclusivement <strong>30% d'essence pure et 70% d'alcool végétal</strong>. Cette concentration exceptionnelle, soit le double des standards habituels, garantit une tenue remarquable et une intensité olfactive incomparable.
                  </p>
                </div>
                <div className="bg-white/70 backdrop-blur-md p-8 rounded-2xl border border-gray-300/50 hover:border-amber-500/50 transition-all duration-500">
                  <h3 className="text-2xl font-bold mb-4 text-amber-700 font-serif">Partenariat d'excellence</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Nous bénéficions d'un contrat d'exclusivité avec SOZIO, créateur et fournisseur de renom de compositions parfumantes et d'essences pour parfums, eaux de toilettes, déodorants, bougies et parfums... implanté à Grasse depuis plus de 250 ans. Un véritable pionnier de la parfumerie française qui nous garantit l'accès aux recettes originales des parfums.
                  </p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white/70 backdrop-blur-md border border-gray-300/50 rounded-2xl p-6 max-w-4xl mx-auto">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    <strong className="text-amber-700">Mention légale :</strong> Les noms de marques mentionnés servent uniquement à situer les familles olfactives. Les parfums proposés proviennent de fabricants européens reconnus, selon des formules identiques ou issues des mêmes licences. D&amp;S n'est affilié à aucune marque mentionnée.
                  </p>
                </div>
              </div>

              {/* Section approche économique */}
              <div className="mt-16 bg-gradient-to-br from-amber-50/80 to-orange-50/80 backdrop-blur-md rounded-3xl p-8 border border-amber-200/50">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-amber-700 mb-4 font-serif">Notre approche économique</h3>
                  <div className="flex items-center justify-center mb-6">
                    <div className="h-px bg-gradient-to-r from-transparent via-amber-500/70 to-transparent w-48"></div>
                    <div className="mx-6 w-2 h-2 bg-amber-500 rounded-full shadow-lg shadow-amber-500/50"></div>
                    <div className="h-px bg-gradient-to-r from-amber-500/70 via-transparent to-transparent w-48"></div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                  <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-amber-200/50">
                    <h4 className="text-xl font-bold text-amber-700 mb-4">💰 Prix ultra compétitifs</h4>
                    <div className="space-y-3 text-gray-700">
                      <p><strong>✓ Pas de publicité</strong> coûteuse à répercuter</p>
                      <p><strong>✓ Pas d'égérie</strong> à rémunérer</p>
                      <p><strong>✓ Pas de distributeur</strong> type Sephora, Nocibé etc.</p>
                      <p><strong>✓ Pas de flacon sophistiqué</strong> onéreux</p>
                      <p className="text-amber-600 font-semibold">📍 Résultat : Des parfums à partir de 35€ (sauf enfants)</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-amber-200/50">
                    <h4 className="text-xl font-bold text-amber-700 mb-4">🎯 Notre philosophie</h4>
                    <div className="space-y-3 text-gray-700">
                      <p>Les tarifs élevés des parfums de grandes marques sont à <strong>80% liés à leur budget publicitaire</strong> ainsi qu'aux nombreux intermédiaires.</p>
                      <p>Nous payons uniquement <strong>l'essentiel du produit</strong> : l'essence du parfum, l'alcool alimentaire BIO, et le flacon.</p>
                      <p className="text-amber-600 font-semibold">🌟 Un packaging simple et épuré pour vous proposer des produits à prix ultra compétitifs.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* Section Livraison */}
          <section id="livraison" className="py-20 relative z-10 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="container mx-auto px-6 relative">
              <div className="text-center mb-20">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 font-serif tracking-wide drop-shadow-lg">
                  Livraison &amp; Formats
                </h2>
                <div className="flex items-center justify-center mb-6">
                  <div className="h-px bg-gradient-to-r from-transparent via-amber-500/70 to-transparent w-48"></div>
                  <div className="mx-6 w-2 h-2 bg-amber-500 rounded-full shadow-lg shadow-amber-500/50"></div>
                  <div className="h-px bg-gradient-to-r from-amber-500/70 via-transparent to-transparent w-48"></div>
                </div>
              </div>
              <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                  {/* Frais de port */}
                  <div className="bg-white/70 backdrop-blur-md p-8 rounded-2xl border border-gray-300/50 hover:border-blue-500/50 transition-all duration-500">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-2xl">🚚</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 font-serif">Frais de port dégressifs</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-100/50 rounded-lg border border-gray-200/30">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">💸</span>
                          <span className="text-gray-700">Commande moins de 50 euros</span>
                        </div>
                        <span className="text-xl font-bold text-red-600">9&nbsp;€</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-100/50 rounded-lg border border-gray-200/30">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">📦</span>
                          <span className="text-gray-700">Commande 50 € - 79,99 €</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-bold text-orange-600">4,50&nbsp;€</span>
                          <div className="text-xs text-orange-500">(-50%)</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-100/50 to-green-50/50 rounded-lg border border-green-300/30">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🎁</span>
                          <span className="text-gray-700">Commande ≥ 80 €</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-bold text-green-600">OFFERTS</span>
                          <div className="text-xs text-green-500">(100%)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Formats et étuis */}
                  <div className="bg-white/70 backdrop-blur-md p-8 rounded-2xl border border-gray-300/50 hover:border-purple-500/50 transition-all duration-500">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-2xl">👜</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 font-serif">Étui 15 ml recommandé</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-100/50 rounded-lg border border-gray-200/30">
                        <p className="text-gray-700 mb-3">
                          <strong className="text-gray-900">Tous nos parfums adultes 70ml</strong> sont accompagnés d'un mini-flacon 15ml offert, sans étui.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-amber-700">
                          <span>🧴</span>
                          <span>Format : 70ml + 15ml de poche offert</span>
                        </div>
                      </div>
                      <div className="p-4 bg-purple-100/50 rounded-lg border border-purple-300/30">
                        <p className="text-purple-800 mb-2">
                          <strong>Pour un usage pratique et sécurisé</strong>, pensez à l'étui 15ml
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Étui 15ml (vendu séparément)</span>
                          <span className="text-lg font-bold text-purple-600">15&nbsp;€</span>
                        </div>
                        <p className="text-xs text-purple-600 mt-2">
                          ✨ Réutilisable pour toutes vos prochaines recharges
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Informations complémentaires */}
                <div className="bg-white/70 backdrop-blur-md border border-gray-300/50 rounded-2xl p-8 text-center">
                  <h4 className="text-xl font-bold text-amber-700 mb-4">Informations importantes</h4>
                  <div className="grid md:grid-cols-2 gap-6 text-left">
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">📦 Contenu de votre commande :</h5>
                      <ul className="text-gray-700 space-y-1 text-sm">
                        <li>• Flacon principal 50ml ou 70ml</li>
                        <li>• Mini-flacon 15ml offert (uniquement avec 70ml, sans étui)</li>
                        <li>• Emballage sécurisé pour le transport</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">🚀 Expédition :</h5>
                      <ul className="text-gray-700 space-y-1 text-sm">
                        <li>• Préparation : 5-7 jours ouvrés</li>
                        <li>• Livraison : 3-5 jours ouvrés</li>
                        <li>• Suivi de colis inclus</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section Partenaires */}
          <section id="partenaires" className="py-20 relative z-10 bg-gradient-to-br from-slate-50 via-white to-gray-50">
            <div className="container mx-auto px-6 text-center relative">
              <div className="mb-20">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 font-serif tracking-wide drop-shadow-lg">
                  Nos Partenaires
                </h2>
                <div className="flex items-center justify-center mb-6">
                  <div className="h-px bg-gradient-to-r from-transparent via-amber-500/70 to-transparent w-48"></div>
                  <div className="mx-6 w-2 h-2 bg-amber-500 rounded-full shadow-lg shadow-amber-500/50"></div>
                  <div className="h-px bg-gradient-to-r from-amber-500/70 via-transparent to-transparent w-48"></div>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {/* Partenaire Pizzas TS */}
                <a
                  href="https://pizzas-ts.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/70 backdrop-blur-md p-8 rounded-2xl border border-gray-300/50 hover:border-red-500/50 transition-all duration-500 hover:scale-105 group"
                >
                  <div className="w-[80px] md:w-[90px] h-[80px] md:h-[90px] mx-auto mb-6">
                    <img
                      src="/images/TSP.png"
                      alt="Logo Pizzas TS"
                      className="w-[90px] h-[90px] object-contain mx-auto"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 font-serif text-center">Pizzas TS</h3>
                  <p className="text-gray-600 text-center">Découvrez nos délicieuses pizzas artisanales</p>
                </a>
                {/* Partenaire TS Clean */}
                <a
                  href="https://tsclean.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/70 backdrop-blur-md p-8 rounded-2xl border border-gray-300/50 hover:border-blue-500/50 transition-all duration-500 hover:scale-105 group"
                >
                  <div className="w-[80px] md:w-[90px] h-[80px] md:h-[90px] mx-auto mb-6">
                    <img
                      src="/images/TSC.png"
                      alt="Logo TS Clean"
                      className="w-[90px] h-[90px] object-contain mx-auto"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 font-serif text-center">TS Clean</h3>
                  <p className="text-gray-600 text-center">Services de nettoyage professionnel</p>
                </a>
                {/* Partenaire Éclat Parfumé */}
                <a
                  href="https://www.facebook.com/share/1EHtVGKy3C/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/70 backdrop-blur-md p-8 rounded-2xl border border-gray-300/50 hover:border-purple-500/50 transition-all duration-500 hover:scale-105 group"
                >
                  <div className="w-[80px] md:w-[90px] h-[80px] md:h-[90px] mx-auto mb-6">
                    <img
                      src="/images/EPD.png"
                      alt="Logo Éclat Parfumé"
                      className="w-[90px] h-[90px] object-contain mx-auto"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 font-serif text-center">Éclat Parfumé</h3>
                  <p className="text-gray-600 text-center">Conseils et expertise en parfumerie</p>
                </a>
              </div>
            </div>
          </section>

          {/* Section Avis Clients */}
          <section id="avis" className="py-20 bg-gradient-to-br from-amber-50 via-white to-yellow-50 border-t border-amber-200/40 relative z-10">
            <div className="container mx-auto px-6 max-w-6xl">
              <h2 className="text-3xl md:text-4xl font-bold text-amber-700 mb-4 text-center font-serif drop-shadow-lg">Avis Clients</h2>
              <div className="text-center mb-12">
                <div className="flex justify-center items-center gap-2 mb-2">
                  <span className="text-3xl">⭐⭐⭐⭐⭐</span>
                  <span className="text-xl font-bold text-amber-700">5,0/5</span>
                </div>
                <p className="text-gray-600">Basé sur 247 avis vérifiés</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white/90 rounded-2xl shadow-lg border border-amber-100 p-6 hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center gap-1 mb-3">
                    <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
                  </div>
                  <p className="text-gray-700 italic mb-4">"Parfum incroyable ! La tenue est exceptionnelle, j'ai reçu plein de compliments. La livraison était rapide et l'emballage soigné."</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">M</div>
                    <div>
                      <p className="font-semibold text-amber-700">Marie L.</p>
                      <p className="text-xs text-gray-500">Vérifié - Il y a 3 jours</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/90 rounded-2xl shadow-lg border border-amber-100 p-6 hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center gap-1 mb-3">
                    <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
                  </div>
                  <p className="text-gray-700 italic mb-4">"Qualité équivalente aux grandes marques mais à prix abordable. Le flacon 15ml en complément est parfait pour le sac à main. Je recommande vivement !"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold">J</div>
                    <div>
                      <p className="font-semibold text-amber-700">Julien M.</p>
                      <p className="text-xs text-gray-500">Vérifié - Il y a 1 semaine</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/90 rounded-2xl shadow-lg border border-amber-100 p-6 hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center gap-1 mb-3">
                    <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
                  </div>
                  <p className="text-gray-700 italic mb-4">"Parfait ! Mon parfum préféré à un prix imbattable. Le service client est réactif et professionnel. Bravo D&S Parfum !"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-red-400 rounded-full flex items-center justify-center text-white font-bold">S</div>
                    <div>
                      <p className="font-semibold text-amber-700">Sarah D.</p>
                      <p className="text-xs text-gray-500">Vérifié - Il y a 2 semaines</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-12 text-center">
                <div className="grid md:grid-cols-3 gap-6 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-gray-600">Avis 100% vérifiés</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-gray-600">Collectés via Google Reviews</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-gray-600">Mis à jour quotidiennement</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section Contact premium dynamique */}
          <ContactSection contactInfo={contactInfo} />

          {/* Nos engagements */}
          <section id="engagements" className="py-16 bg-white/90 border-t border-amber-200/40 relative z-10">
            <div className="container mx-auto px-6 max-w-5xl">
              <h2 className="text-2xl md:text-3xl font-bold text-amber-700 mb-10 text-center font-serif drop-shadow-lg">Nos engagements</h2>
              <div className="grid md:grid-cols-4 gap-8 text-center">
                <div className="flex flex-col items-center">
                  <span className="text-4xl mb-2">🇮🇹</span>
                  <h3 className="font-bold text-lg text-amber-700 mb-1">Fabrication italienne</h3>
                  <p className="text-gray-700 text-sm">Parfums conçus selon les traditions italiennes de haute parfumerie.</p>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-4xl mb-2">🌱</span>
                  <h3 className="font-bold text-lg text-amber-700 mb-1">Qualité & éthique</h3>
                  <p className="text-gray-700 text-sm">Ingrédients sélectionnés, respect des normes européennes.</p>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-4xl mb-2">🔒</span>
                  <h3 className="font-bold text-lg text-amber-700 mb-1">Paiement sécurisé</h3>
                  <p className="text-gray-700 text-sm">Transactions protégées et données confidentielles.</p>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-4xl mb-2">😊</span>
                  <h3 className="font-bold text-lg text-amber-700 mb-1">Satisfaction client</h3>
                  <p className="text-gray-700 text-sm">Service client réactif et retours facilités.</p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section id="faq" className="py-20 bg-white/80 backdrop-blur-md border-t border-amber-500/20">
            <div className="container mx-auto px-6 max-w-3xl">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-amber-700 mb-10 font-serif drop-shadow-lg">FAQ - Questions fréquentes</h2>
              <div className="space-y-6">
                <details className="group border border-amber-200 rounded-xl p-4 bg-white/90 shadow transition-all">
                  <summary className="font-semibold text-gray-900 cursor-pointer flex items-center justify-between">
                    Quels sont les délais de livraison ?
                    <span className="ml-2 text-amber-600 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-2 text-gray-700">Votre commande est préparée sous 5-7 jours ouvrés. La livraison prend ensuite 3-5 jours ouvrés en France métropolitaine. Comptez au total 8-10 jours ouvrés.</p>
                </details>
                <details className="group border border-amber-200 rounded-xl p-4 bg-white/90 shadow transition-all">
                  <summary className="font-semibold text-gray-900 cursor-pointer flex items-center justify-between">
                    Puis-je retourner un parfum si je ne suis pas satisfait ?
                    <span className="ml-2 text-amber-600 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-2 text-gray-700">Oui, vous disposez de 14 jours après réception pour nous retourner un produit non ouvert. Contactez-nous pour la procédure de retour.</p>
                </details>
                <details className="group border border-amber-200 rounded-xl p-4 bg-white/90 shadow transition-all">
                  <summary className="font-semibold text-gray-900 cursor-pointer flex items-center justify-between">
                    Les parfums sont-ils équivalents à des grandes marques ?
                    <span className="ml-2 text-amber-600 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-2 text-gray-700">Nos fragrances sont élaborées dans les mêmes laboratoires que les grandes maisons, avec une concentration de 30% d'essence de parfum pour une tenue exceptionnelle.</p>
                </details>
                <details className="group border border-amber-200 rounded-xl p-4 bg-white/90 shadow transition-all">
                  <summary className="font-semibold text-gray-900 cursor-pointer flex items-center justify-between">
                    Proposez-vous des échantillons ?
                    <span className="ml-2 text-amber-600 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-2 text-gray-700">Oui, nous proposons des mini-flacons 15ml offerts avec chaque parfum adulte 70ml, parfaits pour tester ou emporter partout.</p>
                </details>
                <details className="group border border-amber-200 rounded-xl p-4 bg-white/90 shadow transition-all">
                  <summary className="font-semibold text-gray-900 cursor-pointer flex items-center justify-between">
                    Comment contacter le service client ?
                    <span className="ml-2 text-amber-600 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-2 text-gray-700">Vous pouvez nous écrire via le formulaire de contact du site ou par email à <a href="mailto:contact@dsparfum.fr" className="text-amber-700 underline">contact@dsparfum.fr</a>.</p>
                </details>
              </div>
            </div>
          </section>
          {/* Scroll to top button */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-50 bg-amber-600 hover:bg-amber-700 text-white rounded-full p-3 shadow-lg transition-all duration-300 animate-bounce"
            aria-label="Remonter en haut"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>

          {/* Modal du panier */}
          <CartModal
            isOpen={isCartModalOpen}
            onClose={() => setIsCartModalOpen(false)}
            contactInfo={contactInfo}
            setContactInfo={setContactInfo}
          />
          
          {/* Panier flottant mobile */}
          <FloatingCartMobile 
            onClick={() => setIsCartModalOpen(true)} 
            isModalOpen={isCartModalOpen}
          />
          
          {/* Compteur de visites privé - visible uniquement en mode admin */}
          <PrivateVisitCounter />
        </>
              </div>
            </CartProvider>
          </PromoProvider>
          </ContactProvider>
        }
      />
    </Routes>
  </BrowserRouter>
  );
}

export default App;
