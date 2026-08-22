import { useState } from 'react';
import { Layers, Target, FileCheck, Box, Ruler, Zap } from 'lucide-react';

const services = [
  {
    id: '01',
    icon: Layers,
    color: '#39C3FF',
    title: 'BIM Coordination',
    description: 'Coordinate Architectural, Structural and MEP disciplines within a controlled federated workflow.',
    features: ['Federated model coordination', 'Discipline alignment', 'Multidisciplinary reviews', 'Coordination workflows'],
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?crop=entropy&cs=srgb&fm=jpg&q=85',
  },
  {
    id: '02',
    icon: Target,
    color: '#FF7A1A',
    title: 'Clash Detection & Issue Review',
    description: 'Identify, prioritise and communicate meaningful coordination conflicts.',
    features: ['Clash detection', 'Priority filtering', 'Issue assignment', 'Coordination reporting', 'Issue follow-up'],
    image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?crop=entropy&cs=srgb&fm=jpg&q=85',
  },
  {
    id: '03',
    icon: FileCheck,
    color: '#43D17A',
    title: 'BIM QA/QC & Model Validation',
    description: 'Review model quality, consistency and information reliability.',
    features: ['Naming checks', 'Classification review', 'Property validation', 'Model compliance', 'QA/QC reporting'],
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?crop=entropy&cs=srgb&fm=jpg&q=85',
  },
  {
    id: '04',
    icon: Box,
    color: '#39C3FF',
    title: '4D/5D BIM Support',
    description: 'Connect BIM information with project sequencing, quantities and cost-related workflows.',
    features: ['Construction sequence support', 'Quantity take-off', 'Phasing', 'Cost planning support'],
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?crop=entropy&cs=srgb&fm=jpg&q=85',
  },
  {
    id: '05',
    icon: Ruler,
    color: '#7DE0FF',
    title: 'COBie & Information Management',
    description: 'Review and structure asset and project information for reliable digital delivery.',
    features: ['COBie validation', 'Asset information review', 'Model data consistency', 'Structured information delivery'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=srgb&fm=jpg&q=85',
  },
  {
    id: '06',
    icon: Zap,
    color: '#164B78',
    title: 'On-Demand BIM Support',
    description: 'Flexible remote BIM capacity when project teams experience demanding workloads or deadlines.',
    features: ['Temporary BIM support', 'Urgent coordination', 'QA/QC reviews', 'Additional project capacity'],
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?crop=entropy&cs=srgb&fm=jpg&q=85',
  },
];

const Services = () => {
  const [active, setActive] = useState(0);
  const service = services[active];
  const Icon = service.icon;

  return (
    <section
      id="services"
      data-testid="services-section"
      className="min-h-screen flex flex-col justify-center py-28 relative overflow-hidden"
      style={{ background: '#04070B' }}
    >
      <div className="absolute inset-0 pointer-events-none blueprint-bg opacity-30" />
      <div
        className="absolute pointer-events-none"
        style={{ top: '-10%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(57,195,255,0.08) 0%, transparent 65%)' }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 relative z-10 w-full">
        <span className="text-white/50 text-xs font-light tracking-[0.2em] uppercase mb-6 block">
          What We Deliver
        </span>
        <h2 className="font-instrument-serif text-5xl sm:text-6xl md:text-7xl leading-[1.02] text-white mb-20 max-w-3xl">
          Digital coordination built around project delivery.
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Left: service list */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            {services.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActive(i)}
                className="text-left py-6 border-b border-white/10 transition-colors duration-200"
              >
                <div className="flex items-baseline gap-5">
                  <span
                    className="font-mono text-xs transition-colors duration-200"
                    style={{ color: active === i ? s.color : 'rgba(255,255,255,0.3)' }}
                  >
                    {s.id}
                  </span>
                  <span
                    className="text-xl md:text-2xl font-light transition-colors duration-200"
                    style={{ color: active === i ? '#F7F9FB' : 'rgba(247,249,251,0.45)' }}
                  >
                    {s.title}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Right: active service detail */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden mb-10">
              <img src={service.image} alt={service.title} className="w-full h-full object-cover" style={{ filter: 'brightness(0.6) saturate(0.9)' }} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(4,7,11,0.1) 0%, rgba(4,7,11,0.75) 100%)' }} />
              <div
                className="absolute top-6 left-6 w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: `${service.color}22`, border: `1px solid ${service.color}55` }}
              >
                <Icon size={22} style={{ color: service.color }} />
              </div>
            </div>

            <p className="text-white/70 text-lg md:text-xl font-light leading-relaxed mb-10">
              {service.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {service.features.map((feat) => (
                <div key={feat} className="flex items-center gap-3">
                  <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: service.color }} />
                  <span className="text-white/55 text-sm font-light">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
