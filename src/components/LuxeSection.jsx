import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

// Données Luxe (70ml) - prix plus élevés
const parfumsLuxe = [
  // Femme Luxe
  { id: "93", publicRef: "DSL-001", name: "AVENTUS FOR HER", brand: "CREED", contenance: "70ml", price: "57 €", category: "Femme Luxe" },
  { id: "122", publicRef: "DSL-002", name: "LIBRE", brand: "YSL", contenance: "70ml", price: "48 €", category: "Femme Luxe" },
  { id: "131", publicRef: "DSL-003", name: "GOOD GIRL", brand: "CAROLINA HERRERA", contenance: "70ml", price: "48 €", category: "Femme Luxe" },
  { id: "132", publicRef: "DSL-004", name: "MY WAY", brand: "ARMANI", contenance: "70ml", price: "45 €", category: "Femme Luxe" },

  // Homme Luxe
  { id: "68", publicRef: "DSL-005", name: "AVENTUS", brand: "CREED", contenance: "70ml", price: "57 €", category: "Homme Luxe" },
  { id: "94", publicRef: "DSL-006", name: "SAUVAGE", brand: "DIOR", contenance: "70ml", price: "48 €", category: "Homme Luxe" },
  { id: "113", publicRef: "DSL-007", name: "SUR LA ROUTE", brand: "LOUIS VUITTON", contenance: "70ml", price: "57 €", category: "Homme Luxe" },
  { id: "136", publicRef: "DSL-008", name: "DIOR HOMME INTENSE", brand: "DIOR", contenance: "70ml", price: "45 €", category: "Homme Luxe" },

  // Mixte Luxe
  { id: "44", publicRef: "DSL-009", name: "SILVER MOUNTAIN", brand: "CREED", contenance: "70ml", price: "48 €", category: "Mixte Luxe" },
  { id: "73", publicRef: "DSL-010", name: "HIMALAYA", brand: "CREED", contenance: "70ml", price: "48 €", category: "Mixte Luxe" },
  { id: "99", publicRef: "DSL-011", name: "MANDARINO DI AMALFI", brand: "TOM FORD", contenance: "70ml", price: "45 €", category: "Mixte Luxe" },
  { id: "110", publicRef: "DSL-012", name: "KIRKE", brand: "TIZIANA TERENZI", contenance: "70ml", price: "48 €", category: "Mixte Luxe" },
  { id: "114", publicRef: "DSL-013", name: "OMBRE NOMADE", brand: "LOUIS VUITTON", contenance: "70ml", price: "48 €", category: "Mixte Luxe" },
  { id: "135", publicRef: "DSL-014", name: "BOIS D'ARGENT", brand: "DIOR", contenance: "70ml", price: "57 €", category: "Mixte Luxe" },
  { id: "142", publicRef: "DSL-015", name: "OMBRE LEATHER", brand: "TOM FORD", contenance: "70ml", price: "57 €", category: "Mixte Luxe" }
];

export default function LuxeSection() {
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const { addToCart } = useCart();
  
  const categories = ['Tous', 'Femme Luxe', 'Homme Luxe', 'Mixte Luxe'];
  
  const filteredParfums = selectedCategory === 'Tous' 
    ? parfumsLuxe 
    : parfumsLuxe.filter(parfum => parfum.category === selectedCategory);

  const getCategoryColor = (category) => {
    if (category.includes('Femme')) return 'pink';
    if (category.includes('Homme')) return 'blue';
    return 'emerald';
  };

  const getImageFilter = (category) => {
    if (category.includes('Femme')) return 'hue-rotate(320deg) saturate(1.3) brightness(1.1)';
    if (category.includes('Homme')) return 'hue-rotate(200deg) saturate(1.2) brightness(0.9)';
    return 'hue-rotate(120deg) saturate(1.1) brightness(1.0)';
  };

  const handleAddToCart = (parfum) => {
  const product = {
    id: `luxe-${parfum.id}`,
    ref: parfum.publicRef,        
    publicRef: parfum.publicRef,
    name: parfum.name,
    brand: parfum.brand,
    price: parfum.price,
    contenance: parfum.contenance,
    category: parfum.category
  };
  addToCart(product);
};

  return (
    <section className="py-20 relative overflow-hidden min-h-screen">
      {/* Background unifié avec nouvelle image marbre noir profond */}
      <div className="absolute inset-0">
        {/* Image de fond marbre noir profond */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://raw.githubusercontent.com/Firestonecanon/dsparfum-images/main/ChatGPT%20Image%2028%20juin%202025%2C%2002_53_06.png')`,
            backgroundAttachment: 'fixed',
            filter: 'contrast(1.4) brightness(0.7) saturate(0.8)'
          }}
        ></div>
        
        {/* Overlay noir profond pour accentuer le contraste */}
        <div className="absolute inset-0 bg-black/75"></div>
        
        {/* Overlay final pour la profondeur sans reflets jaunes */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white font-serif tracking-wide">
            Collection Luxe
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Notre gamme premium, inspirée des plus grandes maisons de parfumerie. 
            Des compositions raffinées pour les connaisseurs exigeants.
          </p>
          
          <div className="flex items-center justify-center mt-8">
            <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent w-64"></div>
            <div className="mx-4 w-2 h-2 bg-emerald-500 rounded-full"></div>
            <div className="h-px bg-gradient-to-r from-emerald-500/50 via-transparent to-transparent w-64"></div>
          </div>
        </div>

        {/* Filtres par catégorie */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid gap-4 md:gap-6">
            {filteredParfums.map((parfum) => {
              const colorClass = getCategoryColor(parfum.category);
              const imageFilter = getImageFilter(parfum.category);
              
              return (
                <div 
                  key={parfum.id}
                  className={`group bg-black/90 backdrop-blur-md border border-gray-700/50 rounded-2xl p-4 md:p-6 hover:border-${colorClass}-500/40 transition-all duration-500 hover:transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-${colorClass}-500/10 relative overflow-hidden`}
                  style={{
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(245, 158, 11, 0.08)'
                  }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-${colorClass}-500/[0.05] to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000`}></div>
                  
                  <div className="flex items-center gap-4 md:gap-6 relative z-10">
                    <div className="flex-shrink-0 relative">
                      <div className="w-20 h-28 md:w-24 md:h-32 rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-300 shadow-lg">
                        <img 
                          src="https://raw.githubusercontent.com/Firestonecanon/dsparfum-images/main/ChatGPT%20Image%2025%20juin%202025%2C%2017_14_18.png" 
                          alt={`Flacon D&S ${parfum.name}`}
                          className="w-full h-full object-cover rounded-xl"
                          style={{ filter: imageFilter }}
                        />
                      </div>
                      <div className={`absolute -top-2 -right-2 bg-gradient-to-r from-${colorClass}-500 to-${colorClass}-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg border border-${colorClass}-400`}>
                        {parfum.publicRef}
                      </div>
                      {/* Badge Luxe */}
                      <div className="absolute -bottom-2 -left-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                        LUXE
                      </div>
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className={`text-lg md:text-xl font-bold text-white mb-1 truncate group-hover:text-${colorClass}-300 transition-colors duration-300`}>
                            {parfum.name}
                          </h3>
                          <p className={`text-${colorClass}-300 text-sm md:text-base font-medium`}>
                            {parfum.brand}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className={`bg-${colorClass}-900/30 border border-${colorClass}-500/30 rounded-full px-3 py-1`}>
                              <p className={`text-${colorClass}-200 text-xs font-medium`}>
                                🧴 {parfum.contenance} + 15 ml offert (sans étui)
                              </p>
                            </div>
                          </div>
                          <p className="text-gray-400 text-xs mt-1">
                            L'étui 15 ml est recommandé pour un transport optimal (en vente séparée à 15 €)
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="text-right">
                            <div className="text-xl md:text-2xl font-bold text-white">
                              {parfum.price}
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => handleAddToCart(parfum)}
                            className={`bg-gradient-to-r from-${colorClass}-500 to-${colorClass}-600 hover:from-${colorClass}-400 hover:to-${colorClass}-500 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-${colorClass}-500/30 whitespace-nowrap relative overflow-hidden group`}
                          >
                            <span className="relative z-10">Commander</span>
                            <div className={`absolute inset-0 bg-gradient-to-r from-${colorClass}-400 to-${colorClass}-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Note en bas */}
        <div className="mt-16 text-center">
          <div className="bg-black/90 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 max-w-4xl mx-auto shadow-2xl" style={{
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(245, 158, 11, 0.12)'
          }}>
            <p className="text-sm text-gray-300 leading-relaxed">
              <strong className="text-emerald-400">Collection D&S Luxe - Raffinement Premium</strong><br />
              Nos parfums luxe sont inspirés des plus grandes maisons de parfumerie, élaborés avec des ingrédients nobles. 
              <strong className="text-white"> Qualité exceptionnelle, prix accessible.</strong> Concentration premium pour une expérience olfactive raffinée.
              <br /><br />
              <em className="text-xs text-gray-400">* D&S n'est affilié à aucune marque mentionnée. Les noms servent uniquement à situer les familles olfactives.</em>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}