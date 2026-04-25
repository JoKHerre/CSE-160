class Cube {
    constructor() {
        this.type='cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }

    render() {
        var rgba = this.color;

        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the maatrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front of cube
        drawTriangle3D( [0,0,0, 1,1,0, 1,0,0] );
        drawTriangle3D( [0,0,0, 0,1,0, 1,1,0] );

        // Pass color of a point to a u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
    

        // drawTriangle3D( [0,0,-1, 1,1,-1, 1,0,-1] );
        // drawTriangle3D( [0,0,0, 1,1,0, 1,0,0] );
        // drawTriangle3D( [0,0,0, 0,1,0, 1,1,0] );
        // drawTriangle3D( [0,0,-1, 0,1,-1, 1,1,-1] );


        // Sides
        drawTriangle3D( [0,0,0, 0,0,1, 0,1,1] );
        drawTriangle3D( [0,0,0, 0,1,0, 0,1,1] );

        drawTriangle3D( [1,0,0, 1,0,1, 1,1,1] );
        drawTriangle3D( [1,0,0, 1,1,0, 1,1,1] );

        drawTriangle3D( [0,0,1, 1,0,1, 1,1,1] );
        drawTriangle3D( [0,0,1, 0,1,1, 1,1,1] );

        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
        // Top of cube
        drawTriangle3D( [0,1,0, 0,1,1, 1,1,1] );
        drawTriangle3D( [0,1,0, 1,1,1, 1,1,0] );

        // Bottom
        drawTriangle3D( [0,0,0, 0,0,1, 1,0,1] );
        drawTriangle3D( [0,0,0, 1,0,1, 1,0,0] );
    }
}