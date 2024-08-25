const fs = {
  readFileSync: function() {
    return `{"saveVersion":7,"fileName":"Untitled model","camPivotPosition":{"x":0.44479864835739138,"y":0.43768882751464846,"z":-0.6910855770111084},"camPivotRotation":{"x":69.06101989746094,"y":10.828967094421387,"z":-0.00017678759468253702},"cameraPosition":{"x":0.07917314767837525,"y":5.523581504821777,"z":-2.6025099754333498},"meshes":[{"preciseFactor":10000,"rotation":{"x":0.0,"y":0.0,"z":0.0,"w":1.0},"facesOfTriangles":[0,0,1,1,2,2,3,3,4,4,5,5],"triangles":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35],"facesUnivertsList":[{"u":[0,1,3,2]},{"u":[2,3,5,4]},{"u":[4,5,7,6]},{"u":[6,7,1,0]},{"u":[6,0,2,4]},{"u":[1,7,5,3]}],"materialIndex":-1,"hasMaterial":false,"smoothNormals":false,"primitiveType":2,"primitiveOptions":[1.0,1.0,1.0,0.0],"smoothPixels":true,"planarCounts":1,"idTex":-1,"displayEdgesLengths":false,"hasNormals":true,"hasColors":true,"hasUVs":true,"_uvs":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"_normals":[0,0,-10000,0,0,-10000,0,0,-10000,0,0,-10000,0,0,-10000,0,0,-10000,0,10000,0,0,10000,0,0,10000,0,0,10000,0,0,10000,0,0,10000,0,0,0,10000,0,0,10000,0,0,10000,0,0,10000,0,0,10000,0,0,10000,0,-10000,0,0,-10000,0,0,-10000,0,0,-10000,0,0,-10000,0,0,-10000,0,-7060,-7082,0,-7060,-7082,0,-7060,-7082,0,-7060,-7082,0,-7060,-7082,0,-7060,-7082,0,7060,7082,0,7060,7082,0,7060,7082,0,7060,7082,0,7060,7082,0,7060,7082,0],"_positions":[0,0,-5000,10000,0,-5000,-10032,10000,-5000,-32,10000,-5000,-10032,10000,5000,-32,10000,5000,0,0,5000,10000,0,5000],"_colorsHtml":["CCCCCC","CCCCCC","CCCCCC","CCCCCC","CCCCCC","CCCCCC","CCCCCC","CCCCCC","CCCCCC","CCCCCC","CCCCCC","CCCCCC","CCCCCC","CCCCCC","CCCCCC","CCCCCC","CCCCCC","CCCCCC","CCCCCC","CCCCCC","CCCCCC","CCCCCC","CCCCCC","CCCCCC","CCCCCC","CCCCCC","CCCCCC","CCCCCC","CCCCCC","CCCCCC","CCCCCC","CCCCCC","CCCCCC","CCCCCC","CCCCCC","CCCCCC"],"_posIndexis":[3,1,0,2,3,0,5,3,2,4,5,2,7,5,4,6,7,4,1,7,6,0,1,6,2,0,6,4,2,6,5,7,1,3,5,1],"_posCounter":[0,0,0,0,1,1,0,2,1,0,1,2,0,2,1,0,1,2,1,2,1,2,2,2,3,3,3,3,4,4,3,3,3,3,4,4]}],"lights":[],"hasAmbient":true}`
  },
  createWriteStream: function() {
    let result = "";
    return {
      write: a => {result += a},
      end: function() {
        return result
      }
    }
  }
}

const inputFilePath = "C:\\filepath\\filename.3ma";
const outputFilePath = "C:\\filepath\\filename.obj";

try {
    const fileContent = fs.readFileSync(inputFilePath, 'utf8');
    const data = JSON.parse(fileContent);

    const outputStream = fs.createWriteStream(outputFilePath);
    let vertexIndex = 0;
    let prevVertexIndex = vertexIndex;
    let forward = 0;

    const meshes = data.meshes || [];

    meshes.forEach((mesh, msh) => {
        outputStream.write("\ng \n");
        const preciseFactor = mesh.preciseFactor || 1;

        if (preciseFactor === 0) {
            throw new Error("preciseFactor cannot be zero");
        }

        prevVertexIndex = vertexIndex;

        const positions = mesh._positions || [];
        for (let vtx = 0; vtx < positions.length; vtx += 3) {
            const posX = positions[vtx] / preciseFactor;
            const posY = positions[vtx + 1] / preciseFactor;
            const posZ = (positions[vtx + 2] * -1) / preciseFactor;
            const vertexString = `v ${posX} ${posY} ${posZ}\n`;
            outputStream.write(vertexString);
            vertexIndex++;
        }

        if (msh > 0) {
            forward = 1;
        }

        const univertsList = mesh.facesUnivertsList || [];
        outputStream.write(`\ng name${msh} \n`);
        univertsList.forEach(fcx => {
            outputStream.write("f");
            fcx.u.forEach(fcxIndex => {
                outputStream.write(` ${fcxIndex + 1 + (forward * prevVertexIndex)}`);
            });
            outputStream.write("\n");
        });
    });

    outputStream.end();

} catch (error) {
    if (error.code === 'ENOENT') {
        console.error(`Error: ${error.message}`);
    } else if (error instanceof SyntaxError) {
        console.error(`Error reading JSON: ${error.message}`);
    } else {
        console.error(`An unexpected error occurred: ${error.message}`);
    }
}
