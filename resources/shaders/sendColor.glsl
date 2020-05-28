#version 300 es
precision mediump float;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform vec3 color;

in vec3 vertexPosition;
out vec3 frag_color;

void main() 
{   
    vec4 worldVertex = modelMatrix * vec4(vertexPosition, 1);
    frag_color = color;
    gl_Position = projectionMatrix * viewMatrix * worldVertex;
}
    