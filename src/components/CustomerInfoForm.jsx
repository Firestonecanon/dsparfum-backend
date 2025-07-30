import React, { useState, useEffect } from 'react';
import { useContact } from '../context/ContactContext';

export default function CustomerInfoForm({ 
  onSubmit, 
  submitButtonText = "Envoyer", 
  title = "Vos informations",
  messageLabel = "Message (optionnel)"
}) {
  const { contactInfo, updateContactInfo } = useContact();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    postalCode: '',
    city: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchroniser avec le contexte
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      firstName: contactInfo.firstName || prev.firstName,
      lastName: contactInfo.lastName || prev.lastName,
      email: contactInfo.email || prev.email,
      phone: contactInfo.phone || prev.phone,
      street: contactInfo.street || prev.street,
      postalCode: contactInfo.postalCode || prev.postalCode,
      city: contactInfo.city || prev.city,
      message: contactInfo.message || prev.message
    }));
  }, [contactInfo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Formatage spécial pour les champs numériques
    let formattedValue = value;
    
    if (name === 'phone') {
      // Garder seulement les chiffres et espaces pour le téléphone
      formattedValue = value.replace(/[^\d\s]/g, '');
      // Limiter à 14 caractères (10 chiffres + 4 espaces max)
      if (formattedValue.replace(/\s/g, '').length > 10) {
        formattedValue = formattedValue.substring(0, 14);
      }
    } else if (name === 'postalCode') {
      // Garder seulement les chiffres pour le code postal
      formattedValue = value.replace(/\D/g, '');
      // Limiter à 5 chiffres
      if (formattedValue.length > 5) {
        formattedValue = formattedValue.substring(0, 5);
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    
    // Mettre à jour le contexte immédiatement
    updateContactInfo({ [name]: formattedValue });
    
    // Supprimer l'erreur de ce champ si elle existe
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'Le prénom est obligatoire';
    if (!formData.lastName.trim()) newErrors.lastName = 'Le nom est obligatoire';
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est obligatoire';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    // Validation téléphone : exactement 10 chiffres
    if (!formData.phone.trim()) {
      newErrors.phone = 'Le téléphone est obligatoire';
    } else {
      const phoneDigits = formData.phone.replace(/\D/g, ''); // Enlever tout sauf les chiffres
      if (phoneDigits.length !== 10) {
        newErrors.phone = 'Le téléphone doit contenir exactement 10 chiffres';
      }
    }
    
    if (!formData.street.trim()) newErrors.street = 'L\'adresse est obligatoire';
    
    // Validation code postal : exactement 5 chiffres
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Le code postal est obligatoire';
    } else if (!/^\d{5}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Le code postal doit contenir exactement 5 chiffres';
    }
    
    if (!formData.city.trim()) newErrors.city = 'La ville est obligatoire';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Mettre à jour le contexte avec toutes les données
      updateContactInfo(formData);
      
      // Appeler la fonction de soumission parent si fournie
      if (onSubmit) {
        await onSubmit(formData);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-2xl border-2 border-amber-300 shadow-xl">
      <h3 className="text-2xl font-bold text-amber-900 mb-6 text-center">{title}</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nom et Prénom */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-amber-900 mb-2">
              Prénom *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-white/60 border rounded-lg text-amber-900 placeholder-amber-400 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors duration-300 ${errors.firstName ? 'border-red-500' : 'border-amber-200'}`}
              placeholder="Votre prénom"
            />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
          </div>
          
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-amber-900 mb-2">
              Nom *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-white/60 border rounded-lg text-amber-900 placeholder-amber-400 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors duration-300 ${errors.lastName ? 'border-red-500' : 'border-amber-200'}`}
              placeholder="Votre nom"
            />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
          </div>
        </div>

        {/* Email et Téléphone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              className={`w-full px-4 py-3 bg-white/60 border rounded-lg text-amber-900 placeholder-amber-400 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors duration-300 ${errors.email ? 'border-red-500' : 'border-amber-200'}`}
              placeholder="votre@email.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-amber-900 mb-2">
              Téléphone * <span className="text-xs text-amber-600">(10 chiffres)</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-white/60 border rounded-lg text-amber-900 placeholder-amber-400 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors duration-300 ${errors.phone ? 'border-red-500' : 'border-amber-200'}`}
              placeholder="06 12 34 56 78"
              pattern="[0-9\s]*"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>
        </div>

        {/* Adresse */}
        <div>
          <label htmlFor="street" className="block text-sm font-medium text-amber-900 mb-2">
            Adresse *
          </label>
          <input
            type="text"
            id="street"
            name="street"
            required
            value={formData.street}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 bg-white/60 border rounded-lg text-amber-900 placeholder-amber-400 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors duration-300 ${errors.street ? 'border-red-500' : 'border-amber-200'}`}
            placeholder="123 rue de la Paix"
          />
          {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
        </div>

        {/* Code postal et Ville */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-amber-900 mb-2">
              Code postal *
            </label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              required
              value={formData.postalCode}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-white/60 border rounded-lg text-amber-900 placeholder-amber-400 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors duration-300 ${errors.postalCode ? 'border-red-500' : 'border-amber-200'}`}
              placeholder="75001"
              maxLength={5}
              pattern="[0-9]*"
            />
            {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="city" className="block text-sm font-medium text-amber-900 mb-2">
              Ville *
            </label>
            <input
              type="text"
              id="city"
              name="city"
              required
              value={formData.city}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-white/60 border rounded-lg text-amber-900 placeholder-amber-400 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors duration-300 ${errors.city ? 'border-red-500' : 'border-amber-200'}`}
              placeholder="Paris"
            />
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-amber-900 mb-2">
            {messageLabel}
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-white/60 border border-amber-200 rounded-lg text-amber-900 placeholder-amber-400 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors duration-300 resize-none"
            placeholder="Votre message..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-400 hover:from-yellow-300 hover:to-yellow-500 text-amber-900 font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl shadow-yellow-200/40 border border-amber-300/60 backdrop-blur-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Envoi en cours...' : submitButtonText}
        </button>
      </form>
    </div>
  );
}
