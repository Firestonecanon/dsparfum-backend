import React, { useState } from 'react';

function App() {
  const [activeCollection, setActiveCollection] = useState('homme');

  return (
    <div className="min-h-screen text-gray-900 relative overflow-x-hidden">
      {/* Header avec navigation */}
      <header className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-sm z-50 shadow-lg border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="text-2xl font-bold text-amber-800">
              DS Parfum
            </div>
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveCollection('homme')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeCollection === 'homme'
                    ? 'bg-amber-600 text-white shadow-lg'
                    : 'text-amber-800 hover:bg-amber-100'
                }`}
              >
                Homme
              </button>
              <button
                onClick={() => setActiveCollection('femme')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeCollection === 'femme'
                    ? 'bg-amber-600 text-white shadow-lg'
                    : 'text-amber-800 hover:bg-amber-100'
                }`}
              >
                Femme
              </button>
              <button
                onClick={() => setActiveCollection('mixte')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeCollection === 'mixte'
                    ? 'bg-amber-600 text-white shadow-lg'
                    : 'text-amber-800 hover:bg-amber-100'
                }`}
              >
                Mixte
              </button>
              <button
                onClick={() => setActiveCollection('luxe')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeCollection === 'luxe'
                    ? 'bg-amber-600 text-white shadow-lg'
                    : 'text-amber-800 hover:bg-amber-100'
                }`}
              >
                Luxe
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Corps principal avec marge pour le header */}
      <main className="pt-20">
        {/* Section Hero */}
        <section className="relative bg-gradient-to-br from-amber-50 via-white to-amber-100 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Découvrez l'Art du <span className="text-amber-600">Parfum</span>
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
              Une collection exclusive de parfums premium inspirés des plus grandes fragrances mondiales.
            </p>
          </div>
        </section>

        {/* Collections */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Collection {activeCollection.charAt(0).toUpperCase() + activeCollection.slice(1)}
            </h2>
            <p className="text-lg text-gray-600 mb-12">
              {activeCollection === 'homme' && 'Parfums masculins sophistiqués et élégants'}
              {activeCollection === 'femme' && 'Fragrances féminines raffinées et sensuelles'}
              {activeCollection === 'mixte' && 'Parfums unisexes modernes et polyvalents'}
              {activeCollection === 'luxe' && 'Collections prestige haute qualité'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Placeholder pour les parfums */}
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-amber-100 to-amber-200"></div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Parfum {activeCollection} {item}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Description du parfum {item} de la collection {activeCollection}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-amber-600">29€</span>
                      <button className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors">
                        Ajouter au panier
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section Contact */}
        <section className="bg-amber-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Contactez-nous
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Une question ? Besoin d'aide ? Notre équipe est là pour vous.
              </p>
              <button className="bg-amber-600 text-white px-8 py-3 rounded-lg hover:bg-amber-700 transition-colors text-lg">
                Nous contacter
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
