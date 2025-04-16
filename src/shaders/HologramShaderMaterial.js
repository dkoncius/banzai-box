import * as THREE from 'three';

const vertexShader = `
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

void main() {
  // Pass local position to fragment shader
  vPosition = position;
  
  // Pass texture coordinates
  vUv = uv;
  
  // Pass the normal
  vNormal = normalize(normalMatrix * normal);
  
  // Project vertex
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

uniform vec3 uHoloColor;
uniform float uTime;
uniform float uEdgeIntensity;
uniform float uScanlineSpeed;
uniform float uScanlineCount;
uniform float uGlitchIntensity;

// Random function
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  // Edge glow (Fresnel effect)
  vec3 viewDirection = normalize(cameraPosition - vPosition);
  float fresnel = 1.0 - max(0.0, dot(viewDirection, vNormal));
  fresnel = pow(fresnel, 3.0) * uEdgeIntensity;
  
  // Scan lines
  float scanline = sin(vUv.y * uScanlineCount + uTime * uScanlineSpeed) * 0.5 + 0.5;
  scanline = pow(scanline, 2.0) * 0.15;
  
  // Pulsing opacity
  float pulse = sin(uTime * 0.5) * 0.1 + 0.9;
  
  // Glitch effect
  float glitchTime = floor(uTime * 10.0) / 10.0; // Stepped time for glitch
  float glitchSeed = random(vec2(glitchTime));
  float glitchStrength = 0.0;
  
  // Create random glitches
  if (glitchSeed > 0.95) {
    glitchStrength = uGlitchIntensity;
  }
  
  float glitchOffset = glitchStrength * random(vec2(vUv.y, glitchTime));
  
  // Shifted UV for glitch
  vec2 glitchedUv = vUv;
  glitchedUv.x += glitchOffset * (step(0.5, random(vec2(vUv.y * 100.0, glitchTime))) * 2.0 - 1.0);
  
  // Horizontal glitch lines
  float glitchLine = step(0.8, random(vec2(floor(glitchedUv.y * 20.0), glitchTime)));
  glitchLine *= step(0.95, random(vec2(glitchTime)));
  
  // Base hologram color
  vec3 baseColor = uHoloColor;
  
  // Add scan line effect
  baseColor += vec3(scanline);
  
  // Add pulse and fresnel
  baseColor *= pulse;
  baseColor += uHoloColor * fresnel * 2.0;
  
  // Add glitch effect
  baseColor += vec3(glitchLine) * 0.1;
  
  // Hard horizontal lines
  float hardLines = step(0.93, fract(vUv.y * 50.0)) * 0.1;
  baseColor += vec3(hardLines);
  
  // Final color
  vec4 finalColor = vec4(baseColor, 0.8 + fresnel * 0.2);
  
  gl_FragColor = finalColor;
}
`;

// Create a custom material with the hologram shader
export class HologramShaderMaterial extends THREE.ShaderMaterial {
  constructor(params = {}) {
    // Set default values for uniforms
    const uniforms = {
      uHoloColor: { value: params.uHoloColor || new THREE.Color(0.1, 0.6, 1.0) },
      uTime: { value: 0.0 },
      uEdgeIntensity: { value: params.uEdgeIntensity || 1.5 },
      uScanlineSpeed: { value: params.uScanlineSpeed || 2.0 },
      uScanlineCount: { value: params.uScanlineCount || 50.0 },
      uGlitchIntensity: { value: params.uGlitchIntensity || 0.03 }
    };
    
    super({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide
    });
  }
  
  // Method to update the time uniform
  update(time) {
    this.uniforms.uTime.value = time;
  }
} 