import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import BanzaiTree from './BanzaiTree';

/**
 * Name to shape algorithm:
 * - First letter determines base shape
 * - Name length determines size
 * - Vowel count determines shader type
 * - Character sum affects color hue
 */
export default function NameShapeGenerator() {
  const [name, setName] = useState('');
  const [shapeParams, setShapeParams] = useState({
    shape: 'box',
    color: '#b499e4',
    size: 0.8,
    shaderType: 0
  });
  const [showShape, setShowShape] = useState(false);
  const [savedShapes, setSavedShapes] = useState([]);

  // Load saved shapes from localStorage on component mount
  useEffect(() => {
    const storedShapes = localStorage.getItem('banzaiShapesGallery');
    if (storedShapes) {
      try {
        setSavedShapes(JSON.parse(storedShapes));
      } catch (error) {
        console.error('Failed to parse stored shapes:', error);
      }
    }
  }, []);

  // Convert name to shape parameters
  const generateShapeFromName = (inputName) => {
    if (!inputName) return;
    
    const nameNormalized = inputName.trim().toLowerCase();
    
    // Determine shape based on first letter
    const firstChar = nameNormalized.charCodeAt(0) % 4;
    let shape = 'box';
    switch(firstChar) {
      case 0: shape = 'box'; break;
      case 1: shape = 'sphere'; break;
      case 2: shape = 'cylinder'; break;
      case 3: shape = 'torus'; break;
      default: shape = 'box';
    }
    
    // Size based on name length (between 0.6 and 1.2)
    const size = 0.6 + Math.min(nameNormalized.length / 10, 0.6);
    
    // Shader type based on vowel count
    const vowelCount = (nameNormalized.match(/[aeiou]/gi) || []).length;
    const shaderType = vowelCount % 5;
    
    // Color based on character sum
    let charSum = 0;
    for (let i = 0; i < nameNormalized.length; i++) {
      charSum += nameNormalized.charCodeAt(i);
    }
    const hue = (charSum % 360) / 360;
    const color = new THREE.Color().setHSL(hue, 0.7, 0.6).getHexString();
    
    return {
      shape,
      size,
      shaderType,
      color: '#' + color,
      originalName: inputName
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;
    
    const newShapeParams = generateShapeFromName(name);
    setShapeParams(newShapeParams);
    setShowShape(true);
  };

  const handleSave = () => {
    if (!showShape || !name) return;
    
    // Save the current shape to the list
    setSavedShapes(prev => {
      // Don't add duplicates
      if (prev.some(shape => shape.originalName === name)) {
        return prev;
      }
      
      const newShapes = [...prev, {...shapeParams, originalName: name}];
      
      // Store in localStorage
      localStorage.setItem('banzaiShapesGallery', JSON.stringify(newShapes));
      
      // Dispatch a custom event to notify other components
      const event = new CustomEvent('shapesUpdated', { 
        detail: { shapes: newShapes } 
      });
      window.dispatchEvent(event);
      
      return newShapes;
    });
    
    // Clear the input
    setName('');
    setShowShape(false);
  };

  const handleClearGallery = () => {
    if (window.confirm('Are you sure you want to clear the entire gallery?')) {
      setSavedShapes([]);
      localStorage.removeItem('banzaiShapesGallery');
      
      // Dispatch a custom event to notify other components
      const event = new CustomEvent('shapesUpdated', { 
        detail: { shapes: [] } 
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="name-shape-generator">
      <h3 className="option-title">Generate Shape from Your Name</h3>
      
      <form onSubmit={handleSubmit} className="name-input-form">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="name-input"
          maxLength={30}
        />
        <button type="submit" className="generate-btn">Generate</button>
      </form>
      
      {showShape && (
        <div className="generated-shape-container">
          <div className="shape-details">
            <div className="shape-name">Shape for: {name}</div>
            <div className="shape-properties">
              <span>Type: {shapeParams.shape}</span>
              <span>Size: {shapeParams.size.toFixed(2)}</span>
              <span>Shader: {shapeParams.shaderType}</span>
            </div>
            <button onClick={handleSave} className="save-shape-btn">
              Save to Gallery
            </button>
          </div>
          
          <div className="shape-preview">
            <Canvas
              camera={{ position: [0, 0, 3], fov: 35 }}
              style={{ height: '200px' }}
            >
              <ambientLight intensity={0.5} />
              <directionalLight position={[2, 2, 2]} intensity={0.8} />
              <BanzaiTree
                color={shapeParams.color}
                size={shapeParams.size}
                shape={shapeParams.shape}
                shaderType={shapeParams.shaderType}
                isSpinning={true}
              />
              <OrbitControls enableZoom={false} />
            </Canvas>
          </div>
        </div>
      )}
      
      {savedShapes.length > 0 && (
        <div className="shapes-gallery">
          <div className="gallery-header">
            <h4 className="gallery-title">Community Shapes Gallery</h4>
            <button onClick={handleClearGallery} className="clear-gallery-btn">
              Clear Gallery
            </button>
          </div>
          <div className="gallery-grid">
            {savedShapes.map((shape, index) => (
              <div key={index} className="gallery-item">
                <div className="gallery-item-name">
                  {shape.originalName}
                </div>
                <div className="gallery-item-preview">
                  <Canvas
                    camera={{ position: [0, 0, 3], fov: 35 }}
                    style={{ height: '120px', width: '120px' }}
                  >
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[2, 2, 2]} intensity={0.8} />
                    <BanzaiTree
                      color={shape.color}
                      size={shape.size}
                      shape={shape.shape}
                      shaderType={shape.shaderType}
                      isSpinning={true}
                    />
                    <OrbitControls enableZoom={false} enableRotate={false} />
                  </Canvas>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 