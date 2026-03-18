import { useState } from 'react';
import { ExternalLink, MapPin, Users, CheckCircle } from 'lucide-react';

const Portfolio = () => {
  const [activeProject, setActiveProject] = useState(0);

  const projects = [
    {
      id: 1,
      title: 'Metropolitan Tower Complex',
      category: 'Commercial',
      location: 'São Paulo, Brazil',
      client: 'Apex Developers',
      clashesResolved: '2,450+',
      image: 'https://images.unsplash.com/photo-1760482736887-b4ac5d6db04b?crop=entropy&cs=srgb&fm=jpg&q=85',
      description: 'Full BIM coordination for a 45-story mixed-use tower including MEP, structural, and architectural clash detection.',
      scope: ['MEP Coordination', 'Structural Analysis', 'Facade Integration'],
    },
    {
      id: 2,
      title: 'Regional Medical Center',
      category: 'Healthcare',
      location: 'Maputo, Mozambique',
      client: 'HealthBuild Corp',
      clashesResolved: '3,200+',
      image: 'https://images.unsplash.com/photo-1772442198624-4fc4d7281e89?crop=entropy&cs=srgb&fm=jpg&q=85',
      description: 'Complex healthcare facility coordination with critical MEP routing for medical equipment and patient safety systems.',
      scope: ['Medical Gas Systems', 'HVAC Optimization', 'Equipment Clearances'],
    },
    {
      id: 3,
      title: 'Industrial Manufacturing Plant',
      category: 'Industrial',
      location: 'Lisbon, Portugal',
      client: 'EuroManu Industries',
      clashesResolved: '1,850+',
      image: 'https://images.unsplash.com/photo-1655696644743-972ed99b89f7?crop=entropy&cs=srgb&fm=jpg&q=85',
      description: 'Large-scale industrial facility with heavy machinery integration and specialized ventilation requirements.',
      scope: ['Process Piping', 'Crane Clearances', 'Utility Routing'],
    },
  ];

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
            A selection of our recent BIM coordination projects showcasing our expertise across various sectors.
          </p>
        </div>

        {/* Portfolio Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Project Display */}
          <div 
            data-testid="portfolio-main-display"
            className="tech-card rounded-sm overflow-hidden bg-[#0F172A]"
          >
            <div 
              className="h-64 lg:h-80 bg-cover bg-center relative"
              style={{ backgroundImage: `url(${projects[activeProject].image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="px-3 py-1 bg-[#0EA5E9] text-[#0F172A] text-xs font-mono rounded-sm">
                  {projects[activeProject].category}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 
                data-testid="portfolio-project-title"
                className="text-xl font-bold mb-2"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {projects[activeProject].title}
              </h3>
              <p className="text-[#94A3B8] text-sm mb-4">
                {projects[activeProject].description}
              </p>
              
              {/* Project Details */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={16} className="text-[#0EA5E9]" />
                  <span className="text-[#94A3B8]">{projects[activeProject].location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users size={16} className="text-[#0EA5E9]" />
                  <span className="text-[#94A3B8]">{projects[activeProject].client}</span>
                </div>
              </div>

              {/* Clashes Resolved */}
              <div className="flex items-center gap-2 p-3 bg-[#1E293B] rounded-sm mb-4">
                <CheckCircle size={20} className="text-[#22D3EE]" />
                <span className="text-sm text-[#94A3B8]">Clashes Resolved:</span>
                <span className="font-mono font-bold text-[#22D3EE]">{projects[activeProject].clashesResolved}</span>
              </div>

              {/* Scope Tags */}
              <div className="flex flex-wrap gap-2">
                {projects[activeProject].scope.map((item, idx) => (
                  <span 
                    key={idx}
                    className="px-2 py-1 border border-[#334155] rounded-sm text-xs text-[#94A3B8]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Project List */}
          <div 
            data-testid="portfolio-project-list"
            className="space-y-4"
          >
            {projects.map((project, index) => (
              <button
                key={project.id}
                data-testid={`portfolio-project-${project.id}`}
                onClick={() => setActiveProject(index)}
                className={`w-full tech-card rounded-sm p-4 flex gap-4 text-left transition-all duration-300 ${
                  activeProject === index 
                    ? 'border-[#0EA5E9] bg-[#0F172A]' 
                    : 'bg-[#0F172A] hover:border-[#334155]'
                }`}
              >
                <div 
                  className="w-20 h-20 flex-shrink-0 rounded-sm bg-cover bg-center"
                  style={{ backgroundImage: `url(${project.image})` }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-[#334155]">0{project.id}</span>
                    <span className="text-xs text-[#0EA5E9]">{project.category}</span>
                  </div>
                  <h4 
                    className="font-bold mb-1"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {project.title}
                  </h4>
                  <p className="text-xs text-[#94A3B8]">{project.location}</p>
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
