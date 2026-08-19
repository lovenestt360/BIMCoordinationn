import { useEffect, useState } from 'react';

function probeWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    );
  } catch (e) {
    return false;
  }
}

export function useWebGLSupport() {
  const [state, setState] = useState(() => ({
    supported: false,
    reducedMotion: false,
    quality: 'high',
    ready: false,
  }));

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const supported = probeWebGL();
    const lowTier =
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) ||
      window.innerWidth < 768;

    setState({
      supported,
      reducedMotion,
      quality: lowTier ? 'low' : 'high',
      ready: true,
    });
  }, []);

  return state;
}
