import { Component, Suspense, useEffect, useMemo, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import ProceduralMassing from './ProceduralMassing';

const MODEL_PATH = '/models/hero-building.glb';
const TARGET_SIZE = 6;

function NormalizedGLTF({ onClashTarget }) {
  const { scene } = useGLTF(MODEL_PATH);

  const normalized = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxAxis = Math.max(size.x, size.y, size.z) || 1;
    const scale = TARGET_SIZE / maxAxis;

    clone.position.sub(center);
    clone.scale.setScalar(scale);

    const targetNode = clone.getObjectByName('ClashCameraTarget');
    const clashPoint = targetNode
      ? targetNode.getWorldPosition(new THREE.Vector3())
      : new THREE.Vector3(0, 0, 0);

    return { clone, clashPoint };
  }, [scene]);

  useEffect(() => {
    onClashTarget?.(normalized.clashPoint.clone());
  }, [normalized, onClashTarget]);

  return <primitive object={normalized.clone} />;
}

class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    // Defense-in-depth for a genuinely malformed glb — the common "file doesn't
    // exist yet" case is filtered out earlier by useModelAvailability below,
    // since dev servers commonly SPA-fallback missing static paths to index.html
    // (served as 200 text/html), which useGLTF/GLTFLoader can't cleanly surface
    // as a catchable Suspense rejection.
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function useModelAvailability() {
  const [available, setAvailable] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(MODEL_PATH, { method: 'HEAD', cache: 'no-store' })
      .then((res) => {
        if (cancelled) return;
        const contentType = res.headers.get('content-type') || '';
        setAvailable(res.ok && !contentType.includes('text/html'));
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return available;
}

export default function BuildingModel({ onClashTarget }) {
  const available = useModelAvailability();
  const fallback = <ProceduralMassing onClashTarget={onClashTarget} />;

  if (available !== true) {
    return fallback;
  }

  return (
    <ModelErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <NormalizedGLTF onClashTarget={onClashTarget} />
      </Suspense>
    </ModelErrorBoundary>
  );
}
