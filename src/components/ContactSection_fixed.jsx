import React, { useState, useEffect, useRef } from 'react';
import emailjs from 'emailjs-com';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    subject: '',
    message: '',
    paymentMethod: ''
  });
  const [orderLoaded, setOrderLoaded] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const messageRef = useRef(null);
  
  const serviceID = 'default_service';
  const templateID = 'template_7jq93dw';
  const userID = 'yT_WG-KfFJZTG-bJO';

  const paymentMethods = [
    { id: 'paypal', name: 'PayPal', icon: '💳' },
    { id: 'wero', name: 'Wero', icon: '📱' },
    { id: 'virement', name: 'Virement bancaire', icon: '🏦' },
    { id: 'carte', name: 'Carte bancaire', icon: '💳' }
  ];

  useEffect(() => {
    const updateContactFields = (event) => {
      try {
        const data = event.detail;
        setFormData(prev => ({
          ...prev,
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || ''
        }));
        setOrderLoaded(true);
      } catch (err) {
        console.error('Erreur lors de la mise à jour des champs:', err);
      }
    };

    // Écouter l'événement de mise à jour des coordonnées
    window.addEventListener('contactInfoUpdated', updateContactFields);

    // Charger les données existantes depuis sessionStorage
    try {
      const savedOrder = sessionStorage.getItem('dsparfum-pending-order');
      if (savedOrder) {
        const data = JSON.parse(savedOrder);
        setFormData(prev => ({
          ...prev,
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || ''
        }));
        setOrderLoaded(true);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
    }

    return () => {
      window.removeEventListener('contactInfoUpdated', updateContactFields);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError(null);

    // Construire le corps de l'email
    let emailBody = formData.message + '\n\n';

    // Ajouter les détails de la commande si présents
    try {
      const savedOrder = sessionStorage.getItem('dsparfum-pending-order');
      if (savedOrder) {
        const orderDetails = JSON.parse(savedOrder);
        emailBody += '=== Détails de la commande ===\n';
        if (orderDetails.items) {
          emailBody += '\nArticles commandés:\n';
          orderDetails.items.forEach(item => {
            emailBody += `- ${item.name} (${item.quantity})\n`;
          });
        }
        if (orderDetails.total) {
          emailBody += `\nTotal: ${orderDetails.total}\n`;
        }
      }
    } catch (err) {
      console.error('Erreur lors de la lecture des détails de commande:', err);
    }

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
      .then(() => {
        setSending(false);
        setSent(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          subject: '',
          message: '',
          paymentMethod: ''
        });
      
        sessionStorage.removeItem('dsparfum-pending-order');
      })
      .catch((err) => {
        setSending(false);
        setError("Erreur lors de l'envoi. Merci de réessayer ou de nous contacter directement.");
      });
  };

  return (
    <section id="contact" className="py-20 relative z-10 bg-gradient-to-br from-white/90 via-yellow-50/80 to-amber-50/80">
      <div className="container mx-auto px-6 relative">
        <div className="mb-20 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-amber-700 font-serif tracking-wide drop-shadow-lg">
            Contactez-nous
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Une question sur nos produits ? Un conseil personnalisé ?
            N'hésitez pas à nous contacter, nous vous répondrons dans les plus brefs délais.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Colonne d'informations */}
            <div className="space-y-8">
              {/* Coordonnées */}
              <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-2xl border-2 border-amber-300 shadow-xl contact-glass">
                <h3 className="text-2xl font-bold text-amber-700 mb-6 font-serif">Nos coordonnées</h3>
                <div className="space-y-4">
                  <p className="flex items-center gap-3 text-gray-600">
                    <span className="text-xl">📍</span>
                    <span>12 rue de la Parfumerie<br />75001 Paris, France</span>
                  </p>
                  <p className="flex items-center gap-3 text-gray-600">
                    <span className="text-xl">📧</span>
                    <a href="mailto:contact@dsparfum.fr" className="hover:text-amber-600 transition-colors">
                      contact@dsparfum.fr
                    </a>
                  </p>
                  <p className="flex items-center gap-3 text-gray-600">
                    <span className="text-xl">📱</span>
                    <a href="tel:+33123456789" className="hover:text-amber-600 transition-colors">
                      01 23 45 67 89
                    </a>
                  </p>
                </div>
              </div>

              {/* Moyens de paiement */}
              <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-2xl border-2 border-amber-300 shadow-xl contact-glass">
                <h3 className="text-2xl font-bold text-amber-700 mb-6 font-serif">Moyens de paiement</h3>
                <div className="grid grid-cols-2 gap-4">
                  {paymentMethods.map(method => (
                    <div key={method.id} className="flex items-center gap-2 text-gray-600">
                      <span className="text-xl">{method.icon}</span>
                      <span>{method.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Horaires */}
              <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-2xl border-2 border-amber-300 shadow-xl contact-glass">
                <h3 className="text-2xl font-bold text-amber-700 mb-6 font-serif">Nos horaires</h3>
                <div className="space-y-2 text-gray-600">
                  <p className="flex justify-between">
                    <span>Lundi - Vendredi:</span>
                    <span>9h - 18h</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Samedi:</span>
                    <span>10h - 17h</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Dimanche:</span>
                    <span>Fermé</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Formulaire de contact */}
            <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-2xl border-2 border-amber-300 shadow-xl contact-glass">
              {/* Indicateur de commande chargée */}
              {orderLoaded && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 flex items-center gap-2">
                    <span className="text-xl">✅</span>
                    Vos coordonnées ont été pré-remplies depuis votre commande
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nom */}
                <div>
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Votre nom"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="votre@email.com"
                  />
                </div>

                {/* Téléphone */}
                <div>
                  <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Votre numéro de téléphone"
                  />
                </div>

                {/* Adresse */}
                <div>
                  <label htmlFor="address" className="block text-gray-700 font-medium mb-2">
                    Adresse
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Votre adresse complète"
                    rows="2"
                  />
                </div>

                {/* Sujet */}
                <div>
                  <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">
                    Sujet *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Sujet de votre message"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    ref={messageRef}
                    value={formData.message}
                    onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Votre message"
                    rows="4"
                  />
                </div>

                {/* Moyen de paiement préféré */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Moyen de paiement préféré
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {paymentMethods.map(method => (
                      <label
                        key={method.id}
                        className={`
                          flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all
                          ${formData.paymentMethod === method.id
                            ? 'bg-amber-50 border-amber-300 text-amber-700'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={formData.paymentMethod === method.id}
                          onChange={e => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                          className="hidden"
                        />
                        <span className="text-xl">{method.icon}</span>
                        <span>{method.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Messages d'état */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 flex items-center gap-2">
                      <span className="text-xl">❌</span>
                      {error}
                    </p>
                  </div>
                )}

                {sent && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 flex items-center gap-2">
                      <span className="text-xl">✅</span>
                      Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.
                    </p>
                  </div>
                )}

                {/* Bouton d'envoi */}
                <button
                  type="submit"
                  disabled={sending}
                  className={`
                    w-full py-3 px-6 text-white font-semibold rounded-lg shadow-md
                    focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-75
                    transition-all duration-300 transform hover:scale-[1.02]
                    ${sending
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800'
                    }
                  `}
                >
                  {sending ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Envoi en cours...
                    </span>
                  ) : 'Envoyer le message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
