// Vertex Shader
attribute vec3 aPosition;
attribute vec3 aNormal;

uniform mat4 matrix_model;
uniform mat4 matrix_viewProjection;
uniform vec3 uCameraPosition;

varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
    vec4 worldPosition = matrix_model * vec4(aPosition, 1.0);
    vNormal = mat3(matrix_model) * aNormal;
    vViewDir = uCameraPosition - worldPosition.xyz;
    
    gl_Position = matrix_viewProjection * worldPosition;
}