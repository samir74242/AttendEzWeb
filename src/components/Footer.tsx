import { CheckSquare, Twitter, Mail, HelpCircle, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0e1324] text-white/70 border-t border-white/5 relative z-10 pt-16 pb-8">
      {/* Decorative Grid overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px)] bg-[size:4rem] opacity-[0.01]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Upper footer */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/5">
          
          {/* Brand Info */}
          <div className="md:col-span-6 flex flex-col items-start text-left">
            <a href="#" className="flex items-center gap-2.5 group mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white shadow-lg shadow-brand-primary/20 group-hover:scale-105 transition-transform">
                <CheckSquare className="w-5.5 h-5.5" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-xl font-bold tracking-tight text-white">
                  Attend<span className="text-brand-accent">Ez</span>
                </span>
                <span className="text-[9px] font-mono tracking-widest text-brand-secondary uppercase -mt-1">
                  STUDENT UTILITY
                </span>
              </div>
            </a>
            <p className="text-xs sm:text-sm text-white/50 max-w-sm leading-relaxed mb-6">
              Track Easily. Attend Smartly. AttendEz helps students effortlessly log attendance, manage daily calendars, calculate thresholds, and protect study schedules with clean local privacy.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 text-white hover:text-brand-accent flex items-center justify-center transition-all border border-white/5"
                title="Twitter"
              >
                <Twitter className="w-4.5 h-4.5" />
              </a>
              <a
                href="mailto:attendez.edu@gmail.com"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 text-white hover:text-brand-accent flex items-center justify-center transition-all border border-white/5"
                title="Email Support"
              >
                <Mail className="w-4.5 h-4.5" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-3 text-left">
            <h4 className="text-xs font-bold font-mono text-white tracking-wider uppercase mb-5">
              Product Links
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li>
                <a href="#features" className="hover:text-brand-accent transition-colors">
                  Key Features
                </a>
              </li>
              <li>
                <a href="#showcase" className="hover:text-brand-accent transition-colors">
                  Interactive Showcase
                </a>
              </li>
              <li>
                <a href="#why-us" className="hover:text-brand-accent transition-colors">
                  Why AttendEz
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-brand-accent transition-colors">
                  Frequently Asked FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Legal / Policy links */}
          <div className="md:col-span-3 text-left">
            <h4 className="text-xs font-bold font-mono text-white tracking-wider uppercase mb-5">
              Resources
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li>
                <a href="#privacy-policy" className="hover:text-brand-accent transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-brand-accent transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Lower footer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40 font-medium">
          <span>
            © {currentYear} AttendEz. All rights reserved.
          </span>
          <div className="flex items-center gap-1.5 text-white/50">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500 shrink-0" />
            <span>by</span>
            <span className="text-white font-bold">Sameer Pandey</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
