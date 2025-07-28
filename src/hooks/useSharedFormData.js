import { useState, useEffect } from 'react';

export const useSharedFormData = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    subject: '',
    message: '',
    paymentMethod: ''
  });

  // Charger les données depuis sessionStorage au montage
  useEffect(() => {
    const savedData = sessionStorage.getItem('dsparfum-form-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({
          ...prev,
          ...parsed
        }));
      } catch (err) {
        console.error('Erreur lors du chargement des données du formulaire:', err);
      }
    }
  }, []);

  // Sauvegarder les données dans sessionStorage à chaque changement
  const updateFormData = (newData) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        ...newData
      };
      // Sauvegarder dans sessionStorage
      sessionStorage.setItem('dsparfum-form-data', JSON.stringify(updated));
      return updated;
    });
  };

  // Émettre l'événement lorsque formData change
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('formDataUpdated', { 
      detail: formData 
    }));
  }, [formData]);

  return {
    formData,
    updateFormData
  };
};
