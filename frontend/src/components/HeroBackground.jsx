import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const COUNT = 200;
const SPREAD = 16;

function Dots() {
  const ref = useRef();

  const geo = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const opacities = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * SPREAD;
      pos[i * 3 + 1] = (Math.random() - 0.5) * SPREAD;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      opacities[i]   = Math.random() * 0.5 + 0.1;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.015;
    const p = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      p[i * 3 + 1] += dt * 0.08;
      if (p[i * 3 + 1] > SPREAD / 2) {
        p[i * 3 + 1] = -SPREAD / 2;
        p[i * 3]     = (Math.random() - 0.5) * SPREAD;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        color="#636AFF"
        size={0.035}
        sizeAttenuation
        transparent
        opacity={0.35}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <Dots />
      </Canvas>

      {/* Radial gradient center glow */}
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(99,106,255,0.06) 0%, transparent 70%)' }} />

      {/* Edge vignette */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-surface-0/40 via-transparent to-surface-0" />
    </div>
  );
}
