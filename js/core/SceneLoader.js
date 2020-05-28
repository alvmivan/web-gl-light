import { GameEntity } from "./GameEntity.js"
import { shaders } from "./Pools.js"
import { Material } from "./Material.js"
import { ObjParser } from "./ObjParser.js"
import { MeshRenderer } from "./MeshRenderer.js"
import { WireframeRenderer } from "./WireframeRenderer.js"
import {createProgram, createShader } from "../utils.js"
import { getScript } from "../scripts/scripts.js"
import { CompositeRenderer, AND } from "./CompositeRenderer.js"

/*
    Responsabilidad : cargar la escena
    vamos a tener un json llamado config.json al que le vamos a preguntar que escena queremos cargar
    quiza podrian pasarle el json
*/

export class CameraData
{
    /** @type {any[]} */
    scripts = []
    /** @type {number} */        
}

class SceneModel
{    
    /**
     * @type {CameraData}
     */
    cameraData = new CameraData()
    /**
     * @type {Array<GameEntity>} 
     */
    entities = []
    /**
     * @type {Array<Material>}
     */
    materials = []
}

export class SceneLoader
{

    data = new SceneModel();
    
    /**
     * 
     * @param {WebGL2RenderingContext} gl 
     * @param {(sceneLoader: SceneLoader)=>any} onSceneLoaded 
     * @returns {Promise<SceneModel>}
     * //es una funcion que se ejecuta al terminar de cargarse la escena
     */
    async loadMainScene(gl, onSceneLoaded = undefined)
    {
        const config = await resourcesLoad('config.json');
        this.data = await loadPrefab(gl,config.sceneLocation, this.data, true);
        if(onSceneLoaded)
        {
            onSceneLoaded(this.data);
        }
        return this.data;
    }
 

    clean()
    {        
        this.data = new SceneModel();
    }
}
/**
 @param {SceneModel} data
 */
async function loadCamera(cameraData, gl, data)
{
    data.cameraData.scripts.push(getScript("orbitalcam"));
     // todo: deshardcodear y pasarlo al json   
}

/**
 * @param {WebGL2RenderingContext} gl  
 * @param {string} sceneLocation 
 * @param {SceneModel} data 
 * @return {Promise<SceneModel>}
 */
export async function loadPrefab(gl, sceneLocation, data, chargeCamera = false)
{   
    if(!data)
    {
        data = new SceneModel();
    }
    const sceneData = await resourcesLoad(sceneLocation);        
    if(chargeCamera)
    {    
        // levanto la informacion relacionada a la camara
        await loadCamera(sceneData.camera, gl, data);
    }
    // levantar los materiales y guardarlos en la pool        
    await loadMaterials(sceneData.materials, gl, data);
    // levanto las entidades de la escena con sus geometrias
    await loadGeometries(sceneData.objects, gl , data);
    return data;
}

/**
 * @param {SceneModel} sceneData
 * @param { Array<{
            "name" : String,
            "geometry" : String,
            "transform" : {
                "position" : Number[],
                "rotation" : Number[],
                "scale" : Number[]
            },            
            "materialInstance" : 
            {
                "materialIndex" : Number,
                "uniforms" :                 
                    {
                        "name" : String,
                        "type" : String,
                        "value" : Number[]
                    }[]                 
            }
        }>} objects */


        

async function loadGeometries(objects, gl, sceneData)
{
    let objParser = new ObjParser();

    for (let i = 0; i < objects.length; i++) 
    {
        let object = objects[i];

        let meshModel = {};

        if(object.geometry)
        {
            let rawObj = await resourcesLoad(object.geometry, false);            
            meshModel = objParser.parse(rawObj);
        }
        else if(object.vertices && object.indices)
        {
            meshModel.triangles = object.indices;
            meshModel.vertices = object.vertices;
        }        

        // todo: chequear si tiene material, sino ver de crear uno default
        let materialData = object.materialInstance;               
        let materialInstance = instantiateMaterialFromData(materialData)
        
        let renderer;
        
        if(object.rendererType)
        {   
            let wireframeMaterial = materialInstance;
            if(object.wireframeMaterial)
            {
                
                wireframeMaterial = instantiateMaterialFromData(object.wireframeMaterial);
            }         
            if(object.rendererType.toLowerCase() == "wireframe")
            {
                let pure = false;
                if(object.pureWireframe)
                {
                    pure = true;
                }
                renderer = new WireframeRenderer(meshModel, gl, wireframeMaterial, pure);
            }
            else if(object.rendererType.toLowerCase() == "composite")
            {
                let w = new WireframeRenderer(meshModel, gl, wireframeMaterial);
                
                let t = new MeshRenderer(meshModel, gl, materialInstance);

                renderer = new CompositeRenderer([t,w]);                
                if(object.compositeMode.toLowerCase() == "and")
                {
                    renderer.rendererType = AND;    
                }
            }
            else
            {
                renderer = new MeshRenderer(meshModel, gl, materialInstance);
            }     
        }
        else
        {
            renderer = new MeshRenderer(meshModel, gl, materialInstance);
        }

        let entity = new GameEntity(renderer);

        entity.tag = object.tag;

      //  console.log("tag : "+entity.tag);

        if(object.scripts)
        {
            object.scripts.forEach((scriptData)=>
            {
                let script = getScript(scriptData.key);
                script.params = scriptData.params;
                entity.scripts.push(script);
            });
        }

        if(object.transform) // si ni lo tiene es porque va identity
        {
            if(object.transform.position)
            {
                entity.transform.position = object.transform.position;
            }
            if(object.transform.rotation)
            {
                entity.transform.rotation = object.transform.rotation;
            }
            if(object.transform.scale)
            {
                entity.transform.scale = object.transform.scale;
            }
        }
        sceneData.entities.push(entity);
    }



    function instantiateMaterialFromData(materialData) {
        let materialInstance = sceneData.materials[materialData.materialIndex].clone()
        materialInstance.uniforms = materialData.uniforms
        return materialInstance
    }
}


/**
 * tiene mas cosas scene data pero esto lo unico que importa en esta funcion
 * @param {Array<{ 
        fragmentPath : String vertexPath : String
        modelMatrixName :  String
        viewMatrixName : String
        projectionMatrixName : String
        vertexPositionName : String
    }>} materialsData 
    @param {SceneModel} sceneData
 * @param {WebGL2RenderingContext} gl 
 */
async function loadMaterials(materialsData, gl, sceneData) 
{
    for ( let i = 0 ; i< materialsData.length ; ++i)
    {
        let materialData = materialsData[i];
        let material = new Material();
        // busco los sahders, los compilo y creo el program
        let fragPath = materialData.fragmentPath;
        let vertPath = materialData.vertexPath;
        let fragmentShader;
        let vertexShader;
        if (shaders.has(fragPath)) {
            fragmentShader = shaders.get(fragPath);
        }
        else {
            let fragmentShaderSource = await resourcesLoad(fragPath, false);
            fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
            shaders.set(fragPath, fragmentShader);
        }
        if (shaders.has(vertPath)) {
            vertexShader = shaders.get(vertPath);
        }
        else {
            let vertexShaderSource = await resourcesLoad(vertPath, false);
            vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
            shaders.set(vertPath, vertexShader);
        }
        material.program = createProgram(gl, vertexShader, fragmentShader);
        //seteo las locaciones de los uniforms
        material.modelMatrixLocation = gl.getUniformLocation(material.program, materialData.modelMatrixName);
        material.viewMatrixLocation = gl.getUniformLocation(material.program, materialData.viewMatrixName);
        material.projectionMatrixLocation = gl.getUniformLocation(material.program, materialData.projectionMatrixName);
        material.vertexPositionName = materialData.vertexPositionName;
        // guardo el material
        sceneData.materials.push(material);
    }
}

const resourcesLocation = '../../resources/';

async function resourcesLoad(path, isJson = true)
{    
    const response = await fetch(resourcesLocation + path);

    // isJson = response.headers.get('content-type')  === 'application/json'; // todo: ver que onda con esto

    if(isJson)
    {
        return JSON.parse(await response.text());
    }    
    else
    {
        return await response.text();
    }
    
}