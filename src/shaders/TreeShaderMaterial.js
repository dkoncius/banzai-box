import * as THREE from 'three';

const vertexShader = `
varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
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

uniform vec3 uDarkColor;
uniform vec3 uLightColor;
uniform vec3 uFresnelColor;
uniform float uFresnelPower;
uniform float uGlossiness;

void main() {
  // Calculate light direction (fixed light direction for simplicity)
  vec3 lightDir = normalize(vec3(0.5, 0.8, 0.6)); 
  
  // Calculate diffuse component (Lambert)
  float diffuseFactor = dot(vNormal, lightDir);
  diffuseFactor = max(0.0, diffuseFactor);
  
  // Create the multi-step "cel" diffuse shading
  // This is what creates the clear separation between light and dark areas
  float celFactor;
  if (diffuseFactor < 0.5) {
    celFactor = 0.0;
  } else if (diffuseFactor < 0.75) {
    celFactor = 0.5;
  } else {
    celFactor = 1.0;
  }
  
  // Calculate the specular reflection
  vec3 reflectDir = reflect(-lightDir, vNormal);
  float specularFactor = max(0.0, dot(vViewDir, reflectDir));
  specularFactor = pow(specularFactor, uGlossiness);
  
  // Create "cel" specular highlight
  float specularCelFactor = specularFactor > 0.7 ? 1.0 : 0.0;
  
  // Calculate fresnel effect for rim lighting
  float fresnelFactor = 1.0 - max(0.0, dot(vNormal, vViewDir));
  fresnelFactor = pow(fresnelFactor, uFresnelPower);
  
  // Combine diffuse, specular, and fresnel components
  vec3 finalColor = mix(uDarkColor, uLightColor, celFactor);
  finalColor += specularCelFactor * vec3(0.3);
  finalColor += fresnelFactor * uFresnelColor;
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

// Create a custom material with the Ghibli-style shader
export class TreeShaderMaterial extends THREE.ShaderMaterial {
  constructor(params = {}) {
    // Set default values for uniforms
    const uniforms = {
      uDarkColor: { value: params.uDarkColor || new THREE.Color(0.03, 0.15, 0.02) },
      uLightColor: { value: params.uLightColor || new THREE.Color(0.4, 0.8, 0.1) },
      uFresnelColor: { value: params.uFresnelColor || new THREE.Color(0.6, 1.0, 0.3) },
      uFresnelPower: { value: params.uFresnelPower || 1.4 },
      uGlossiness: { value: params.uGlossiness || 3.0 }
    };
    
    super({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: false,
      side: THREE.DoubleSide
    });
  }
} 