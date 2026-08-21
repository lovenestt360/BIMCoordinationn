import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, MapPin } from 'lucide-react';
import gsap from 'gsap';

const projects = [
  {
    id: 1,
    number: '01',
    category: 'Healthcare',
    title: 'Mental Health Unit',
    location: 'Australia',
    services: 'BIM Coordination, Clash Detection',
    tools: 'Navisworks, Autodesk Construction Cloud',
    description:
      'Multidisciplinary healthcare project focused on BIM coordination, clash detection, federated model review, and ACC-based issue tracking across architectural, structural, HVAC, fire, plumbing, and electrical models.',
    highlights: ['6+ Disciplines Coordinated', '1,000+ Clashes Reviewed', 'ACC Issue Tracking'],
    image: '/projects/mental-health-unit.jpg',
  },
  {
    id: 2,
    number: '02',
    category: 'Education',
    title: 'School Project',
    location: 'Australia',
    services: 'BIM QA/QC, Model Validation',
    tools: 'Solibri, Autodesk Construction Cloud, BCF',
    description:
      'BIM QA/QC and model validation support focused on reviewing model consistency, element classification, property sets, and COBie-related information through Solibri and BCF-based workflows.',
    highlights: ['Solibri Model Validation', 'COBie Data Review', 'BCF Issue Reporting'],
    image: '/projects/school-project.jpg',
  },
  {
    id: 3,
    number: '03',
    category: 'Infrastructure',
    title: 'Water Supply System',
    location: 'Namigonha, Ribáuè District, Mozambique',
    services: '4D/5D BIM, Quantity Take-Off, Cost Support',
    tools: 'Revit, Bexel Manager',
    description:
      'BIM-based planning and cost support for a water supply infrastructure project — Revit model development, quantity take-off, cost assignment and 4D/5D workflows using Bexel Manager.',
    highlights: ['4D/5D BIM Workflow', 'QTO Quantity Take-Off', 'Cost Estimation Support'],
    image: '/projects/water-supply-system.jpg',
  },
];

const Portfolio = () => {
  const [active, setActive] = useState(0);
  const imgRefs = useRef([]);
  const project = projects[active];

  useEffect(() => {
    imgRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.to(el, { autoAlpha: i === active ? 1 : 0, duration: 0.8, ease: 'power2.out' });
    });
  }, [active]);

  return (
    <section
      id="portfolio"
      data-testid="portfolio-section"
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ background: '#04070B' }}
    >
      {/* Background image stack — crossfades between projects */}
      <div className="absolute inset-0">
        {projects.map((p, i) => (
          <div
            key={p.id}
            ref={(el) => { imgRefs.current[i] = el; }}
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${p.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: i === active ? 1 : 0,
            }}
          />
        ))}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(100deg, rgba(4,7,11,0.92) 0%, rgba(4,7,11,0.55) 45%, rgba(4,7,11,0.8) 100%)' }} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-between px-6 md:px-12 lg:px-16 pt-32 pb-16">
        <div className="max-w-2xl">
          <span className="text-white/50 text-xs font-light tracking-[0.2em] uppercase mb-6 block">Selected Work</span>
          <h2 className="font-instrument-serif text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-white mb-6">
            Coordination across real project environments.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7">
            <span className="text-[#39C3FF] text-xs font-mono tracking-widest uppercase mb-3 block">{project.category}</span>
            <h3 className="font-instrument-serif text-3xl sm:text-4xl text-white mb-3">{project.title}</h3>
            <div className="flex items-center gap-2 text-white/50 text-sm mb-5">
              <MapPin size={14} />
              {project.location}
            </div>
            <p className="text-white/65 text-sm md:text-base font-light leading-relaxed max-w-lg mb-6">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-2 mb-2">
              {project.highlights.map((h) => (
                <span key={h} className="px-3 py-1.5 rounded-full text-xs border border-white/15 text-white/60">
                  {h}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-3">
            {projects.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setActive(i)}
                className="text-left flex items-center gap-4 py-3 border-b transition-colors duration-200"
                style={{ borderColor: active === i ? 'rgba(57,195,255,0.4)' : 'rgba(255,255,255,0.1)' }}
              >
                <span className="font-mono text-xs" style={{ color: active === i ? '#39C3FF' : 'rgba(255,255,255,0.3)' }}>
                  {p.number}
                </span>
                <span className="text-sm md:text-base font-light flex-1" style={{ color: active === i ? '#F7F9FB' : 'rgba(247,249,251,0.45)' }}>
                  {p.title}
                </span>
                <ArrowUpRight size={16} style={{ color: active === i ? '#39C3FF' : 'rgba(255,255,255,0.25)' }} />
              </button>
            ))}

            <a
              href="#contact"
              onClick={(e) => { e.preventDefault(); document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="mt-4 border border-white/25 text-white rounded-full px-6 py-3 text-sm font-medium text-center hover:bg-white/10 transition-colors duration-200"
            >
              Request Full Portfolio
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
