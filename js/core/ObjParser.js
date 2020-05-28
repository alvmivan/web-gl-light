import {TrianglesMeshModel} from "./TrianglesMeshModel.js"


export class ObjParser
{
    /**
     * @returns {TrianglesMeshModel}
     * @param {String} objRaw 
     */
    parse(objRaw)
    {
        if(typeof objRaw !== 'string')
        {
            objRaw = objRaw.toString();
        }

        var lines = objRaw.trim().split('\n');

        var positions = [];
        var cells = [];
        var vertexUVs = [];
        var vertexNormals = [];
        var faceUVs = [];
        var faceNormals = [];
        var name = null;

        for(var i=0; i<lines.length; i++) {
          var line = lines[i];
    
          if(line[0] === '#') continue; // ignorar los comentarios
    
          var parts = line.trim().replace(/ +/g, ' ').split(' ');
    
          switch(parts[0]) 
          {
            case 'o':
              name = parts.slice(1).join(' ');
              break;
            case 'v':
              var position = parts.slice(1).map(Number).slice(0, 3);
              positions = combine(positions, position);
              break;
            case 'vt':
              var uv = parts.slice(1).map(Number);
              vertexUVs = combine(vertexUVs, uv);
              break;
            case 'vn':
              var normal = parts.slice(1).map(Number);
              vertexNormals = combine(vertexNormals, normal);
              break;
            case 'f':
              var positionIndices = [];
              var uvIndices = [];
              var normalIndices = [];
          
              parts
                .slice(1)
                .forEach(function(part) {
                  var indices = part
                    .split('/')
                    .map(function(index) {
                      if(index === '') {
                        return NaN;
                      }
                      return Number(index);
                    })
                
                  positionIndices.push(convertIndex(indices[0], positions.length));
                
                  if(indices.length > 1) {
                    if(!isNaN(indices[1])) {
                      uvIndices.push(convertIndex(indices[1], vertexUVs.length));
                    }
                    if(!isNaN(indices[2])) {
                      normalIndices.push(convertIndex(indices[2], vertexNormals.length));
                    }
                  }
              
                });
            
                cells = combine(cells, positionIndices);
            
                if(uvIndices.length > 0) {
                  faceUVs.push(uvIndices);
                }
                if(normalIndices.length > 0) {
                  faceNormals.push(normalIndices);
                }

              break;
            default:
              // skip
          }
    
        }
      
        var mesh = 
        {
            positions: positions,
            cells: cells
        };
      
        if(vertexUVs.length > 0) 
        {
          mesh.vertexUVs = vertexUVs;
        }
      
        if(faceUVs.length > 0) 
        { 
          mesh.faceUVs = faceUVs;
        }
      
        if(vertexNormals.length > 0) 
        {
          mesh.vertexNormals = vertexNormals;
        }
      
        if(faceNormals.length > 0) 
        {
          mesh.faceNormals = faceNormals;
        }
      
        if(name !== null) 
        {
          mesh.name = name;
        }

        let model = new TrianglesMeshModel();
        model.vertices = mesh.positions;
        model.triangles = mesh.cells;    
        model.meshName = mesh.name;
        // por ahora solo necesito esto
        // pero dejo las otras cosas parseadas para cuando las necesitemos
      
        return model;
    }
} 
       
function convertIndex(objIndex, arrayLength) {
  return objIndex > 0 ? objIndex - 1 : objIndex + arrayLength;
}

function combine(listA, listB)
{
    return [...listA, ...listB];
}