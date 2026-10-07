import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FeaturesSection } from './components/FeaturesSection';
import { HowItWorks } from './components/HowItWorks';
import { CatalogPreview } from './components/CatalogPreview';
import { PlatformsSection } from './components/PlatformsSection';
import { CtaBanner } from './components/CtaBanner';
import { Footer } from './components/Footer';

/**
 * Landing de WordHive. Presenta el juego y lleva a la version web completa
 * (/jugar/), donde estan la cuenta, las salas, los amigos y las partidas.
 */
export default function App() {
  return (
    <div className="wordhive-app">
      <Navbar />
      <main id="main-content">
        <Hero />
        <FeaturesSection />
        <HowItWorks />
        <CatalogPreview />
        <PlatformsSection />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
