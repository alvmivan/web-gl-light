#version 300 es
precision mediump float;
in vec3 frag_color;
//we need to declare an output for the fragment shader
out vec4 outColor;

void main() 
{   
    outColor = vec4(0.1,0.1,0.1, 1);
}


