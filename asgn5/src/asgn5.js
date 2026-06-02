import * as THREE from 'three';
import {GUI} from 'three/addons/libs/lil-gui.module.min.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

function main() {
    // SCENE
    const scene = new THREE.Scene();

    // RENDERER
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        logarithmicDepthBuffer: true,
        alpha: true,
    });
    renderer.shadowMap.enabled = true;
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    
    // CAMERA
    const fov = 25
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;

    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(35, 11, 35);

    // CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0,1,0);
    controls.enableDamping = true;
    controls.update();

    // SKYBOX
	const loader = new THREE.TextureLoader();
	const texture = loader.load(
		'../textures/skybox.jpg', () => {
			texture.mapping = THREE.EquirectangularReflectionMapping;
			texture.colorSpace = THREE.SRGBColorSpace;
			scene.background = texture;
		} );

    // AMBIENT LIGHT
    // const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    // scene.add(ambientLight);

    // SUNLIGHT
    const sunLight = new THREE.DirectionalLight(0xf3e8a0, 6);
    sunLight.position.set(-12,12,-12);
    sunLight.castShadow = true;

    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;

    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;

    sunLight.shadow.camera.left = -30;
    sunLight.shadow.camera.right = 30;
    sunLight.shadow.camera.top = 30;
    sunLight.shadow.camera.bottom = -30;


    scene.add(sunLight);

    // CAMPFIRE LIGHT
    const fireLight = new THREE.PointLight(0xff6600, 1, 0.5);
    fireLight.position.set(0, 1, 0);
    fireLight.castShadow = true;
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
    const groundGeometry = new THREE.PlaneGeometry(30, 30);
    const groundMaterial = new THREE.MeshPhongMaterial( {map: grassTexture});
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI/2;
    ground.receiveShadow = true;
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
                root.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
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
    function createTree(x, z) {
        // Trunk
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.25, 0.35, 2, 12),
            new THREE.MeshPhongMaterial({ color: 0x8b4513 })
        );
        trunk.position.set(x, 1, z);
        trunk.castShadow = true;
        scene.add(trunk);

        const leafMaterial = new THREE.MeshPhongMaterial({color: 0x228b22});

        // Bottom cone
        const cone1 = new THREE.Mesh(
            new THREE.ConeGeometry(1.3, 2.2, 16),
            leafMaterial
        );
        cone1.position.set(x, 2.3, z);
        cone1.castShadow = true;
        scene.add(cone1);

        // Middle cone
        const cone2 = new THREE.Mesh(
            new THREE.ConeGeometry(1.0, 2.0, 16),
            leafMaterial
        );
        cone2.position.set(x, 3.3, z);
        cone2.castShadow = true;
        scene.add(cone2);

        // Top cone
        const cone3 = new THREE.Mesh(
            new THREE.ConeGeometry(0.7, 1.6, 16),
            leafMaterial
        );
        cone3.position.set(x, 4.2, z);
        cone3.castShadow = true;
        scene.add(cone3);
    }
    // function createTree(x,z) {
    //     const trunk = 
    //         new THREE.Mesh(
    //             new THREE.CylinderGeometry(0.25,0.25,2),
    //             new THREE.MeshPhongMaterial({color: 0x8b4513})
    //         );
    //     trunk.position.set(x,1,z);
    //     scene.add(trunk);

    //     const leaves =
    //         new THREE.Mesh(
    //             new THREE.SphereGeometry(1,16,16),
    //             new THREE.MeshPhongMaterial({color: 0x228b22})
    //         );
    //     leaves.position.set(x,2.5,z);
    //     scene.add(leaves); 
    // }

    const treeCount = 50;

    for (let i = 0; i < treeCount; i++) {
        let x, z;
        let validPosition = false;

        while (!validPosition) {

            x = Math.random() * 30 - 15;
            z = Math.random() * 30 - 15;

            const distanceFromCenter = Math.sqrt(x * x + z * z);

            if (distanceFromCenter < 6) continue;

            // Prefer trees farther from center
            if (Math.random() < distanceFromCenter / 15) {
                validPosition = true;
            }
        }

        createTree(x, z);
    }

    // createTree(-5, -5);
    // createTree(5, -5);
    // createTree(3.5, 4);
    // createTree(5, 5);

    function resizeRendererToDisplaySize( renderer ) {
		const canvas = renderer.domElement;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		const needResize = canvas.width !== width || canvas.height !== height;
		if ( needResize ) {
			renderer.setSize( width, height, false );
		}

		return needResize;

	}

    function render( time ) {
        time *= 0.001;

        if ( resizeRendererToDisplaySize(renderer) ) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        fireLight.intensity = 20 + Math.random() * 3;

        // controls.target.set(0, 1, 0);
        controls.update();

        renderer.render( scene, camera );
        requestAnimationFrame(render);
    }

    requestAnimationFrame( render );
}


main();