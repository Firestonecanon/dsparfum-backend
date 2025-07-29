
// Composant ContactSection :
// - Récupère automatiquement le panier client (commande) via sessionStorage ou event
// - Pré-remplit le formulaire avec la commande
// - Envoie toutes les infos (client + panier) par mail
// - Affiche un encart visuel rassurant si une commande est détectée
import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { CONTACT_URL } from '../config/api.js';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '', // Ajout adresse postale facultative
    subject: '',
    message: '',
    paymentMethod: ''
  });

  // Ref pour le textarea message
  const messageRef = React.useRef(null);

  const [orderLoaded, setOrderLoaded] = useState(false);

  const paymentMethods = [
    { id: 'paypal', name: 'PayPal', icon: '💳' },
    { id: 'wero', name: 'Wero', icon: '📱' },
    { id: 'virement', name: 'Virement bancaire', icon: '🏦' },
    { id: 'carte', name: 'Carte bancaire', icon: '💳' }
  ];

  // Fonction pour charger les données de commande
  const loadOrderData = () => {
    console.log('🔍 Recherche de données de commande...');
    // Vérifier sessionStorage
    const pendingOrder = sessionStorage.getItem('dsparfum-pending-order');
    if (pendingOrder) {
      try {
        const orderData = JSON.parse(pendingOrder);
        console.log('✅ Commande trouvée dans sessionStorage:', orderData);
        setFormData(prev => {
          // Évite la double injection si déjà présent
          const alreadyInjected = prev.message && prev.message.includes(orderData.message);
          return {
            ...prev,
            subject: orderData.subject || '',
            message: alreadyInjected
              ? prev.message
              : (orderData.message + (prev.message ? '\n\n' + prev.message : ''))
          };
        });
        setOrderLoaded(true);
        // Nettoyer après utilisation
        sessionStorage.removeItem('dsparfum-pending-order');
        // Focus et scroll sur le textarea après injection (mobile UX)
        setTimeout(() => {
          if (messageRef.current) {
            messageRef.current.focus();
            messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
        return true;
      } catch (error) {
        console.error('❌ Erreur lors du parsing de la commande:', error);
      }
    }
    console.log('❌ Aucune commande trouvée');
    return false;
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadOrderData();
  }, []);

  // Écouter l'événement de nouvelle commande
  useEffect(() => {
    const handleNewOrder = (event) => {
      console.log('📨 Nouvel événement de commande reçu:', event.detail);
      const orderData = event.detail;
      if (orderData && orderData.subject && orderData.message) {
        setFormData(prev => {
          const alreadyInjected = prev.message && prev.message.includes(orderData.message);
          return {
            ...prev,
            subject: orderData.subject,
            message: alreadyInjected
              ? prev.message
              : (orderData.message + (prev.message ? '\n\n' + prev.message : ''))
          };
        });
        setOrderLoaded(true);
        // Focus et scroll sur le textarea après injection (mobile UX)
        setTimeout(() => {
          if (messageRef.current) {
            messageRef.current.focus();
            messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
        console.log('✅ Formulaire mis à jour avec la commande');
      }
    };
    window.addEventListener('newOrderReady', handleNewOrder);
    return () => {
      window.removeEventListener('newOrderReady', handleNewOrder);
    };
  }, []);

  // Vérification périodique (fallback)
  useEffect(() => {
    if (!orderLoaded) {
      const interval = setInterval(() => {
        if (loadOrderData()) {
          clearInterval(interval);
        }
      }, 500);

      // Nettoyer l'interval après 10 secondes
      setTimeout(() => {
        clearInterval(interval);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [orderLoaded]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gestion de l'état d'envoi
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setError(null);

    // Construction du message complet (avec panier injecté)
    let emailBody = `Nom: ${formData.name}\n`;
    emailBody += `Email: ${formData.email}\n`;
    emailBody += `Téléphone: ${formData.phone}\n`;
    if (formData.address) emailBody += `Adresse postale: ${formData.address}\n`;
    if (formData.paymentMethod) {
      const selectedPayment = paymentMethods.find(method => method.id === formData.paymentMethod);
      emailBody += `Mode de paiement souhaité: ${selectedPayment?.name}\n`;
    }
    emailBody += `\nMessage (panier inclus):\n${formData.message}`;

    // Paramètres EmailJS
    const serviceID = 'default_service'; // Service par défaut EmailJS (à adapter si tu en as créé un autre)
    const templateID = 'template_7jq93dw'; // Ton template ID EmailJS
    const userID = 'yT_WG-KfFJZTG-bJO'; // Clé publique EmailJS fournie

    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      phone: formData.phone,
      address: formData.address,
      subject: formData.subject || 'Contact D&S Parfum',
      payment: formData.paymentMethod,
      message: emailBody,
    };

    emailjs.send(serviceID, templateID, templateParams, userID)
      .then(async () => {
        // Envoi réussi via EmailJS
        setSending(false);
        setSent(true);
        
        // Enregistrer le contact dans la base admin
        try {
          console.log('🔄 Tentative d\'enregistrement sur:', CONTACT_URL);
          const response = await fetch(CONTACT_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              message: formData.message,
              address: formData.address,
              paymentMethod: formData.paymentMethod,
              subject: formData.subject
            }),
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('✅ Contact enregistré dans l\'admin:', result);
          } else {
            console.error('❌ Erreur HTTP:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('📝 Détails de l\'erreur:', errorText);
          }
        } catch (error) {
          console.error('❌ Erreur enregistrement contact admin:', error);
          console.error('🔗 URL utilisée:', CONTACT_URL);
          // Ne pas bloquer l'utilisateur si l'admin ne répond pas
        }
        
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          subject: '',
          message: '',
          paymentMethod: ''
        });
      })
      .catch((err) => {
        setSending(false);
        setError("Erreur lors de l'envoi. Merci de réessayer ou de nous contacter directement.");
        console.error('❌ Erreur EmailJS:', err);
      });
  };

  return (
    <section id="contact" className="py-20 relative z-10 bg-gradient-to-br from-white/90 via-yellow-50/80 to-amber-50/80">
      <div className="container mx-auto px-6 relative">
        <div className="mb-20 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-amber-700 font-serif tracking-wide drop-shadow-lg">
            Contactez-nous
          </h2>
          <div className="flex items-center justify-center mb-6">
            <div className="h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent w-48"></div>
            <div className="mx-6 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
            <div className="h-px bg-gradient-to-r from-yellow-500 via-transparent to-transparent w-48"></div>
          </div>
          <p className="text-xl text-amber-900/80 max-w-3xl mx-auto leading-relaxed">
            Une question ? Un conseil personnalisé ? Notre équipe est à votre écoute pour vous accompagner dans votre choix.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Informations de contact */}
            <div className="space-y-8">
              <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border-2 border-amber-300 shadow-lg hover:shadow-amber-200/60 hover:border-amber-400 transition-all duration-500 contact-glass">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-200 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-amber-900 font-serif">Email</h3>
                    <a href="mailto:contact@dsparfum.fr" className="text-amber-700 font-bold hover:underline">contact@dsparfum.fr</a>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border-2 border-amber-300 shadow-lg hover:shadow-amber-200/60 hover:border-amber-400 transition-all duration-500 contact-glass">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-200 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-amber-900 font-serif">Téléphone</h3>
                    <a href="tel:+33664869951" className="text-amber-700 font-bold hover:underline">06 64 86 99 51</a>
                  </div>
                </div>
              </div>

              {/* Modes de paiement */}
              <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl border border-amber-200">
                <h3 className="text-lg font-semibold text-amber-900 font-serif mb-4">Modes de paiement acceptés</h3>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center gap-2 text-amber-800">
                      <span className="text-lg">{method.icon}</span>
                      <span className="text-sm">{method.name}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-amber-100/40 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-800">
                    💳 <strong>Carte bancaire :</strong> Nous vous guiderons pour le paiement sécurisé lors de la finalisation de votre commande.
                  </p>
                </div>
              </div>

              {/* Réseaux sociaux */}
              <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl border border-amber-200">
                <h3 className="text-lg font-semibold text-amber-900 font-serif mb-4">Suivez-nous</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a 
                    href="https://www.facebook.com/profile.php?id=61577262944619" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200 hover:border-blue-300 rounded-lg transition-all duration-300 group"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-blue-800 text-sm">Facebook</div>
                      <div className="text-xs text-blue-600">Actualités & nouveautés</div>
                    </div>
                  </a>

                  <a 
                    href="https://www.instagram.com/d_s_parfum?igsh=YXQ3MG50bDJxM2sx" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-pink-50/80 hover:bg-pink-100/80 border border-pink-200 hover:border-pink-300 rounded-lg transition-all duration-300 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-pink-800 text-sm">Instagram</div>
                      <div className="text-xs text-pink-600">@d_s_parfum</div>
                    </div>
                  </a>
                </div>
                <div className="mt-3 p-2 bg-amber-50/60 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-700 text-center">
                    📱 Découvrez nos coulisses et conseils parfums
                  </p>
                </div>
              </div>

              {/* Horaires & Livraison */}
              <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl border border-amber-200">
                <h3 className="text-lg font-semibold text-amber-900 font-serif mb-4">Horaires & Livraison</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-amber-900 text-sm">Service Client</div>
                      <div className="text-xs text-amber-700">Lun-Ven : 9h-18h</div>
                      <div className="text-xs text-amber-600">Réponse sous 24h</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-amber-900 text-sm">Expédition</div>
                      <div className="text-xs text-amber-700">Sous 8-10 jours</div>
                      <div className="text-xs text-amber-600">Colissimo suivi</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-amber-900 text-sm">Support client</div>
                      <div className="text-xs text-amber-700">Service personnalisé</div>
                      <div className="text-xs text-amber-600">Conseil expert</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gradient-to-r from-amber-100/60 to-yellow-100/60 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">🚚</span>
                    <span className="text-xs font-semibold text-amber-800">Livraison gratuite dès 80€</span>
                  </div>
                  <div className="text-xs text-amber-700">
                    <span className="font-medium">Délais :</span> France métropolitaine 8-10 jours ouvrés
                  </div>
                </div>
              </div>
            </div>

            {/* Formulaire de contact */}
            <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-2xl border-2 border-amber-300 shadow-xl contact-glass">
              {/* Indicateur de commande chargée */}
              {orderLoaded && formData.subject && formData.message && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-100/80 via-emerald-50/80 to-green-200/60 border-2 border-green-400/60 rounded-xl animate-pulse shadow-lg flex flex-col md:flex-row items-center gap-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-base font-semibold">Commande détectée : votre panier est prêt à être envoyé !</span>
                  </div>
                  <div className="text-xs text-green-800 font-medium mt-1 md:mt-0 md:ml-4">
                    <span className="inline-block px-2 py-1 bg-green-200/60 rounded">Le contenu de votre panier a été automatiquement ajouté au message.</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-amber-900 mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/60 border border-amber-200 rounded-lg text-amber-900 placeholder-amber-400 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors duration-300"
                      placeholder="Votre nom"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-amber-900 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/60 border border-amber-200 rounded-lg text-amber-900 placeholder-amber-400 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors duration-300"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-amber-900 mb-2">
                    Adresse postale (facultatif)
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/60 border border-amber-200 rounded-lg text-amber-900 placeholder-amber-400 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors duration-300"
                    placeholder="Votre adresse postale (facultatif)"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-amber-900 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/60 border border-amber-200 rounded-lg text-amber-900 placeholder-amber-400 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors duration-300"
                    placeholder="Votre numéro de téléphone"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-amber-900 mb-2">
                    Sujet
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/60 border border-amber-200 rounded-lg text-amber-900 placeholder-amber-400 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors duration-300"
                    placeholder="Sujet de votre message"
                  />
                </div>

                <div>
                  <label htmlFor="paymentMethod" className="block text-sm font-medium text-amber-900 mb-2">
                    Mode de paiement souhaité
                  </label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/60 border border-amber-200 rounded-lg text-amber-900 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors duration-300"
                  >
                    <option value="">Sélectionnez un mode de paiement</option>
                    {paymentMethods.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.icon} {method.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-amber-900 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={8}
                    ref={messageRef}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/60 border border-amber-200 rounded-lg text-amber-900 placeholder-amber-400 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors duration-300 resize-none"
                    placeholder="Votre message ou votre commande..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-400 hover:from-yellow-300 hover:to-yellow-500 text-amber-900 font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl shadow-yellow-200/40 border border-amber-300/60 backdrop-blur-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={sending}
                >
                  {sending ? 'Envoi en cours...' : 'Envoyer le message'}
                </button>
                {sent && (
                  <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded text-green-800 text-center font-semibold animate-fade-in">
                    ✅ Merci, votre message a bien été envoyé ! Nous vous répondrons rapidement.
                  </div>
                )}
                {error && (
                  <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded text-red-800 text-center font-semibold animate-fade-in">
                    {error}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
        <style jsx>{`
          /* Glassmorphism premium + encart commande */
          .contact-glass {
            box-shadow: 0 8px 48px 0 #FFD70033, 0 1px 0 #fff2 inset;
            border: 2.5px solid #FFD70044;
          }
        `}</style>
      </div>
    </section>
  );
}