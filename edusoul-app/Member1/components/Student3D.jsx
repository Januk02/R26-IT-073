import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';

function StudentCharacter() {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Head */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
      
      {/* Hair */}
      <mesh position={[0, 2.8, 0]} castShadow>
        <sphereGeometry args={[0.55, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#2c1810" />
      </mesh>
      
      {/* Body */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <capsuleGeometry args={[0.4, 1.2, 8, 16]} />
        <meshStandardMaterial color="#6366f1" />
      </mesh>
      
      {/* Arms */}
      <mesh position={[-0.5, 1.8, 0]} rotation={[0, 0, 0.3]} castShadow>
        <capsuleGeometry args={[0.12, 0.8, 8, 16]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
      <mesh position={[0.5, 1.8, 0]} rotation={[0, 0, -0.3]} castShadow>
        <capsuleGeometry args={[0.12, 0.8, 8, 16]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
      
      {/* Legs */}
      <mesh position={[-0.2, 0.5, 0]} castShadow>
        <capsuleGeometry args={[0.15, 0.8, 8, 16]} />
        <meshStandardMaterial color="#1e1b4b" />
      </mesh>
      <mesh position={[0.2, 0.5, 0]} castShadow>
        <capsuleGeometry args={[0.15, 0.8, 8, 16]} />
        <meshStandardMaterial color="#1e1b4b" />
      </mesh>
      
      {/* Book in hand */}
      <mesh position={[0.7, 1.5, 0.2]} rotation={[0.3, 0, -0.5]} castShadow>
        <boxGeometry args={[0.3, 0.4, 0.05]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
      
      {/* Graduation Cap */}
      <mesh position={[0, 3.1, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.05, 32]} />
        <meshStandardMaterial color="#1e1b4b" />
      </mesh>
      <mesh position={[0, 3.15, 0.3]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.15, 8]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
    </group>
  );
}

function FloatingElements() {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        child.position.y = 2 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.3;
        child.rotation.y += 0.02;
        child.rotation.x += 0.01;
      });
    }
  });

  const colors = ['#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];
  const shapes = ['box', 'sphere', 'octahedron', 'torus', 'cone'];
  
  return (
    <group ref={groupRef}>
      {shapes.map((shape, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i / shapes.length) * Math.PI * 2) * 2,
            2,
            Math.sin((i / shapes.length) * Math.PI * 2) * 2
          ]}
          castShadow
        >
          {shape === 'box' && <boxGeometry args={[0.2, 0.2, 0.2]} />}
          {shape === 'sphere' && <sphereGeometry args={[0.15, 16, 16]} />}
          {shape === 'octahedron' && <octahedronGeometry args={[0.15]} />}
          {shape === 'torus' && <torusGeometry args={[0.1, 0.05, 8, 16]} />}
          {shape === 'cone' && <coneGeometry args={[0.1, 0.2, 8]} />}
          <meshStandardMaterial color={colors[i]} emissive={colors[i]} emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

export default function Student3D() {
  return (
    <div className="w-full h-96">
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#a855f7" />
        
        <Float floatIntensity={1} speed={2}>
          <StudentCharacter />
        </Float>
        
        <FloatingElements />
        
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}
