class Cube {
    constructor() {
        this.type='cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();

        this.buffer = null;
        this.vertices = null;
    }

    generateVertices() {
        this.vertices = new Float32Array([

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
    }

    render() {
        // var rgba = this.color;

        // // Pass the color of a point to u_FragColor uniform variable
        // gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // // Pass the maatrix to u_ModelMatrix attribute
        // gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // if (this.vertices === null) {
        //     this.generateVertices();
        // }

        // if (this.buffer === null) {
        //     this.buffer = gl.createBuffer();
        //     if (!this.buffer) {
        //         console.log("Failed to create cube buffer");
        //         return;
        //     }
        // }

        // gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

        // gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
        
        // gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        // gl.enableVertexAttribArray(a_Position);

        // gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);

        var rgba = this.color;

        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the maatrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Top of cube
        drawTriangle3D( [0,1,0, 0,1,1, 1,1,1] );
        drawTriangle3D( [0,1,0, 1,1,1, 1,1,0] );
        
        // 4 Sides
        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
        drawTriangle3D( [0,0,0, 0,0,1, 0,1,1] );
        drawTriangle3D( [0,0,0, 0,1,0, 0,1,1] );
        
        gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
        drawTriangle3D( [0,0,0, 1,1,0, 1,0,0] );
        drawTriangle3D( [0,0,0, 0,1,0, 1,1,0] );
        
        gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);
        drawTriangle3D( [1,0,0, 1,0,1, 1,1,1] );
        drawTriangle3D( [1,0,0, 1,1,0, 1,1,1] );

        gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);
        drawTriangle3D( [0,0,1, 1,0,1, 1,1,1] );
        drawTriangle3D( [0,0,1, 0,1,1, 1,1,1] );

        // Bottom
        gl.uniform4f(u_FragColor, rgba[0]*.5, rgba[1]*.5, rgba[2]*.5, rgba[3]);
        drawTriangle3D( [0,0,0, 0,0,1, 1,0,1] );
        drawTriangle3D( [0,0,0, 1,0,1, 1,0,0] );
    }
}