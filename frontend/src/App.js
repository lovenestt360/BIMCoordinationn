import "@/App.css";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import gsap from "gsap";
import { captureAttribution } from "./lib/attribution";

// Captured once per page load so cold-email UTM/role/pain params are
// available to any form or tracking call for the rest of the session,
// regardless of which route the visitor lands on.
captureAttribution();

// Motion is reserved for the scroll-driven 3D story. Legacy GSAP transitions in
// the remaining marketing sections resolve immediately while state changes work.
gsap.globalTimeline.timeScale(1000000);
import Navbar from "./components/Navbar";
import KlyronScrollStory from "./components/KlyronScrollStory/KlyronScrollStory";
import Portfolio from "./components/Portfolio";
import Deliverables from "./components/Deliverables";
import OnDemandSupport from "./components/OnDemandSupport";
import Process from "./components/Process";
import About from "./components/About";
import MeetingScheduler from "./components/MeetingScheduler";
import FAQ from "./components/FAQ";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import FloatingContact from "./components/FloatingContact";
import { Toaster } from "./components/ui/sonner";
import LandingPageVariant from "./pages/LandingPage";

const LandingPage = () => {
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
      <main id="top">
        <KlyronScrollStory />
        <div className="digital-continuation">
          <Portfolio />
          <Deliverables />
          <OnDemandSupport />
          <Process />
          <About />
          <MeetingScheduler />
          <FAQ />
          <Contact />
        </div>
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
