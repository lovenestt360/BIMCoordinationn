import { useEffect, useRef, useState } from 'react';
import { useWebGLSupport } from '../../hooks/useWebGLSupport';

// Deliberately imports NOTHING from 'three'/'@react-three/fiber'/'@react-three/drei' —
// those only exist inside the modules loaded via `sceneImport()`, so the ~600KB+ 3D
// runtime never enters the main bundle. Each lazy-loaded scene owns its own <Canvas>.
export default function CanvasWrapper({ sceneImport, fallback, className, canvasProps, sceneProps }) {
  const containerRef = useRef(null);
  const { supported, reducedMotion, quality, ready } = useWebGLSupport();
  const [isNear, setIsNear] = useState(false);
  const [SceneComponent, setSceneComponent] = useState(null);

  const canRender3D = ready && supported && !reducedMotion;

  useEffect(() => {
    if (!canRender3D || !containerRef.current) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setIsNear(entry.isIntersecting));
      },
      { rootMargin: '400px 0px 400px 0px', threshold: 0 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [canRender3D]);

  useEffect(() => {
    if (!canRender3D || !isNear || SceneComponent) return undefined;

    let cancelled = false;
    sceneImport().then((mod) => {
      if (!cancelled) setSceneComponent(() => mod.default);
    });
    return () => {
      cancelled = true;
    };
  }, [canRender3D, isNear, SceneComponent, sceneImport]);

  if (!ready) {
    return <div ref={containerRef} className={className} />;
  }

  if (!canRender3D) {
    return (
      <div ref={containerRef} className={className}>
        {fallback}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className}>
      {isNear && SceneComponent ? (
        <SceneComponent quality={quality} canvasProps={canvasProps} {...sceneProps} />
      ) : (
        fallback
      )}
    </div>
  );
}
