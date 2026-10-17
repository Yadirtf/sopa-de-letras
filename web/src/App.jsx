import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { NewGameRibbon } from './components/NewGameRibbon';
import { GamesSection } from './components/GamesSection';
import { FeaturesSection } from './components/FeaturesSection';
import { HowItWorks } from './components/HowItWorks';
import { CatalogPreview } from './components/CatalogPreview';
import { PlatformsSection } from './components/PlatformsSection';
import { CtaBanner } from './components/CtaBanner';
import { CreditsSection } from './components/CreditsSection';
import { Footer } from './components/Footer';

/**
 * Landing de WordHive. Presenta los juegos (sopa de letras y La Batalla Más Temida) y lleva a la version web completa
 * (/jugar/), donde estan la cuenta, las salas, los amigos y las partidas.
 */
export default function App() {
  return (
    <div className="wordhive-app">
      <NewGameRibbon />
      <Navbar />
      <main id="main-content">
        <Hero />
        <GamesSection />
        <FeaturesSection />
        <HowItWorks />
        <CatalogPreview />
        <PlatformsSection />
        <CtaBanner />
        <CreditsSection />
      </main>
      <Footer />
    </div>
  );
}
