import { useEffect } from 'react';

export function useGlobalScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll('.sr-hidden');
    const continuation = document.querySelector('.digital-continuation');
    const sections = continuation ? continuation.querySelectorAll(':scope > section') : [];
    const cards = continuation
      ? continuation.querySelectorAll('article, .tech-card, .process-card, .dlv-item, .dlv-gallery-item, [data-motion-card]')
      : [];
    const progress = document.createElement('div');
    progress.className = 'drawing-progress';
    progress.setAttribute('aria-hidden', 'true');
    document.body.appendChild(progress);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('sr-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.01, rootMargin: '300px 0px 300px 0px' }
    );

    elements.forEach((el) => observer.observe(el));

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('is-in-view', entry.isIntersecting);
        });
      },
      { threshold: 0.08, rootMargin: '-8% 0px -18% 0px' }
    );

    sections.forEach((section, index) => {
      section.classList.add('motion-section');
      section.style.setProperty('--section-index', index);
      sectionObserver.observe(section);
    });

    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const card = entry.target;
            const delay = Number.parseInt(card.style.getPropertyValue('--card-delay'), 10) || 0;
            const fromX = card.dataset.motionDirection === 'left' ? '-42px' : '42px';
            const fromRotate = card.dataset.motionDirection === 'left' ? '-1.8deg' : '1.8deg';
            const animation = card.animate(
              [
                { opacity: 0, transform: `translate3d(${fromX}, 72px, 0) rotate(${fromRotate}) scale(.96)`, filter: 'blur(8px)' },
                { opacity: 0.72, transform: `translate3d(${fromX === '-42px' ? '5px' : '-5px'}, 8px, 0) rotate(0deg) scale(.995)`, filter: 'blur(1px)', offset: 0.72 },
                { opacity: 1, transform: 'translateY(0) scale(1)', filter: 'blur(0)' },
              ],
              { duration: 900, delay, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' }
            );
            animation.onfinish = () => {
              card.classList.add('is-revealed');
              animation.cancel();
            };
            cardObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -12% 0px' }
    );

    cards.forEach((card, index) => {
      card.classList.add('motion-card');
      card.dataset.motionDirection = index % 2 === 0 ? 'left' : 'right';
      card.style.setProperty('--card-delay', `${(index % 4) * 65}ms`);
      cardObserver.observe(card);
    });

    let frame = null;
    const updateProgress = () => {
      frame = null;
      if (!continuation) return;
      const rect = continuation.getBoundingClientRect();
      const travel = Math.max(1, continuation.offsetHeight - window.innerHeight);
      const value = Math.min(1, Math.max(0, -rect.top / travel));
      progress.style.setProperty('--drawing-progress', value);
      progress.classList.toggle('is-active', rect.top <= 0 && rect.bottom >= window.innerHeight);

      cards.forEach((card) => {
        if (!card.classList.contains('is-revealed')) return;
        const cardRect = card.getBoundingClientRect();
        if (cardRect.bottom < 0 || cardRect.top > window.innerHeight) return;
        const cardOffset = (cardRect.top + cardRect.height / 2 - window.innerHeight / 2) / window.innerHeight;
        card.style.setProperty('--card-float', `${Math.max(-7, Math.min(7, cardOffset * -10))}px`);
      });

      sections.forEach((section) => {
        const sectionRect = section.getBoundingClientRect();
        if (sectionRect.bottom < 0 || sectionRect.top > window.innerHeight) return;
        const sectionOffset = (sectionRect.top + sectionRect.height / 2 - window.innerHeight / 2) / window.innerHeight;
        section.style.setProperty('--section-drift', `${Math.max(-34, Math.min(34, sectionOffset * -18))}px`);
      });
    };

    const onScroll = () => {
      if (frame === null) frame = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      observer.disconnect();
      sectionObserver.disconnect();
      cardObserver.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame !== null) window.cancelAnimationFrame(frame);
      progress.remove();
    };
  }, []);
}
