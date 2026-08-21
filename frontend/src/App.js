import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useGlobalScrollReveal } from "./hooks/useScrollReveal";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import WhyBimCoordination from "./components/WhyBimCoordination";
import ModelFederation from "./components/ModelFederation";
import ClashDetectionSection from "./components/ClashDetectionSection";
import Services from "./components/Services";
import Process from "./components/Process";
import WhyKlyron from "./components/WhyKlyron";
import OnDemandSupport from "./components/OnDemandSupport";
import About from "./components/About";
import Portfolio from "./components/Portfolio";
import QAQCSection from "./components/QAQCSection";
import BimToConstruction from "./components/BimToConstruction";
import MeetingScheduler from "./components/MeetingScheduler";
import FAQ from "./components/FAQ";
import FinalCTA from "./components/FinalCTA";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import FloatingContact from "./components/FloatingContact";
import { Toaster } from "./components/ui/sonner";

const LandingPage = () => {
  useGlobalScrollReveal();

  return (
    <div data-testid="landing-page" className="min-h-screen bg-[#04070B]">
      <Navbar />
      <main>
        <Hero />
        <WhyBimCoordination />
        <ModelFederation />
        <ClashDetectionSection />
        <Services />
        <Process />
        <WhyKlyron />
        <OnDemandSupport />
        <About />
        <Portfolio />
        <QAQCSection />
        <BimToConstruction />
        <MeetingScheduler />
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
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
