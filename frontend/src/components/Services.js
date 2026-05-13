import { Layers, Box, Ruler, FileCheck, Zap, Target } from 'lucide-react';

const Services = () => {
  const services = [
    {
      id: '01',
      icon: Layers,
      title: 'BIM Coordination',
      description: 'Coordination of architectural, structural, and MEP BIM models to improve model alignment, reduce design conflicts, and support construction-ready project delivery.',
      features: [
        'Review architectural, structural, and MEP models',
        'Create and manage federated models',
        'Check model alignment between disciplines',
        'Review coordination issues with project teams',
        'Support weekly or periodic coordination workflows',
      ],
    },
    {
      id: '02',
      icon: Target,
      title: 'Clash Detection & Issue Review',
      description: 'Detection and review of model conflicts before construction begins, helping project teams reduce rework, delays, and coordination risks on site.',
      features: [
        'Run clash detection in Navisworks',
        'Review hard clashes and clearance issues',
        'Separate real clashes from false or low-priority clashes',
        'Group clash results by discipline, zone, or priority',
        'Prepare clash reports with screenshots and comments',
      ],
    },
    {
      id: '03',
      icon: FileCheck,
      title: 'BIM QA/QC & Model Validation',
      description: 'Model quality review focused on checking whether BIM models are accurate, consistent, properly classified, and ready for coordination or project delivery.',
      features: [
        'Check model naming, classification, and element organization',
        'Review property sets and model information',
        'Validate model quality using Solibri',
        'Identify missing or inconsistent information',
        'Prepare QA/QC reports and validation comments',
      ],
    },
    {
      id: '04',
      icon: Box,
      title: '4D/5D BIM Support',
      description: 'BIM-based planning and cost support that connects model information with construction sequencing, quantity take-off, and cost understanding.',
      features: [
        'Link model elements to construction activities',
        'Create 4D construction simulations',
        'Review project sequence and phasing',
        'Extract quantities from BIM models',
        'Prepare quantity and cost breakdowns using Bexel Manager',
      ],
    },
    {
      id: '05',
      icon: Ruler,
      title: 'COBie & Information Management',
      description: 'Support for structured BIM data delivery by reviewing asset information, model data, and information requirements where applicable.',
      features: [
        'Review asset information in BIM models',
        'Check COBie-related data fields',
        'Identify missing or incomplete asset information',
        'Support structured information delivery',
        'Review model data consistency',
      ],
    },
    {
      id: '06',
      icon: Zap,
      title: 'On-Demand BIM Support',
      description: 'Flexible BIM support for teams that need additional coordination capacity during deadlines, urgent submissions, or peak project workload.',
      features: [
        'Urgent clash detection support',
        'Short-term model review assistance',
        'Remote BIM coordination support',
        'Fast QA/QC review of submitted models',
        'Support during peak project workload',
      ],
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
                className="sr-hidden tech-card-hover rounded-sm bg-[#020617] p-6"
              >
                {/* Service ID */}
                <span className="font-mono text-xs text-[#22D3EE] mb-4 block opacity-60">
                  {service.id}
                </span>

                {/* Icon */}
                <div className="card-icon w-12 h-12 rounded-sm bg-[#1E293B] flex items-center justify-center mb-4 transition-all duration-300">
                  <Icon size={24} className="text-[#0EA5E9] transition-colors duration-300" />
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
                      <div className="w-1.5 h-1.5 bg-[#22D3EE] rounded-full flex-shrink-0" />
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
