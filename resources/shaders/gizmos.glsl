#version 300 es
precision mediump float;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform vec3 color;

in vec3 vertexPosition;
out vec3 frag_color;

void bestAbsOne(inout vec3 v)
{
    if(abs(v.x)>abs(v.y))
    {
        v.y = 0.0;
        bool xone = abs(v.x) > abs(v.z);
        v.x = xone ? 1.0 : 0.0;
        v.z = xone ? 0.0 : 1.0;
    }
    else
    {
        v.x = 0.0;
        bool yone = abs(v.y) > abs(v.z);
        v.y = yone ? 1.0 : 0.0;
        v.z = yone ? 0.0 : 1.0;
    }   
    
}


void main() 
{   
    vec4 worldVertex = modelMatrix * vec4(vertexPosition, 1);
    frag_color = vertexPosition;
    bestAbsOne(frag_color);
    gl_Position = projectionMatrix * viewMatrix * worldVertex;
}
    