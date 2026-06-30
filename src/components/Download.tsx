import { motion } from 'motion/react';
import { Download, Sparkles, Smartphone, CheckCircle, ShieldCheck, Zap } from 'lucide-react';
import DownloadButton from './DownloadButton';

export default function DownloadSection() {
  return (
    <section id="download" className="py-24 bg-brand-bg relative overflow-hidden z-10">
      {/* Background radial gradients for intense glow */}
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full bg-brand-primary/10 blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="bg-gradient-to-tr from-[#111827] via-[#1a233d] to-[#0f172a] rounded-[32px] sm:rounded-[40px] p-8 sm:p-14 lg:p-20 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center gap-12 lg:gap-8 justify-between">
          
          {/* Decorative background grids */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-[0.03]" />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-primary/20 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-secondary/20 rounded-full blur-[120px] pointer-events-none" />

          {/* Left Column Content */}
          <div className="lg:max-w-xl text-left relative z-10">
            {/* Sparkle badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-primary/25 border border-brand-primary/30 text-brand-accent text-xs font-bold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Get the Free APK Now</span>
            </div>

            {/* Headline */}
            <h2 className="font-display text-3xl sm:text-5.5xl font-extrabold tracking-tight text-white leading-none mb-4">
              Take Control of Your <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-accent to-brand-secondary">
                Attendance Today.
              </span>
            </h2>

            {/* Subheading */}
            <p className="text-md sm:text-lg text-white/70 font-semibold mb-6">
              Track Easily. Attend Smartly.
            </p>

            {/* Description */}
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed mb-8">
              Download AttendEz directly to your Android device. Skip administrative headaches, keep accurate checklists of every lecture, and secure your semester with a beautiful, 100% private companion app.
            </p>

            {/* Feature lists for download assurance */}
            <div className="grid grid-cols-2 gap-4 mb-10 border-t border-white/10 pt-6">
              <div className="flex items-center gap-2 text-white/80">
                <CheckCircle className="w-4 h-4 text-brand-success shrink-0" />
                <span className="text-xs font-semibold">Only 20MB</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <ShieldCheck className="w-4 h-4 text-brand-accent shrink-0" />
                <span className="text-xs font-semibold">No Ad Ware</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Zap className="w-4 h-4 text-brand-warning shrink-0" />
                <span className="text-xs font-semibold">Instant Startup</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Smartphone className="w-4 h-4 text-brand-secondary shrink-0" />
                <span className="text-xs font-semibold">Requires Android 8+</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <DownloadButton
                className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-brand-primary text-white font-extrabold shadow-xl shadow-brand-primary/30 hover:bg-brand-primary/90 hover:-translate-y-0.5 transition-all group"
              >
                <Download className="w-5 h-5 group-hover:animate-bounce" />
                <span>Download APK (v2.0)</span>
              </DownloadButton>
            </div>
          </div>

          {/* Right Column Visual Device Illustration */}
          <div className="w-full lg:w-fit flex justify-center items-center relative z-10">
            <motion.div 
              initial={{ rotate: 12, y: 30 }}
              whileInView={{ rotate: 6, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', damping: 20 }}
              className="relative w-56 h-96 bg-[#070b14] rounded-[36px] border-4 border-[#252f44] shadow-2xl p-2 flex flex-col justify-between"
            >
              {/* iPhone detail notch */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-3 bg-[#0e1324] rounded-full" />
              
              {/* Device content screenshot wrapper */}
              <div className="w-full h-full bg-[#0a0f1d] rounded-[28px] overflow-hidden p-3.5 pt-6 flex flex-col justify-between border border-white/5 relative">
                {/* Simulated Screen Element */}
                <div className="space-y-4 text-center mt-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary mx-auto flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
                    <CheckCircle className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-snug">AttendEz Ready</h4>
                    <span className="text-[9px] text-white/50 block font-mono mt-0.5">VERSION 2.0.0</span>
                  </div>
                </div>

                {/* Simulated progress circular indicator */}
                <div className="my-2 p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <span className="text-[10px] text-brand-success font-extrabold block">● SYSTEM STATUS</span>
                  <p className="text-[8.5px] text-white/70 mt-1">On-device local SQLite ledger is configured and ready.</p>
                </div>

                {/* Simulated Button UI */}
                <div className="w-full py-2.5 rounded-xl bg-brand-primary text-white text-[10px] font-black text-center shadow-md">
                  GET STARTED
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
