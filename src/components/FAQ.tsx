import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Plus, Minus, HelpCircle } from 'lucide-react';
import { FAQS } from '../types';

export default function FAQ() {
  const [openId, setOpenId] = useState<string | null>('faq1'); // Keep first open by default

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-24 bg-white relative overflow-hidden z-10 border-b border-brand-border/30">
      {/* Abstract circles */}
      <div className="absolute top-[20%] right-[-12%] w-[35%] h-[35%] rounded-full bg-brand-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-12%] w-[35%] h-[35%] rounded-full bg-brand-secondary/5 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] font-mono tracking-widest text-brand-secondary uppercase mb-2 block">
            KNOWLEDGE BASE
          </span>
          <h2 className="font-display text-3xl sm:text-4.5xl font-extrabold tracking-tight text-brand-primary-text leading-[1.1] mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-lg text-brand-secondary-text">
            Have questions about calculation models, storage settings, or custom semesters? We’ve got the quick answers right here.
          </p>
        </div>

        {/* Accordion Layout */}
        <div className="space-y-4">
          {FAQS.map((faq) => {
            const isOpen = faq.id === openId;
            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all ${
                  isOpen 
                    ? 'bg-brand-bg/50 border-brand-primary/25 shadow-md shadow-brand-primary/5' 
                    : 'bg-white border-brand-border/60 hover:bg-brand-bg/30'
                }`}
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-bold text-brand-primary-text transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className={`w-5 h-5 shrink-0 ${isOpen ? 'text-brand-primary' : 'text-brand-secondary-text'}`} />
                    <span className="text-sm sm:text-base leading-snug">{faq.question}</span>
                  </div>
                  <div className={`w-7 h-7 rounded-lg bg-brand-bg flex items-center justify-center text-brand-primary-text shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180 bg-brand-primary/10 text-brand-primary' : ''
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-brand-secondary-text leading-relaxed border-t border-brand-border/30 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>



      </div>
    </section>
  );
}
