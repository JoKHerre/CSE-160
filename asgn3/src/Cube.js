class Cube {
    constructor() {
        this.type='cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -2;

        this.uvBuffer = null;
        this.vertexBuffer = null

        this.cubeVertices32 = new Float32Array([
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

        this.uvVertices = new Float32Array([
            
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
        // drawTriangle3D( [0,1,0, 0,1,1, 1,1,1 ] );
        // drawTriangle3D( [0,1,0, 1,1,1, 1,1,0] );
        
        // 4 Sides
        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
        drawTriangle3DUV([0,0,0, 1,1,0, 1,0,0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV( [0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1]);
        // drawTriangle3D( [0,0,0, 1,1,0, 1,0,0] );
        // drawTriangle3D( [0,0,0, 0,1,0, 1,1,0] );

        gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
        drawTriangle3DUV( [0,0,0, 0,0,1, 0,1,1], [0,0, 1,0, 1,1] );
        drawTriangle3DUV( [0,0,0, 0,1,0, 0,1,1], [0,0, 0,1, 1,1] );
        // drawTriangle3D( [0,0,0, 0,0,1, 0,1,1] );
        // drawTriangle3D( [0,0,0, 0,1,0, 0,1,1] );
        

        
        gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);
        drawTriangle3DUV( [1,0,0, 1,0,1, 1,1,1], [0,0, 1,0, 1,1] );
        drawTriangle3DUV( [1,0,0, 1,1,0, 1,1,1], [0,0, 0,1, 1,1]);
        // drawTriangle3D( [1,0,0, 1,0,1, 1,1,1] );
        // drawTriangle3D( [1,0,0, 1,1,0, 1,1,1] );

        gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);
        drawTriangle3DUV( [0,0,1, 1,0,1, 1,1,1], [0,0, 1,0, 1,1] );
        drawTriangle3DUV( [0,0,1, 0,1,1, 1,1,1], [0,0, 0,1, 1,1] );
        // drawTriangle3D( [0,0,1, 1,0,1, 1,1,1] );
        // drawTriangle3D( [0,0,1, 0,1,1, 1,1,1] );

        // Bottom
        gl.uniform4f(u_FragColor, rgba[0]*.5, rgba[1]*.5, rgba[2]*.5, rgba[3]);
        drawTriangle3DUV( [0,0,0, 0,0,1, 1,0,1], [0,0, 0,1, 1,1] );
        drawTriangle3DUV( [0,0,0, 1,0,1, 1,0,0], [0,0, 1,1, 1,0] );
        // drawTriangle3D( [0,0,0, 0,0,1, 1,0,1] );
        // drawTriangle3D( [0,0,0, 1,0,1, 1,0,0] );
    }

    renderFast() {
        var rgba = this.color;

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        
        // Pass the matrix to u_ModelMatrix
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        if (g_vertexBuffer == null) {
            initTriangle3D();
        }

        // gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
        // gl.bufferData(gl.ARRAY_BUFFER, this.cubeVertices32, gl.DYNAMIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.cubeVertices, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.bindBuffer(gl.ARRAY_BUFFER, g_uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.uvVertices, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_UV);


        gl.drawArrays(gl.TRIANGLES, 0, 36);

        // var allVerts = [];

        // // Top of cube
        // allVerts = allVerts.concat([0,1,0, 0,1,1, 1,1,1]);
        // allVerts = allVerts.concat([0,1,0, 1,1,1, 1,1,0]);

        // // drawTriangle3DUV( [0,1,0, 0,1,1, 1,1,1], [0,0, 0,1, 1,1] );     
        // // drawTriangle3DUV( [0,1,0, 1,1,1, 1,1,0], [0,0, 1,1, 1,0] );
        
        // // 4 Sides
        // allVerts = allVerts.concat([0,0,0, 1,1,0, 1,0,0]);
        // allVerts = allVerts.concat([0,0,0, 0,1,0, 1,1,0]);
        // // gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
        // // drawTriangle3DUV([0,0,0, 1,1,0, 1,0,0], [0,0, 1,1, 1,0]);
        // // drawTriangle3DUV( [0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1]);

        // allVerts = allVerts.concat([0,0,0, 0,0,1, 0,1,1]);
        // allVerts = allVerts.concat([0,0,0, 0,1,0, 0,1,1]);
        // // gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
        // // drawTriangle3DUV( [0,0,0, 0,0,1, 0,1,1], [0,0, 1,0, 1,1] );
        // // drawTriangle3DUV( [0,0,0, 0,1,0, 0,1,1], [0,0, 0,1, 1,1] );

        // allVerts = allVerts.concat([1,0,0, 1,0,1, 1,1,1]);
        // allVerts = allVerts.concat([1,0,0, 1,1,0, 1,1,1]);
        // // gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);
        // // drawTriangle3DUV( [1,0,0, 1,0,1, 1,1,1], [0,0, 1,0, 1,1] );
        // // drawTriangle3DUV( [1,0,0, 1,1,0, 1,1,1], [0,0, 0,1, 1,1]);


        // allVerts = allVerts.concat([0,0,1, 1,0,1, 1,1,1]);
        // allVerts = allVerts.concat([0,0,1, 0,1,1, 1,1,1]);
        // // gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);
        // // drawTriangle3DUV( [0,0,1, 1,0,1, 1,1,1], [0,0, 1,0, 1,1] );
        // // drawTriangle3DUV( [0,0,1, 0,1,1, 1,1,1], [0,0, 0,1, 1,1] );


        // // Bottom
        // allVerts = allVerts.concat([0,0,0, 0,0,1, 1,0,1]);
        // allVerts = allVerts.concat([0,0,0, 1,0,1, 1,0,0]);
        // // gl.uniform4f(u_FragColor, rgba[0]*.5, rgba[1]*.5, rgba[2]*.5, rgba[3]);
        // // drawTriangle3DUV( [0,0,0, 0,0,1, 1,0,1], [0,0, 0,1, 1,1] );
        // // drawTriangle3DUV( [0,0,0, 1,0,1, 1,0,0], [0,0, 1,1, 1,0] );

        // drawTriangle3D(allVerts);
        // // drawTriangle3DUV(this.vertices, )
    }
}