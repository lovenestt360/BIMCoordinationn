import { useState } from 'react';
import { ExternalLink, MapPin, Users, CheckCircle, Wrench, Tag } from 'lucide-react';

const projects = [
  {
    id: 1,
    number: '01',
    category: 'Healthcare',
    title: 'Mental Health Unit',
    location: 'Australia',
    client: 'Confidential',
    sector: 'Healthcare',
    services: 'BIM Coordination, Clash Detection',
    tools: 'Navisworks, Autodesk Construction Cloud',
    disciplines: 'Architectural, Structural, HVAC, Fire, Plumbing, Electrical',
    delivery: 'Remote BIM Support',
    status: 'Completed',
    description:
      'Multidisciplinary healthcare project focused on BIM coordination, clash detection, federated model review, and ACC-based issue tracking. The work involved reviewing architectural, structural, HVAC, fire, plumbing, and electrical models to support better coordination before construction.',
    highlights: [
      '6+ Disciplines Coordinated',
      '1,000+ Clashes Reviewed',
      'ACC Issue Tracking',
      'Completed Delivery Status',
    ],
    image: '/projects/mental-health-unit.jpg',
    alt: 'Mental Health Unit BIM coordination model showing architectural and MEP systems',
  },
  {
    id: 2,
    number: '02',
    category: 'Education',
    title: 'School Project',
    location: 'Australia',
    client: 'Confidential',
    sector: 'Education',
    services: 'BIM QA/QC, Model Validation',
    tools: 'Solibri, Autodesk Construction Cloud, BCF Workflow',
    disciplines: 'COBie & Model Data Review',
    delivery: 'Remote BIM Support',
    status: 'Completed',
    description:
      'BIM QA/QC and model validation support for an education project, focused on reviewing model consistency, element classification, property sets, and COBie-related information. The work also included structured issue reporting through Solibri, Autodesk Construction Cloud, and BCF-based workflows.',
    highlights: [
      'Solibri Model Validation',
      'COBie Data Review',
      'BCF Issue Reporting',
      'Completed Delivery Status',
    ],
    image: '/projects/school-project.jpg',
    alt: 'School project building used for BIM QA/QC and model validation portfolio card',
  },
  {
    id: 3,
    number: '03',
    category: 'Infrastructure',
    title: 'Water Supply System',
    location: 'Namigonha, Ribáuè District, Mozambique',
    client: 'Confidential',
    sector: 'Infrastructure',
    services: '4D/5D BIM, Quantity Take-Off, Cost Support',
    tools: 'Revit, Bexel Manager',
    disciplines: 'Quantity Take-Off, Cost Estimation, Construction Sequencing',
    delivery: 'BIM-Based Project Support',
    status: 'Completed',
    description:
      'BIM-based planning and cost support for a water supply infrastructure project. The work involved Revit model development, quantity take-off, cost assignment, cost estimation, and 4D/5D workflows using Bexel Manager to support project planning and cost understanding.',
    highlights: [
      '4D/5D BIM Workflow',
      'QTO Quantity Take-Off',
      'Cost Estimation Support',
      'Completed Delivery Status',
    ],
    image: '/projects/water-supply-system.jpg',
    alt: 'Water supply system BIM model showing architectural and structural 3D drawings',
  },
];

const Portfolio = () => {
  const [activeProject, setActiveProject] = useState(0);

  const project = projects[activeProject];

  return (
    <section
      id="portfolio"
      data-testid="portfolio-section"
      className="py-24 lg:py-32 blueprint-bg relative"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="mb-16">
          <p className="text-[#0EA5E9] font-mono text-sm mb-2" data-testid="portfolio-label">// PORTFOLIO</p>
          <h2
            data-testid="portfolio-title"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Featured <span className="text-[#0EA5E9]">Projects</span>
          </h2>
          <p className="text-[#94A3B8] max-w-2xl">
            A selection of BIM coordination, QA/QC, and digital delivery projects showcasing practical model review, clash detection, validation, and 4D/5D support across construction and infrastructure workflows.
          </p>
        </div>

        {/* Portfolio Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Project Display */}
          <div
            data-testid="portfolio-main-display"
            className="tech-card rounded-sm overflow-hidden bg-[#0F172A]"
          >
            {/* Image */}
            <div
              className="h-64 lg:h-80 bg-cover bg-center relative"
              style={{ backgroundImage: `url(${project.image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="px-3 py-1 bg-[#0EA5E9] text-[#0F172A] text-xs font-mono rounded-sm">
                  {project.category}
                </span>
              </div>
              <div className="absolute top-4 right-4">
                <span className="px-2 py-1 bg-[#1E293B] border border-[#334155] text-[#22D3EE] text-xs font-mono rounded-sm">
                  {project.status}
                </span>
              </div>
            </div>

            <div className="p-6">
              <h3
                data-testid="portfolio-project-title"
                className="text-xl font-bold mb-1"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {project.title}
              </h3>

              <div className="flex items-center gap-2 text-sm mb-4">
                <MapPin size={14} className="text-[#0EA5E9]" />
                <span className="text-[#94A3B8]">{project.location}</span>
              </div>

              <p className="text-[#94A3B8] text-sm mb-5 leading-relaxed">
                {project.description}
              </p>

              {/* Project Meta */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-[#1E293B] rounded-sm p-3">
                  <p className="text-[#475569] text-xs font-mono mb-1">CLIENT</p>
                  <p className="text-[#CBD5E1] text-sm font-medium">{project.client}</p>
                </div>
                <div className="bg-[#1E293B] rounded-sm p-3">
                  <p className="text-[#475569] text-xs font-mono mb-1">SECTOR</p>
                  <p className="text-[#CBD5E1] text-sm font-medium">{project.sector}</p>
                </div>
                <div className="bg-[#1E293B] rounded-sm p-3 col-span-2">
                  <p className="text-[#475569] text-xs font-mono mb-1">SERVICES</p>
                  <p className="text-[#CBD5E1] text-sm">{project.services}</p>
                </div>
                <div className="bg-[#1E293B] rounded-sm p-3 col-span-2">
                  <p className="text-[#475569] text-xs font-mono mb-1">TOOLS</p>
                  <p className="text-[#CBD5E1] text-sm">{project.tools}</p>
                </div>
              </div>

              {/* Highlights */}
              <div className="flex flex-wrap gap-2">
                {project.highlights.map((h, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 px-2 py-1 border border-[#334155] rounded-sm">
                    <CheckCircle size={12} className="text-[#22D3EE]" />
                    <span className="text-xs text-[#94A3B8]">{h}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Project List */}
          <div
            data-testid="portfolio-project-list"
            className="space-y-4"
          >
            {projects.map((p, index) => (
              <button
                key={p.id}
                data-testid={`portfolio-project-${p.id}`}
                onClick={() => setActiveProject(index)}
                className={`w-full tech-card rounded-sm p-4 flex gap-4 text-left transition-all duration-300 ${
                  activeProject === index
                    ? 'border-[#0EA5E9] bg-[#0F172A]'
                    : 'bg-[#0F172A] hover:border-[#334155]'
                }`}
              >
                <div
                  className="w-20 h-20 flex-shrink-0 rounded-sm bg-cover bg-center"
                  style={{ backgroundImage: `url(${p.image})` }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-[#334155]">{p.number}</span>
                    <span className={`text-xs ${activeProject === index ? 'text-[#0EA5E9]' : 'text-[#0EA5E9]'}`}>{p.category}</span>
                  </div>
                  <h4
                    className="font-bold mb-1"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {p.title}
                  </h4>
                  <p className="text-xs text-[#94A3B8]">{p.location}</p>
                </div>
                <div className={`flex items-center ${activeProject === index ? 'text-[#0EA5E9]' : 'text-[#334155]'}`}>
                  <ExternalLink size={18} />
                </div>
              </button>
            ))}

            {/* More Projects CTA */}
            <div
              data-testid="portfolio-more-cta"
              className="text-center pt-6 border-t border-[#1E293B]"
            >
              <p className="text-sm text-[#94A3B8] mb-4">
                Want to see more of our work?
              </p>
              <a
                href="#contact"
                data-testid="portfolio-contact-btn"
                className="btn-outline px-6 py-2 rounded-sm text-sm inline-block"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Request Full Portfolio
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
