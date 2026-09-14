import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';

const ACCENT = '#8b5cf6';
const ACCENT_2 = '#6366f1';
const NODE_COLOR = '#c4b5fd';

function seededRand(seed) {
  const x = Math.sin(seed * 999.7) * 43758.5453;
  return x - Math.floor(x);
}

function useNetwork() {
  return useMemo(() => {
    const layerCounts = [4, 6, 6, 4];
    const xs = [-3.3, -1.1, 1.1, 3.3];
    const layers = layerCounts.map((count, li) => {
      const nodes = [];
      for (let i = 0; i < count; i++) {
        const spread = 2.6;
        const y = (i - (count - 1) / 2) * (spread / Math.max(count - 1, 1)) * 1.7;
        const z = (seededRand(li * 31 + i * 7) - 0.5) * 1.4;
        nodes.push(new THREE.Vector3(xs[li], y, z));
      }
      return nodes;
    });

    const edges = [];
    for (let li = 0; li < layers.length - 1; li++) {
      layers[li].forEach((a, ai) => {
        layers[li + 1].forEach((b, bi) => {
          if (seededRand(li * 500 + ai * 17 + bi * 3) > 0.35) {
            edges.push([a, b]);
          }
        });
      });
    }

    const allNodes = layers.flat();
    return { layers, edges, allNodes };
  }, []);
}

function Node({ position }) {
  const ref = useRef();
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const s = 1 + Math.sin(t * 1.6 + phase) * 0.12;
    if (ref.current) ref.current.scale.setScalar(s);
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.11, 16, 16]} />
      <meshStandardMaterial
        color={NODE_COLOR}
        emissive={ACCENT}
        emissiveIntensity={1.1}
        toneMapped={false}
      />
    </mesh>
  );
}

function Edge({ a, b }) {
  const points = useMemo(() => [a, b], [a, b]);
  return <Line points={points} color={ACCENT_2} lineWidth={0.6} transparent opacity={0.25} />;
}

function PulseDot({ a, b, speed, delay }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    const t = ((clock.getElapsedTime() * speed + delay) % 1);
    if (ref.current) {
      ref.current.position.lerpVectors(a, b, t);
      const fade = Math.sin(t * Math.PI);
      ref.current.material.opacity = fade;
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.055, 8, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0} toneMapped={false} />
    </mesh>
  );
}

function NeuralNetwork() {
  const { edges, allNodes } = useNetwork();
  const group = useRef();
  const pulses = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => {
        const [a, b] = edges[Math.floor(seededRand(i * 13.1) * edges.length)];
        return { a, b, speed: 0.35 + seededRand(i * 5.2) * 0.5, delay: seededRand(i * 8.7) };
      }),
    [edges]
  );

  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.08) * 0.15;
  });

  return (
    <group ref={group}>
      {edges.map((e, i) => (
        <Edge key={i} a={e[0]} b={e[1]} />
      ))}
      {allNodes.map((n, i) => (
        <Node key={i} position={n} />
      ))}
      {pulses.map((p, i) => (
        <PulseDot key={i} a={p.a} b={p.b} speed={p.speed} delay={p.delay} />
      ))}
    </group>
  );
}

function Robot({ radius, speed, height, offset, scale = 1 }) {
  const group = useRef();
  const legL = useRef();
  const legR = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + offset;
    const x = Math.cos(t) * radius;
    const z = Math.sin(t) * radius;
    const y = height + Math.sin(t * 3) * 0.15;
    if (group.current) {
      group.current.position.set(x, y, z);
      group.current.rotation.y = -t + Math.PI / 2;
    }
    const walk = Math.sin(t * 8);
    if (legL.current) legL.current.rotation.x = walk * 0.5;
    if (legR.current) legR.current.rotation.x = -walk * 0.5;
  });

  return (
    <group ref={group} scale={scale}>
      {/* body */}
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[0.32, 0.4, 0.22]} />
        <meshStandardMaterial color="#1f2028" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* chest light */}
      <mesh position={[0, 0.32, 0.115]}>
        <circleGeometry args={[0.06, 16]} />
        <meshBasicMaterial color={ACCENT} toneMapped={false} />
      </mesh>
      {/* head */}
      <mesh position={[0, 0.66, 0]}>
        <boxGeometry args={[0.22, 0.2, 0.2]} />
        <meshStandardMaterial color="#2a2c38" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* eyes */}
      <mesh position={[-0.06, 0.67, 0.101]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color={ACCENT_2} toneMapped={false} />
      </mesh>
      <mesh position={[0.06, 0.67, 0.101]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color={ACCENT_2} toneMapped={false} />
      </mesh>
      {/* antenna */}
      <mesh position={[0, 0.82, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.12, 6]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      <mesh position={[0, 0.89, 0]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color={ACCENT} toneMapped={false} />
      </mesh>
      {/* arms */}
      <mesh position={[-0.21, 0.34, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.32, 8]} />
        <meshStandardMaterial color="#2a2c38" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0.21, 0.34, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.32, 8]} />
        <meshStandardMaterial color="#2a2c38" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* legs */}
      <group ref={legL} position={[-0.09, 0.12, 0]}>
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.24, 8]} />
          <meshStandardMaterial color="#1a1b22" metalness={0.5} roughness={0.4} />
        </mesh>
      </group>
      <group ref={legR} position={[0.09, 0.12, 0]}>
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.24, 8]} />
          <meshStandardMaterial color="#1a1b22" metalness={0.5} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

export default function NeuralScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 1.2, 9.5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={40} color={ACCENT} />
      <pointLight position={[-5, -3, 4]} intensity={25} color={ACCENT_2} />

      <NeuralNetwork />
      <Robot radius={5.2} speed={0.35} height={-1.6} offset={0} scale={1.3} />
      <Robot radius={4.4} speed={-0.28} height={1.9} offset={2.1} scale={1.1} />
      <Robot radius={6} speed={0.22} height={0.2} offset={4.4} scale={1.5} />

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={6}
        maxDistance={14}
        autoRotate
        autoRotateSpeed={0.6}
      />
    </Canvas>
  );
}
