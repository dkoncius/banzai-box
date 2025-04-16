import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useThree } from '@react-three/fiber';
import { GlowShaderMaterial } from '../shaders/GlowShaderMaterial';
import { PatternShaderMaterial } from '../shaders/PatternShaderMaterial';
import { TreeShaderMaterial } from '../shaders/TreeShaderMaterial';
import { HologramShaderMaterial } from '../shaders/HologramShaderMaterial';
import * as THREE from 'three';

export default function BanzaiTree({ 
  color = '#b499e4',
  size = 0.8,
  shape = 'box',
  isSpinning = true
}) {
  const group = useRef();
  const materialRef = useRef();
  const [shaderType, setShaderType] = useState(0); // 0: Standard, 1: Glow, 2: Pattern, 3: Tree, 4: Hologram
  const clock = useRef(new THREE.Clock());
  
  // Effect to cycle through shader types every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setShaderType((prev) => (prev + 1) % 5);
    }, 5000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Animation
  useFrame((state, delta) => {
    if (group.current && isSpinning) {
      group.current.rotation.y += delta * 0.5; // Rotate at 0.5 radians per second
    }
    
    // Update shader time for animated shaders
    if (materialRef.current && materialRef.current.update) {
      materialRef.current.update(clock.current.getElapsedTime());
    }
  });

  // Render different geometric shapes based on the shape prop
  const renderShape = () => {
    switch(shape) {
      case 'sphere':
        return <sphereGeometry args={[size * 0.7, 32, 32]} />;
      case 'cylinder':
        return <cylinderGeometry args={[size * 0.5, size * 0.5, size, 32]} />;
      case 'torus':
        return <torusGeometry args={[size * 0.5, size * 0.2, 16, 32]} />;
      case 'box':
      default:
        return <boxGeometry args={[size, size, size]} />;
    }
  };
  
  // Render different materials based on shaderType
  const renderMaterial = () => {
    const colorObj = new THREE.Color(color);
    
    switch(shaderType) {
      case 1: // Glow Shader
        return (
          <primitive 
            ref={materialRef}
            object={new GlowShaderMaterial({
              uBaseColor: colorObj,
              uPulseSpeed: 1.2,
              uGlowIntensity: 0.9
            })}
          />
        );
      case 2: // Pattern Shader
        return (
          <primitive 
            ref={materialRef}
            object={new PatternShaderMaterial({
              uBaseColor: colorObj,
              uLineColor: new THREE.Color(1, 1, 1).lerp(colorObj, 0.3),
              uGridScale: 15.0,
              uAnimSpeed: 0.7
            })}
          />
        );
      case 3: // Tree Shader
        return (
          <primitive 
            ref={materialRef}
            object={new TreeShaderMaterial({
              uDarkColor: colorObj.clone().multiplyScalar(0.5),
              uLightColor: colorObj,
              uFresnelColor: colorObj.clone().lerp(new THREE.Color(1, 1, 1), 0.5)
            })}
          />
        );
      case 4: // Hologram Shader
        return (
          <primitive 
            ref={materialRef}
            object={new HologramShaderMaterial({
              uHoloColor: colorObj,
              uEdgeIntensity: 1.8,
              uScanlineSpeed: 2.5,
              uGlitchIntensity: 0.05
            })}
          />
        );
      case 0: // Standard Material
      default:
        return <meshStandardMaterial ref={materialRef} color={color} roughness={0.4} metalness={0.1} />;
    }
  };

  return (
    <group ref={group} position={[0, 0, 0]}>
      <mesh castShadow receiveShadow>
        {renderShape()}
        {renderMaterial()}
      </mesh>
    </group>
  );
} 