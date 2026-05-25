class Cube {
    constructor() {
        this.type='cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.textureNum = -2;

        this.uvBuffer = null;
        this.vertexBuffer = null

        
        this.cubeVertices32 = new Float32Array([
            // // Top of cube
            0,1,0,  0,1,1,  1,1,1,
            0,1,0,  1,1,1,  1,1,0,

            // // 4 Sides
            0,0,0,  0,0,1,  0,1,1,
            0,0,0,  0,1,0,  0,1,1,

            0,0,0,  1,0,0,  1,1,0,
            0,0,0,  0,1,0,  1,1,0,

            1,0,0,  1,0,1,  1,1,1,
            1,0,0,  1,1,0,  1,1,1,

            0,0,1,  1,0,1,  1,1,1,
            0,0,1,  0,1,1,  1,1,1,
    
            // // Bottom
            0,0,0,  0,0,1,  1,0,1,
            0,0,0,  1,0,1,  1,0,0,
        ]);

        this.cubeVertices = [
            0,1,0,  0,1,1,  1,1,1,
            0,1,0,  1,1,1,  1,1,0,

            0,0,0,  0,0,1,  0,1,1,
            0,0,0,  0,1,0,  0,1,1,

            0,0,0,  1,0,0,  1,1,0,
            0,0,0,  0,1,0,  1,1,0,

            1,0,0,  1,0,1,  1,1,1,
            1,0,0,  1,1,0,  1,1,1,

            0,0,1,  1,0,1,  1,1,1,
            0,0,1,  0,1,1,  1,1,1,

            0,0,0,  0,0,1,  1,0,1,
            0,0,0,  1,0,1,  1,0,0,
        ];

        this.uvVertices32 = new Float32Array([
            0,0, 0,1, 1,1,
            0,0, 1,1, 1,0,
            0,0, 1,1, 1,0,
            0,0, 0,1, 1,1,
            0,0, 1,0, 1,1,
            0,0, 0,1, 1,1,
            0,0, 1,0, 1,1,
            0,0, 0,1, 1,1,
            0,0, 1,0, 1,1,
            0,0, 0,1, 1,1,
            0,0, 0,1, 1,1,
            0,0, 1,1, 1,0
        ]);

        this.uvVertices = [
            0,0, 0,1, 1,1,
            0,0, 1,1, 1,0,
            0,0, 1,1, 1,0,
            0,0, 0,1, 1,1,
            0,0, 1,0, 1,1,
            0,0, 0,1, 1,1,
            0,0, 1,0, 1,1,
            0,0, 0,1, 1,1,
            0,0, 1,0, 1,1,
            0,0, 0,1, 1,1,
            0,0, 0,1, 1,1,
            0,0, 1,1, 1,0
        ];

        this.normalVertices32 = new Float32Array([
            // Top
            0,1,0,   0,1,0,   0,1,0,
            0,1,0,   0,1,0,   0,1,0,
            // Left
            -1,0,0,  -1,0,0,  -1,0,0,
            -1,0,0,  -1,0,0,  -1,0,0,
            // Front
            0,0,-1,  0,0,-1,  0,0,-1,
            0,0,-1,  0,0,-1,  0,0,-1,
            // Right
            1,0,0,   1,0,0,   1,0,0,
            1,0,0,   1,0,0,   1,0,0,
            // Back
            0,0,1,   0,0,1,   0,0,1,
            0,0,1,   0,0,1,   0,0,1,
            // Bottom
            0,-1,0,  0,-1,0,  0,-1,0,
            0,-1,0,  0,-1,0,  0,-1,0,
        ]);
    }

    render() {
        var rgba = this.color;

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);
        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        // Pass the maatrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Top of cube
        drawTriangle3DUV( [0,1,0, 0,1,1, 1,1,1], [0,0, 0,1, 1,1] );     
        drawTriangle3DUV( [0,1,0, 1,1,1, 1,1,0], [0,0, 1,1, 1,0] );
        // 4 Sides
        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
        drawTriangle3DUV([0,0,0, 1,1,0, 1,0,0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV( [0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1]);

        gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
        drawTriangle3DUV( [0,0,0, 0,0,1, 0,1,1], [0,0, 1,0, 1,1] );
        drawTriangle3DUV( [0,0,0, 0,1,0, 0,1,1], [0,0, 0,1, 1,1] );
        
        gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);
        drawTriangle3DUV( [1,0,0, 1,0,1, 1,1,1], [0,0, 1,0, 1,1] );
        drawTriangle3DUV( [1,0,0, 1,1,0, 1,1,1], [0,0, 0,1, 1,1]);

        gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);
        drawTriangle3DUV( [0,0,1, 1,0,1, 1,1,1], [0,0, 1,0, 1,1] );
        drawTriangle3DUV( [0,0,1, 0,1,1, 1,1,1], [0,0, 0,1, 1,1] );

        // Bottom
        gl.uniform4f(u_FragColor, rgba[0]*.5, rgba[1]*.5, rgba[2]*.5, rgba[3]);
        drawTriangle3DUV( [0,0,0, 0,0,1, 1,0,1], [0,0, 0,1, 1,1] );
        drawTriangle3DUV( [0,0,0, 1,0,1, 1,0,0], [0,0, 1,1, 1,0] );
    }

    renderFast() {
        var rgba = this.color;
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        if (g_vertexBuffer == null) {
            initTriangle3D();
        }

        gl.bufferData(gl.ARRAY_BUFFER, this.cubeVertices32, gl.DYNAMIC_DRAW);
        drawTriangle3DUVNormal(this.cubeVertices, this.uvVertices, this.cubeVertices32, this.uvVertices32, this.normalVertices32);
    }
}