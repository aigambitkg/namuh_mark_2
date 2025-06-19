import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQ = React.memo(() => {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Was sind KI-Tokens?',
      answer: 'Tokens sind Ihre Währung für KI-gestützte Features. Jede KI-Anwendung verbraucht 1 Token. Sie erhalten monatlich neue Tokens basierend auf Ihrem Plan.'
    },
    {
      question: 'Kann ich meinen Plan jederzeit ändern?',
      answer: 'Ja, Sie können jederzeit upgraden oder downgraden. Änderungen werden zum nächsten Abrechnungszyklus wirksam.'
    },
    {
      question: 'Gibt es eine kostenlose Testphase?',
      answer: 'Alle Pläne starten mit kostenlosen Features. Sie können die Plattform ausgiebig testen, bevor Sie sich für einen kostenpflichtigen Plan entscheiden.'
    },
    {
      question: 'Wie funktioniert die Abrechnung?',
      answer: 'Die Abrechnung erfolgt monatlich. Sie können jederzeit kündigen und zahlen nur für den aktuellen Monat.'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mt-20"
    >
      <h2 className="text-3xl font-bold text-namuh-navy text-center mb-12">
        Häufig gestellte Fragen
      </h2>
      
      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card"
          >
            <button
              onClick={() => setOpenQuestion(openQuestion === index ? null : index)}
              className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-namuh-navy">{faq.question}</h3>
              {openQuestion === index ? (
                <ChevronUp className="h-5 w-5 text-namuh-teal" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>
            
            <AnimatePresence>
              {openQuestion === index && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
});

export default FAQ;