/**
 * aca se guardan los datos adicionales al program
 */
export class Material 
{
    modelMatrixLocation;
    viewMatrixLocation;
    projectionMatrixLocation;
    program;
    vertexColorName;
    vertexPositionName;

    clone()
    {
        let mat = new Material();
        mat.modelMatrixLocation = this.modelMatrixLocation;
        mat.viewMatrixLocation = this.viewMatrixLocation;
        mat.projectionMatrixLocation = this.projectionMatrixLocation;
        mat.program = this.program;
        mat.vertexColorName = this.vertexColorName;
        mat.vertexPositionName = this.vertexPositionName;
        return mat;
    } 
    // probar despues con JSON.parse(JSON.strngfy(this)) como un depth-clone

}
