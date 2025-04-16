import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, TransformControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import BanzaiTree from './BanzaiTree';

// A wrapper component to handle draggable shapes in the collaborative structure
function DraggableShape({ 
  shapeData, 
  position,
  onPositionChange,
  isSelected,
  onSelect
}) {
  const mesh = useRef();
  const { camera } = useThree();
  
  // Handle transformControl updates
  const handleTransformChange = () => {
    if (mesh.current) {
      onPositionChange([
        mesh.current.position.x,
        mesh.current.position.y,
        mesh.current.position.z
      ]);
    }
  };
  
  return (
    <group
      ref={mesh}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {isSelected && (
        <TransformControls
          object={mesh}
          mode="translate"
          onObjectChange={handleTransformChange}
        />
      )}
      
      <BanzaiTree
        color={shapeData.color}
        size={shapeData.size}
        shape={shapeData.shape}
        shaderType={shapeData.shaderType}
        isSpinning={false}
      />
      
      {/* Label for the shape */}
      <Html
        position={[0, shapeData.size * -1.5, 0]}
        center
        style={{
          fontSize: '0.8rem',
          padding: '3px 8px',
          backgroundColor: 'rgba(0,0,0,0.6)',
          color: 'white',
          borderRadius: '4px',
          pointerEvents: 'none',
          opacity: isSelected ? 1 : 0.7,
        }}
      >
        {shapeData.originalName}
      </Html>
    </group>
  );
}

// Component for the scene background
function SceneBackground() {
  return (
    <>
      <color attach="background" args={['#f8f6ef']} />
      <fog attach="fog" args={['#f8f6ef', 20, 40]} />
      <gridHelper args={[20, 20, '#cccccc', '#e5e5e5']} position={[0, -2, 0]} />
    </>
  );
}

export default function CollaborativeStructure() {
  const [savedShapes, setSavedShapes] = useState([]);
  const [structureShapes, setStructureShapes] = useState([]);
  const [selectedShapeIndex, setSelectedShapeIndex] = useState(null);
  const [structureName, setStructureName] = useState('My Collaborative Structure');
  const [savedStructures, setSavedStructures] = useState([]);
  
  // Load saved shapes from localStorage on component mount
  useEffect(() => {
    // Load shapes
    const loadShapesFromStorage = () => {
      const storedShapes = localStorage.getItem('banzaiShapesGallery');
      if (storedShapes) {
        try {
          setSavedShapes(JSON.parse(storedShapes));
        } catch (error) {
          console.error('Failed to parse stored shapes:', error);
        }
      }
    };
    
    // Initial load
    loadShapesFromStorage();
    
    // Load structures
    const storedStructures = localStorage.getItem('banzaiCollaborativeStructures');
    if (storedStructures) {
      try {
        setSavedStructures(JSON.parse(storedStructures));
      } catch (error) {
        console.error('Failed to parse stored structures:', error);
      }
    }
    
    // Listen for shape updates from other components
    const handleShapesUpdated = (event) => {
      setSavedShapes(event.detail.shapes);
    };
    
    // Add event listener
    window.addEventListener('shapesUpdated', handleShapesUpdated);
    
    // Clean up listener on unmount
    return () => {
      window.removeEventListener('shapesUpdated', handleShapesUpdated);
    };
  }, []);
  
  // Save structures to localStorage whenever they change
  useEffect(() => {
    if (savedStructures.length > 0) {
      localStorage.setItem('banzaiCollaborativeStructures', JSON.stringify(savedStructures));
    }
  }, [savedStructures]);
  
  const addShapeToStructure = (shape) => {
    // Generate a random position within a reasonable range
    const randomPosition = [
      (Math.random() - 0.5) * 4,  // x: -2 to 2
      (Math.random() - 0.5) * 2,  // y: -1 to 1
      (Math.random() - 0.5) * 4   // z: -2 to 2
    ];
    
    setStructureShapes(prev => [
      ...prev, 
      { 
        ...shape, 
        position: randomPosition,
        id: Date.now() // ensure unique id
      }
    ]);
  };
  
  const updateShapePosition = (index, newPosition) => {
    setStructureShapes(prev => 
      prev.map((shape, i) => 
        i === index ? { ...shape, position: newPosition } : shape
      )
    );
  };
  
  const removeShapeFromStructure = (index) => {
    setStructureShapes(prev => prev.filter((_, i) => i !== index));
    setSelectedShapeIndex(null);
  };
  
  const saveStructure = () => {
    if (structureShapes.length === 0) {
      alert('Add some shapes to your structure before saving!');
      return;
    }
    
    const newStructure = {
      id: Date.now(),
      name: structureName,
      shapes: structureShapes,
      createdAt: new Date().toISOString()
    };
    
    setSavedStructures(prev => [newStructure, ...prev]);
    
    // Optionally clear the current structure
    if (window.confirm('Structure saved! Start a new structure?')) {
      setStructureShapes([]);
      setStructureName('My Collaborative Structure');
    }
  };
  
  const loadStructure = (structure) => {
    if (structureShapes.length > 0 && 
        !window.confirm('Loading this structure will replace your current work. Continue?')) {
      return;
    }
    
    setStructureShapes(structure.shapes);
    setStructureName(structure.name);
  };
  
  const deleteStructure = (structureId) => {
    if (window.confirm('Are you sure you want to delete this structure?')) {
      setSavedStructures(prev => prev.filter(s => s.id !== structureId));
    }
  };
  
  const handleCanvasClick = (e) => {
    // Deselect when clicking empty space
    if (!e.object) {
      setSelectedShapeIndex(null);
    }
  };
  
  return (
    <div className="collaborative-structure">
      <h3 className="option-title">Create Collaborative Structures</h3>
      
      <div className="structure-container">
        <div className="structure-sidebar">
          <div className="structure-controls">
            <input
              type="text"
              value={structureName}
              onChange={(e) => setStructureName(e.target.value)}
              className="structure-name-input"
              placeholder="Name your structure"
            />
            
            <button onClick={saveStructure} className="save-structure-btn">
              Save Structure
            </button>
            
            {selectedShapeIndex !== null && (
              <button 
                onClick={() => removeShapeFromStructure(selectedShapeIndex)}
                className="remove-shape-btn"
              >
                Remove Selected Shape
              </button>
            )}
          </div>
          
          <div className="available-shapes">
            <h4 className="sidebar-title">Available Shapes</h4>
            {savedShapes.length === 0 ? (
              <p className="empty-message">No shapes available. Create some in the Name Shape Generator!</p>
            ) : (
              <div className="shapes-list">
                {savedShapes.map((shape, index) => (
                  <div 
                    key={index} 
                    className="available-shape-item"
                    onClick={() => addShapeToStructure(shape)}
                  >
                    <div className="shape-thumbnail">
                      <Canvas camera={{ position: [0, 0, 3], fov: 35 }}>
                        <ambientLight intensity={0.5} />
                        <directionalLight position={[2, 2, 2]} intensity={0.8} />
                        <BanzaiTree
                          color={shape.color}
                          size={shape.size}
                          shape={shape.shape}
                          shaderType={shape.shaderType}
                          isSpinning={true}
                        />
                      </Canvas>
                    </div>
                    <div className="shape-item-name">{shape.originalName}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="saved-structures">
            <h4 className="sidebar-title">Saved Structures</h4>
            {savedStructures.length === 0 ? (
              <p className="empty-message">No structures saved yet.</p>
            ) : (
              <div className="structures-list">
                {savedStructures.map((structure) => (
                  <div key={structure.id} className="saved-structure-item">
                    <div className="structure-info">
                      <div className="structure-item-name">{structure.name}</div>
                      <div className="structure-item-shapes">
                        {structure.shapes.length} shape{structure.shapes.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="structure-actions">
                      <button 
                        onClick={() => loadStructure(structure)}
                        className="load-structure-btn"
                      >
                        Load
                      </button>
                      <button 
                        onClick={() => deleteStructure(structure.id)}
                        className="delete-structure-btn"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="structure-canvas">
          <Canvas
            camera={{ position: [0, 1, 8], fov: 40 }}
            onClick={handleCanvasClick}
            style={{ height: '500px' }}
          >
            <SceneBackground />
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
            <spotLight position={[-5, 5, 5]} intensity={0.5} castShadow />
            
            {structureShapes.map((shape, index) => (
              <DraggableShape
                key={shape.id}
                shapeData={shape}
                position={shape.position}
                onPositionChange={(newPos) => updateShapePosition(index, newPos)}
                isSelected={selectedShapeIndex === index}
                onSelect={() => setSelectedShapeIndex(index)}
              />
            ))}
            
            <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
          </Canvas>
          
          {structureShapes.length === 0 ? (
            <div className="empty-canvas-message">
              <p>Click on shapes from the sidebar to add them to your structure.</p>
              <p>Then drag to position them in 3D space.</p>
            </div>
          ) : (
            <div className="canvas-controls">
              <div className="info-message">
                Click a shape to select it. Drag the arrows to move it in 3D space.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 