#version 300 es
precision mediump float;
in vec3 frag_color;
//we need to declare an output for the fragment shader
out vec4 outColor;

void main() 
{   
    int x = int((frag_color.x + 1000.0) * 0.1);
    int z = int((frag_color.z + 1000.0) * 0.1);
    vec3 c = frag_color;
    if((x % 2 == 0) != (z % 2 == 0))
    {
        c = vec3(0.2,0.2,0.2);
    }
    else{
        c = vec3(0.8,0.8,0.8);
    }
   	outColor = vec4(c, 1);
}

