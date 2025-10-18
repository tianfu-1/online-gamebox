// Fragment shader (a simple textured shader)

precision mediump float;
varying vec2 vUv0;
uniform sampler2D uDiffuseMap;

void main(void) {
    gl_FragColor = texture2D(uDiffuseMap, vUv0);
}