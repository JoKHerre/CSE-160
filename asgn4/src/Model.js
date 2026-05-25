class Model {
    constructor(gl, filePath) {
        this.filePath = filePath;
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.isFullyLoaded = false;
        this.textureNum = -2;
        this.getFileContent().then(() => {
            this.vertexBuffer = gl.createBuffer();
            this.normalBuffer = gl.createBuffer(); 
            
            if (!this.vertexBuffer || !this.normalBuffer) {
                console.error('Failed to create buffers for model');
                return;
            }
        });
    }

    async parseModel(fileContent) {
        const lines = fileContent.split("\n");
        const allVertices = [];
        const allNormals = [];

        const unpackedVerts = [];
        const unpackedNormals = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const tokens = line.split(/\s+/);

            if (tokens[0] == "v") {
                allVertices.push(parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3]));
            } else if (tokens[0] == "vn") {
                allNormals.push(parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3]));
            } else if (tokens[0] == "f") {
                for (const face of [tokens[1], tokens[2], tokens[3]]) {
                    const indices = face.split("//");
                    const vertexIndex = (parseInt(indices[0]) - 1) * 3;
                    const normalIndex = (parseInt(indices[1]) - 1) * 3;

                    unpackedVerts.push(
                        allVertices[vertexIndex],
                        allVertices[vertexIndex + 1],
                        allVertices[vertexIndex + 2]
                    );

                    unpackedNormals.push(
                        allNormals[normalIndex],
                        allNormals[normalIndex + 1],
                        allNormals[normalIndex + 2]
                    );
                }
            }
        }

        this.modelData = {
            vertices: new Float32Array(unpackedVerts),
            normals: new Float32Array(unpackedNormals)
        };
        this.isFullyLoaded = true;
    }

    async getFileContent() {
        try {
            const response = await fetch(this.filePath);
            if (!response.ok) throw new Error(`Could not load file "${this.filePath}". Are you sure the file name/path are correct?`);

            const fileContent = await response.text();
            await this.parseModel(fileContent);
        } catch (e) {
            console.error('Model load error', e);
        }
    }

    render(gl) {
    if (!this.isFullyLoaded) return;

    // OBJ has no UVs
    gl.disableVertexAttribArray(a_UV);

    // vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.modelData.vertices, gl.DYNAMIC_DRAW);

    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    // normals
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.modelData.normals, gl.DYNAMIC_DRAW);

    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);

    // uniforms
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    gl.uniform4fv(u_FragColor, this.color);
    gl.uniform1i(u_whichTexture, this.textureNum);

    let normalMatrix = new Matrix4();
    normalMatrix.setInverseOf(this.matrix);
    normalMatrix.transpose();

    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

    gl.drawArrays(gl.TRIANGLES, 0, this.modelData.vertices.length / 3);
}
}
