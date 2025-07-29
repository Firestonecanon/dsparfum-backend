import React from 'react';
import { useCart } from '../context/CartContext';
import { etuis } from '../data/etuis';

export default function EtuisSection() {
  const { addToCart } = useCart();

  const handleAddToCart = (etui) => {
  const product = {
    id: `etui-${etui.ref}`,
    ref: etui.publicRef,        
    publicRef: etui.publicRef,
    name: etui.name,
    brand: etui.brand,
    price: etui.price,
    contenance: etui.contenance,
    category: 'Étuis'
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
            Collection Étuis
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Protégez et transportez vos parfums 15ml avec style. 
            Des étuis élégants et pratiques, réutilisables pour toutes vos recharges.
          </p>
          
          <div className="flex items-center justify-center mt-8">
            <div className="h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent w-64"></div>
            <div className="mx-4 w-2 h-2 bg-teal-500 rounded-full"></div>
            <div className="h-px bg-gradient-to-r from-teal-500/50 via-transparent to-transparent w-64"></div>
          </div>
        </div>

        {/* Image de présentation générale */}
        <div className="mb-12 text-center">
          <div className="max-w-4xl mx-auto bg-black/90 backdrop-blur-md border border-teal-500/30 rounded-2xl p-6 overflow-hidden">
            <h3 className="text-2xl font-bold text-white mb-4 font-serif">Nos Modèles Disponibles</h3>
            <div className="grid grid-cols-2 gap-4">
              <img 
                src="/images/Resized_IMG_20250622_123102_173001.jpg" 
                alt="Étuis de poche D&S - Vue 1" 
                className="w-full h-48 object-cover rounded-xl shadow-lg"
                loading="lazy"
              />
              <img 
                src="/images/Render_Cover.webp" 
                alt="Étuis de poche D&S - Vue 2" 
                className="w-full h-48 object-cover rounded-xl shadow-lg"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Informations importantes */}
        <div className="bg-black/90 backdrop-blur-md border border-teal-500/30 rounded-2xl p-6 max-w-4xl mx-auto mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl">💡</span>
            </div>
            <h3 className="text-xl font-bold text-white font-serif">Pourquoi choisir un étui ?</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-teal-900/20 border border-teal-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🛡️</span>
                <span className="font-semibold text-teal-300">Protection</span>
              </div>
              <p className="text-gray-300">Protège votre flacon 15ml des chocs et rayures</p>
            </div>
            
            <div className="bg-teal-900/20 border border-teal-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">👜</span>
                <span className="font-semibold text-teal-300">Transport</span>
              </div>
              <p className="text-gray-300">Facilite le transport dans votre sac ou poche</p>
            </div>
            
            <div className="bg-teal-900/20 border border-teal-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">♻️</span>
                <span className="font-semibold text-teal-300">Réutilisable</span>
              </div>
              <p className="text-gray-300">Compatible avec toutes vos recharges 15ml</p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid gap-4 md:gap-6">
            {etuis.map((etui, index) => (
              <div 
                key={etui.id}
                className="group bg-black/90 backdrop-blur-md border border-gray-700/50 rounded-2xl p-4 md:p-6 hover:border-teal-500/40 transition-all duration-500 hover:transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-teal-500/10 relative overflow-hidden"
                style={{
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(245, 158, 11, 0.08)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-500/[0.05] to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                <div className="flex items-center gap-4 md:gap-6 relative z-10">
                  {/* Image réelle de l'étui - TAILLE RÉDUITE */}
                  <div className="flex-shrink-0 relative">
                    <div className="w-16 h-20 md:w-18 md:h-24 rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-300 shadow-lg bg-gray-800">
                      <img 
                        src={etui.image}
                        alt={`Étui D&S ${etui.ref} - ${etui.name}`}
                        className="w-full h-full object-cover rounded-xl"
                        loading="lazy"
                        onError={(e) => {
                          console.log(`Erreur de chargement pour ${etui.image}`);
                          // Fallback vers un placeholder coloré
                          e.target.style.display = 'none';
                          const placeholder = e.target.parentNode.querySelector('.fallback-placeholder');
                          if (placeholder) {
                            placeholder.style.display = 'flex';
                          }
                        }}
                      />
                      {/* Fallback placeholder */}
                      <div className="fallback-placeholder w-full h-full bg-gradient-to-br from-teal-600 to-teal-800 rounded-xl flex items-center justify-center absolute inset-0" style={{display: 'none'}}>
                        <div className="text-center relative z-10">
                          <div className="text-2xl mb-1">📱</div>
                          <div className="text-xs text-white font-bold">{etui.publicRef}</div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-lg border border-teal-400">
                      {etui.publicRef}
                    </div>
                  </div>

                  {/* Informations de l'étui */}
                  <div className="flex-grow min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-lg md:text-xl font-bold text-white mb-1 truncate group-hover:text-teal-300 transition-colors duration-300">
                          {etui.name}
                        </h3>
                        <p className="text-teal-300 text-sm md:text-base font-medium">
                          {etui.brand}
                        </p>
                        <p className="text-gray-400 text-xs md:text-sm mt-1">
                          {etui.pattern}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="bg-teal-900/30 border border-teal-500/30 rounded-full px-3 py-1">
                            <p className="text-teal-200 text-xs font-medium">
                              👜 Étui pour flacon {etui.contenance}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-400 text-xs mt-1">
                          ✨ Réutilisable pour toutes vos recharges 15ml
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="text-right">
                          <div className="text-xl md:text-2xl font-bold text-white">
                            {etui.price}
                          </div>
                          <div className="text-xs text-gray-400">
                            Prix unique
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => handleAddToCart(etui)}
                          className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-teal-500/30 whitespace-nowrap relative overflow-hidden group"
                        >
                          <span className="relative z-10">Commander</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
              <strong className="text-teal-400">Collection D&S Étuis - Praticité & Style</strong><br />
              Nos étuis 15ml sont conçus pour protéger et transporter vos parfums de poche en toute sécurité. 
              <strong className="text-white"> Design élégant, protection optimale.</strong> Réutilisables à l'infini pour toutes vos recharges D&S.
              <br /><br />
              <em className="text-xs text-gray-400">💡 Conseil : Un étui est fortement recommandé pour éviter les fuites et protéger votre flacon 15ml lors du transport.</em>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}