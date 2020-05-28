import {createIndexBuffer, bindAttributeToVertexBuffer, createProgram,createVertexBuffer } from "../utils.js";

/**
 * esta clase es la encargada de renderizar las meshes usando triangulos
 * tambien de la inicializacion del vao
 */


export class WireframeRenderer
{    
    vao;    
    /** @type {Material} */
    material;
    count;

    /**     
     * @param {Material} material
     * @param {TrianglesMeshModel} meshModel      
     * @param {WebGL2RenderingContext} gl     
     */
    constructor(meshModel, gl, material, pure) // pure es no parsear porque no son triangulos
    {                
        let asLines = meshModel.triangles;
        if(!pure)
        {
            asLines = this.trianglesToLines(asLines);
        }
         
        this.vao = gl.createVertexArray();        
        this.material = material;        
        this.count = asLines.length;
        this.renderMode = gl.LINES;

        const positionBuffer = createVertexBuffer(gl, meshModel.vertices);
        const indexBuffer = createIndexBuffer(gl, asLines);

        let positionAttributeLocation = gl.getAttribLocation(material.program, material.vertexPositionName);           
        
        gl.useProgram(material.program);
        gl.bindVertexArray(this.vao);
        gl.enableVertexAttribArray(positionAttributeLocation);
        bindAttributeToVertexBuffer(gl, positionAttributeLocation, 3, positionBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bindVertexArray(null);
    }

    /**
     * 
     * @param {Array<Number>} triangles 
     */
    trianglesToLines(triangles)
    {
        let out = []
        for(let i=0 ; i<triangles.length ; i+=3)
        {
            out.push(triangles[i]);
            out.push(triangles[i+1]);
            out.push(triangles[i+1]);
            out.push(triangles[i+2]);
            out.push(triangles[i+2]);
            out.push(triangles[i]);
        }
        return out;
    }

    
}


