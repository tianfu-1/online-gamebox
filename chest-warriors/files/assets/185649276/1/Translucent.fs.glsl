// Fragment Shader
precision mediump float;

uniform vec3 uColor;
uniform float uRimPower;
uniform float uRimIntensity;

varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewDir);
    
    float rim = 1.0 - max(dot(viewDir, normal), 0.0);
    rim = pow(rim, uRimPower) * uRimIntensity;
    
    vec3 finalColor = uColor * rim;
    
    gl_FragColor = vec4(finalColor, rim);
}