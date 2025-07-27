import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

// Données Luxury (50ml) - gamme ultra-premium
const parfumsLuxury = [
  // Femme Luxury (50ml)
  { id: "109", publicRef: "DSLU-001", name: "J'ADORE L'OR", brand: "DIOR", contenance: "50ml", price: "52 €", category: "Femme Luxury" },
  { id: "123", publicRef: "DSLU-002", name: "GOOD GIRL GONE BAD", brand: "KILIAN", contenance: "50ml", price: "52 €", category: "Femme Luxury" },

  // Homme Luxury (50ml)
  { id: "74", publicRef: "DSLU-003", name: "BLACK AFGANO", brand: "NASOMATTO", contenance: "50ml", price: "52 €", category: "Homme Luxury" },
  { id: "75", publicRef: "DSLU-004", name: "X FOR MEN", brand: "CLIVE CHRISTIAN", contenance: "50ml", price: "52 €", category: "Homme Luxury" },

  // Mixte Luxury (50ml)
  { id: "101", publicRef: "DSLU-005", name: "VELVET AMBER SKIN", brand: "D&G", contenance: "50ml", price: "52 €", category: "Mixte Luxury" },
  { id: "102", publicRef: "DSLU-006", name: "VELVET AMBER SUN", brand: "D&G", contenance: "50ml", price: "52 €", category: "Mixte Luxury" },
  { id: "106", publicRef: "DSLU-007", name: "FUCKING FABULOUS", brand: "TOM FORD", contenance: "50ml", price: "52 €", category: "Mixte Luxury" },
  { id: "111", publicRef: "DSLU-008", name: "LOST CHERRY", brand: "TOM FORD", contenance: "50ml", price: "52 €", category: "Mixte Luxury" },
  { id: "112", publicRef: "DSLU-009", name: "NEROLI PORTOFINO", brand: "TOM FORD", contenance: "50ml", price: "52 €", category: "Mixte Luxury" },
  { id: "117", publicRef: "DSLU-010", name: "TOBACCO VANILLE", brand: "TOM FORD", contenance: "50ml", price: "52 €", category: "Mixte Luxury" },
  { id: "124", publicRef: "DSLU-011", name: "BACCARAT ROUGE 540", brand: "MAISON F.KURKDJIAN", contenance: "50ml", price: "52 €", category: "Mixte Luxury" },
  { id: "125", publicRef: "DSLU-012", name: "ZETA", brand: "MORPH", contenance: "50ml", price: "52 €", category: "Mixte Luxury" },
  { id: "126", publicRef: "DSLU-013", name: "SOLE DI POSITANO ACQUA", brand: "TOM FORD", contenance: "50ml", price: "52 €", category: "Mixte Luxury" },
  { id: "127", publicRef: "DSLU-014", name: "SOLEIL BLANC", brand: "TOM FORD", contenance: "50ml", price: "52 €", category: "Mixte Luxury" },
  { id: "128", publicRef: "DSLU-015", name: "OUD WOOD", brand: "TOM FORD", contenance: "50ml", price: "52 €", category: "Mixte Luxury" },
  { id: "129", publicRef: "DSLU-016", name: "VANILLE FATALE", brand: "TOM FORD", contenance: "50ml", price: "52 €", category: "Mixte Luxury" },
  { id: "130", publicRef: "DSLU-017", name: "ERBA PURA", brand: "XERJOFF", contenance: "50ml", price: "52 €", category: "Mixte Luxury" },
  { id: "137", publicRef: "DSLU-018", name: "MEGAMARE", brand: "ORTO PARISI", contenance: "50ml", price: "65 €", category: "Mixte Luxury" },
  { id: "138", publicRef: "DSLU-019", name: "BITTER PEACH", brand: "TOM FORD", contenance: "50ml", price: "52 €", category: "Mixte Luxury" },
  { id: "139", publicRef: "DSLU-020", name: "XJ 1861NAXOS", brand: "XERJOFF", contenance: "50ml", price: "52 €", category: "Mixte Luxury" },
  { id: "140", publicRef: "DSLU-021", name: "WOOD WHISPER", brand: "OJAR", contenance: "50ml", price: "52 €", category: "Mixte Luxury" },
  { id: "141", publicRef: "DSLU-022", name: "LES SABLES ROSES", brand: "LOUIS VUITTON", contenance: "50ml", price: "52 €", category: "Mixte Luxury" },
  { id: "143", publicRef: "DSLU-023", name: "TURATH", brand: "THE SPIRIT OF DUBAI", contenance: "50ml", price: "65 €", category: "Mixte Luxury" },
  { id: "144", publicRef: "DSLU-024", name: "VANILLA POWDER", brand: "MATIERE PREMIERE", contenance: "50ml", price: "52 €", category: "Mixte Luxury" },
  { id: "145", publicRef: "DSLU-025", name: "BIANCO LATTE", brand: "GIARDINI DI TOSCANA", contenance: "50ml", price: "52 €", category: "Mixte Luxury" }
];

export default function LuxurySection() {
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const { addToCart } = useCart();
  
  const categories = ['Tous', 'Femme Luxury', 'Homme Luxury', 'Mixte Luxury'];
  
  const filteredParfums = selectedCategory === 'Tous' 
    ? parfumsLuxury 
    : parfumsLuxury.filter(parfum => parfum.category === selectedCategory);

  const getCategoryColor = (category) => {
    if (category.includes('Femme')) return 'pink';
    if (category.includes('Homme')) return 'blue';
    return 'red';
  };

  const getImageFilter = (category) => {
    if (category.includes('Femme')) return 'hue-rotate(320deg) saturate(1.3) brightness(1.1)';
    if (category.includes('Homme')) return 'hue-rotate(200deg) saturate(1.2) brightness(0.9)';
    return 'hue-rotate(15deg) saturate(1.5) brightness(1.2) contrast(1.2) sepia(0.3)';
  };

  const handleAddToCart = (parfum) => {
  const product = {
    id: `luxury-${parfum.id}`,
    ref: parfum.publicRef,        // <-- Correction ici !
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
            Collection Luxury
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Notre gamme la plus exclusive, réservée aux connaisseurs les plus exigeants. 
            Des compositions rares et précieuses, élaborées avec les ingrédients les plus nobles.
          </p>
          
          <div className="flex items-center justify-center mt-8">
            <div className="h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent w-64"></div>
            <div className="mx-4 w-2 h-2 bg-red-500 rounded-full"></div>
            <div className="h-px bg-gradient-to-r from-red-500/50 via-transparent to-transparent w-64"></div>
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
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
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
                  className={`group bg-black/90 backdrop-blur-md border border-gray-700/50 rounded-2xl p-4 md:p-6 hover:border-${colorClass}-500/30 transition-all duration-500 hover:transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-${colorClass}-500/5 relative overflow-hidden`}
                  style={{
                    boxShadow: '0 4px 20px rgba(245, 158, 11, 0.02), inset 0 1px 0 rgba(245, 158, 11, 0.05)'
                  }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-${colorClass}-500/[0.02] to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000`}></div>
                  
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
                      {/* Badge Luxury */}
                      <div className="absolute -bottom-2 -left-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                        LUXURY
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
                          <p className="text-gray-400 text-xs md:text-sm mt-1">
                            Flacon {parfum.contenance} • {parfum.category}
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            Format 50ml sans 15ml offert
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
                            className={`bg-gradient-to-r from-${colorClass}-500 to-${colorClass}-600 hover:from-${colorClass}-400 hover:to-${colorClass}-500 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-${colorClass}-500/20 whitespace-nowrap relative overflow-hidden group`}
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
            boxShadow: '0 8px 32px rgba(245, 158, 11, 0.03), inset 0 1px 0 rgba(245, 158, 11, 0.08)'
          }}>
            <p className="text-sm text-gray-300 leading-relaxed">
              <strong className="text-red-400">Collection D&S Luxury - Excellence Absolue</strong><br />
              Nos parfums luxury sont les créations les plus raffinées, inspirées des plus grandes maisons de parfumerie de luxe. 
              <strong className="text-white"> Qualité exceptionnelle, prix accessible.</strong> Concentration premium pour une expérience olfactive inoubliable.
              <br /><br />
              <em className="text-xs text-gray-400">* D&S n'est affilié à aucune marque mentionnée. Les noms servent uniquement à situer les familles olfactives.</em>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}