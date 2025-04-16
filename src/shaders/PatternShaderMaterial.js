import * as THREE from 'three';

const vertexShader = `
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

void main() {
  // Pass the vertex position in local space to the fragment shader
  vPosition = position;
  
  // Pass the UV coordinates
  vUv = uv;
  
  // Pass the normal
  vNormal = normalize(normalMatrix * normal);
  
  // Project the vertex
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

uniform vec3 uBaseColor;
uniform vec3 uLineColor;
uniform float uTime;
uniform float uGridScale;
uniform float uLineWidth;
uniform float uAnimSpeed;

void main() {
  // Create a grid pattern based on UV coordinates
  vec2 grid = abs(fract(vUv * uGridScale - 0.5) - 0.5) / fwidth(vUv * uGridScale);
  float gridPattern = min(grid.x, grid.y);
  
  // Animate the grid lines
  float animatedOffset = sin(vUv.x * 10.0 + uTime * uAnimSpeed) * 0.1 + 
                         cos(vUv.y * 10.0 + uTime * uAnimSpeed) * 0.1;
  gridPattern += animatedOffset;
  
  // Convert the grid pattern to lines with adjusted width
  float line = 1.0 - smoothstep(uLineWidth - 0.01, uLineWidth, gridPattern);
  
  // Create a light-based effect
  vec3 lightDir = normalize(vec3(sin(uTime * 0.5), 1.0, cos(uTime * 0.5)));
  float diffuse = max(0.0, dot(vNormal, lightDir));
  
  // Base color with light influence
  vec3 baseWithLight = mix(uBaseColor * 0.5, uBaseColor, diffuse);
  
  // Final color combines base color with grid lines
  vec3 finalColor = mix(baseWithLight, uLineColor, line * 0.8);
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

// Create a custom material with the pattern shader
export class PatternShaderMaterial extends THREE.ShaderMaterial {
  constructor(params = {}) {
    // Set default values for uniforms
    const uniforms = {
      uBaseColor: { value: params.uBaseColor || new THREE.Color(0.1, 0.3, 0.5) },
      uLineColor: { value: params.uLineColor || new THREE.Color(0.9, 0.9, 1.0) },
      uTime: { value: 0.0 },
      uGridScale: { value: params.uGridScale || 10.0 },
      uLineWidth: { value: params.uLineWidth || 0.05 },
      uAnimSpeed: { value: params.uAnimSpeed || 0.5 }
    };
    
    super({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: false,
      side: THREE.DoubleSide
    });
  }
  
  // Method to update the time uniform
  update(time) {
    this.uniforms.uTime.value = time;
  }
} 