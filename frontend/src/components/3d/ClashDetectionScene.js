import { Suspense, useCallback, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import BuildingModel from './BuildingModel';
import IssueCardOverlay from './IssueCardOverlay';

const OVERVIEW_POSITION = new THREE.Vector3(0, 2.6, 9);

// Must match the bands in IssueCardOverlay.js — both read the same progressRef/
// scrollYProgress source, so identical breakpoints keep the glow and the card in sync.
const GLOW_IN = [0.25, 0.45];
const COLOR_BANDS = [0.6, 0.7, 0.8];
const RED = new THREE.Color('#EF4444');
const ORANGE = new THREE.Color('#F59E0B');
const GREEN = new THREE.Color('#22C55E');

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

function ClashDetectionSceneContent({ progressRef, scrollYProgress }) {
  const [clashPoint, setClashPoint] = useState(() => new THREE.Vector3(0, 0, 0));
  const glowRef = useRef();
  const mixedColor = useRef(new THREE.Color());
  const { camera } = useThree();

  const handleClashTarget = useCallback((point) => {
    setClashPoint(point);
  }, []);

  useFrame(() => {
    const p = progressRef.current;

    let closeBlend;
    if (p < 0.25) closeBlend = p / 0.25;
    else if (p < 0.8) closeBlend = 1;
    else closeBlend = 1 - (p - 0.8) / 0.2;
    closeBlend = clamp01(closeBlend);

    const flyTarget = new THREE.Vector3(clashPoint.x + 1.6, clashPoint.y + 0.7, clashPoint.z + 2.4);
    camera.position.lerpVectors(OVERVIEW_POSITION, flyTarget, closeBlend);
    camera.lookAt(clashPoint);

    if (glowRef.current) {
      let glowOpacity;
      if (p < GLOW_IN[0]) glowOpacity = 0;
      else if (p < GLOW_IN[1]) glowOpacity = (p - GLOW_IN[0]) / (GLOW_IN[1] - GLOW_IN[0]);
      else glowOpacity = 1;
      glowRef.current.material.opacity = clamp01(glowOpacity) * 0.85;

      if (p < COLOR_BANDS[0]) {
        mixedColor.current.copy(RED);
      } else if (p < COLOR_BANDS[1]) {
        mixedColor.current.copy(RED).lerp(ORANGE, (p - COLOR_BANDS[0]) / (COLOR_BANDS[1] - COLOR_BANDS[0]));
      } else if (p < COLOR_BANDS[2]) {
        mixedColor.current.copy(ORANGE).lerp(GREEN, (p - COLOR_BANDS[1]) / (COLOR_BANDS[2] - COLOR_BANDS[1]));
      } else {
        mixedColor.current.copy(GREEN);
      }
      glowRef.current.material.color.copy(mixedColor.current);
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 3, 3]} intensity={1} color="#0EA5E9" />
      <BuildingModel onClashTarget={handleClashTarget} />
      <mesh ref={glowRef} position={clashPoint}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="#EF4444" transparent opacity={0} />
      </mesh>
      <IssueCardOverlay position={clashPoint} scrollYProgress={scrollYProgress} />
    </>
  );
}

export default function ClashDetectionScene({ quality, canvasProps, progressRef, scrollYProgress }) {
  return (
    <Canvas
      dpr={[1, quality === 'low' ? 1.5 : 2]}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
      {...canvasProps}
    >
      <Suspense fallback={null}>
        <ClashDetectionSceneContent progressRef={progressRef} scrollYProgress={scrollYProgress} />
      </Suspense>
    </Canvas>
  );
}
