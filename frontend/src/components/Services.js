import { Layers, Target, FileCheck, Box, Ruler, Zap } from 'lucide-react';

const services = [
  {
    id: '01',
    icon: Layers,
    color: '#0EA5E9',
    title: 'BIM Coordination',
    description: 'Coordination of architectural, structural, and MEP BIM models to align disciplines and support construction-ready project delivery.',
    features: ['Federated model setup & review', 'Discipline alignment checks', 'Weekly coordination workflows'],
    // Real BIM coordination model — MEP, structural, architectural systems
    image: '/projects/mental-health-unit.jpg',
  },
  {
    id: '02',
    icon: Target,
    color: '#22D3EE',
    title: 'Clash Detection & Issue Review',
    description: 'Detection and structured review of model conflicts before construction, helping teams reduce rework and coordination risks on site.',
    features: ['Clash detection in Navisworks', 'Priority clash classification', 'Structured reports with screenshots'],
    // Complex MEP/structural installation — overlapping systems typical of clash scenarios
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?crop=entropy&cs=srgb&fm=jpg&q=85',
  },
  {
    id: '03',
    icon: FileCheck,
    color: '#0EA5E9',
    title: 'BIM QA/QC & Model Validation',
    description: 'Model quality review checking accuracy, classification, property sets, and readiness for coordination or project delivery.',
    features: ['Solibri model validation', 'Naming & classification audit', 'QA/QC reports & comments'],
    // Real project building model — actual QA/QC and validation work performed
    image: '/projects/school-project.jpg',
  },
  {
    id: '04',
    icon: Box,
    color: '#22D3EE',
    title: '4D/5D BIM Support',
    description: 'BIM-based planning connecting model data with construction sequencing, quantity take-off, and cost support using Bexel Manager.',
    features: ['4D construction simulations', 'Quantity take-off from models', 'Cost breakdowns & phasing'],
    // Real 3D structural BIM model — quantity take-off and sequencing work
    image: '/projects/water-supply-system.jpg',
  },
  {
    id: '05',
    icon: Ruler,
    color: '#0EA5E9',
    title: 'COBie & Information Management',
    description: 'Structured BIM data delivery support — reviewing asset information, COBie fields, and model data consistency for information requirements.',
    features: ['COBie data field review', 'Asset information check', 'Structured delivery support'],
    // Technical data/information management — structured asset data and records
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?crop=entropy&cs=srgb&fm=jpg&q=85',
  },
  {
    id: '06',
    icon: Zap,
    color: '#22D3EE',
    title: 'On-Demand BIM Support',
    description: 'Flexible BIM support for teams needing extra coordination capacity during deadlines, urgent submissions, or peak workload periods.',
    features: ['Urgent clash detection support', 'Fast QA/QC model review', 'Remote BIM coordination'],
    // Remote professional working — represents flexible remote BIM support
    image: 'https://images.unsplash.com/photo-1664575602554-2087b04935a5?crop=entropy&cs=srgb&fm=jpg&q=85',
  },
];

const Services = () => {
  return (
    <section
      id="services"
      data-testid="services-section"
      className="py-24 lg:py-32 relative"
      style={{ background: '#0B1220' }}
    >
      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(14,165,233,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.03) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }} />
      {/* Ambient top glow */}
      <div className="absolute pointer-events-none" style={{
        top: 0, left: '30%', width: '500px', height: '300px',
        background: 'radial-gradient(ellipse, rgba(14,165,233,0.07) 0%, transparent 70%)',
      }} />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="sr-hidden mb-14">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[#0EA5E9] font-mono text-sm" data-testid="services-label">// SERVICES</span>
            <div className="h-px flex-1 max-w-[60px]" style={{ background: 'linear-gradient(90deg, rgba(14,165,233,0.5), transparent)' }} />
          </div>
          <h2
            data-testid="services-title"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            What We <span style={{
              background: 'linear-gradient(90deg, #0EA5E9, #22D3EE)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Deliver</span>
          </h2>
          <p className="text-[#94A3B8] max-w-2xl">
            Six core BIM services — from coordination and clash detection to QA/QC, 4D/5D, and digital delivery — designed to reduce risk and improve model quality before construction begins.
          </p>
        </div>

        {/* Grid */}
        <div
          data-testid="services-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                data-testid={`service-card-${service.id}`}
                className="sr-hidden process-card flex flex-col"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                {/* ── Image area ── */}
                <div className="relative h-48 overflow-hidden flex-shrink-0">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="service-img w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0" style={{
                    background: 'linear-gradient(to bottom, rgba(7,19,32,0.15) 0%, rgba(7,19,32,0.92) 100%)',
                  }} />

                  {/* Ghost number watermark */}
                  <span
                    className="absolute bottom-[-8px] right-2 font-black select-none pointer-events-none"
                    style={{
                      fontSize: '96px',
                      lineHeight: 1,
                      fontFamily: 'Space Grotesk, sans-serif',
                      color: 'rgba(255,255,255,0.05)',
                      letterSpacing: '-4px',
                    }}
                  >
                    {service.id}
                  </span>

                  {/* Step badge – top left */}
                  <div className="absolute top-4 left-4">
                    <span
                      className="font-mono text-xs px-2 py-1 rounded-full font-bold tracking-wider"
                      style={{
                        background: `rgba(14,165,233,0.18)`,
                        border: `1px solid ${service.color}55`,
                        color: service.color,
                      }}
                    >
                      {service.id}
                    </span>
                  </div>

                  {/* Icon – top right */}
                  <div
                    className="service-icon-wrap absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: 'rgba(14,165,233,0.12)',
                      border: `1px solid ${service.color}40`,
                    }}
                  >
                    <Icon size={18} style={{ color: service.color }} />
                  </div>

                  {/* Bottom title strip */}
                  <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
                    <h3
                      className="text-base font-bold text-[#F1F5F9] leading-tight"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      {service.title}
                    </h3>
                  </div>
                </div>

                {/* ── Content area ── */}
                <div className="p-5 flex flex-col flex-1 relative z-10">
                  <p className="text-[#94A3B8] text-sm leading-relaxed mb-5 flex-1">
                    {service.description}
                  </p>

                  {/* 3 features */}
                  <div className="space-y-2 pt-3" style={{ borderTop: '1px solid rgba(14,165,233,0.1)' }}>
                    {service.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div
                          className="feat-dot w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: service.color }}
                        />
                        <span className="text-xs text-[#94A3B8]">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div data-testid="services-cta" className="sr-hidden mt-14 text-center">
          <p className="text-[#64748B] mb-5 text-sm">Need a specific BIM service for your project?</p>
          <a
            href="#contact"
            data-testid="services-contact-btn"
            className="btn-primary px-8 py-3 rounded-sm font-medium inline-block"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Discuss Your Project
          </a>
        </div>
      </div>
    </section>
  );
};

export default Services;
