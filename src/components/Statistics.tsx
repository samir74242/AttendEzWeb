import { motion } from 'motion/react';
import { Award, Zap, ShieldAlert, CheckSquare } from 'lucide-react';

interface StatBlock {
  id: string;
  value: string;
  label: string;
  sub: string;
  icon: any;
  color: string;
}

const STATS: StatBlock[] = [
  {
    id: 'accuracy',
    value: '99.8%',
    label: 'Accuracy Log Rate',
    sub: 'Calculated instantly on-device',
    icon: CheckSquare,
    color: 'text-brand-primary bg-brand-primary/10'
  },
  {
    id: 'offline',
    value: '100%',
    label: 'Offline Availability',
    sub: 'No remote servers or syncing logs',
    icon: ShieldAlert,
    color: 'text-brand-secondary bg-brand-secondary/10'
  },
  {
    id: 'performance',
    value: '60 FPS',
    label: 'Native Performance',
    sub: 'Optimized lightweight render engine',
    icon: Zap,
    color: 'text-brand-accent bg-brand-accent/10'
  },
  {
    id: 'records',
    value: '10k+',
    label: 'Lectures Automated',
    sub: 'Managed across multiple semesters',
    icon: Award,
    color: 'text-emerald-600 bg-emerald-50'
  }
];

export default function Statistics() {
  return (
    <section className="py-20 bg-white relative overflow-hidden z-10 border-b border-brand-border/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="p-6 rounded-2xl border border-brand-border/50 hover:border-brand-primary/15 hover:shadow-lg hover:shadow-brand-primary/5 transition-all flex flex-col items-center text-center group"
              >
                {/* Icon wrapper */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color} mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5.5 h-5.5" />
                </div>

                {/* Big number count */}
                <span className="font-display text-4xl sm:text-5xl font-black text-brand-primary-text tracking-tight mb-2">
                  {stat.value}
                </span>

                {/* Text titles */}
                <h4 className="text-sm font-bold text-brand-primary-text mb-1">
                  {stat.label}
                </h4>
                <p className="text-xs text-brand-secondary-text leading-snug">
                  {stat.sub}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
