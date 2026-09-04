import { useState } from 'react';
import { Layers, Target, FileCheck, Box, Ruler, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SERVICE_META = [
  { id: '01', icon: Layers, color: '#39C3FF', image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?crop=entropy&cs=srgb&fm=jpg&q=85' },
  { id: '02', icon: Target, color: '#FF7A1A', image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?crop=entropy&cs=srgb&fm=jpg&q=85' },
  { id: '03', icon: FileCheck, color: '#43D17A', image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?crop=entropy&cs=srgb&fm=jpg&q=85' },
  { id: '04', icon: Box, color: '#39C3FF', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?crop=entropy&cs=srgb&fm=jpg&q=85' },
  { id: '05', icon: Ruler, color: '#7DE0FF', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=srgb&fm=jpg&q=85' },
  { id: '06', icon: Zap, color: '#164B78', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?crop=entropy&cs=srgb&fm=jpg&q=85' },
];

const Services = () => {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);

  const items = t('services.items', { returnObjects: true });
  const services = SERVICE_META.map((meta, i) => ({ ...meta, ...items[i] }));
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
          {t('services.eyebrow')}
        </span>
        <h2 className="font-instrument-serif text-5xl sm:text-6xl md:text-7xl leading-[1.02] text-white mb-20 max-w-3xl">
          {t('services.heading')}
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
