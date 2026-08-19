import { useEffect, useMemo } from 'react';
import { Edges, Line } from '@react-three/drei';
import * as THREE from 'three';

const SLAB_COUNT = 4;
const SLAB_SIZE = [4.6, 0.18, 3.2];
const SLAB_GAP = 1.05;

const CLASH_POINT = new THREE.Vector3(1.6, SLAB_GAP * 1.5, 0.4);

const INDICATOR_POINTS = [
  new THREE.Vector3(-1.8, SLAB_GAP * 0.5, -0.9),
  new THREE.Vector3(1.2, SLAB_GAP * 2.5, -1.1),
  new THREE.Vector3(-1.0, SLAB_GAP * 3.2, 0.8),
];

export default function ProceduralMassing({ onClashTarget }) {
  useEffect(() => {
    onClashTarget?.(CLASH_POINT.clone());
  }, [onClashTarget]);

  const slabs = useMemo(
    () =>
      Array.from({ length: SLAB_COUNT }, (_, i) => ({
        y: i * SLAB_GAP,
        offsetX: (i % 2 === 0 ? 1 : -1) * 0.18,
      })),
    []
  );

  return (
    <group>
      {slabs.map((slab, i) => (
        <mesh key={i} position={[slab.offsetX, slab.y, 0]}>
          <boxGeometry args={SLAB_SIZE} />
          <meshStandardMaterial color="#0EA5E9" transparent opacity={0.08} roughness={0.4} metalness={0.1} />
          <Edges color="#22D3EE" />
        </mesh>
      ))}

      {/* Duct intersecting beam at the clash point */}
      <mesh position={[CLASH_POINT.x, CLASH_POINT.y, CLASH_POINT.z]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 2.4, 16]} />
        <meshStandardMaterial color="#94A3B8" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[CLASH_POINT.x, CLASH_POINT.y, CLASH_POINT.z]}>
        <boxGeometry args={[0.3, 0.3, 2.6]} />
        <meshStandardMaterial color="#475569" roughness={0.6} metalness={0.2} />
      </mesh>

      {/* Ambient coordination indicators + dashed connector lines (hero "data flowing" look) */}
      {INDICATOR_POINTS.map((pos, i) => (
        <mesh key={`ind-${i}`} position={pos}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshBasicMaterial color="#22D3EE" />
        </mesh>
      ))}
      {INDICATOR_POINTS.map((pos, i) => (
        <Line
          key={`line-${i}`}
          points={[pos, CLASH_POINT]}
          color="#22D3EE"
          lineWidth={1}
          dashed
          dashSize={0.08}
          gapSize={0.06}
          transparent
          opacity={0.3}
        />
      ))}
    </group>
  );
}

export { CLASH_POINT };
