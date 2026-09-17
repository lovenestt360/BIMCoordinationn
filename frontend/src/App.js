import "@/App.css";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import gsap from "gsap";
import { useGlobalScrollReveal } from "./hooks/useScrollReveal";
import { captureAttribution } from "./lib/attribution";

// Captured once per page load so cold-email UTM/role/pain params are
// available to any form or tracking call for the rest of the session,
// regardless of which route the visitor lands on.
captureAttribution();

// GSAP tweens are driven by JS, not CSS, so the prefers-reduced-motion rules in
// App.css can't reach them. Collapsing the global timeline makes every GSAP
// entrance/scroll animation resolve near-instantly for users who asked for less motion,
// without having to thread a check through every component.
if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  gsap.globalTimeline.timeScale(200);
}
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import CredibilityStrip from "./components/CredibilityStrip";
import WhyBimCoordination from "./components/WhyBimCoordination";
import ModelFederation from "./components/ModelFederation";
import ClashDetectionSection from "./components/ClashDetectionSection";
import Portfolio from "./components/Portfolio";
import Services from "./components/Services";
import Deliverables from "./components/Deliverables";
import OnDemandSupport from "./components/OnDemandSupport";
import Process from "./components/Process";
import WhyKlyron from "./components/WhyKlyron";
import About from "./components/About";
import QAQCSection from "./components/QAQCSection";
import BimToConstruction from "./components/BimToConstruction";
import MeetingScheduler from "./components/MeetingScheduler";
import WhatHappensNext from "./components/WhatHappensNext";
import FAQ from "./components/FAQ";
import FinalCTA from "./components/FinalCTA";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import FloatingContact from "./components/FloatingContact";
import { Toaster } from "./components/ui/sonner";
import LandingPageVariant from "./pages/LandingPage";

const LandingPage = () => {
  useGlobalScrollReveal();

  useEffect(() => {
    // Landing pages redirect here as e.g. "/#about" when a section only
    // exists on the homepage. A plain browser navigation tries to scroll to
    // that hash before React has actually rendered the section, so it
    // silently lands at the top instead — wait a beat for render, then try.
    if (window.location.hash) {
      const id = window.location.hash;
      const timer = setTimeout(() => {
        document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, []);

  return (
    <div data-testid="landing-page" className="min-h-screen bg-[#04070B]">
      <Navbar />
      <main>
        <Hero />
        <CredibilityStrip />
        <WhyBimCoordination />
        <ModelFederation />
        <ClashDetectionSection />
        <Portfolio />
        <Services />
        <Deliverables />
        <OnDemandSupport />
        <Process />
        <WhyKlyron />
        <QAQCSection />
        <About />
        <BimToConstruction />
        <MeetingScheduler />
        <WhatHappensNext />
        <FAQ />
        <FinalCTA />
        <Contact />
      </main>
      <Footer />
      <FloatingContact />
      <Toaster position="bottom-right" />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/en/bim-managers" element={<LandingPageVariant variantKey="bimManagers" />} />
          {/* Alias: the master brief originally named this page "bim-support" */}
          <Route path="/en/bim-support" element={<LandingPageVariant variantKey="bimManagers" />} />
          <Route path="/en/contractors" element={<LandingPageVariant variantKey="contractors" />} />
          <Route path="/en/clash-coordination" element={<LandingPageVariant variantKey="clashCoordination" />} />
          <Route path="/en/model-qa-qc" element={<LandingPageVariant variantKey="modelQaQc" />} />
          <Route path="/en/preconstruction" element={<LandingPageVariant variantKey="preconstruction" />} />
          <Route path="/en/digital-delivery" element={<LandingPageVariant variantKey="digitalDelivery" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
