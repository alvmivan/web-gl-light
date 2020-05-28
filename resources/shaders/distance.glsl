#version 300 es
precision mediump float;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;


float maxDistSqr = 400.0;
in vec3 vertexPosition;
out vec3 frag_color;

void main() 
{   
    vec4 worldVertex = modelMatrix * vec4(vertexPosition, 1);
    vec4 camPos = viewMatrix * vec4(0,0,0,1);
    vec3 camToVertex = (camPos - worldVertex).xyz;
    float sqrDistance = dot( camToVertex , camToVertex ) ;
    frag_color = vec3(sqrDistance,sqrDistance,sqrDistance) / maxDistSqr;
    gl_Position = projectionMatrix * viewMatrix * worldVertex;
}
    