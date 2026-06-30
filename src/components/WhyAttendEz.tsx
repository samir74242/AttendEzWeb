import { motion } from 'motion/react';
import { 
  AlertTriangle, 
  CheckCircle, 
  BrainCircuit, 
  Percent, 
  CalendarDays, 
  Lock,
  ArrowRight,
  UserX,
  Sparkles
} from 'lucide-react';
import { COMPARISONS } from '../types';

const iconMap: Record<string, any> = {
  BrainCircuit: BrainCircuit,
  Percent: Percent,
  CalendarDays: CalendarDays,
  Lock: Lock
};

export default function WhyAttendEz() {
  return (
    <section id="why-us" className="py-24 bg-brand-bg relative overflow-hidden z-10">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] font-mono tracking-widest text-brand-secondary uppercase mb-2 block">
            PROBLEM VS SOLUTION
          </span>
          <h2 className="font-display text-3xl sm:text-4.5xl font-extrabold tracking-tight text-brand-primary-text leading-[1.1] mb-4">
            Ditch the Paper & Guesswork
          </h2>
          <p className="text-base sm:text-lg text-brand-secondary-text">
            Why do students love AttendEz? Because we swap manual fraction tracking and clunky college portal logins for an elegant, intelligent personal assistant.
          </p>
        </div>

        {/* Dual-Column Interactive Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Left Column - Traditional Pain Points (Student Stressors) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-red-100/65 shadow-sm flex flex-col justify-between relative overflow-hidden">
            {/* Warning Glow */}
            <div className="absolute -top-12 -left-12 w-28 h-28 bg-red-500/5 rounded-full blur-2xl" />
            
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[11px] font-extrabold mb-6 border border-red-100">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>The Traditional Struggle</span>
              </div>
              <h3 className="font-display text-2xl font-extrabold text-brand-primary-text mb-6">
                Why Keeping Track is Stressful
              </h3>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0 border border-red-100">
                    <UserX className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-brand-primary-text">Portal Logouts</h4>
                    <p className="text-xs text-brand-secondary-text mt-0.5 leading-relaxed">
                      Wasting minutes logging in to slow college ERP sites just to view a simple attendance count.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0 border border-red-100">
                    <Percent className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-brand-primary-text">Complex Percentage Math</h4>
                    <p className="text-xs text-brand-secondary-text mt-0.5 leading-relaxed">
                      Manually counting class slots, factoring in medical leaves, and guessing if skipping Friday is safe.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0 border border-red-100">
                    <CalendarDays className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-brand-primary-text">Messy Timetable Layouts</h4>
                    <p className="text-xs text-brand-secondary-text mt-0.5 leading-relaxed">
                      Schedules scattered across gallery screenshots, whatsapp group pins, or confusing PDFs.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-brand-bg flex items-center text-[11px] font-mono text-red-400 font-semibold uppercase tracking-wider">
              Total stress & administrative overhead
            </div>
          </div>

          {/* Center Connector Indicator */}
          <div className="lg:col-span-2 flex flex-row lg:flex-col items-center justify-center gap-2">
            <div className="h-0.5 lg:h-16 w-12 lg:w-0.5 bg-brand-border/80" />
            <div className="w-10 h-10 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary flex items-center justify-center text-xs font-black shrink-0">
              VS
            </div>
            <div className="h-0.5 lg:h-16 w-12 lg:w-0.5 bg-brand-border/80" />
          </div>

          {/* Right Column - AttendEz Premium Solution Cards */}
          <div className="lg:col-span-5 bg-[#0e1324] rounded-3xl p-6 sm:p-8 border border-white/5 shadow-xl text-white flex flex-col justify-between relative overflow-hidden">
            {/* Glowing solution orb */}
            <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-brand-primary/20 rounded-full blur-3xl" />
            
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/20 text-brand-accent text-[11px] font-extrabold mb-6 border border-brand-primary/30">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>The AttendEz Premium Standard</span>
              </div>
              <h3 className="font-display text-2xl font-extrabold text-white mb-6">
                Seamless, Automatic, Intelligent
              </h3>

              <div className="space-y-6">
                {COMPARISONS.map((comp) => {
                  const Icon = iconMap[comp.icon] || CheckCircle;
                  return (
                    <div key={comp.id} className="flex gap-4">
                      <div className="w-9 h-9 rounded-lg bg-brand-primary/25 text-brand-accent flex items-center justify-center shrink-0 border border-brand-primary/20">
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{comp.solutionTitle}</h4>
                        <p className="text-xs text-white/60 mt-0.5 leading-relaxed">
                          {comp.solutionDesc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-brand-accent font-semibold uppercase tracking-wider">
              <span>Zero friction productivity</span>
              <span className="text-white/60 font-sans normal-case">20MB App Size</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
