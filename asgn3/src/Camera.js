class Camera {
    constructor() {
        this.fov = 60;
        this.eye = new Vector3([0,0,0]);
        this.at = new Vector3([0,0,-1]);
        this.up = new Vector3([0,1,0]);

        this.viewMat = new Matrix4();
        this.viewMat.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );

        this.projMat = new Matrix4();
        this.projMat.setPerspective(this.fov, canvas.width/canvas.height, 0.1, 100);

        this.speed = 0.3;
    }

    moveForward() {
        var v = new Vector3();
        v.set(this.at);
        v.sub(this.eye);
        v.normalize();
        
        v.mul(this.speed);

        this.eye.add(v);
        this.at.add(v);
    }

    moveBackward() {
        var v = new Vector3();
        v.set(this.eye);
        v.sub(this.at);
        v.normalize();

        v.mul(this.speed);
        
        this.eye.add(v);
        this.at.add(v);
    }

    moveLeft() {
        var v = new Vector3();
        v.set(this.at);
        v.sub(this.eye);

        var s = Vector3.cross(this.up, v);
        s.normalize();
        s.mul(this.speed);

        this.eye.add(s);
        this.at.add(s);
    }

    moveRight() {
        var v = new Vector3();
        v.set(this.at);
        v.sub(this.eye);

        var s = Vector3.cross(v, this.up);
        s.normalize();
        s.mul(this.speed);

        this.eye.add(s);
        this.at.add(s);
    }

    panLeft(a) {
        var v = new Vector3();
        v.set(this.at);
        v.sub(this.eye);

        var rotationMat = new Matrix4();
        rotationMat.setRotate(a, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

        var v_prime = rotationMat.multiplyVector3(v);
        v_prime.add(this.eye);
        this.at.set(v_prime);
    }

    panRight(a) {
        var v = new Vector3();
        v.set(this.at);
        v.sub(this.eye);

        var rotationMat = new Matrix4();
        rotationMat.setRotate(-a, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        
        var v_prime = rotationMat.multiplyVector3(v);
        v_prime.add(this.eye);
        this.at.set(v_prime);
    }

    lookUp(a) {
        let v = new Vector3();
        v.set(this.at);
        v.sub(this.eye); 

        var s = Vector3.cross(v, this.up);
        s.normalize();

        var rotationMat = new Matrix4();
        rotationMat.setRotate(a, s.elements[0], s.elements[1], s.elements[2]);

        var v_prime = rotationMat.multiplyVector3(v);
        v_prime.add(this.eye)
        this.at.set(v_prime);
    }

    lookDown(a) {
        var v = new Vector3();
        v.set(this.at);
        v.sub(this.eye); 

        var s = Vector3.cross(v, this.up);
        s.normalize();

        let rotationMat = new Matrix4();
        rotationMat.setRotate(-a, s.elements[0], s.elements[1], s.elements[2]);

        let v_prime = rotationMat.multiplyVector3(v);
        v_prime.add(this.eye)
        this.at.set(v_prime);
    }

    zoomIn() {
        if(this.fov > 20) {
            this.fov -= 5;
            this.projMat.setPerspective(this.fov, canvas.width/canvas.height, 0.1, 100);
        }
    }

    zoomOut() {
        if(this.fov < 100) {
            this.fov += 5;
            this.projMat.setPerspective(this.fov, canvas.width/canvas.height, 0.1, 100);
        }
    }
}