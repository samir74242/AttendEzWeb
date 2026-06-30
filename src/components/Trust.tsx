import { motion } from 'motion/react';
import { Shield, WifiOff, Zap, Sparkles, Heart, Lock, LayoutTemplate, Feather, Smartphone } from 'lucide-react';

interface TrustBadge {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
}

const BADGES: TrustBadge[] = [
  {
    id: 'privacy',
    title: 'Privacy First',
    description: 'Zero remote collection',
    icon: Shield,
    color: 'from-blue-500/10 to-brand-primary/15 text-brand-primary border-brand-primary/20'
  },
  {
    id: 'offline',
    title: 'Offline Support',
    description: 'No internet required',
    icon: WifiOff,
    color: 'from-purple-500/10 to-brand-secondary/15 text-brand-secondary border-brand-secondary/20'
  },
  {
    id: 'speed',
    title: 'Fast Performance',
    description: 'No lag, instant loads',
    icon: Zap,
    color: 'from-amber-500/10 to-brand-warning/15 text-brand-warning border-brand-warning/20'
  },
  {
    id: 'ads',
    title: 'No Ads & Distractions',
    description: '100% focused study helper',
    icon: Sparkles,
    color: 'from-[#FF4B91]/10 to-[#FF4B91]/15 text-[#FF4B91] border-[#FF4B91]/20'
  },
  {
    id: 'student',
    title: 'Student Friendly',
    description: 'Simple and relatable',
    icon: Heart,
    color: 'from-emerald-500/10 to-emerald-500/15 text-emerald-600 border-emerald-500/20'
  },
  {
    id: 'secure',
    title: 'Highly Secure',
    description: 'On-device database encrypt',
    icon: Lock,
    color: 'from-teal-500/10 to-teal-500/15 text-teal-600 border-teal-500/20'
  },
  {
    id: 'beautiful',
    title: 'Beautiful UI',
    description: 'Apple-caliber aesthetics',
    icon: LayoutTemplate,
    color: 'from-pink-500/10 to-pink-500/15 text-pink-600 border-pink-500/20'
  },
  {
    id: 'lightweight',
    title: 'Lightweight (20MB)',
    description: 'Won\'t fill up your storage',
    icon: Feather,
    color: 'from-cyan-500/10 to-brand-accent/15 text-brand-accent border-brand-accent/20'
  },
  {
    id: 'cross-platform',
    title: 'Modern Core',
    description: 'Built for Android & iOS',
    icon: Smartphone,
    color: 'from-indigo-500/10 to-indigo-500/15 text-indigo-600 border-indigo-500/20'
  }
];

export default function Trust() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <section className="py-14 bg-white border-y border-brand-border/40 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        {/* Subtle Section Divider Label */}
        <div className="flex flex-col items-center justify-center text-center mb-10">
          <span className="text-[10px] font-mono tracking-widest text-brand-secondary uppercase mb-2">
            QUALITY ASSURANCE
          </span>
          <h2 className="font-display text-2xl font-extrabold text-brand-primary-text tracking-tight">
            Designed for Ultimate Student Reliability
          </h2>
          <p className="text-sm text-brand-secondary-text max-w-lg mt-1.5">
            AttendEz eliminates all tracking, heavy sync servers, and annoying ads to keep your daily academic checks instant.
          </p>
        </div>

        {/* Badges Layout */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-4 sm:gap-6 justify-center"
        >
          {BADGES.map((badge) => {
            const IconComponent = badge.icon;
            return (
              <motion.div
                key={badge.id}
                variants={itemVariants}
                className="lg:col-span-1 flex flex-col items-center justify-center text-center p-3.5 rounded-2xl bg-brand-bg/60 border border-brand-border/30 hover:border-brand-primary/25 hover:bg-white hover:shadow-lg hover:shadow-brand-primary/5 transition-all group"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${badge.color} border flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <IconComponent className="w-5 h-5 shrink-0" />
                </div>
                <h4 className="text-[12.5px] font-bold text-brand-primary-text leading-tight mb-0.5">
                  {badge.title}
                </h4>
                <span className="text-[10px] text-brand-secondary-text leading-tight block">
                  {badge.description}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
