import { createContext, useContext, useState, useEffect } from 'react';

const ContactContext = createContext();
export const useContact = () => useContext(ContactContext);

export const ContactProvider = ({ children }) => {
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  // Charger les données sauvegardées au montage
  useEffect(() => {
    const savedData = sessionStorage.getItem('dsparfum-form-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setContactInfo(prev => ({
          ...prev,
          name: parsed.name || prev.name,
          email: parsed.email || prev.email,
          phone: parsed.phone || prev.phone,
          address: parsed.address || prev.address
        }));
      } catch (err) {
        console.error('❌ Erreur chargement données contact:', err);
      }
    }
  }, []);

  // Sauvegarder les modifications dans le sessionStorage
  useEffect(() => {
    if (contactInfo.name || contactInfo.email || contactInfo.phone || contactInfo.address) {
      sessionStorage.setItem('dsparfum-form-data', JSON.stringify(contactInfo));
    }
  }, [contactInfo]);

  return (
    <ContactContext.Provider value={{ contactInfo, setContactInfo }}>
      {children}
    </ContactContext.Provider>
  );
};
