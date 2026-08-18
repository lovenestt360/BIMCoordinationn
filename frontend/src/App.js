import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useGlobalScrollReveal } from "./hooks/useScrollReveal";
import ScrollProgress from "./components/ScrollProgress";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Services from "./components/Services";
import Process from "./components/Process";
import Portfolio from "./components/Portfolio";
import MeetingScheduler from "./components/MeetingScheduler";
import FAQ from "./components/FAQ";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import FloatingContact from "./components/FloatingContact";
import { Toaster } from "./components/ui/sonner";

const LandingPage = () => {
  useGlobalScrollReveal();

  return (
    <div data-testid="landing-page" className="min-h-screen bg-[#020617]">
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Process />
        <Portfolio />
        <MeetingScheduler />
        <FAQ />
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
