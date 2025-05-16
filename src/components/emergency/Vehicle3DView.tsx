
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, Environment } from '@react-three/drei';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';

interface Vehicle3DViewProps {
  vehicleType: string;
  isAvailable: boolean;
}

function VehicleModel({ vehicleType, isAvailable }: { vehicleType: string, isAvailable: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.SpotLight>(null);
  
  // Create vehicle geometry based on type
  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Gentle hovering animation
    meshRef.current.position.y = Math.sin(state.clock.getElapsedTime()) * 0.05 + 0.1;
    
    // Rotation animation for available vehicles
    if (isAvailable) {
      meshRef.current.rotation.y += 0.01;
    }
    
    // Animate light for emergency vehicles
    if (lightRef.current && isAvailable) {
      // Flash light color based on vehicle type
      const time = state.clock.getElapsedTime();
      if (vehicleType === 'ambulance') {
        lightRef.current.color = new THREE.Color(
          Math.sin(time * 5) > 0 ? 0xff0000 : 0xffffff
        );
      } else if (vehicleType === 'police') {
        lightRef.current.color = new THREE.Color(
          Math.sin(time * 5) > 0 ? 0x0000ff : 0xff0000
        );
      }
    }
  });

  // Choose material colors based on vehicle type
  let color = '#f97316'; // Default orange for fire trucks
  if (vehicleType === 'ambulance') color = '#ea384c';
  if (vehicleType === 'police') color = '#1EAEDB';
  
  // Choose vehicle model based on type
  let scale = isAvailable ? 1.2 : 1;
  let geometry: JSX.Element;
  
  switch (vehicleType) {
    case 'ambulance':
      geometry = <boxGeometry args={[1, 0.8, 2]} />;
      break;
    case 'police': 
      geometry = <capsuleGeometry args={[0.5, 1.5, 4, 16]} />;
      break;
    default: // fire truck
      geometry = <cylinderGeometry args={[0.5, 0.7, 2, 8]} />;
  }
  
  return (
    <group>
      {/* Vehicle body */}
      <mesh ref={meshRef} castShadow receiveShadow scale={scale}>
        {geometry}
        <meshStandardMaterial 
          color={color} 
          metalness={0.6} 
          roughness={0.3} 
          emissive={isAvailable ? color : '#000000'}
          emissiveIntensity={isAvailable ? 0.2 : 0}
        />
      </mesh>
      
      {/* Emergency lights */}
      {isAvailable && (
        <spotLight
          ref={lightRef}
          position={[0, 2, 0]}
          angle={0.4}
          penumbra={1}
          intensity={5}
          castShadow
          color={vehicleType === 'ambulance' ? '#ff0000' : vehicleType === 'police' ? '#0000ff' : '#ff8800'}
        />
      )}
      
      {/* Ground reflection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial 
          color="#f0f0f0" 
          metalness={0.2}
          roughness={0.8}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}

const Vehicle3DView: React.FC<Vehicle3DViewProps> = ({ vehicleType, isAvailable }) => {
  const { theme } = useTheme(); 
  const isDark = theme === 'dark';
  
  return (
    <div className="relative w-full h-48 rounded-lg overflow-hidden">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 1, 5]} />
        <ambientLight intensity={0.8} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={1} 
          castShadow 
          shadow-mapSize-width={1024} 
          shadow-mapSize-height={1024}
        />
        <VehicleModel vehicleType={vehicleType} isAvailable={isAvailable} />
        <Environment preset="city" />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate={isAvailable}
          autoRotateSpeed={2}
        />
      </Canvas>
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/30 to-transparent h-12"></div>
    </div>
  );
};

export default Vehicle3DView;
