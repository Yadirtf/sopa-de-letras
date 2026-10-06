import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AuthShowcaseSection } from './components/AuthShowcaseSection';
import { FeaturesSection } from './components/FeaturesSection';
import { HowItWorks } from './components/HowItWorks';
import { CatalogPreview } from './components/CatalogPreview';
import { LeaderboardPreview } from './components/LeaderboardPreview';
import { CtaBanner } from './components/CtaBanner';
import { Footer } from './components/Footer';
import { AuthModal } from './components/auth/AuthModal';
import { UserProfileModal } from './components/auth/UserProfileModal';
import { ToastContainer } from './components/ToastContainer';
import { QaStatusBar } from './components/QaStatusBar';

export default function App() {
  return (
    <AuthProvider>
      <div className="wordhive-app">
        <Navbar />
        <main id="main-content">
          <Hero />
          <AuthShowcaseSection />
          <FeaturesSection />
          <HowItWorks />
          <CatalogPreview />
          <LeaderboardPreview />
          <CtaBanner />
        </main>
        <Footer />

        {/* Modales y utilidades flotantes */}
        <AuthModal />
        <UserProfileModal />
        <ToastContainer />
        <QaStatusBar />
      </div>
    </AuthProvider>
  );
}
