import { useState } from 'react';
import { motion } from 'motion/react';
import { Download, Sparkles, Plus, Minus, CheckCircle, Flame, Eye, ArrowRight, ShieldCheck, Heart, Info } from 'lucide-react';
import DownloadButton from './DownloadButton';

interface MockSubject {
  name: string;
  code: string;
  present: number;
  total: number;
  color: string;
}

export default function Hero() {
  // Live simulation state inside the phone mockup
  const [subjects, setSubjects] = useState<MockSubject[]>([
    { name: 'Data Structures & Algos', code: 'CS-301', present: 16, total: 20, color: 'from-[#3366FF] to-[#00C2FF]' },
    { name: 'Database Management', code: 'CS-304', present: 11, total: 15, color: 'from-[#7B61FF] to-[#FF4B91]' },
    { name: 'Discrete Mathematics', code: 'MA-202', present: 13, total: 20, color: 'from-[#22C55E] to-[#10B981]' }
  ]);

  const targetPercentage = 75;

  const handleUpdate = (index: number, type: 'present' | 'absent') => {
    setSubjects(prev => prev.map((sub, idx) => {
      if (idx !== index) return sub;
      const newPresent = type === 'present' ? sub.present + 1 : sub.present;
      const newTotal = sub.total + 1;
      return { ...sub, present: newPresent, total: newTotal };
    }));
  };

  const getPercentage = (present: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((present / total) * 100);
  };

  return (
    <section className="relative min-h-screen pt-24 pb-16 flex items-center justify-center overflow-hidden bg-brand-bg">
      {/* Background Mesh Gradients */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-brand-primary/10 blur-[140px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[40%] -right-[15%] w-[50%] h-[50%] rounded-full bg-brand-secondary/80 opacity-[0.08] blur-[160px] animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute -bottom-[10%] left-[30%] w-[40%] h-[40%] rounded-full bg-brand-accent/15 blur-[120px]" />
        
        {/* Subtle Decorative Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.15]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10 w-full">
        {/* Hero Left Content */}
        <div className="lg:col-span-7 flex flex-col text-left">
          {/* Tagline Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold w-fit mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Introducing AttendEz v2.0 • Brand New Release</span>
          </motion.div>

          {/* Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl md:text-6.5xl font-extrabold tracking-tight text-brand-primary-text leading-[1.05] mb-6"
          >
            Never Miss a <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent">
              Class Again.
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-brand-secondary-text max-w-xl font-normal leading-relaxed mb-8"
          >
            Track Easily. Attend Smartly. AttendEz helps students effortlessly manage attendance, monitor semester eligibility, coordinate timetables, and receive smart reminders—all in a beautifully private, offline app.
          </motion.p>

          {/* Action CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10"
          >
            <DownloadButton
              className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-brand-primary text-white font-bold shadow-xl shadow-brand-primary/30 hover:bg-brand-primary/95 hover:-translate-y-0.5 hover:shadow-2xl transition-all"
            >
              <Download className="w-5 h-5" />
              <span>Download APK (20MB)</span>
            </DownloadButton>
            <a
              href="#features"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white border border-brand-border hover:border-brand-primary text-brand-primary-text hover:text-brand-primary font-bold shadow-sm hover:bg-brand-bg transition-all"
            >
              <span>Explore Features</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Bullet Indicators (Trust Elements) */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-3 gap-4 border-t border-brand-border/60 pt-6 max-w-lg"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-success shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-brand-primary-text">100% Private</span>
                <span className="text-[10px] text-brand-secondary-text">On-Device Storage</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-brand-warning shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-brand-primary-text">Offline first</span>
                <span className="text-[10px] text-brand-secondary-text">No Internet Needed</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-[#FF4B91] shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-brand-primary-text">Ad-Free</span>
                <span className="text-[10px] text-brand-secondary-text">Pure Productivity</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Hero Right Content (Interactive iPhone mockup) */}
        <div className="lg:col-span-5 flex justify-center items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 100, delay: 0.2 }}
            className="relative w-full max-w-[340px]"
          >
            {/* Ambient Background Glow behind phone */}
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary via-brand-secondary to-brand-accent opacity-20 blur-3xl rounded-[40px] -z-10 animate-pulse" />

            {/* Simulated iPhone Frame */}
            <div className="w-full bg-[#0a0f1d] p-3 rounded-[44px] shadow-2xl border-4 border-[#2d3748] relative">
              {/* Camera Notch */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-32 h-5 bg-[#0a0f1d] rounded-full z-30 flex items-center justify-between px-4">
                <div className="w-3.5 h-3.5 bg-black/40 rounded-full border border-white/5 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-[#1a202c] rounded-full" />
                </div>
                <div className="w-10 h-1 bg-[#232a35] rounded-full" />
                <div className="w-2 h-2 bg-[#1a202c] rounded-full" />
              </div>

              {/* Speaker & Sensor */}
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#1a202c] rounded-full z-30" />

              {/* Inner Screen */}
              <div className="w-full rounded-[34px] overflow-hidden bg-gradient-to-b from-[#0f172a] to-[#090d16] text-white select-none pt-8 pb-4 px-4 min-h-[580px] flex flex-col justify-between relative border border-white/5">
                
                {/* Phone Status bar */}
                <div className="absolute top-2 left-0 w-full px-6 flex justify-between text-[11px] font-mono font-medium text-white/75 z-20">
                  <span>09:41</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px]">LTE</span>
                    <div className="w-4.5 h-2.5 border border-white/60 rounded-sm p-0.5 flex items-center">
                      <div className="h-full w-3 bg-brand-success rounded-3xs" />
                    </div>
                  </div>
                </div>

                {/* Dashboard Screen */}
                <div className="flex-1 mt-4">
                  {/* Local App Header */}
                  <div className="flex justify-between items-center mb-5">
                    <div>
                      <span className="text-[10px] text-white/50 font-mono tracking-wider block">CURRENT STATUS</span>
                      <h4 className="text-md font-display font-extrabold text-white tracking-tight">Active Semesters</h4>
                    </div>
                    <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-brand-primary/20 text-brand-accent border border-brand-accent/20">
                      Sem 5
                    </span>
                  </div>

                  {/* Summary Widget */}
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 mb-5 relative overflow-hidden">
                    <div className="absolute -top-12 -right-12 w-28 h-28 bg-brand-secondary/15 rounded-full blur-xl" />
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-white/50 block font-medium">AVERAGE ATTENDANCE</span>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-3xl font-display font-black text-white">
                            {subjects.length > 0
                              ? Math.round(subjects.reduce((sum, s) => sum + getPercentage(s.present, s.total), 0) / subjects.length)
                              : 0}%
                          </span>
                          <span className="text-xs text-brand-success font-semibold flex items-center gap-0.5">
                            ▲ +2.4%
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-brand-success/20 text-brand-success border border-brand-success/15 mb-1.5">
                          ELIGIBLE
                        </span>
                        <span className="text-[9px] text-white/40">Goal: {targetPercentage}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Subjects Simulation List */}
                  <div className="space-y-3.5">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[11px] text-white/50 uppercase font-mono tracking-wider">Subjects Calculator</span>
                      <span className="text-[10px] text-brand-accent flex items-center gap-0.5">
                        <Info className="w-3 h-3" /> Tap to simulate
                      </span>
                    </div>

                    {subjects.map((sub, idx) => {
                      const pct = getPercentage(sub.present, sub.total);
                      const isEligible = pct >= targetPercentage;

                      return (
                        <div 
                          key={sub.code}
                          className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-2.5 relative group hover:bg-white/[0.08] transition-all"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] text-white/45 font-mono">{sub.code}</span>
                              <h5 className="text-xs font-bold leading-tight line-clamp-1">{sub.name}</h5>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[8.5px] font-extrabold ${
                              isEligible 
                                ? 'bg-brand-success/15 text-brand-success border border-brand-success/20' 
                                : 'bg-brand-warning/15 text-brand-warning border border-brand-warning/20'
                            }`}>
                              {pct}%
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r ${sub.color} transition-all duration-500`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>

                          {/* Interactive Buttons */}
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-[9.5px] text-white/45">
                              Present: <b className="text-white font-mono">{sub.present}</b> / <span className="font-mono">{sub.total}</span>
                            </span>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleUpdate(idx, 'absent')}
                                className="p-1 rounded bg-red-500/15 border border-red-500/20 text-red-400 hover:bg-red-500/30 text-[9px] font-bold flex items-center gap-0.5 transition-colors"
                                title="Add Absent"
                              >
                                <Minus className="w-2.5 h-2.5" /> Abs
                              </button>
                              <button
                                onClick={() => handleUpdate(idx, 'present')}
                                className="p-1 rounded bg-brand-success/15 border border-brand-success/20 text-brand-success hover:bg-brand-success/30 text-[9px] font-bold flex items-center gap-0.5 transition-colors"
                                title="Add Present"
                              >
                                <Plus className="w-2.5 h-2.5" /> Pres
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom App Navigation Tabbar */}
                <div className="border-t border-white/10 pt-3 flex justify-between items-center px-4 mt-6">
                  <div className="flex flex-col items-center gap-1 text-brand-primary">
                    <CheckCircle className="w-5.5 h-5.5" />
                    <span className="text-[9px] font-semibold">Track</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-white/40 hover:text-white/70 transition-colors">
                    <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 3v18h18M18 17l-4-4-4 4-4-4" /></svg>
                    <span className="text-[9px]">Analytics</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-white/40 hover:text-white/70 transition-colors">
                    <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                    <span className="text-[9px]">Schedule</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-white/40 hover:text-white/70 transition-colors">
                    <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    <span className="text-[9px]">Settings</span>
                  </div>
                </div>

                {/* iPhone Home Indicator */}
                <div className="w-28 h-1 bg-white/45 mx-auto rounded-full mt-3" />
              </div>
            </div>

            {/* Float Badge */}
            <div className="absolute -bottom-4 -left-6 bg-white p-3.5 rounded-2xl shadow-xl border border-brand-border/60 flex items-center gap-2.5 animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="w-8 h-8 rounded-full bg-[#FFD700]/10 flex items-center justify-center text-[#FFB800]">
                ★
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-brand-primary-text">4.9/5 Rating</span>
                <span className="text-[10px] text-brand-secondary-text font-medium">On Google Play</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
