import { Award, Building2, CheckCircle } from 'lucide-react';

const About = () => {
  return (
    <section
      id="about"
      data-testid="about-section"
      className="py-24 lg:py-32 blueprint-bg relative">

      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="mb-16">
          <p className="text-[#0EA5E9] font-mono text-sm mb-2" data-testid="about-label">// ABOUT</p>
          <h2
            data-testid="about-title"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}>

            Meet the <span className="text-[#0EA5E9]">Engineer</span>
          </h2>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card - Spans 2 columns */}
          <div
            data-testid="about-profile-card"
            className="lg:col-span-2 tech-card rounded-sm bg-[#0F172A] p-8 flex flex-col md:flex-row gap-8">

            {/* Profile Image */}
            <div className="w-full md:w-64 flex-shrink-0">
              <img
                src="/mario.jpg"
                alt="Mário Quissico Júnior"
                className="w-full h-auto border border-[#1E293B] rounded-sm object-contain"
              />
            </div>
            
            {/* Bio */}
            <div className="flex flex-col justify-center">
              <h3
                data-testid="about-name"
                className="text-2xl font-bold mb-1"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Mário Quissico Júnior


              </h3>
              <p className="text-[#0EA5E9] font-mono text-sm mb-4">Director & BIM Coordinator</p>
              <p className="text-[#94A3B8] leading-relaxed mb-6">Civil Engineer and Director of Klyron Consulting, specialized in BIM Coordination, Clash Detection, Model QA/QC, 4D/5D BIM support, and digital delivery workflows. He delivers high-level coordination that aligns multidisciplinary teams, improves model reliability, validates project information, and supports construction-ready BIM delivery with practical solutions — reducing rework, minimizing delays, and bringing clarity to complex projects.</p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
                  <CheckCircle size={16} className="text-[#22D3EE]" />
                  <span>Navisworks Expert</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
                  <CheckCircle size={16} className="text-[#22D3EE]" />
                  <span>Revit Certified</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
                  <CheckCircle size={16} className="text-[#22D3EE]" />
                  <span>Autodesk Construction Cloud Expert</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
                  <CheckCircle size={16} className="text-[#22D3EE]" />
                  <span>Solibri Certified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div
            data-testid="about-stats-card"
            className="tech-card rounded-sm bg-[#0F172A] p-8 flex flex-col justify-center">

            <div className="space-y-8">
              <div>
                <p className="font-mono text-4xl font-bold text-[#0EA5E9]" data-testid="stat-experience">2+</p>
                <p className="text-[#94A3B8] text-sm mt-1">Years of Experience</p>
              </div>
              <div className="border-t border-[#1E293B] pt-8">
                <p className="font-mono text-4xl font-bold text-[#22D3EE]" data-testid="stat-projects">8+</p>
                <p className="text-[#94A3B8] text-sm mt-1">Projects Completed</p>
              </div>
              <div className="border-t border-[#1E293B] pt-8">
                <p className="font-mono text-4xl font-bold text-[#0EA5E9]" data-testid="stat-clashes">20K+</p>
                <p className="text-[#94A3B8] text-sm mt-1">Clashes Resolved</p>
              </div>
            </div>
          </div>

          {/* Mission Card */}
          <div
            data-testid="about-mission-card"
            className="tech-card rounded-sm bg-[#0F172A] p-8">

            <Award size={32} className="text-[#0EA5E9] mb-4" />
            <h4 className="text-lg font-bold mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Our Mission
            </h4>
            <p className="text-[#94A3B8] text-sm leading-relaxed">
              To deliver exceptional BIM coordination services that prevent construction conflicts, 
              reduce costs, and ensure project success through digital precision.
            </p>
          </div>

          {/* Company Card */}
          <div
            data-testid="about-company-card"
            className="lg:col-span-2 tech-card rounded-sm bg-[#0F172A] p-8">

            <Building2 size={32} className="text-[#22D3EE] mb-4" />
            <h4 className="text-lg font-bold mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Klyron Consulting
            </h4>
            <p className="text-[#94A3B8] text-sm leading-relaxed mb-4">
              We partner with architects, engineers, and contractors to ensure seamless 
              project coordination. Our expertise spans residential, commercial, and industrial 
              construction, delivering comprehensive clash detection and BIM coordination services 
              that keep your projects on track and within budget.
            </p>
            <div className="flex flex-wrap gap-3">
              {['Residential', 'Commercial', 'Industrial', 'Healthcare', 'Education'].map((tag) =>
              <span
                key={tag}
                className="px-3 py-1 bg-[#1E293B] rounded-sm text-xs font-mono text-[#94A3B8]">

                  {tag}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>);

};

export default About;