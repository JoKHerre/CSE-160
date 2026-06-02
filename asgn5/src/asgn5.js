import * as THREE from 'three';
import {GUI} from 'three/addons/libs/lil-gui.module.min.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {EXRLoader} from 'three/addons/loaders/EXRLoader.js';

// ASSETS USED:
// Backpack by J-Toastie [CC-BY] (https://creativecommons.org/licenses/by/3.0/) via Poly Pizza (https://poly.pizza/m/uRRsiIZKHG)
// Campfire by Poly by Google [CC-BY] (https://creativecommons.org/licenses/by/3.0/) via Poly Pizza (https://poly.pizza/m/0vzzmM-t8CP)
// Tent by J-Toastie [CC-BY] (https://creativecommons.org/licenses/by/3.0/) via Poly Pizza (https://poly.pizza/m/0LnXUwcQzk)

// DOCUMENTATION NOT IN CANVAS
// https://threejs.org/docs/#EXRLoader

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
    const fireLight = new THREE.PointLight(0xff6600, 1, 5);
    fireLight.position.set(0, 2, 0);
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
    function loadModel(objPath, mtlPath, position, scale, rotationX=0, rotationY=0, rotationZ=0) {
        const objLoader = new OBJLoader();
        const mtlLoader = new MTLLoader();

        mtlLoader.load(mtlPath, (mtl) => {
            mtl.preload();
            objLoader.setMaterials(mtl);
            objLoader.load(objPath, (root) => {
                root.position.copy(position);
                root.rotation.x = rotationX;
                root.rotation.y = rotationY;
                root.rotation.z = rotationZ;
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
        new THREE.Vector3(-1.2,0,-2),
        0.5,
        0,
        Math.PI / 2,
        -Math.PI / 12
    );

    // ROCKS AROUND CAMPFIRE
    const rockGeometry = new THREE.DodecahedronGeometry(0.1, 0);
    const rockMaterial = new THREE.MeshStandardMaterial({color: 0x808080});
    const rockCount = 18;
    for (let i = 0; i < rockCount; i++) {
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        const angle = (i / rockCount) * Math.PI * 2;
        const radius = 0.5 + Math.random() * 0.1;
        rock.position.set(Math.cos(angle) * radius, 0.05, Math.sin(angle) * radius);
        rock.castShadow = true;
        scene.add(rock);
    }

    // LOG
    const exrLoader = new EXRLoader();
    const barkColor = textureLoader.load('../textures/pine_bark_diff_1k.jpg');
    const barkNormal = exrLoader.load('../textures/pine_bark_nor_gl_1k.exr');
    const barkRough = exrLoader.load('../textures/pine_bark_rough_1k.exr');
    [barkColor,  barkNormal, barkRough].forEach(tex => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(1, 1);
    });
    const barkMaterial = new THREE.MeshStandardMaterial({
        map: barkColor,
        normalMap: barkNormal,
        roughnessMap: barkRough,
        roughness: 1.0,
    });
    
    const logGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2, 64, 32);
    const log = new THREE.Mesh(logGeometry, barkMaterial);
    log.rotation.z = Math.PI / 2;
    log.rotation.y = Math.PI / 3;
    log.position.set(2, 0.2, 1);
    log.castShadow = true;
    log.receiveShadow = true;
    scene.add(log);

    // STUMP
    const stumpGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.4, 24);
    const stump = new THREE.Mesh(stumpGeometry, barkMaterial);
    stump.position.set(-2, 0.2, -0.5);
    stump.castShadow = true;
    stump.receiveShadow = true;
    scene.add(stump);

    // TREES
    function createTree(x, z) {
        const scale = 0.4 + Math.random() * 0.4;
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.25 * (scale*1), 0.35 * (scale*1.2), 2, 12),
            new THREE.MeshPhongMaterial({ color: 0x8b4513 })
        );
        trunk.position.set(x, 1, z);
        trunk.castShadow = true;
        scene.add(trunk);

        const leafMaterial = new THREE.MeshPhongMaterial({color: 0x228b22});
        const cone1 = new THREE.Mesh(
            new THREE.ConeGeometry(1.3*scale, 2.2*scale, 16),
            leafMaterial
        );
        cone1.position.set(x, 4 - (1.2 / scale), z);
        cone1.castShadow = true;
        scene.add(cone1);

        const cone2 = new THREE.Mesh(
            new THREE.ConeGeometry(1.0*scale, 2.0*scale, 16),
            leafMaterial
        );
        cone2.position.set(x, 4.5 - (1.2 / scale), z);
        cone2.castShadow = true;
        scene.add(cone2);

        const cone3 = new THREE.Mesh(
            new THREE.ConeGeometry(0.7*scale, 1.7*scale, 16),
            leafMaterial
        );
        cone3.position.set(x, 5 - (1.2 / scale), z);
        cone3.castShadow = true;
        scene.add(cone3);
    }

    const treeCount = 250;

    for (let i = 0; i < treeCount; i++) {
        let x, z;
        let validPosition = false;

        while (!validPosition) {

            x = Math.random() * 28 - 15;
            z = Math.random() * 28 - 15;

            const distanceFromCenter = Math.sqrt(x * x + z * z);

            if (distanceFromCenter < 6) {
                continue;
            }
            
            if (Math.random() < distanceFromCenter / 15) {
                validPosition = true;
            }
        }

        createTree(x, z);
    }

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

    const sunRadius = 20;
    const sunSpeed= 0.1;

    function render( time ) {
        time *= 0.001;

        if ( resizeRendererToDisplaySize(renderer) ) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        const angle = time * sunSpeed;
        sunLight.position.set(
            Math.cos(angle) * sunRadius,
            Math.sin(angle) * sunRadius,
            0
        );
        sun.position.copy(sunLight.position);
        sunLight.intensity = Math.max(0, sun.position.y / 5);

        fireLight.intensity = 40 + Math.random() * 5;

        controls.update();

        renderer.render( scene, camera );
        requestAnimationFrame(render);
    }

    requestAnimationFrame( render );
}


main();