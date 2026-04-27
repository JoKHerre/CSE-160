class Pyramid {
    constructor() {
        this.type='pyramid';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }

    render() {
        var rgba = this.color;

        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the maatrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Square Base (2 Triangles)
        drawTriangle3D( [0,0,0, 0,0,1, 1,0,1] );
        drawTriangle3D( [0,0,0, 1,0,1, 1,0,0] );

        // 4 Faces
        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
        drawTriangle3D( [0,0,0, 0,0,1, .5,.5,.5] );

        gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
        drawTriangle3D( [0,0,0, 1,0,0, .5,.5,.5] );
        
        gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);
        drawTriangle3D( [1,0,0, 1,0,1, .5,.5,.5] );
        
        gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);
        drawTriangle3D( [0,0,1, 1,0,1, .5,.5,.5] );
    }
}