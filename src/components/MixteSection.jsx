import React from 'react';
import { useCart } from '../context/CartContext';
import { parfumsMixte } from '../data/parfumsMixte';

export default function MixteSection() {
  const { addToCart } = useCart();

  const handleAddToCart = (parfum) => {
  const product = {
    id: `mixte-${parfum.ref}`,
    ref: parfum.publicRef,       
    publicRef: parfum.publicRef,
    name: parfum.name,
    brand: parfum.brand,
    price: parfum.price,
    contenance: '70ml',
    category: 'Mixte'
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
            Collection Mixte
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Des fragrances unisexes sophistiquées qui transcendent les genres. 
            Pour ceux qui osent l'originalité et l'élégance sans compromis.
          </p>
          
          <div className="flex items-center justify-center mt-8">
            <div className="h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent w-64"></div>
            <div className="mx-4 w-2 h-2 bg-violet-500 rounded-full"></div>
            <div className="h-px bg-gradient-to-r from-violet-500/50 via-transparent to-transparent w-64"></div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid gap-4 md:gap-6">
            {parfumsMixte.map((parfum, index) => (
              <div 
                key={parfum.id}
                className="group bg-black/90 backdrop-blur-md border border-gray-700/50 rounded-2xl p-4 md:p-6 hover:border-violet-500/40 transition-all duration-500 hover:transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-violet-500/10 relative overflow-hidden"
                style={{
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(245, 158, 11, 0.08)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/[0.05] to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                <div className="flex items-center gap-4 md:gap-6 relative z-10">
                  {/* Image du flacon - TAILLE RÉDUITE */}
                  <div className="flex-shrink-0 relative">
                    <div className="w-16 h-20 md:w-18 md:h-24 rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-300 shadow-lg">
                      <img 
                        src="https://raw.githubusercontent.com/Firestonecanon/dsparfum-images/main/ChatGPT%20Image%2025%20juin%202025%2C%2017_14_18.png" 
                        alt={`Flacon D&S ${parfum.name}`}
                        className="w-full h-full object-cover rounded-xl"
                        style={{ filter: 'hue-rotate(270deg) saturate(1.1) brightness(1.0)' }}
                      />
                    </div>
                    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-violet-500 to-violet-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-lg border border-violet-400">
                      {parfum.publicRef}
                    </div>
                  </div>

                  {/* Informations du parfum */}
                  <div className="flex-grow min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-lg md:text-xl font-bold text-white mb-1 truncate group-hover:text-violet-300 transition-colors duration-300">
                          {parfum.name}
                        </h3>
                        <p className="text-violet-300 text-sm md:text-base font-medium">
                          {parfum.brand}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="bg-violet-900/30 border border-violet-500/30 rounded-full px-3 py-1">
                            <p className="text-violet-200 text-xs font-medium">
                              🧴 70 ml + 15 ml offert (sans étui)
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
                          className="bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-violet-500/30 whitespace-nowrap relative overflow-hidden group"
                        >
                          <span className="relative z-10">Commander</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Note en bas */}
        <div className="mt-16 text-center">
          <div className="bg-black/90 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 max-w-4xl mx-auto shadow-2xl" style={{
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(245, 158, 11, 0.12)'
          }}>
            <p className="text-sm text-gray-300 leading-relaxed">
              <strong className="text-violet-400">Collection D&S Parfums Mixtes - Élégance Unisexe</strong><br />
              Nos parfums mixtes sont inspirés de grandes marques, élaborés à partir des mêmes essences et fabriqués dans les mêmes laboratoires. 
              <strong className="text-white"> Résultat : même qualité, meilleur prix.</strong> Concentration 30% d'essence de parfum pour une tenue exceptionnelle.
              <br /><br />
              <em className="text-xs text-gray-400">* D&S n'est affilié à aucune marque mentionnée. Les noms servent uniquement à situer les familles olfactives.</em>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}