import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import BanzaiTree from './components/BanzaiTree';
import TreeControls from './components/TreeControls';
import * as THREE from 'three';
import { ErrorBoundary } from 'react-error-boundary';

const themes = [
  { name: 'default', color: '#b499e4' },
  { name: 'autumn', color: '#e67e22' },
  { name: 'spring', color: '#f48fb1' },
  { name: 'winter', color: '#90caf9' },
  { name: 'purple', color: '#9575cd' }
];

const shapes = [
  { name: 'box', label: 'Cube' },
  { name: 'sphere', label: 'Sphere' },
  { name: 'cylinder', label: 'Cylinder' },
  { name: 'torus', label: 'Donut' }
];

function FallbackComponent({ error }) {
  return (
    <div style={{ margin: '2rem', padding: '2rem', background: '#f8d7da', color: '#721c24', borderRadius: '0.25rem' }}>
      <h2>Something went wrong:</h2>
      <p>{error.message}</p>
    </div>
  );
}

export default function App() {
  const [treeColor, setTreeColor] = useState(0);
  const [currentTheme, setCurrentTheme] = useState(themes[0].name);
  const [currentShape, setCurrentShape] = useState('box');
  const [isSpinning, setIsSpinning] = useState(true);
  
  const handleColorChange = (colorIndex) => {
    setTreeColor(colorIndex);
    setCurrentTheme(themes[colorIndex].name);
  };

  const handleShapeChange = (shape) => {
    setCurrentShape(shape);
  };

  const toggleSpin = () => {
    setIsSpinning(!isSpinning);
  };

  // Apply theme class on initial load and when theme changes
  useEffect(() => {
    themes.forEach(theme => {
      document.body.classList.remove(`theme-${theme.name}`);
    });
    document.body.classList.add(`theme-${currentTheme}`);
  }, [currentTheme]);
  
  // Apply default theme on mount
  useEffect(() => {
    document.body.classList.add(`theme-${themes[0].name}`);
    return () => {
      themes.forEach(theme => {
        document.body.classList.remove(`theme-${theme.name}`);
      });
    };
  }, []);
  
  return (
    <div className="app-container">
      <div className="project-info">
        <div>
          <span>Project:</span>
          BANZAI BOX
        </div>
        <div>
          <span>Services:</span>
          3D VISUALIZATION
        </div>
        <div>
          <span>Type of project:</span>
          INTERACTIVE SHAPES
        </div>
      </div>
      
      <h1 className="project-title">banzai·box</h1>
      
      <div className="main-content">
        <div className="tablet-container">
          <div className="tablet-content">
            <div className="tablet-header">
              <div className="tablet-logo">banzai.box</div>
              <div className="tablet-nav">
                <div className="tablet-nav-item">Shapes</div>
                <div className="tablet-nav-item">Colors</div>
                <div className="tablet-nav-item">About</div>
                <div className="tablet-nav-item">Contact</div>
              </div>
              <button className="tablet-contact">Contact us</button>
            </div>
            
            <div className="tablet-main">
              <div className="tablet-text">
                <h2 className="tablet-headline">Experience interactive 3D shapes with style</h2>
                <div className="ready-badge">Interactive Demo</div>
                
                <p className="tablet-description">
                  Welcome to banzai.box, your playground for 3D shape exploration. Choose different shapes, colors, and watch them come to life with smooth animations.
                </p>
                
                <TreeControls 
                  activeColor={treeColor}
                  onColorChange={handleColorChange}
                />
                
                <div className="tree-controls-container">
                  <div className="option-title">Choose shape</div>
                  <div className="shape-options">
                    {shapes.map((shape) => (
                      <button 
                        key={shape.name}
                        className={`shape-option ${currentShape === shape.name ? 'active' : ''}`}
                        onClick={() => handleShapeChange(shape.name)}
                      >
                        {shape.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="action-buttons">
                  <button 
                    className="start-button"
                    onClick={toggleSpin}
                  >
                    {isSpinning ? 'Stop Spin' : 'Start Spin'}
                  </button>
                </div>
              </div>
              
              <div className="scene-container">
                <ErrorBoundary FallbackComponent={FallbackComponent}>
                  <Canvas
                    camera={{
                      position: [0, 0, 5],
                      fov: 25
                    }}
                    shadows
                    gl={{
                      antialias: true,
                      powerPreference: "high-performance"
                    }}
                  >
                    <color attach="background" args={['#ffffff00']} />
                    <ambientLight intensity={0.4} />
                    <directionalLight
                      position={[5, 8, 7.5]}
                      intensity={0.8}
                      castShadow
                      shadow-mapSize-width={2048}
                      shadow-mapSize-height={2048}
                      shadow-camera-far={50}
                      shadow-camera-left={-10}
                      shadow-camera-right={10}
                      shadow-camera-top={10}
                      shadow-camera-bottom={-10}
                    />
                    <pointLight
                      position={[-3, 2, -3]}
                      intensity={1}
                      color={themes[treeColor].color}
                    />
                    <Suspense fallback={null}>
                      <BanzaiTree 
                        castShadow 
                        receiveShadow 
                        color={themes[treeColor].color} 
                        shape={currentShape}
                        isSpinning={isSpinning}
                      />
                    </Suspense>
                    <OrbitControls
                      enableZoom={true}
                      enablePan={false}
                      enableRotate={true}
                      minDistance={3}
                      maxDistance={10}
                      minPolarAngle={0}
                      maxPolarAngle={Math.PI / 2}
                    />
                  </Canvas>
                </ErrorBoundary>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="credits">
        Design by <a href="https://www.linkedin.com/in/deividas-koncius/" target="_blank" rel="noopener noreferrer">Deividas Koncius</a>
      </div>
    </div>
  );
}