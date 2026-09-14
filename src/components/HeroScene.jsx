import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PURPLE = '#7c5cff';
const TEAL = '#33e0c9';

function seeded(seed) {
  const x = Math.sin(seed * 999.7) * 43758.5453;
  return x - Math.floor(x);
}

function useMousePointer() {
  const target = useRef({ x: 0, y: 0 });
  useEffect(() => {
    function onMove(e) {
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    }
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);
  return target;
}

function TumblingShape({ position, kind, color, scale, speed }) {
  const ref = useRef();
  const rotSpeed = useMemo(
    () => [
      (seeded(position[0] * 3.1) - 0.5) * speed,
      (seeded(position[1] * 5.7) - 0.5) * speed,
      (seeded(position[2] * 7.3) - 0.5) * speed,
    ],
    [position, speed]
  );

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += rotSpeed[0] * delta;
    ref.current.rotation.y += rotSpeed[1] * delta;
    ref.current.rotation.z += rotSpeed[2] * delta;
  });

  let geometry;
  if (kind === 'ico') geometry = <icosahedronGeometry args={[1, 0]} />;
  else if (kind === 'oct') geometry = <octahedronGeometry args={[1, 0]} />;
  else geometry = <torusGeometry args={[0.8, 0.28, 8, 24]} />;

  return (
    <mesh ref={ref} position={position} scale={scale}>
      {geometry}
      <meshBasicMaterial color={color} wireframe transparent opacity={0.32} />
    </mesh>
  );
}

function OrbBot({ radius, phase, speedX, speedY, depth, scale = 1 }) {
  const group = useRef();
  const eye = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const x = Math.sin(t * speedX + phase) * radius;
    const y = Math.cos(t * speedY + phase * 1.3) * (radius * 0.55);
    if (group.current) {
      group.current.position.set(x, y, depth);
      group.current.rotation.z = Math.sin(t * 0.6 + phase) * 0.3;
    }
    if (eye.current) {
      const pulse = 0.6 + Math.sin(t * 3 + phase) * 0.4;
      eye.current.material.opacity = pulse;
      eye.current.scale.setScalar(0.9 + pulse * 0.15);
    }
  });

  return (
    <group ref={group} scale={scale}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.34, 0.035, 8, 32]} />
        <meshBasicMaterial color={TEAL} transparent opacity={0.8} toneMapped={false} />
      </mesh>
      <mesh ref={eye}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color={PURPLE} transparent opacity={0.9} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Scene() {
  const pointer = useMousePointer();
  const group = useRef();

  const shapes = useMemo(() => {
    const kinds = ['ico', 'oct', 'torus'];
    const colors = [PURPLE, TEAL];
    return Array.from({ length: 16 }, (_, i) => ({
      position: [
        (seeded(i * 1.7) - 0.5) * 20,
        (seeded(i * 2.9) - 0.5) * 13,
        (seeded(i * 4.1) - 0.5) * 6 - 8,
      ],
      kind: kinds[i % kinds.length],
      color: colors[i % colors.length],
      scale: 0.45 + seeded(i * 6.3) * 0.85,
      speed: 0.25 + seeded(i * 8.9) * 0.5,
    }));
  }, []);

  const bots = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        radius: 3 + seeded(i * 11.1) * 4,
        phase: seeded(i * 13.7) * Math.PI * 2,
        speedX: 0.15 + seeded(i * 17.3) * 0.25,
        speedY: 0.12 + seeded(i * 19.9) * 0.25,
        depth: -1 - seeded(i * 23.1) * 4,
        scale: 0.8 + seeded(i * 29.7) * 0.9,
      })),
    []
  );

  useFrame(() => {
    if (!group.current) return;
    const targetY = pointer.current.x * 0.35;
    const targetX = -pointer.current.y * 0.22;
    group.current.rotation.y += (targetY - group.current.rotation.y) * 0.04;
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.04;
  });

  return (
    <group ref={group}>
      {shapes.map((s, i) => (
        <TumblingShape key={i} {...s} />
      ))}
      {bots.map((b, i) => (
        <OrbBot key={i} {...b} />
      ))}
    </group>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 9], fov: 55 }}
      gl={{ antialias: true, alpha: true }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Scene />
    </Canvas>
  );
}
