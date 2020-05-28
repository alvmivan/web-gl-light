import {createIndexBuffer, bindAttributeToVertexBuffer, createProgram,createVertexBuffer } from "../utils.js";

/**
 * esta clase es la encargada de renderizar las meshes usando triangulos
 * tambien de la inicializacion del vao
 */


export class MeshRenderer
{    
    vao;    
    /** @type {Material} */
    material;
    count;
    renderMode;
    /**     
     * @param {Material} material
     * @param {TrianglesMeshModel} meshModel      
     * @param {WebGL2RenderingContext} gl     
     */
    constructor(meshModel, gl, material)
    {                
        this.vao = gl.createVertexArray();        
        this.material = material;        
        this.count = meshModel.triangles.length;
        this.renderMode = gl.TRIANGLES;

        const positionBuffer = createVertexBuffer(gl, meshModel.vertices);
        const indexBuffer = createIndexBuffer(gl, meshModel.triangles);
        
        let positionAttributeLocation = gl.getAttribLocation(material.program, material.vertexPositionName);   
        
        
        gl.useProgram(material.program);
        gl.bindVertexArray(this.vao);
        gl.enableVertexAttribArray(positionAttributeLocation);
        bindAttributeToVertexBuffer(gl, positionAttributeLocation, 3, positionBuffer);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bindVertexArray(null);
    }

    
}


