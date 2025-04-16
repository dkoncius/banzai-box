import * as THREE from 'three';

const vertexShader = `
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec2 vUv;

void main() {
  // Pass texture coordinates to fragment shader
  vUv = uv;
  
  // Compute the view direction
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vViewDir = normalize(cameraPosition - worldPosition.xyz);
  
  // Transform the normal to world space
  vNormal = normalize(normalMatrix * normal);
  
  // Project the vertex
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec2 vUv;

uniform vec3 uBaseColor;
uniform float uTime;
uniform float uPulseSpeed;
uniform float uGlowIntensity;
uniform float uGlowSize;

void main() {
  // Create a pulsing effect based on time
  float pulse = sin(uTime * uPulseSpeed) * 0.5 + 0.5;
  
  // Calculate fresnel effect for edge glow
  float fresnelFactor = 1.0 - max(0.0, dot(vNormal, vViewDir));
  fresnelFactor = pow(fresnelFactor, uGlowSize) * uGlowIntensity;
  
  // Create a repeating pattern based on UV coordinates
  float pattern = sin(vUv.x * 10.0) * sin(vUv.y * 10.0 + uTime) * 0.25 + 0.25;
  
  // Combine base color with glow and pulse effects
  vec3 baseColor = uBaseColor;
  vec3 glowColor = mix(baseColor, vec3(1.0), 0.6); // Lighter color for glow
  
  // Final color combines base color with the glow, pattern and pulse effects
  vec3 finalColor = mix(baseColor, glowColor, fresnelFactor * pulse);
  finalColor += pattern * pulse * 0.3; // Add subtle pattern
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

// Create a custom material with the glow shader
export class GlowShaderMaterial extends THREE.ShaderMaterial {
  constructor(params = {}) {
    // Set default values for uniforms
    const uniforms = {
      uBaseColor: { value: params.uBaseColor || new THREE.Color(0.4, 0.2, 0.8) },
      uTime: { value: 0.0 },
      uPulseSpeed: { value: params.uPulseSpeed || 1.0 },
      uGlowIntensity: { value: params.uGlowIntensity || 0.8 },
      uGlowSize: { value: params.uGlowSize || 2.5 }
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