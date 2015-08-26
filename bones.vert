attribute vec3 aVertPos;

void main(void) {
	gl_Position = vec4(aVertPos, 1.0);
}
