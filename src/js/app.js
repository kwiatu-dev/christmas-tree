import * as THREE from 'three';
import { Vector3 } from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

const santaURL = new URL('../3d/santa.glb', import.meta.url);
const DDDLoader = new GLTFLoader();
const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const controls = new OrbitControls( camera, renderer.domElement );

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
document.body.appendChild( renderer.domElement );
camera.position.set(0, 2, 10);
controls.update();

const axesHelper = new THREE.AxesHelper( 5 );
const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
const directionalLightHelper = new THREE.DirectionalLightHelper( directionalLight, 1 );
const directionalLightShadowHelper = new THREE.CameraHelper( directionalLight.shadow.camera );
const ambientLight = new THREE.AmbientLight( 0x404040 );

directionalLight.castShadow = true;
directionalLight.position.set(5, 4, 5);
directionalLightHelper.update();

scene.add(ambientLight, directionalLight, /*directionalLightHelper, directionalLightShadowHelper , axesHelper*/);

const planeGeometry = new THREE.PlaneGeometry( 100, 100 );
const planeMaterial = new THREE.MeshStandardMaterial( {color: "#999999", side: THREE.DoubleSide} );
const plane = new THREE.Mesh( planeGeometry, planeMaterial );
plane.receiveShadow = true;
plane.position.set(0, 0, 0);
plane.rotation.set(Math.PI / 2, 0, 0);

const starGeometry = new THREE.SphereGeometry(.2);
const starMaterial = new THREE.MeshStandardMaterial( { color: 0xffff00 } );
const star = new THREE.Mesh( starGeometry, starMaterial );
star.position.set(0, 3 + .2, 0);
star.receiveShadow = true;
star.castShadow = true;

const rotateAboutPoint = (obj, point, axis, theta) =>{
    obj.position.sub(point);
    obj.position.applyAxisAngle(axis, theta); 
    obj.position.add(point); 
    obj.rotateOnAxis(axis, theta); 
}

const randomNegative = () =>{
    return Math.random() < 0.5 ? -1 : 1;
}

const tree = new THREE.Group();
let treeSegmentGeometry, treeSegmentMaterial, treeSegment, radius = .3, height = .3, positionY = 3;
let treeBombGeometry, treeBombMaterial, treeBomb, size = .05, treeBombCount = 10;

for(let i = .1; i < .6; i += .1){
    radius += i;
    height += i;
    positionY -= i;

    treeSegmentGeometry = new THREE.ConeGeometry(radius, height, 32 );
    treeSegmentMaterial = new THREE.MeshStandardMaterial( {color: "#006e04"} );
    treeSegment = new THREE.Mesh( treeSegmentGeometry, treeSegmentMaterial );

    for(let v = 1; v < treeSegment.geometry.attributes.position.array.length; v+=9){
        treeSegment.geometry.attributes.position.array[v] *= (Math.random() * .1);
    }

    treeSegment.receiveShadow = true;
    treeSegment.castShadow = true;
    treeSegment.position.set(0, positionY, 0);

    tree.add(treeSegment);
    treeBombCount = 10 * (i * 10);

    if(i === .5){ continue; }

    for(let j = 0; j < treeBombCount; j++){
        treeBombGeometry = new THREE.SphereGeometry(size);
        treeBombMaterial = new THREE.MeshStandardMaterial( { color: Math.random() * 0xFFFFFF } );
        treeBomb = new THREE.Mesh( treeBombGeometry, treeBombMaterial );
        treeBomb.receiveShadow = true;
        treeBomb.castShadow = true;
        treeBomb.position.set(radius + (size / 2), positionY - (height / 2), 0);
        rotateAboutPoint(treeBomb, tree.position, new Vector3(0,1,0), randomNegative() * Math.PI * Math.random());
        tree.add(treeBomb);
    }
}

const trunkGeometry = new THREE.CylinderGeometry( .3, .3, 2, 32 );
const trunkMaterial = new THREE.MeshBasicMaterial( {color: "#4a1f01"} );
const trunk = new THREE.Mesh( trunkGeometry, trunkMaterial );
trunk.position.set(0,1,0);
tree.add(trunk);

scene.add(tree, plane, star);

const clock = new THREE.Clock();
let delta, santa;

function animate(tick) {
    delta = clock.getDelta();
    rotateAboutPoint(directionalLight, new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0), -delta);
    santa.position.copy(directionalLight.position);
    santa.rotation.y -= delta;
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
};

DDDLoader.load(santaURL.href, (gltf) => {
    santa = gltf.scene;
    santa.rotation.y -= Math.PI / 4;
    scene.add(santa);
    animate();
}, undefined, (error) => {
    console.log(error);
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});