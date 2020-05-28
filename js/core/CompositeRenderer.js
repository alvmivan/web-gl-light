import {MeshRenderer} from "./MeshRenderer.js";
import {WireframeRenderer} from "./WireframeRenderer.js";

// no se como hacer un enum :( 
export const OR = 0
export const AND = 1


export class CompositeRenderer
{

    

    /** @type {Array<MeshRenderer | WireframeRenderer>} */
    renderers = []
    index = 0

    /**
     * 
     * @param {Array<MeshRenderer|WireframeRenderer>} renderers 
     */
    constructor(renderers)
    {
        this.renderers = renderers;        
    }

    get material()
    {
        return this.renderers[this.index].material;
    }

    get vao()
    {
        return this.renderers[this.index].vao;
    }

    get count()
    {
        return this.renderers[this.index].count;
    }

    get renderMode()
    {
        return this.renderers[this.index].renderMode;
    }

    rendererType = OR;

}