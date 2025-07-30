import React, { createContext, useContext, useState, useEffect } from 'react';

const ContactContext = createContext();

export const ContactProvider = ({ children }) => {
  const [contactInfo, setContactInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    postalCode: '',
    city: '',
    message: ''
  });

  // Charger les informations de contact depuis sessionStorage au démarrage
  useEffect(() => {
    const savedContactInfo = sessionStorage.getItem('dsparfum-contact-info');
    if (savedContactInfo) {
      try {
        const contactData = JSON.parse(savedContactInfo);
        setContactInfo(contactData);
      } catch (error) {
        console.error('Erreur lors du chargement des informations de contact:', error);
      }
    }
  }, []);

  // Sauvegarder les informations de contact dans sessionStorage à chaque modification
  useEffect(() => {
    sessionStorage.setItem('dsparfum-contact-info', JSON.stringify(contactInfo));
  }, [contactInfo]);

  const updateContactInfo = (updates) => {
    console.log('📞 ContactContext - updateContactInfo appelé avec:', updates);
    console.log('📞 ContactContext - contactInfo avant mise à jour:', contactInfo);
    setContactInfo(prev => {
      const newState = { ...prev, ...updates };
      console.log('📞 ContactContext - nouvel état:', newState);
      return newState;
    });
  };

  const clearContactInfo = () => {
    setContactInfo({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      street: '',
      postalCode: '',
      city: '',
      message: ''
    });
    sessionStorage.removeItem('dsparfum-contact-info');
  };

  return (
    <ContactContext.Provider value={{
      contactInfo,
      setContactInfo,
      updateContactInfo,
      clearContactInfo
    }}>
      {children}
    </ContactContext.Provider>
  );
};

export const useContact = () => {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error('useContact must be used within a ContactProvider');
  }
  return context;
};
