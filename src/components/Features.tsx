import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  BarChart3, 
  CalendarRange, 
  BellRing, 
  Notebook, 
  Calculator, 
  ShieldCheck, 
  Moon,
  Sparkles
} from 'lucide-react';
import { FEATURES, Feature } from '../types';

const iconMap: Record<string, any> = {
  CheckCircle2: CheckCircle2,
  BarChart3: BarChart3,
  CalendarRange: CalendarRange,
  BellRing: BellRing,
  NotebookPen: Notebook,
  Calculator: Calculator,
  ShieldCheck: ShieldCheck,
  Moon: Moon
};

export default function Features() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'core' | 'analytics' | 'productivity' | 'utility'>('all');

  const categories = [
    { id: 'all', name: 'All Features' },
    { id: 'core', name: 'Core Essentials' },
    { id: 'analytics', name: 'Analytics & Trends' },
    { id: 'productivity', name: 'Productivity' },
    { id: 'utility', name: 'Smart Utilities' }
  ];

  const filteredFeatures = activeCategory === 'all' 
    ? FEATURES 
    : FEATURES.filter(f => f.category === activeCategory);

  return (
    <section id="features" className="py-24 bg-brand-bg relative overflow-hidden">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] rounded-full bg-brand-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[35%] h-[35%] rounded-full bg-brand-secondary/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] font-mono tracking-widest text-brand-secondary uppercase mb-2 block">
            FEATURE OVERVIEW
          </span>
          <h2 className="font-display text-3xl sm:text-4.5xl font-extrabold tracking-tight text-brand-primary-text leading-[1.1] mb-4">
            Everything You Need <br />
            To Stay In Class & On Track
          </h2>
          <p className="text-base sm:text-lg text-brand-secondary-text leading-relaxed">
            AttendEz is packed with purpose-built utilities tailored perfectly for modern college life. Track, calculate, schedule, and study without standard portal clunk.
          </p>
        </div>

        {/* Dynamic Category Selector Tabs */}
        <div className="flex flex-wrap justify-center items-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeCategory === cat.id
                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                  : 'bg-white text-brand-secondary-text hover:text-brand-primary border border-brand-border/60'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Features Grid Layout */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredFeatures.map((feature, idx) => {
              const IconComponent = iconMap[feature.iconName] || CheckCircle2;
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  transition={{ duration: 0.3 }}
                  key={feature.id}
                  className="bg-white rounded-2xl p-6 border border-brand-border/50 shadow-sm hover:shadow-xl hover:border-brand-primary/20 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden"
                >
                  {/* Subtle Background Inner Glow */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  <div>
                    {/* Header Row (Icon + Badge) */}
                    <div className="flex justify-between items-center mb-5">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-bg to-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:from-brand-primary group-hover:to-brand-secondary group-hover:text-white transition-all shadow-sm">
                        <IconComponent className="w-5.5 h-5.5" />
                      </div>
                      {feature.badge && (
                        <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold tracking-wider uppercase bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/15 flex items-center gap-1 animate-pulse">
                          <Sparkles className="w-2.5 h-2.5" /> {feature.badge}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <h3 className="text-base font-extrabold text-brand-primary-text mb-2.5 group-hover:text-brand-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-brand-secondary-text leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  {/* Micro link details */}
                  <div className="mt-5 pt-4 border-t border-brand-bg flex items-center justify-between text-[10px] font-mono tracking-wider text-brand-secondary/60 uppercase">
                    <span>SEMESTER UTILITIES</span>
                    <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-brand-primary font-bold">
                      Explore →
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
