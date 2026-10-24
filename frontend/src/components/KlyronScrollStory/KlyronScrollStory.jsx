import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { mountKlyronScrollStory } from './storyRuntime';

// modelUrl: where the web model is served from (put klyron-model.glb in /public/models/).
export default function KlyronScrollStory({ modelUrl = '/models/klyron-model.glb' }) {
  const ref = useRef(null);
  const storyRef = useRef(null);
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage?.startsWith('pt') ? 'pt' : 'en';

  useEffect(() => {
    const story = mountKlyronScrollStory(ref.current, { modelUrl, language });
    storyRef.current = story;
    return () => {
      storyRef.current = null;
      story.destroy();
    };
    // Language is updated in place below to preserve the WebGL scene and scroll state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelUrl]);

  useEffect(() => {
    storyRef.current?.setLanguage(language);
  }, [language]);

  const ariaLabel = language === 'pt'
    ? 'Como a Klyron coordena um projeto BIM'
    : 'How Klyron coordinates a BIM project';

  return <section ref={ref} id="bim-story" aria-label={ariaLabel} />;
}
