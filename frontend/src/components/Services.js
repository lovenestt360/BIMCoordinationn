import { Layers, Box, Ruler, FileCheck, Zap, Target } from 'lucide-react';

const Services = () => {
  const services = [
    {
      id: '01',
      icon: Target,
      title: 'Clash Detection',
      description: 'Comprehensive analysis of MEP, structural, and architectural models to identify conflicts before construction begins.',
      features: ['Hard Clash Detection', 'Soft Clash Analysis', 'Clearance Checks'],
    },
    {
      id: '02',
      icon: Layers,
      title: 'BIM Coordination',
      description: 'Full coordination of multi-discipline models ensuring seamless integration across all project stakeholders.',
      features: ['Model Integration', 'Federated Models', 'Issue Tracking'],
    },
    {
      id: '03',
      icon: Box,
      title: '4D Scheduling',
      description: 'Time-based visualization of construction sequences to optimize project planning and identify schedule conflicts.',
      features: ['Construction Simulation', 'Sequence Planning', 'Progress Tracking'],
    },
    {
      id: '04',
      icon: Ruler,
      title: 'Constructability Review',
      description: 'Expert analysis of design documents to identify potential construction challenges and optimize buildability.',
      features: ['Design Analysis', 'Risk Assessment', 'Value Engineering'],
    },
    {
      id: '05',
      icon: FileCheck,
      title: 'Quality Assurance',
      description: 'Rigorous quality control processes ensuring model accuracy and compliance with project standards.',
      features: ['Model Audits', 'Standards Compliance', 'Documentation'],
    },
    {
      id: '06',
      icon: Zap,
      title: 'Rapid Response',
      description: 'On-demand clash detection and coordination support for urgent project needs with quick turnaround times.',
      features: ['24-48hr Turnaround', 'Priority Support', 'Emergency Reviews'],
    },
  ];

  return (
    <section
      id="services"
      data-testid="services-section"
      className="py-24 lg:py-32 bg-[#0F172A] relative"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="mb-16">
          <p className="text-[#0EA5E9] font-mono text-sm mb-2" data-testid="services-label">// SERVICES</p>
          <h2 
            data-testid="services-title"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            What We <span className="text-[#0EA5E9]">Deliver</span>
          </h2>
          <p className="text-[#94A3B8] max-w-2xl">
            Comprehensive BIM coordination services designed to eliminate costly construction conflicts 
            and ensure project success.
          </p>
        </div>

        {/* Services Grid */}
        <div 
          data-testid="services-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                data-testid={`service-card-${service.id}`}
                className="tech-card rounded-sm bg-[#020617] p-6 group"
              >
                {/* Service ID */}
                <span className="font-mono text-xs text-[#334155] mb-4 block">
                  {service.id}
                </span>

                {/* Icon */}
                <div className="w-12 h-12 rounded-sm bg-[#1E293B] flex items-center justify-center mb-4 group-hover:bg-[#0EA5E9] transition-colors duration-300">
                  <Icon 
                    size={24} 
                    className="text-[#0EA5E9] group-hover:text-[#0F172A] transition-colors duration-300" 
                  />
                </div>

                {/* Content */}
                <h3 
                  className="text-lg font-bold mb-2"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {service.title}
                </h3>
                <p className="text-[#94A3B8] text-sm mb-4 leading-relaxed">
                  {service.description}
                </p>

                {/* Features */}
                <div className="space-y-2 pt-4 border-t border-[#1E293B]">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-[#22D3EE] rounded-full" />
                      <span className="text-xs text-[#94A3B8]">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div 
          data-testid="services-cta"
          className="mt-16 text-center"
        >
          <p className="text-[#94A3B8] mb-6">
            Need a custom solution for your project?
          </p>
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
