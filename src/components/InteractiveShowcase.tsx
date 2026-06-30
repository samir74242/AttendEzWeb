import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckSquare, 
  LineChart, 
  Calendar, 
  BookOpen, 
  Sliders, 
  Flame, 
  Check, 
  AlertCircle,
  Plus,
  Clock,
  MapPin,
  Sparkles,
  Award
} from 'lucide-react';

interface ShowcaseScreen {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  color: string;
}

const SCREENS: ShowcaseScreen[] = [
  {
    id: 'dashboard',
    title: 'Daily Dashboard',
    subtitle: 'Track Easily',
    description: 'See your complete day at a glance. Understand your cumulative average attendance, current active eligibility status, and check-in to classes straight from the main stream.',
    icon: CheckSquare,
    color: 'from-blue-600 to-indigo-600'
  },
  {
    id: 'analytics',
    title: 'Advanced Analytics',
    subtitle: 'Attend Smartly',
    description: 'Analyze deep trend logs, subject-by-subject histories, and monthly attendance ratios. Learn precisely when you tend to skip and track healthy check-in streaks.',
    icon: LineChart,
    color: 'from-[#7B61FF] to-[#00C2FF]'
  },
  {
    id: 'schedule',
    title: 'Timetable Schedule',
    subtitle: 'Stay Punctual',
    description: 'An elegant, interactive weekly calendar mapping lecture periods, lecture halls, and instructor details. Highlights active sessions with automatic prompt banners.',
    icon: Calendar,
    color: 'from-[#FF4B91] to-[#7B61FF]'
  },
  {
    id: 'notes',
    title: 'Integrated Notes',
    subtitle: 'Never Forget',
    description: 'Keep quick course study summaries, reference slide links, exam syllabi, and assignment checklists tied directly to the relevant subject dashboard page.',
    icon: BookOpen,
    color: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'settings',
    title: 'Custom Semesters',
    subtitle: 'Personalized Math',
    description: 'Fully customize your academic milestones. Choose standard target rates (e.g. 75% or 85%), archive old terms, and easily toggle true AMOLED dark layouts.',
    icon: Sliders,
    color: 'from-amber-500 to-orange-600'
  }
];

export default function InteractiveShowcase() {
  const [activeScreenIndex, setActiveScreenIndex] = useState(0);
  const [isAutoPlayActive, setIsAutoPlayActive] = useState(true);
  const autoPlayTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isAutoPlayActive) {
      autoPlayTimer.current = setInterval(() => {
        setActiveScreenIndex((prevIndex) => (prevIndex + 1) % SCREENS.length);
      }, 5500);
    }
    return () => {
      if (autoPlayTimer.current) clearInterval(autoPlayTimer.current);
    };
  }, [isAutoPlayActive]);

  const handleManualSelection = (index: number) => {
    setActiveScreenIndex(index);
    setIsAutoPlayActive(false); // Disable autoplay when user interacts
  };

  const handlePrev = () => {
    setIsAutoPlayActive(false);
    setActiveScreenIndex((prevIndex) => (prevIndex - 1 + SCREENS.length) % SCREENS.length);
  };

  const handleNext = () => {
    setIsAutoPlayActive(false);
    setActiveScreenIndex((prevIndex) => (prevIndex + 1) % SCREENS.length);
  };

  const currentScreen = SCREENS[activeScreenIndex];

  return (
    <section id="showcase" className="py-24 bg-white border-y border-brand-border/30 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] font-mono tracking-widest text-brand-secondary uppercase mb-2 block">
            INTERACTIVE EXPERIENCE
          </span>
          <h2 className="font-display text-3xl sm:text-4.5xl font-extrabold tracking-tight text-brand-primary-text leading-[1.1] mb-4">
            Step Inside AttendEz
          </h2>
          <p className="text-base sm:text-lg text-brand-secondary-text">
            No mock screenshots needed. Click through each section to simulate exactly how our beautiful native application interface looks and behaves in real hand-held devices.
          </p>
        </div>

        {/* Dynamic Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Columns - Detailed Controls & Descriptive Copy */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="space-y-4 mb-8">
              {SCREENS.map((screen, index) => {
                const Icon = screen.icon;
                const isActive = index === activeScreenIndex;

                return (
                  <button
                    key={screen.id}
                    onClick={() => handleManualSelection(index)}
                    className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                      isActive
                        ? 'bg-brand-bg border-brand-primary/20 shadow-md shadow-brand-primary/5'
                        : 'bg-white border-transparent hover:bg-brand-bg/40'
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-xl shrink-0 flex items-center justify-center transition-all ${
                      isActive 
                        ? 'bg-gradient-to-br from-brand-primary to-brand-secondary text-white' 
                        : 'bg-brand-bg text-brand-secondary-text'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-mono font-bold tracking-wider uppercase ${
                          isActive ? 'text-brand-primary' : 'text-brand-secondary-text/80'
                        }`}>
                          {screen.subtitle}
                        </span>
                        {isActive && (
                          <span className="text-[9px] font-semibold text-brand-secondary-text bg-white border border-brand-border/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-ping" />
                            Live Preview
                          </span>
                        )}
                      </div>
                      <h3 className="text-md sm:text-lg font-bold text-brand-primary-text mt-0.5 mb-1.5">
                        {screen.title}
                      </h3>
                      {isActive && (
                        <p className="text-xs text-brand-secondary-text leading-relaxed">
                          {screen.description}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Manual Controls & Indicator Bar */}
            <div className="flex items-center justify-between px-2">
              <div className="flex gap-1.5">
                {SCREENS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleManualSelection(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === activeScreenIndex ? 'w-6 bg-brand-primary' : 'w-2 bg-brand-border'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
              <div className="flex gap-2.5">
                <button
                  onClick={handlePrev}
                  className="p-2.5 rounded-xl border border-brand-border bg-white text-brand-secondary-text hover:text-brand-primary hover:bg-brand-bg transition-all shadow-sm"
                  aria-label="Previous Screen"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2.5 rounded-xl border border-brand-border bg-white text-brand-secondary-text hover:text-brand-primary hover:bg-brand-bg transition-all shadow-sm"
                  aria-label="Next Screen"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - iPhone Visual Screen Simulator */}
          <div className="lg:col-span-6 flex justify-center items-center">
            <div className="relative w-full max-w-[320px]">
              
              {/* Phone decorative background ring */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-brand-secondary/5 to-brand-accent/15 rounded-[44px] blur-2xl -z-10 scale-105" />

              {/* iPhone Frame */}
              <div className="w-full bg-[#0e1324] p-2.5 rounded-[42px] shadow-2xl border-4 border-[#252f44] relative overflow-hidden">
                
                {/* iPhone Camera Notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-[#0e1324] rounded-full z-30 flex items-center justify-between px-3.5">
                  <div className="w-2.5 h-2.5 bg-black/40 rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-[#1a202c] rounded-full" />
                  </div>
                  <div className="w-1.5 h-1.5 bg-[#1a202c] rounded-full" />
                </div>

                {/* Inner Screen Canvas */}
                <div className="w-full rounded-[32px] overflow-hidden bg-gradient-to-b from-[#0e1424] to-[#070b14] text-white min-h-[520px] pt-7 pb-4 px-3.5 flex flex-col justify-between relative border border-white/5 font-sans select-none">
                  
                  {/* Local Simulated Screens Container */}
                  <div className="flex-1 mt-4 overflow-hidden relative">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentScreen.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full flex flex-col"
                      >
                        
                        {/* 1. DASHBOARD VIEW */}
                        {currentScreen.id === 'dashboard' && (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center px-1">
                              <div>
                                <span className="text-[9px] text-white/50 block font-mono">WELCOME BACK</span>
                                <h4 className="text-sm font-bold tracking-tight">Sameer Pandey</h4>
                              </div>
                              <div className="w-7 h-7 rounded-full bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-xs font-black">SP</div>
                            </div>

                            {/* Circular gauge */}
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                                {/* Vector Circle */}
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                  <path className="text-white/10" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                  <path className="text-brand-primary" strokeDasharray="80, 100" strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                </svg>
                                <span className="absolute text-xs font-extrabold font-mono">80%</span>
                              </div>
                              <div>
                                <h5 className="text-[11.5px] font-bold">Eligible Target: 75%</h5>
                                <p className="text-[9px] text-white/50 mt-0.5">You can safely skip 3 classes across active subjects.</p>
                              </div>
                            </div>

                            {/* Active Subject Row */}
                            <div className="space-y-2">
                              <span className="text-[9px] text-white/40 uppercase font-mono tracking-wider block">Recent Classes</span>
                              <div className="p-2.5 rounded-xl bg-white/5 border border-white/8 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <span className="w-1.5 h-8 rounded bg-brand-primary" />
                                  <div>
                                    <h6 className="text-[10.5px] font-bold">Applied Physics</h6>
                                    <span className="text-[8.5px] text-white/50">11:00 AM - Room 402</span>
                                  </div>
                                </div>
                                <span className="px-2 py-0.5 rounded-full bg-brand-success/20 text-brand-success text-[8.5px] font-bold">PRESENT</span>
                              </div>
                              <div className="p-2.5 rounded-xl bg-white/5 border border-white/8 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <span className="w-1.5 h-8 rounded bg-brand-secondary" />
                                  <div>
                                    <h6 className="text-[10.5px] font-bold">Computer Networks</h6>
                                    <span className="text-[8.5px] text-white/50">12:30 PM - Lab C</span>
                                  </div>
                                </div>
                                <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/50 text-[8.5px] font-bold">NOT LOGGED</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 2. ANALYTICS VIEW */}
                        {currentScreen.id === 'analytics' && (
                          <div className="space-y-4">
                            <h4 className="text-xs font-bold font-mono text-white/50 tracking-wide uppercase px-1">ATTENDANCE INSIGHTS</h4>
                            
                            {/* Streak Block */}
                            <div className="p-3.5 rounded-2xl bg-[#FFA500]/10 border border-[#FFA500]/20 flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <Flame className="w-5.5 h-5.5 text-brand-warning shrink-0" />
                                <div>
                                  <h6 className="text-xs font-bold text-white">7 Lecture Streak!</h6>
                                  <p className="text-[8.5px] text-white/55">You haven\'t missed a class this week.</p>
                                </div>
                              </div>
                              <Award className="w-5 h-5 text-brand-warning shrink-0" />
                            </div>

                            {/* Performance Grid */}
                            <div className="grid grid-cols-2 gap-2.5">
                              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-[8.5px] text-white/40 block">TOTAL ATTENDED</span>
                                <span className="text-lg font-bold font-mono">48 / 56</span>
                                <span className="text-[8px] text-brand-success block mt-0.5">85% attendance ratio</span>
                              </div>
                              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-[8.5px] text-white/40 block">MOST SKIPABLE</span>
                                <span className="text-xs font-bold block mt-1 text-red-400">Discrete Math</span>
                                <span className="text-[8px] text-white/40 block">Exactly at 75.1%</span>
                              </div>
                            </div>

                            {/* Simulated Graph Widget */}
                            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-2">
                              <span className="text-[9px] text-white/45 block font-mono">Weekly Trend (Attended classes)</span>
                              <div className="h-16 flex items-end justify-between px-2 pt-2">
                                <div className="w-2.5 bg-brand-primary h-[40%] rounded-t-xs" />
                                <div className="w-2.5 bg-brand-secondary h-[60%] rounded-t-xs" />
                                <div className="w-2.5 bg-brand-accent h-[90%] rounded-t-xs" />
                                <div className="w-2.5 bg-brand-primary h-[50%] rounded-t-xs" />
                                <div className="w-2.5 bg-brand-secondary h-[100%] rounded-t-xs" />
                                <div className="w-2.5 bg-brand-primary h-[85%] rounded-t-xs" />
                                <div className="w-2.5 bg-brand-accent h-[95%] rounded-t-xs" />
                              </div>
                              <div className="flex justify-between text-[8px] font-mono text-white/40 px-0.5">
                                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 3. SCHEDULE VIEW */}
                        {currentScreen.id === 'schedule' && (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center px-1">
                              <h4 className="text-xs font-bold font-mono text-white/50 tracking-wider uppercase">THURSDAY SCHEDULE</h4>
                              <span className="text-[9px] font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded">Today</span>
                            </div>

                            {/* Lectures Cards */}
                            <div className="space-y-2.5">
                              {/* Lecture 1 */}
                              <div className="p-3 rounded-xl bg-gradient-to-r from-brand-primary/15 to-transparent border-l-4 border-brand-primary bg-white/5 relative">
                                <div className="flex justify-between items-start">
                                  <h5 className="text-[11.5px] font-bold text-white">Design & Analysis of Algos</h5>
                                  <span className="px-1.5 py-0.5 rounded text-[8px] bg-brand-primary/20 text-brand-accent font-bold">10:00 AM</span>
                                </div>
                                <div className="flex items-center gap-3 text-[9px] text-white/60 mt-2">
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 50 mins</span>
                                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> LH-102</span>
                                </div>
                              </div>

                              {/* Lecture 2 */}
                              <div className="p-3 rounded-xl bg-gradient-to-r from-brand-secondary/10 to-transparent border-l-4 border-brand-secondary bg-white/5">
                                <div className="flex justify-between items-start">
                                  <h5 className="text-[11.5px] font-bold text-white">Digital Electronics</h5>
                                  <span className="px-1.5 py-0.5 rounded text-[8px] bg-brand-secondary/20 text-[#D4C3FF] font-bold">11:30 AM</span>
                                </div>
                                <div className="flex items-center gap-3 text-[9px] text-white/60 mt-2">
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 50 mins</span>
                                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Room 101</span>
                                </div>
                              </div>

                              {/* Lecture 3 */}
                              <div className="p-3 rounded-xl border-l-4 border-white/20 bg-white/5 opacity-60">
                                <div className="flex justify-between items-start">
                                  <h5 className="text-[11.5px] font-bold text-white">Environmental Sciences</h5>
                                  <span className="px-1.5 py-0.5 rounded text-[8px] bg-white/10 text-white/60 font-bold">02:00 PM</span>
                                </div>
                                <div className="flex items-center gap-3 text-[9px] text-white/60 mt-2">
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 50 mins</span>
                                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> LH-404</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 4. NOTES VIEW */}
                        {currentScreen.id === 'notes' && (
                          <div className="space-y-4">
                            <h4 className="text-xs font-bold font-mono text-white/50 tracking-wider uppercase px-1">ACADEMIC SCRATCHPAD</h4>
                            
                            {/* Notes Hub Layout */}
                            <div className="space-y-2.5">
                              <div className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors cursor-pointer">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-[9px] text-brand-accent font-bold font-mono">DATA STRUCTURES</span>
                                  <span className="text-[8px] text-white/40">Updated 2h ago</span>
                                </div>
                                <h5 className="text-[11px] font-bold">Graph algorithms cheat-sheet</h5>
                                <p className="text-[9px] text-white/50 mt-1 line-clamp-1">Review BFS and DFS topological sort complexity for test.</p>
                              </div>

                              <div className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors cursor-pointer">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-[9px] text-brand-secondary font-bold font-mono">DATABASE SYSTEMS</span>
                                  <span className="text-[8px] text-white/40">Updated 1d ago</span>
                                </div>
                                <h5 className="text-[11px] font-bold">3NF and BCNF normalization rules</h5>
                                <p className="text-[9px] text-white/50 mt-1 line-clamp-1">Functional dependencies rules: closure attributes check.</p>
                              </div>

                              {/* Quick input bar */}
                              <div className="pt-2">
                                <div className="p-2.5 rounded-xl bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-between">
                                  <span className="text-[10px] text-brand-accent font-bold flex items-center gap-1">
                                    <Plus className="w-3.5 h-3.5" /> Quick jot note...
                                  </span>
                                  <span className="text-[8.5px] font-mono text-white/45">Sem 5</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 5. SETTINGS VIEW */}
                        {currentScreen.id === 'settings' && (
                          <div className="space-y-4">
                            <h4 className="text-xs font-bold font-mono text-white/50 tracking-wider uppercase px-1">SEMESTER GOALS</h4>
                            
                            {/* Sliders and Goals */}
                            <div className="space-y-4">
                              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-bold">Target Threshold</span>
                                  <span className="text-xs font-black font-mono text-brand-primary">75%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full relative">
                                  <div className="absolute top-0 left-0 h-full bg-brand-primary rounded-full w-[75%]" />
                                  <div className="absolute top-1/2 -translate-y-1/2 left-[75%] w-3.5 h-3.5 rounded-full bg-white shadow-lg border-2 border-brand-primary" />
                                </div>
                                <div className="flex justify-between text-[8px] text-white/40 font-mono">
                                  <span>60% Min</span>
                                  <span>85% Max</span>
                                </div>
                              </div>

                              {/* Preset Quick select buttons */}
                              <div className="space-y-1.5">
                                <span className="text-[9px] text-white/45 font-mono uppercase tracking-wider block px-1">Standard Thresholds</span>
                                <div className="grid grid-cols-3 gap-2">
                                  <button className="py-2.5 rounded-xl border border-white/10 bg-white/5 text-[10px] font-bold hover:border-brand-primary hover:text-brand-primary transition-colors">65% Target</button>
                                  <button className="py-2.5 rounded-xl border border-brand-primary/45 bg-brand-primary/15 text-[10px] font-black text-white">75% Target</button>
                                  <button className="py-2.5 rounded-xl border border-white/10 bg-white/5 text-[10px] font-bold hover:border-brand-primary hover:text-brand-primary transition-colors">85% Target</button>
                                </div>
                              </div>

                              {/* Quick Toggles */}
                              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-brand-success" />
                                  <span className="text-[10.5px] font-bold">True AMOLED Dark Mode</span>
                                </div>
                                <div className="w-8 h-4.5 bg-brand-primary rounded-full p-0.5 flex items-center justify-end cursor-pointer">
                                  <div className="w-3.5 h-3.5 bg-white rounded-full" />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* iPhone bottom Bar */}
                  <div className="w-24 h-1 bg-white/35 mx-auto rounded-full mt-4" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
