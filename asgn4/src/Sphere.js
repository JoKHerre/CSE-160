class Sphere {
    constructor() {
        this.type='sphere';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
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

        var d = Math.PI / 10;
        var dd = Math.PI / 10;

        for (var t = 0; t <Math.PI; t += d) {
            for (var r = 0; r < (2*Math.PI); r += d) { 
                var p1 = [Math.sin(t)*Math.cos(r), Math.sin(t)*Math.sin(r), Math.cos(t)];
                var p2 = [Math.sin(t+dd)*Math.cos(r), Math.sin(t+dd)*Math.sin(r), Math.cos(t+dd)];
                var p3 = [Math.sin(t)*Math.cos(r+dd), Math.sin(t)*Math.sin(r+dd), Math.cos(t)];
                var p4 = [Math.sin(t+dd)*Math.cos(r+dd), Math.sin(t+dd)*Math.sin(r+dd), Math.cos(t+dd)];

                var uv1 = [t/Math.PI, r/(2*Math.PI)];
                var uv2 = [(t+dd)/Math.PI, r/(2*Math.PI)];
                var uv3 = [t/Math.PI, (r+dd)/(2*Math.PI)];
                var uv4 = [(t+dd)/Math.PI, (r+dd)/(2*Math.PI)];

                var v = [];
                var uv = [];

                v = v.concat(p1); uv = uv.concat(uv1);
                v = v.concat(p2); uv = uv.concat(uv2);
                v = v.concat(p4); uv = uv.concat(uv4);

                gl.uniform4f(u_FragColor, 1,1,1,1);
                drawTriangle3DUVNormal(v, uv, new Float32Array(v), new Float32Array(uv), new Float32Array(v));

                v = [];
                uv = [];
                v = v.concat(p1); uv = uv.concat(uv1);
                v = v.concat(p4); uv = uv.concat(uv4);
                v = v.concat(p3); uv = uv.concat(uv3);
                gl.uniform4f(u_FragColor, 1,1,1,1);
                drawTriangle3DUVNormal(v, uv, new Float32Array(v), new Float32Array(uv), new Float32Array(v));
            }
        }

        // // Top of cube
        // drawTriangle3DUV( [0,1,0, 0,1,1, 1,1,1], [0,0, 0,1, 1,1] );     
        // drawTriangle3DUV( [0,1,0, 1,1,1, 1,1,0], [0,0, 1,1, 1,0] );
        // // 4 Sides
        // gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
        // drawTriangle3DUV([0,0,0, 1,1,0, 1,0,0], [0,0, 1,1, 1,0]);
        // drawTriangle3DUV( [0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1]);

        // gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
        // drawTriangle3DUV( [0,0,0, 0,0,1, 0,1,1], [0,0, 1,0, 1,1] );
        // drawTriangle3DUV( [0,0,0, 0,1,0, 0,1,1], [0,0, 0,1, 1,1] );
        
        // gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);
        // drawTriangle3DUV( [1,0,0, 1,0,1, 1,1,1], [0,0, 1,0, 1,1] );
        // drawTriangle3DUV( [1,0,0, 1,1,0, 1,1,1], [0,0, 0,1, 1,1]);

        // gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);
        // drawTriangle3DUV( [0,0,1, 1,0,1, 1,1,1], [0,0, 1,0, 1,1] );
        // drawTriangle3DUV( [0,0,1, 0,1,1, 1,1,1], [0,0, 0,1, 1,1] );

        // // Bottom
        // gl.uniform4f(u_FragColor, rgba[0]*.5, rgba[1]*.5, rgba[2]*.5, rgba[3]);
        // drawTriangle3DUV( [0,0,0, 0,0,1, 1,0,1], [0,0, 0,1, 1,1] );
        // drawTriangle3DUV( [0,0,0, 1,0,1, 1,0,0], [0,0, 1,1, 1,0] );
    }

    renderFast() {
        var rgba = this.color;
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        if (g_vertexBuffer == null) {
            initTriangle3D();
        }

        // gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.cubeVertices32, gl.DYNAMIC_DRAW);

        // gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
        // gl.bufferData(gl.ARRAY_BUFFER, this.cubeVertices, gl.DYNAMIC_DRAW);
        // gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        // gl.enableVertexAttribArray(a_Position);

        // gl.bindBuffer(gl.ARRAY_BUFFER, g_uvBuffer);
        // gl.bufferData(gl.ARRAY_BUFFER, this.uvVertices, gl.DYNAMIC_DRAW);
        // gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
        // gl.enableVertexAttribArray(a_UV);


        // gl.drawArrays(gl.TRIANGLES, 0, 36);
        // drawTriangle3DUV(this.cubeVertices, this.uvVertices, this.cubeVertices32, this.uvVertices32);
        drawTriangle3DUVNormal(this.cubeVertices, this.uvVertices, this.cubeVertices32, this.uvVertices32, this.normalVertices32);
        

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