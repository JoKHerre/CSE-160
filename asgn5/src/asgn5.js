import * as THREE from 'three';
import {GUI} from 'three/addons/libs/lil-gui.module.min.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

class MinMaxGUIHelper {
    constructor(obj, minProp, maxProp, minDif) {
        this.obj = obj;
        this.minProp = minProp;
        this.maxProp = maxProp;
        this.minDif = minDif;
    }
    get min() {
        return this.obj[this.minProp];
    }
    set min(v) {
        this.obj[this.minProp] = v;
        this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDif);
    }
    get max() {
        return this.obj[this.maxProp];
    }
    set max(v) {
        this.obj[this.maxProp] = v;
        this.min = this.min;  // this will call the min setter
    }
}

function main() {
    // SCENE
    const scene = new THREE.Scene();
    const fogNear = 20;
    const fogFar = 30;
    const fogColor = 'lightblue';
    scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);
    scene.background = new THREE.Color(fogColor);

    // RENDERER
    // const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        logarithmicDepthBuffer: true,
        alpha: true,
    });
    renderer.setSize( window.innerWidth, window.innerHeight );
    // renderer.setAnimationLoop( animate );
    document.body.appendChild( renderer.domElement );
    
    // CAMERA
    const fov = 45;
    // const aspect = 2;  // the canvas default
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    // const near = 0.00001;
    // const far = 5;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    // const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    // camera.position.z = 5;
    camera.position.set(10, 6, 15);

    // CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0,1,0);
    controls.enableDamping = true;
    controls.update();

    // AMBIENT LIGHT
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // SUNLIGHT
    const sunLight = new THREE.DirectionalLight(0xfff4d6, 3);
    sunLight.position.set(20,30,20);
    scene.add(sunLight);

    // CAMPFIRE LIGHT
    const fireLight = new THREE.PointLight(0xff6600, 25, 15);
    fireLight.position.set(0, 1, 0);
    scene.add(fireLight);

    // HEMISPHERE LIGHT
    const intensity = 1;
    const skyColor = 0xb1e1ff;
    const groundColor = 0xb97a20;
    const hemisphereLight = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(hemisphereLight);

    // SUN
    const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffdd66 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.copy(sunLight.position);
    scene.add(sun);

    // GROUND
    const textureLoader = new THREE.TextureLoader();
    const grassTexture = textureLoader.load('../textures/grass001.jpg');
    grassTexture.colorSpace = THREE.SRGBColorSpace;
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(20, 20);
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshPhongMaterial( {map: grassTexture});
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI/2;
    scene.add(ground);

    // MODEL LOADER
    function loadModel(objPath, mtlPath, position, scale) {
        const objLoader = new OBJLoader();
        const mtlLoader = new MTLLoader();

        mtlLoader.load(mtlPath, (mtl) => {
            mtl.preload();
            objLoader.setMaterials(mtl);
            objLoader.load(objPath, (root) => {
                root.position.copy(position);
                root.scale.set(scale, scale, scale);
                scene.add(root);
            });
        });
    }

    // MODELS
    loadModel(
        '../models/Campfire/PUSHILIN_campfire.obj', 
        '../models/Campfire/PUSHILIN_campfire.mtl',
        new THREE.Vector3(0,0.2,0),
        0.6
    );

    loadModel(
        '../models/Tent/Tent.obj',
        '../models/Tent/Tent.mtl',
        new THREE.Vector3(0,1.3,-4),
        2
    );

    loadModel(
        '../models/Backpack/Backpack.obj',
        '../models/Backpack/Backpack.mtl',
        new THREE.Vector3(-2,0,1),
        0.5
    );

    // TREES
    function createTree(x,z) {
        const trunk = 
            new THREE.Mesh(
                new THREE.CylinderGeometry(0.25,0.25,2),
                new THREE.MeshPhongMaterial({color: 0x8b4513})
            );
        trunk.position.set(x,1,z);
        scene.add(trunk);

        const leaves =
            new THREE.Mesh(
                new THREE.SphereGeometry(1,16,16),
                new THREE.MeshPhongMaterial({color: 0x228b22})
            );
        leaves.position.set(x,2.5,z);
        scene.add(leaves); 
    }

    createTree(-5, -5);
    createTree(5, -5);
    createTree(3.5, 4);
    createTree(5, 5);

    // RESIZE
    window.addEventListener('resize',() => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
    );

    // const gui = new GUI();
    // gui.add(camera, 'fov', 1, 180).onChange(updateCamera);
    // const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
    // // gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
    // gui.add(minMaxGUIHelper, 'min', 0.00001, 50, 0.00001).name('near').onChange(updateCamera);
    // gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(updateCamera);
    
    // const cameraHelper = new THREE.CameraHelper(camera);
    

    // const view1Elem = document.querySelector('#view1');
    // const view2Elem = document.querySelector('#view2');
    // // const controls = new OrbitControls(camera, view1Elem);
    // const controls = new OrbitControls(
    //     camera,
    //     renderer.domElement
    // );

    // // GEOMETRY
    // const boxWidth = 1;
    // const boxHeight = 1;
    // const boxDepth = 1;
    // const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    // // const geometry = new THREE.BoxGeometry( 1, 1, 1 );

    // function loadColorTexture( path ) {
    //     const texture = loader.load( path );
    //     texture.colorSpace = THREE.SRGBColorSpace;
    //     return texture;
    // }

    // // TEXTURE
    // const loadManager = new THREE.LoadingManager();
    // const loader = new THREE.TextureLoader(loadManager);

    // // const texture = loader.load( '../textures/wall.jpg');
    // // texture.colorSpace = THREE.SRGBColorSpace;
    // const materials = [
    //     new THREE.MeshBasicMaterial({map: loader.load('../textures/flower-1.jpg')}),
    //     new THREE.MeshBasicMaterial({map: loader.load('../textures/flower-2.jpg')}),
    //     new THREE.MeshBasicMaterial({map: loader.load('../textures/flower-3.jpg')}),
    //     new THREE.MeshBasicMaterial({map: loader.load('../textures/flower-4.jpg')}),
    //     new THREE.MeshBasicMaterial({map: loader.load('../textures/flower-5.jpg')}),
    //     new THREE.MeshBasicMaterial({map: loader.load('../textures/flower-6.jpg')}),
    // ];

    // // loadManager.onLoad = () => {
    // //     const cube = new THREE.Mesh(geometry, materials);
    // //     scene.add(cube);
    // //     cubes.push(cube);
    // // };

    // function makeInstance ( geometry, texture, x ) {
    //     const material = new THREE.MeshPhongMaterial( { map: texture, } );
    //     // const material = new THREE.MeshBasicMaterial({color: 0x44aa88});
    //     // const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

    //     const cube = new THREE.Mesh( geometry, materials );
    //     scene.add( cube );

    //     cube.position.x = x;
        
    //     return cube;
    // }

    // // const cubes = [
    // //     makeInstance( geometry, 0x44aa88, 0 ),
    // //     makeInstance( geometry, 0x8844aa, -2 ),
    // //     makeInstance( geometry, 0xaa8844, 2 ),
    // // ];

    

    // // MATERIALS
    // {
    // }
    
    // // OBJECT
    // {
    //     const objLoader = new OBJLoader();
    //     const mtlLoader = new MTLLoader();
    //     mtlLoader.load('../models/Campfire/PUSHILIN_campfire.mtl', (mtl) => {
    //         mtl.preload();
    //         for (const material of Object.values(mtl.materials)) {
    //             material.side = THREE.DoubleSide;
    //         }
    //         objLoader.setMaterials(mtl);
    //     objLoader.load('../models/Campfire/PUSHILIN_campfire.obj', (root) => {
    //         root.position.set(0, 0, 0);
    //         scene.add(root);
    //         // // compute the box that contains all the stuff
    //         // // from root and below
    //         // const box = new THREE.Box3().setFromObject(root);
 
    //         // const boxSize = box.getSize(new THREE.Vector3()).length();
    //         // const boxCenter = box.getCenter(new THREE.Vector3());
 
    //         // // set the camera to frame the box
    //         // frameArea(boxSize * 1.2, boxSize, boxCenter, camera);
 
    //         // // update the Trackball controls to handle the new size
    //         // controls.maxDistance = boxSize * 10;
    //         // controls.target.copy(boxCenter);
    //         // controls.update();

    //     });
    //     });
    // }

    // function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
    //     const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
    //     const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
    //     const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
 
    //     // // compute a unit vector that points in the direction the camera is now
    //     // // from the center of the box
    //     // const direction = (new THREE.Vector3()).subVectors(camera.position, boxCenter).normalize();
        
    //     // compute a unit vector that points in the direction the camera is now
    //     // in the xz plane from the center of the box
    //     const direction = (new THREE.Vector3())
    //         .subVectors(camera.position, boxCenter)
    //         .multiply(new THREE.Vector3(1, 0, 1))
    //         .normalize();
 
    //     // move the camera to a position distance units way from the center
    //     // in whatever direction the camera was from the center already
    //     camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));
 
    //     // pick some near and far values for the frustum that
    //     // will contain the box.
    //     camera.near = boxSize / 100;
    //     camera.far = boxSize * 100;
 
    //     camera.updateProjectionMatrix();
 
    //     // point the camera to look at the center of the box
    //     camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
    // }

    function render( time ) {
        time *= 0.001;

        fireLight.intensity = 20 + Math.random() * 3;

        controls.target.set(0, 1, 0);
        controls.update();

        renderer.render( scene, camera );
        requestAnimationFrame(render);
    }

    requestAnimationFrame( render );
}


main();