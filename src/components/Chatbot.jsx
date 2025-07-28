
import React, { useState } from 'react';

const Chatbot = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(!open)} style={styles.button}>
        {open ? "Fermer l’aide" : "Besoin d’aide ?"}
      </button>
      {open && (
        <div style={styles.chatbox}>
          <h4>Assistant DNS</h4>
          <p>Une question ?</p>
          <ul>
            <li><strong>Q:</strong> Livraison ?<br /><strong>R:</strong> 5 à 8 jours ouvrés.</li>
            <li><strong>Q:</strong> Senteurs ?<br /><strong>R:</strong> Inspirées des grandes marques.</li>
          </ul>
        </div>
      )}
    </>
  );
};

const styles = {
  button: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    backgroundColor: '#f4c430',
    color: '#111',
    border: 'none',
    borderRadius: '20px',
    padding: '12px 20px',
    fontWeight: 'bold',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    zIndex: 1000
  },
  chatbox: {
    position: 'fixed',
    bottom: '70px',
    right: '20px',
    width: '300px',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '10px',
    padding: '15px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    zIndex: 999
  }
};

export default Chatbot;
