import React from 'react';

const themes = [
  { name: 'default', color: '#b499e4' },
  { name: 'autumn', color: '#e67e22' },
  { name: 'spring', color: '#f48fb1' },
  { name: 'winter', color: '#90caf9' },
  { name: 'purple', color: '#9575cd' }
];

export default function TreeControls({ activeColor, onColorChange }) {
  return (
    <div className="tree-controls-container">
      <div className="option-title">Choose your theme</div>
      <div className="tree-options">
        {themes.map((theme, index) => (
          <div
            key={theme.name}
            className={`tree-option ${activeColor === index ? 'active' : ''}`}
            onClick={() => onColorChange(index)}
            style={{
              background: theme.color,
              borderColor: 'white'
            }}
          />
        ))}
      </div>
    </div>
  );
} 