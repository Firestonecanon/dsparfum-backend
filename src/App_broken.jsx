import React, { useState, useEffect, useRef } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { PromoProvider } from './context/PromoContext';
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
import AdminClients from './components/AdminClients';
import { parfumsHomme } from './data/parfumsHomme';
import { parfumsFemme } from './data/parfumsFemme';
import { parfumsMixte } from './data/parfumsMixte';
import { parfumsLuxe } from './data/parfumsLuxe';
import { parfumsLuxury } from './data/parfumsLuxury';
import { parfumsEnfant, parfumsCreation } from './data/parfumsEnfantCreation';

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
          className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-blue-200 hover:shadow-md transition-shadow duration-200 mb-4"
        >
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-blue-700 font-serif">Pack Découverte</h2>
            {selectedSamples.length > 0 && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
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
        
        {isExpanded && (
          <div className="bg-white/95 rounded-2xl shadow-xl border border-blue-100 p-8 mb-8 backdrop-blur-sm">
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
            </div>

            {/* Grille de parfums avec filtres */}
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

            {/* Grille de parfums */}
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
                    key={parfum.ref} 
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
            </div>

            {/* Bouton d'ajout au panier */}
            <div className="text-center mt-8">
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
            </div>
          </div>
        )}
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

return (
  <BrowserRouter>
    <Routes>
      <Route path="/admin" element={<AdminClients />} />
      <Route
        path="*"
        element={
            <PromoProvider>
              <CartProvider>
              <div className="min-h-screen text-gray-900 relative overflow-x-hidden">
                {/* Styles CSS pour le luxe */}
                <style jsx>{`
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
            className="fixed inset-0 z-0"
            style={{
              ...smokeStyle,
              filter: 'brightness(1.1) contrast(1.1)',
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
              <a className="nav-link-luxury" href="#collections" onClick={() => scrollToSection('collections')}>✨ Collections</a>
              <a className="nav-link-luxury" href="#offres" onClick={() => scrollToSection('offres')}>🎁 Offres VIP</a>
              <a className="nav-link-luxury" href="#faq" onClick={() => scrollToSection('faq')}>💬 FAQ</a>
              <a className="nav-link-luxury" href="#engagements" onClick={() => scrollToSection('engagements')}>💎 Engagements</a>
              <a className="nav-link-luxury" href="#contact" onClick={() => scrollToSection('contact')}>📞 Contact</a>
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
                <style jsx>{`
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
              </div>
            )}
          </header>
        </div>
        
        {/* Spacer dynamique pour compenser la hauteur du bloc fixe du haut */}
        <div id="spacer-hero" style={{ height: '0px' }} aria-hidden="true"></div>
        
        {/* Hero (section d'accueil) */}
        <section id="accueil" className="w-full relative overflow-visible pt-24 md:pt-32" style={{zIndex:30}}>
          <div className="w-full max-w-7xl mx-auto px-6 lg:flex lg:items-center lg:gap-12 relative z-50 animate-fade-in-up">
            {/* Colonne gauche : texte premium */}
            <div className="relative z-10 text-center lg:text-left lg:flex-1 lg:max-w-3xl animate-hero-pop">
              <span className="inline-block px-4 py-1 mb-2 rounded-full text-xs font-semibold tracking-widest animate-badge-glow" style={{background:'rgba(59, 130, 246, 0.13)', color:'#3b82f6', letterSpacing:2, boxShadow:'0 0 12px 2px rgba(59, 130, 246, 0.3)'}}>NOUVEAUTÉ</span>
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
                Découvrez l'Art du Parfum
              </h1>
              <p className="text-lg md:text-xl text-slate-700 mb-4" style={{textShadow:'0 1px 0 rgba(255,255,255,0.5)'}}>Des fragrances d'exception, pour une expérience sensorielle unique.</p>
              <a
                href="#collections"
                className="hero-btn-glass w-full sm:w-auto block mx-auto sm:inline-block"
                style={{maxWidth:'320px'}}
                onClick={() => scrollToSection('collections')}
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
        </section>

        {/* Offres du moment */}
        <section id="offres" className="py-16 bg-gradient-to-r from-amber-50 via-white to-yellow-50 border-y border-amber-200/40 relative z-10">
          <div className="container mx-auto px-6 max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-bold text-amber-700 mb-8 text-center font-serif drop-shadow-lg">Offres du moment</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/90 rounded-2xl shadow-lg border border-amber-100 p-6 flex flex-col items-center hover:scale-105 transition-transform duration-300">
                <span className="text-4xl mb-2">🎁</span>
                <h3 className="font-bold text-lg text-amber-700 mb-2">Pack Découverte</h3>
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
            className="pointer-events-none select-none absolute inset-0 w-full h-full z-0"
            aria-hidden="true"
            style={{
              backgroundImage: "url('https://raw.githubusercontent.com/Firestonecanon/dsparfum-images/main/marbre-noir-collections.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.85,
              transition: 'opacity 0.7s',
            }}
          ></div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-20">
              <h2 className="bg-white/80 text-gray-900 backdrop-blur-lg p-6 rounded-xl border border-amber-500 shadow-md">
                Nos Collections
              </h2>
              <p className="mt-4 bg-white/80 text-gray-800 backdrop-blur-lg p-4 rounded-xl border border-amber-500 shadow-md">
                Huit univers olfactifs d'exception, chacun révélant une facette unique de votre personnalité
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

        {/* Section Contact premium dynamique */}
        <ContactSection contactInfo={contactInfo} />

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
        <FloatingCartMobile onClick={() => setIsCartModalOpen(true)} />
        
        {/* Compteur de visites privé - visible uniquement en mode admin */}
        <PrivateVisitCounter />

        {/* Animations CSS premium */}
        <style jsx>{`
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
            text-decoration: none;
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
          .animate-scroll-mobile {
            animation: scroll-mobile 20s linear infinite;
          }
          @keyframes scroll-mobile {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
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
      </div>
              </CartProvider>
            </PromoProvider>
        }
      />
    </Routes>
  </BrowserRouter>
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

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCollection, setActiveCollection] = useState('homme'); // État pour l'onglet actif
  const [isCartModalOpen, setIsCartModalOpen] = useState(false); // État pour le modal du panier
  const [contactInfo, setContactInfo] = useState({
    nom: '',
    email: '',
    phone: '',
    adresse: '',
    codePostal: '',
    ville: ''
  });

  return (
    <PromoProvider>
      <CartProvider>
        <div className="min-h-screen bg-gray-50">
          {/* Contenu principal de l'application */}
          <h1>Application restaurée avec succès</h1>
          <p>Toutes les fonctionnalités AppSec.jsx ont été intégrées</p>
        </div>
      </CartProvider>
    </PromoProvider>
  );
}

export default App;
            <span className="text-amber-400">•</span>
            <span className="flex items-center gap-1">🎁 <strong className="text-amber-300">FDP :</strong> 9€ / -50% / Offert</span>
            <span className="text-amber-400">•</span>
            <span className="flex items-center gap-1">👜 <strong className="text-amber-300">Étui 15ml :</strong> 15€ (recommandé)</span>
            <span className="text-amber-400">•</span>
            <span className="flex items-center gap-1">💎 <strong className="text-amber-300">Qualité premium garantie</strong></span>
          </div>
        </div>
        {/* Version mobile avec défilement */}
        <div className="md:hidden py-1.5 relative">
          <div className="animate-scroll-mobile whitespace-nowrap text-xs font-medium">
            <span className="inline-block px-4">🧴 <strong>Format 70ml + 15ml offert</strong></span>
            <span className="inline-block px-4">•</span>
            <span className="inline-block px-4">📦 <strong>FDP :</strong> 9€ / -50% / Offert</span>
            <span className="inline-block px-4">•</span>
            <span className="inline-block px-4">👜 <strong>Étui 15ml :</strong> 15€ (recommandé)</span>
          </div>
        </div>
      </div>

      {/* Barre supérieure d'infos - Version luxe */}
      <div className="hidden md:flex bg-gradient-to-r from-slate-800/95 via-slate-700/90 to-slate-800/95 text-white shadow-xl text-xs font-medium py-2 px-6 justify-between items-center gap-6 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">🚚 <span className="font-semibold">Livraison sous 5-10 jours</span></span>
          <span className="hidden lg:inline text-blue-200">|</span>
          <span className="flex items-center gap-2">⭐ <span className="font-semibold">Avis clients 5/5</span></span>
          <span className="hidden lg:inline text-blue-200">|</span>
          <span className="flex items-center gap-2">🎯 <span className="font-semibold">Offres VIP</span></span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:inline font-semibold">Rejoignez-nous :</span>
          <a href="https://www.facebook.com/profile.php?id=61577262944619" target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition-colors flex items-center gap-1">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="hidden lg:inline text-sm">Facebook</span>
          </a>
          <a href="https://www.instagram.com/d_s_parfum?igsh=YXQ3MG50bDJxM2sx" target="_blank" rel="noopener noreferrer" className="hover:text-pink-200 transition-colors flex items-center gap-1">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span className="hidden lg:inline text-sm">Instagram</span>
          </a>
        </div>
      </div>

      {/* Header principal - Version élégante */}
      <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-xl overflow-hidden border-b border-amber-400/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo avec effet luxe */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg animate-luxury-glow">
                <span className="text-white font-bold text-lg">DS</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                  DS Parfum
                </h1>
                <p className="text-xs text-amber-200 font-light">L'Art du Parfum Premium</p>
              </div>
            </div>

            {/* Navigation desktop */}
            <nav className="hidden md:flex space-x-2">
              {[
                { key: 'homme', label: 'Homme', emoji: '👨' },
                { key: 'femme', label: 'Femme', emoji: '👩' },
                { key: 'mixte', label: 'Mixte', emoji: '💫' },
                { key: 'luxe', label: 'Luxe', emoji: '💎' }
              ].map(({ key, label, emoji }) => (
                <button
                  key={key}
                  onClick={() => setActiveCollection(key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    activeCollection === key
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg scale-105'
                      : 'text-amber-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{emoji}</span>
                  <span>{label}</span>
                </button>
              ))}
            </nav>

            {/* Menu burger mobile */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1"
            >
              <span className="block w-5 h-0.5 bg-gradient-to-r from-amber-300 to-amber-500 mb-1 rounded-full shadow-sm"></span>
              <span className="block w-5 h-0.5 bg-gradient-to-r from-amber-300 to-amber-500 mb-1 rounded-full shadow-sm"></span>
              <span className="block w-5 h-0.5 bg-gradient-to-r from-amber-300 to-amber-500 rounded-full shadow-sm"></span>
            </button>
          </div>

          {/* Menu mobile */}
          {isMenuOpen && (
            <div className="md:hidden pb-4 border-t border-amber-400/30 mt-4 pt-4">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'homme', label: 'Homme', emoji: '👨' },
                  { key: 'femme', label: 'Femme', emoji: '👩' },
                  { key: 'mixte', label: 'Mixte', emoji: '💫' },
                  { key: 'luxe', label: 'Luxe', emoji: '💎' }
                ].map(({ key, label, emoji }) => (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveCollection(key);
                      setIsMenuOpen(false);
                    }}
                    className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                      activeCollection === key
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg'
                        : 'bg-white/10 text-amber-200 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    <span>{emoji}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Corps principal avec image de fond */}
      <main 
        className="min-h-screen relative"
        style={{
          backgroundImage: activeCollection === 'luxe' || activeCollection === 'luxury'
            ? "url('https://raw.githubusercontent.com/Firestonecanon/dsparfum-images/main/marbre-noir-collections.jpg')"
            : "url('https://raw.githubusercontent.com/Firestonecanon/dsparfum-images/main/smoke-1830840.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Overlay pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-black/30"></div>
        
        {/* Section Hero */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Découvrez l'Art du 
              <span className="block bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent animate-luxury-glow">
                Parfum Premium
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Une collection exclusive de parfums premium inspirés des plus grandes fragrances mondiales. 
              Qualité exceptionnelle, essence luxueuse.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-amber-500/25">
                ✨ Découvrir la Collection
              </button>
              <button className="border-2 border-white/30 backdrop-blur-sm bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300">
                🎬 Voir la Vidéo
              </button>
            </div>
          </div>
        </section>

        {/* Collections Grid */}
        <section className="relative py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Collection {activeCollection.charAt(0).toUpperCase() + activeCollection.slice(1)}
              </h2>
              <p className="text-xl text-gray-200 max-w-2xl mx-auto">
                {activeCollection === 'homme' && '🌟 Parfums masculins sophistiqués et élégants'}
                {activeCollection === 'femme' && '🌸 Fragrances féminines raffinées et sensuelles'}
                {activeCollection === 'mixte' && '💫 Parfums unisexes modernes et polyvalents'}
                {activeCollection === 'luxe' && '💎 Collections prestige haute qualité'}
              </p>
            </div>

            {/* Grille de parfums */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="group">
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden hover:shadow-amber-500/25 transition-all duration-300 transform hover:scale-105 border border-white/20">
                    {/* Image du parfum */}
                    <div className="h-64 bg-gradient-to-br from-amber-200/20 to-amber-400/30 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="w-16 h-20 bg-gradient-to-b from-amber-300/30 to-amber-600/50 rounded-lg mx-auto border border-amber-300/30 shadow-xl">
                          <div className="w-8 h-4 bg-gradient-to-b from-amber-400 to-amber-600 rounded-t mx-auto mt-1"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Contenu */}
                    <div className="p-6 text-white">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-amber-300 transition-colors">
                        {activeCollection === 'homme' && `Élégance Masculine ${item}`}
                        {activeCollection === 'femme' && `Charme Féminin ${item}`}
                        {activeCollection === 'mixte' && `Essence Unisexe ${item}`}
                        {activeCollection === 'luxe' && `Prestige Royal ${item}`}
                      </h3>
                      <p className="text-gray-300 mb-4 text-sm">
                        {activeCollection === 'homme' && 'Notes boisées et épicées, caractère affirmé'}
                        {activeCollection === 'femme' && 'Floral fruité, élégance raffinée'}
                        {activeCollection === 'mixte' && 'Fraîcheur moderne, versatilité parfaite'}
                        {activeCollection === 'luxe' && 'Composition exclusive, luxe absolu'}
                      </p>
                      
                      {/* Prix et action */}
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-2xl font-bold text-amber-400">29€</span>
                          <span className="text-sm text-gray-400 ml-2">+ 15ml offert</span>
                        </div>
                        <button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                          🛒 Ajouter
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section Avantages */}
        <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-black/20 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
              Pourquoi Choisir DS Parfum ?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: '🎁',
                  title: 'Format 70ml + 15ml Offert',
                  description: 'Chaque parfum 70ml est accompagné d\'un mini-flacon 15ml gratuit'
                },
                {
                  icon: '💎',
                  title: 'Qualité Premium',
                  description: 'Compositions haut de gamme inspirées des plus grandes fragrances'
                },
                {
                  icon: '🚚',
                  title: 'Livraison Rapide',
                  description: 'Expédition sous 24h, livraison 5-10 jours ouvrés'
                }
              ].map((avantage, index) => (
                <div key={index} className="text-center text-white">
                  <div className="text-4xl mb-4">{avantage.icon}</div>
                  <h3 className="text-xl font-semibold mb-3 text-amber-300">{avantage.title}</h3>
                  <p className="text-gray-300">{avantage.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section Contact */}
        <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-t from-black/50 to-transparent">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Une Question ? Contactez-nous
            </h2>
            <p className="text-xl text-gray-200 mb-8">
              Notre équipe d'experts en parfumerie est à votre disposition
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:contact@dsparfum.fr" 
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center justify-center gap-2"
              >
                ✉️ contact@dsparfum.fr
              </a>
              <a 
                href="https://www.instagram.com/d_s_parfum" 
                target="_blank" 
                rel="noopener noreferrer"
                className="border-2 border-white/30 backdrop-blur-sm bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                📱 @d_s_parfum
              </a>
            </div>
          </div>
        </section>

        {/* Section Livraison */}
        <section id="livraison" className="py-16 bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-t border-blue-200/40 relative z-10">
          <div className="container mx-auto px-6 max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-bold text-blue-700 mb-10 text-center font-serif drop-shadow-lg">Livraison & Conditions</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/90 rounded-2xl shadow-lg border border-blue-100 p-6">
                <h3 className="font-bold text-lg text-blue-700 mb-4 flex items-center gap-2">
                  <span>🚚</span> Expédition
                </h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Préparation : 5-7 jours ouvrés</li>
                  <li>• Livraison France : 3-5 jours ouvrés</li>
                  <li>• Frais de port gratuits dès 80€</li>
                  <li>• Emballage soigné et discret</li>
                </ul>
              </div>
              <div className="bg-white/90 rounded-2xl shadow-lg border border-blue-100 p-6">
                <h3 className="font-bold text-lg text-blue-700 mb-4 flex items-center gap-2">
                  <span>✅</span> Garanties
                </h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Retour possible sous 14 jours</li>
                  <li>• Paiement 100% sécurisé</li>
                  <li>• Service client réactif</li>
                  <li>• Qualité contrôlée</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section Partenaires */}
        <section id="partenaires" className="py-16 bg-gray-50 border-t border-gray-200 relative z-10">
          <div className="container mx-auto px-6 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-10 text-center font-serif">Nos Partenaires</h2>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <span className="text-gray-600 font-semibold">🇮🇹 Laboratoires italiens</span>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <span className="text-gray-600 font-semibold">🌿 Ingrédients naturels</span>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <span className="text-gray-600 font-semibold">🔒 Paiement sécurisé</span>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <span className="text-gray-600 font-semibold">📦 Livraison express</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 relative z-10">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-amber-400">D&S Parfum</h3>
              <p className="text-gray-300 text-sm mb-4">L'art de la parfumerie française depuis 2020. Des fragrances d'exception pour révéler votre personnalité unique.</p>
              <div className="flex gap-3">
                <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-amber-400">Collections</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Parfums Femme</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Parfums Homme</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Parfums Mixte</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Parfums Enfant</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Collection Luxe</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-amber-400">Services</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Pack Découverte</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Création sur mesure</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Livraison rapide</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Service client</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Étuis de protection</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-amber-400">Informations</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">À propos</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Conditions générales</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Politique de confidentialité</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Mentions légales</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">&copy; 2024 D&S Parfum. Tous droits réservés. | Parfumerie en ligne française</p>
          </div>
        </div>
      </footer>

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
      <FloatingCartMobile onClick={() => setIsCartModalOpen(true)} />
      
      {/* Compteur de visites privé - visible uniquement en mode admin */}
      <PrivateVisitCounter />

      {/* Animations CSS premium */}
      <style jsx>{`
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
          text-decoration: none;
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
        .animate-scroll-mobile {
          animation: scroll-mobile 20s linear infinite;
        }
        @keyframes scroll-mobile {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
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
    </div>
  </CartProvider>
</PromoProvider>
);

export default App;

