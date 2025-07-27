
import React from 'react';

const FaqSection = () => {
  const faqs = [
    {
      question: "Les parfums tiennent-ils toute la journée ?",
      answer: "Oui, avec une concentration de 30%, nos parfums sont parmi les plus intenses du marché."
    },
    {
      question: "Est-ce que ce sont des copies ?",
      answer: "Non. Ce sont des créations indépendantes élaborées dans les mêmes laboratoires que les grandes marques."
    },
    {
      question: "Quels sont les délais de livraison ?",
      answer: "Vos commandes sont expédiées sous 24 à 48h et livrées sous 5 à 8 jours ouvrés."
    }
  ];

  return (
    <section id="faq" className="py-20 bg-white/90 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10">FAQ</h2>
        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <details key={idx} className="border rounded-lg p-4 bg-white shadow-md group">
              <summary className="cursor-pointer text-lg font-medium text-gray-800 group-open:text-amber-600">
                {faq.question}
              </summary>
              <p className="mt-2 text-gray-700">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
