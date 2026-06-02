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
    camera.layers.enable(0);
    camera.layers.enable(1);

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
    const groundGeometry = new THREE.CircleGeometry(16, 64);
    const groundMaterial = new THREE.MeshPhongMaterial( {map: grassTexture});
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI/2;
    ground.receiveShadow = true;
    ground.layers.set(1);
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
                // root.userData.isModelRoot = true;
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
        const rock = new THREE.Mesh(rockGeometry, rockMaterial.clone());
        const angle = (i / rockCount) * Math.PI * 2;
        const radius = 0.5 + Math.random() * 0.1;
        rock.position.set(Math.cos(angle) * radius, 0.05, Math.sin(angle) * radius);
        rock.castShadow = true;
        rock.userData.pickable = true;
        rock.userData.isRock = true;
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
    const log = new THREE.Mesh(logGeometry, barkMaterial.clone());
    log.rotation.z = Math.PI / 2;
    log.rotation.y = Math.PI / 3;
    log.position.set(2, 0.2, 1);
    log.castShadow = true;
    log.receiveShadow = true;
    log.userData.pickable = true;
    log.userData.isLog = true;
    scene.add(log);

    // STUMP
    const stumpGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.4, 24);
    const stump = new THREE.Mesh(stumpGeometry, barkMaterial);
    stump.position.set(-2, 0.2, -0.5);
    stump.castShadow = true;
    stump.receiveShadow = true;
    stump.userData.pickable = true;
    stump.userData.isStump = true;
    scene.add(stump);

    // TREES
    function createTree(x, z) {
        const tree = new THREE.Group();

        const scale = 0.4 + Math.random() * 0.4;
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.25 * (scale*1), 0.35 * (scale*1.2), 2, 12),
            new THREE.MeshPhongMaterial({ color: 0x8b4513 })
        );
        trunk.position.set(0, 1, 0);
        trunk.castShadow = true;

        const leafMaterial = new THREE.MeshPhongMaterial({color: 0x228b22});
        const cone1 = new THREE.Mesh(
            new THREE.ConeGeometry(1.3*scale, 2.2*scale, 16),
            leafMaterial
        );
        cone1.position.set(0, 4 - (1.2 / scale), 0);
        cone1.castShadow = true;

        const cone2 = new THREE.Mesh(
            new THREE.ConeGeometry(1.0*scale, 2.0*scale, 16),
            leafMaterial
        );
        cone2.position.set(0, 4.5 - (1.2 / scale), 0);
        cone2.castShadow = true;

        const cone3 = new THREE.Mesh(
            new THREE.ConeGeometry(0.7*scale, 1.7*scale, 16),
            leafMaterial
        );
        cone3.position.set(0, 5 - (1.2 / scale), 0);
        cone3.castShadow = true;

        trunk.userData.pickable = true;
        cone1.userData.pickable = true;
        cone2.userData.pickable = true;
        cone3.userData.pickable = true;
        trunk.userData.isTrunk = true;
        cone1.userData.isLeaf = true;
        cone2.userData.isLeaf = true;
        cone3.userData.isLeaf = true;
        tree.userData.isTree = true;
        tree.userData.pickable = true;

        tree.add(trunk, cone1, cone2, cone3);

        tree.position.set(x,0,z);
        scene.add(tree);
    }

    const treeCount = 250;

    for (let i = 0; i < treeCount; i++) {
        let x, z;
        let validPosition = false;
        while (!validPosition) {
            x = Math.random() * 28 - 15;
            z = Math.random() * 28 - 15;
            const distanceFromCenter = Math.sqrt(x * x + z * z);
            if (distanceFromCenter < 6 || distanceFromCenter > 14) {
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

    class PickHelper {
        constructor() {
            this.raycaster = new THREE.Raycaster();
            this.pickedObject = null;
            this.pickedObjectSavedColor = 0;
        }
        pick(normalizedPosition, scene, camera, time) {

            if (this.pickedObject) {
                this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
                this.pickedObject = undefined;
            }
            
            this.raycaster.setFromCamera(normalizedPosition, camera);

            const intersectedObjects = this.raycaster.intersectObjects(scene.children, true);
            const pickableHit = intersectedObjects.find(i => {
                let obj = i.object;
                while (obj) {
                    if (obj.userData.pickable) {
                        return true;
                    }
                    obj = obj.parent;
                }
                return false;
            });

            if (!pickableHit) {
                return;
            }
             
            this.pickedObject = pickableHit.object;
            while (this.pickedObject.parent && !this.pickedObject.userData.pickable) {
                this.pickedObject = this.pickedObject.parent;
            }
            this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
            this.pickedObject.material.emissive.setHex(0xFFFF00);
        }
    }
    
    const pickPosition = { x: 0, y: 0 };
    const pickHelper = new PickHelper();
    let hoveredObject = null;
    clearPickPosition();

    const sunRadius = 20;
    const sunSpeed= 0.1;

    function render( time ) {
        time *= 0.001;

        if ( resizeRendererToDisplaySize(renderer) ) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        pickHelper.pick(pickPosition, scene, camera, time);
        hoveredObject = pickHelper.pickedObject;

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

    function getCanvasRelativePosition( event ) {
        const canvas = renderer.domElement;
        const rect = canvas.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) * canvas.width / rect.width,
            y: (event.clientY - rect.top) * canvas.height / rect.height 
        }
    }

    function setPickPosition( event ) {
        const canvas = renderer.domElement;
        const pos = getCanvasRelativePosition( event );
        pickPosition.x = ( pos.x / canvas.width ) * 2 - 1;
        pickPosition.y = ( pos.y / canvas.height ) * -2 + 1;
    }

    function clearPickPosition() {
        pickPosition.x = -100000;
        pickPosition.y = -100000;
    }

    window.addEventListener( 'mousemove', setPickPosition );
    window.addEventListener( 'mouseout', clearPickPosition );
    window.addEventListener( 'mouseleave', clearPickPosition );

    window.addEventListener( 'touchstart', (event) => {
        event.preventDefault();
        setPickPosition(event.touches[0]);
    }, { passive: false });

    window.addEventListener( 'touchmove', (event) => {
        setPickPosition(event.touches[0]);
    });

    window.addEventListener( 'touchend', clearPickPosition );

    window.addEventListener('click', (event) => {
        if (!hoveredObject) {
            return;
        }

        let obj = hoveredObject;
        // while (obj.parent && !obj.userData.isTree) {
        //     obj = obj.parent;
        // }

        while (obj.parent && (!obj.userData.pickable || obj.userData.isLeaf || obj.userData.isTrunk)) {
            obj = obj.parent;
        }


        // TREES
        // if (!obj.userData.isTree && !obj.userData.isLeaf && !obj.userData.isTrunk ) {
        //     return;
        // }

        // ROCKS AND STUFF
        // if ((!obj.userData.isRock) && (!obj.userData.isLog) && (!obj.userData.isStump)) {
        //     return; 
        // }

        // EVERYTHING
        if ((!obj.userData.isTree && !obj.userData.isLeaf && !obj.userData.isTrunk ) && (!obj.userData.isRock) && (!obj.userData.isLog) && (!obj.userData.isStump)) {
            return; 
        }

        scene.remove(obj);

        obj.traverse(child => {
            if (child.geometry) {
                child.geometry.dispose(); 
            }
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });

        hoveredObject = null;
    });
}


main();