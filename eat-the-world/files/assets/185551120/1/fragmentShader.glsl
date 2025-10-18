varying vec2 vUv0;

// uniform sampler2D uDiffuseMap;
// uniform sampler2D uHeightMap;
uniform float uTime;

float length2(vec2 p){
    return dot(p,p);
}


float noise(vec2 p){
	return fract(sin(fract(sin(p.x) * (43.13311)) + p.y) * 31.0011);
}

float worley(vec2 p) {
    
	float d = 1e30;
	for (int xo = -1; xo <= 1; ++xo) {
		for (int yo = -1; yo <= 1; ++yo) {
			vec2 tp = floor(p) + vec2(xo, yo);
			d = min(d, length2(p - tp - noise(tp)));
		}
	}
	return 3.0*exp(-4.0*abs(2.5*d - 1.0));
}

float fworley(vec2 p) {
	return sqrt(sqrt(worley(p*5.0)));
}

void main(void)
{
    float t = fworley(vUv0);
    //t*=exp(-length2(abs(0.7*vUv0 - 1.0)));
    t*= abs(sin(uTime * 0.75));
	
    gl_FragColor = vec4(t * vec3(0.1, 1.1*t, pow(t, 0.5-t)), 1.0);
}

