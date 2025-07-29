import React from 'react';
import { useCart } from '../context/CartContext';
import { parfumsEnfant, parfumsCreation } from '../data/parfumsEnfantCreation';

function CollectionSection({ title, parfums, colorScheme, description, category }) {
  const { addToCart } = useCart();

  const handleAddToCart = (parfum) => {
    const product = {
      id: `${category.toLowerCase()}-${parfum.ref}`,
      ref: parfum.publicRef,
      publicRef: parfum.publicRef,
      name: parfum.name,
      brand: parfum.brand,
      price: parfum.price,
      contenance: parfum.contenance,
      category: category
    };
    addToCart(product);
  };

  return (
    <section className="py-20 relative overflow-hidden min-h-screen">
      {/* Background unifié avec nouvelle image marbre noir profond */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://raw.githubusercontent.com/Firestonecanon/dsparfum-images/main/ChatGPT%20Image%2028%20juin%202025%2C%2002_53_06.png')`,
            backgroundAttachment: 'fixed',
            filter: 'contrast(1.4) brightness(0.7) saturate(0.8)'
          }}
        ></div>
        <div className="absolute inset-0 bg-black/75"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 text-white font-serif tracking-wide`}>
            {title}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>
          <div className="flex items-center justify-center mt-8">
            <div className={`h-px bg-gradient-to-r from-transparent ${colorScheme.lineColor} to-transparent w-64`}></div>
            <div className={`mx-4 w-2 h-2 ${colorScheme.dotColor} rounded-full`}></div>
            <div className={`h-px bg-gradient-to-r ${colorScheme.lineColor} via-transparent to-transparent w-64`}></div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid gap-4 md:gap-6">
            {parfums.map((parfum) => (
              <div
                key={parfum.id}
                className={`group bg-black/90 backdrop-blur-md border border-gray-700/50 rounded-2xl p-4 md:p-6 hover:border-${colorScheme.hoverBorder} transition-all duration-500 hover:transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-${colorScheme.shadow} relative overflow-hidden`}
                style={{
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(245, 158, 11, 0.08)'
                }}
              >
                <div className={`absolute inset-0 bg-gradient-to-r from-transparent ${colorScheme.hoverOverlay} to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000`}></div>
                <div className="flex items-center gap-4 md:gap-6 relative z-10">
                  <div className="flex-shrink-0 relative">
                    <div className="w-16 h-20 md:w-18 md:h-24 rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-300 shadow-lg">
                      <img
                        src="https://raw.githubusercontent.com/Firestonecanon/dsparfum-images/main/ChatGPT%20Image%2025%20juin%202025%2C%2017_14_18.png"
                        alt={`Flacon D&S ${parfum.name}`}
                        className="w-full h-full object-cover rounded-xl"
                        style={{ filter: colorScheme.imageFilter }}
                      />
                    </div>
                    <div className={`absolute -top-1 -right-1 ${colorScheme.refBg} text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-lg border ${colorScheme.refBorder}`}>
                      {parfum.publicRef}
                    </div>
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className={`text-lg md:text-xl font-bold text-white mb-1 truncate group-hover:${colorScheme.titleHover} transition-colors duration-300`}>
                          {parfum.name}
                        </h3>
                        <p className={`${colorScheme.brandColor} text-sm md:text-base font-medium`}>
                          {parfum.brand}
                        </p>
                        <p className="text-gray-400 text-xs md:text-sm mt-1">
                          Flacon {parfum.contenance}
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
                          className={`${colorScheme.buttonBg} hover:${colorScheme.buttonHover} text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:${colorScheme.buttonShadow} whitespace-nowrap relative overflow-hidden group`}
                        >
                          <span className="relative z-10">Commander</span>
                          <div className={`absolute inset-0 ${colorScheme.buttonOverlay} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-black/90 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 max-w-4xl mx-auto shadow-2xl" style={{
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(245, 158, 11, 0.12)'
          }}>
            <p className="text-sm text-gray-300 leading-relaxed">
              <strong className={colorScheme.noteTitle}>{title} - Qualité Premium D&S</strong><br />
              Nos parfums sont inspirés de grandes marques, élaborés à partir des mêmes essences et fabriqués dans les mêmes laboratoires.
              <strong className="text-white"> Résultat : même qualité, meilleur prix.</strong> Concentration adaptée pour une tenue exceptionnelle.
              <br /><br />
              <em className="text-xs text-gray-400">* D&S n'est affilié à aucune marque mentionnée. Les noms servent uniquement à situer les familles olfactives.</em>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function EnfantSection() {
  const colorScheme = {
    lineColor: 'via-orange-500/50',
    dotColor: 'bg-orange-500',
    hoverBorder: 'orange-500/30',
    shadow: 'orange-500/5',
    hoverOverlay: 'via-orange-500/[0.02]',
    imageFilter: 'hue-rotate(30deg) saturate(1.4) brightness(1.2)',
    refBg: 'bg-gradient-to-r from-orange-500 to-orange-600',
    refBorder: 'border-orange-400',
    titleHover: 'text-orange-300',
    brandColor: 'text-orange-300',
    buttonBg: 'bg-gradient-to-r from-orange-500 to-orange-600',
    buttonHover: 'hover:from-orange-400 hover:to-orange-500',
    buttonShadow: 'shadow-orange-500/20',
    buttonOverlay: 'bg-gradient-to-r from-orange-400 to-orange-500',
    noteTitle: 'text-orange-400'
  };

  return (
    <CollectionSection
      title="Collection Enfants"
      parfums={parfumsEnfant}
      colorScheme={colorScheme}
      category="Enfant"
      description="Des parfums spécialement conçus pour les plus jeunes, avec des formulations douces et des senteurs ludiques qui éveillent les sens sans les agresser."
    />
  );
}

export function CreationSection() {
  const colorScheme = {
    lineColor: 'via-purple-500/50',
    dotColor: 'bg-purple-500',
    hoverBorder: 'purple-500/30',
    shadow: 'purple-500/5',
    hoverOverlay: 'via-purple-500/[0.02]',
    imageFilter: 'hue-rotate(270deg) saturate(1.2) brightness(0.95)',
    refBg: 'bg-gradient-to-r from-purple-500 to-purple-600',
    refBorder: 'border-purple-400',
    titleHover: 'text-purple-300',
    brandColor: 'text-purple-300',
    buttonBg: 'bg-gradient-to-r from-purple-500 to-purple-600',
    buttonHover: 'hover:from-purple-400 hover:to-purple-500',
    buttonShadow: 'shadow-purple-500/20',
    buttonOverlay: 'bg-gradient-to-r from-purple-400 to-purple-500',
    noteTitle: 'text-purple-400'
  };

  return (
    <CollectionSection
      title="Collection Création"
      parfums={parfumsCreation}
      colorScheme={colorScheme}
      category="Création"
      description="Créez votre parfum unique avec nos maîtres parfumeurs. Une expérience personnalisée pour une fragrance qui vous ressemble parfaitement."
    />
  );
}