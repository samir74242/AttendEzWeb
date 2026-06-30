/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Trust from './components/Trust';
import Features from './components/Features';
import InteractiveShowcase from './components/InteractiveShowcase';
import WhyAttendEz from './components/WhyAttendEz';
import Statistics from './components/Statistics';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import DownloadSection from './components/Download';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'admin'>(() => {
    return window.location.hash === '#admin' ? 'admin' : 'landing';
  });

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setCurrentView('admin');
      } else {
        setCurrentView('landing');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleCloseAdmin = () => {
    window.location.hash = '';
    setCurrentView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentView === 'admin') {
    return <AdminDashboard onClose={handleCloseAdmin} />;
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-primary-text selection:bg-brand-primary/20 selection:text-brand-primary">
      {/* Premium Sticky Navigation Bar */}
      <Navbar />

      <main>
        {/* Full Viewport Interactive Hero Section */}
        <Hero />

        {/* Quality Badges / Trust indicators */}
        <Trust />

        {/* Modular Features Grid (Dynamic Filter Category Tabs) */}
        <Features />

        {/* Live Interactive Phone App Showcase */}
        <InteractiveShowcase />

        {/* Problems Faced vs Solution Splitted Layout */}
        <WhyAttendEz />

        {/* Big numbers & statistical targets */}
        <Statistics />

        {/* Student Testimonials */}
        <Testimonials />

        {/* FAQs Accordion */}
        <FAQ />

        {/* Final royal gradient Download Banner CTA */}
        <DownloadSection />
      </main>

      {/* Brand Footer with Sameer Pandey's Signature */}
      <Footer />
    </div>
  );
}
