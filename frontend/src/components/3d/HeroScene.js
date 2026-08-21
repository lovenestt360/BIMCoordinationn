import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import BuildingModel from './BuildingModel';

function HeroSceneContent() {
  const groupRef = useRef();

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 4, 4]} intensity={1.2} color="#39C3FF" />
      <pointLight position={[-4, 2, -3]} intensity={0.7} color="#7DE0FF" />
      <group ref={groupRef} position={[1.3, -1, 0]}>
        <BuildingModel />
      </group>
    </>
  );
}

export default function HeroScene({ quality, canvasProps }) {
  return (
    <Canvas
      dpr={[1, quality === 'low' ? 1.5 : 2]}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
      {...canvasProps}
    >
      <Suspense fallback={null}>
        <HeroSceneContent />
      </Suspense>
    </Canvas>
  );
}
