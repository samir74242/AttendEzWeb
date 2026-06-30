export interface Feature {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: 'core' | 'analytics' | 'productivity' | 'utility';
  badge?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  college: string;
  rating: number;
  quote: string;
  avatar: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface ProblemSolution {
  id: string;
  problemTitle: string;
  problemDesc: string;
  solutionTitle: string;
  solutionDesc: string;
  icon: string;
}

export const FEATURES: Feature[] = [
  {
    id: 'track',
    title: 'Smart Attendance Tracking',
    description: 'Mark attendance with a single tap. Set target requirements (e.g., 75% or 85%) and instantly see how many classes you can safely miss or must attend.',
    iconName: 'CheckCircle2',
    category: 'core',
    badge: 'Popular'
  },
  {
    id: 'analytics',
    title: 'Visual Attendance Analytics',
    description: 'Get beautiful subject-wise progress bars, charts, and detailed history logs. Spot trends, track streaks, and predict future attendance percentages.',
    iconName: 'BarChart3',
    category: 'analytics',
    badge: 'Powerful'
  },
  {
    id: 'timetable',
    title: 'Timetable Integration',
    description: 'Organize your daily and weekly class schedules. Get real-time alerts showing your next lecture, venue, and professor name.',
    iconName: 'CalendarRange',
    category: 'productivity',
    badge: 'New'
  },
  {
    id: 'reminders',
    title: 'Intelligent Reminders',
    description: 'Smart push notifications remind you to mark attendance right after a class finishes, so your data stays perfectly accurate.',
    iconName: 'BellRing',
    category: 'utility'
  },
  {
    id: 'notes',
    title: 'Lecture & Academic Notes',
    description: 'Jot down quick lecture summaries, assignment deadlines, or syllabus notes directly within each subject profile.',
    iconName: 'NotebookPen',
    category: 'productivity'
  },
  {
    id: 'prediction',
    title: 'Attendance Calculator',
    description: 'Calculate exactly how many consecutive lectures you need to attend to restore your eligible status, or how many you can safely skip.',
    iconName: 'Calculator',
    category: 'utility',
    badge: 'Essential'
  },
  {
    id: 'privacy',
    title: 'Offline-First & Private',
    description: 'Your data belongs entirely to you. AttendEz stores all records locally on your device, ensuring complete privacy and offline functionality.',
    iconName: 'ShieldCheck',
    category: 'core'
  },
  {
    id: 'dark-mode',
    title: 'True Dark Theme',
    description: 'A beautiful, eye-friendly AMOLED dark interface designed for late-night study sessions and early-morning lectures.',
    iconName: 'Moon',
    category: 'utility'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Aarav Mehta',
    role: 'B.Tech CS Student',
    college: 'BITS Pilani',
    rating: 5,
    quote: 'AttendEz saved my semester. Before this, I was keeping mental counts and got blocked from end-semester exams once. The calculator is spot on!',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&h=120&q=80'
  },
  {
    id: 't2',
    name: 'Sneha Rao',
    role: 'Medical Intern',
    college: 'KMC Manipal',
    rating: 5,
    quote: 'With 12-hour shifts and endless lectures, staying above 80% was stressful. This app tracks my clinical postings easily and handles complex schedules.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80'
  },
  {
    id: 't3',
    name: 'Kabir Fernandes',
    role: 'Law Student',
    college: 'National Law School',
    rating: 5,
    quote: 'The design is incredibly fast and gorgeous. I love that it works perfectly offline when I’m in lecture halls with bad cell reception.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80'
  },
  {
    id: 't4',
    name: 'Ananya Sharma',
    role: 'Design Undergrad',
    college: 'NID Ahmedabad',
    rating: 5,
    quote: 'As a design student, I have a very high bar for UI. AttendEz feels like an Apple-caliber app—extremely satisfying micro-interactions and animations!',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&h=120&q=80'
  }
];

export const FAQS: FAQItem[] = [
  {
    id: 'faq1',
    question: 'Is AttendEz completely free to use?',
    answer: 'Yes! AttendEz is free to download and use, with zero advertisements. Our goal is to make student life simple, efficient, and clean.'
  },
  {
    id: 'faq2',
    question: 'Does the application require an active internet connection?',
    answer: 'No. AttendEz operates entirely offline using local on-device database technology. You can check, mark, and update your attendance status even in basements, concrete lecture halls, or remote campuses with zero network reception.'
  },
  {
    id: 'faq3',
    question: 'How does the Attendance Eligibility Calculator work?',
    answer: 'You can define your college or school\'s minimum attendance requirement (e.g., 75%). For each subject, the calculator evaluates your present/absent logs. It tells you exactly how many upcoming lectures you can safely skip while staying above the limit, or precisely how many consecutive lectures you need to attend if you are currently ineligible.'
  },
  {
    id: 'faq4',
    question: 'Is my academic and attendance data safe?',
    answer: 'Absolutely. We do not host your personal records on central cloud servers. Everything—from your subjects and lecture hours to your class notes—is stored locally in private application files on your mobile device.'
  },
  {
    id: 'faq5',
    question: 'Can I set up custom timetables and reminders?',
    answer: 'Yes! You can configure a customized, repeating timetable for every day of the week, including lecture duration and room numbers. You can also turn on smart alerts that prompt you to check in exactly when the lecture schedule ends.'
  },
  {
    id: 'faq6',
    question: 'Can I track statistics across multiple semesters?',
    answer: 'Yes. You can archive past semesters, reset subjects, and start fresh terms, while keeping a secure history of your overall multi-semester performance available for reference.'
  }
];

export const COMPARISONS: ProblemSolution[] = [
  {
    id: 'comp1',
    problemTitle: 'Forgetting Lecture Counts',
    problemDesc: 'Losing track of your total classes and making wild guesses before exam eligibility checks.',
    solutionTitle: 'Single-Tap Class Logging',
    solutionDesc: 'A unified logging hub that updates subject ratios instantly. Your exact numbers are always one tap away.',
    icon: 'BrainCircuit'
  },
  {
    id: 'comp2',
    problemTitle: 'Complex Eligibility Math',
    problemDesc: 'Frantically calculated fractions on paper, trying to figure out if you can safely miss Friday\'s class.',
    solutionTitle: 'Smart Skip & Goal Estimator',
    solutionDesc: 'Automatic calculation that answers: "Yes, you can miss 2 more classes" or "No, you must attend 3 consecutive sessions".',
    icon: 'Percent'
  },
  {
    id: 'comp3',
    problemTitle: 'Scattered Lecture Schedules',
    problemDesc: 'Timetables stored in screenshots, pinned group chats, or messy student portals.',
    solutionTitle: 'In-App Live Timetable',
    solutionDesc: 'An elegant schedule calendar showing ongoing classes, upcoming locations, and real-time reminders.',
    icon: 'CalendarDays'
  },
  {
    id: 'comp4',
    problemTitle: 'Data Privacy Risks',
    problemDesc: 'Signing up on clunky portals that track your location and monetize your academic details.',
    solutionTitle: '100% Offline and Private',
    solutionDesc: 'No external databases, no sign-ins, and no advertising. Your academic life stays on your device.',
    icon: 'Lock'
  }
];
