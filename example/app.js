import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { geoPlaneGeometry, geoContourGeomtry } from '../src';
import worldTriJson from './world.tri.json'


let radius = 160;
let thickness = 0.01;

const el = document.querySelector('#app');
const width = el.clientWidth;
const height = el.clientHeight;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0xddaaaa);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(width, height);
el.innerHTML = '';
el.appendChild(renderer.domElement);


/**
 * Contoler GUI
 */
const gui = new GUI( { width: 300 } );
const params = {
	shape: 'sphere',
};
gui.add(params, 'shape', { sphere: 'sphere', plane: 'plane' }).onChange(run);
gui.open();


/**
 * init scene
 */
const camera = new THREE.PerspectiveCamera(
	45,
	width / height,
	1,
	100000
);
camera.position.z = 500;

const scene = new THREE.Scene();
controls = new OrbitControls(camera, el);

scene.add(new THREE.HemisphereLight());
const dl1 = new THREE.DirectionalLight(0x808080, 1);
dl1.position.set(-500, 500, 500);
scene.add(dl1);

let base;
let geoLayer;

function buildSphere() {
	thickness = 0.05;
	
	const base = new THREE.Mesh(
		new THREE.SphereGeometry(radius - 2, 50, 50),
		new THREE.MeshLambertMaterial({ 
			color: 0xddaaaa,
		})
	);

	const geoLayer = new THREE.Object3D();
	Object.entries(worldTriJson).forEach(([name, tri]) => {
		const obj = new THREE.Object3D();
		obj.name = name;

		const geometry = geoPlaneGeometry(tri, radius, thickness, 3, { top: true, bottom: false, side: false });
		const plane = new THREE.Mesh(
			geometry,
			new THREE.MeshBasicMaterial({
				color: 0x88a080,
				side: THREE.DoubleSide,
			})
		);
		plane.userData.type = 'plane';
		obj.add(plane);
		const planeSide = new THREE.Mesh(
			geoPlaneGeometry(tri, radius, thickness, 3, { top: false, bottom: false, side: true }),
			new THREE.MeshLambertMaterial({
				color: 0x88a080,
				side: THREE.DoubleSide,
			})
		);
		planeSide.userData.type = 'planeSide';
		obj.add(planeSide);

		const contour = new THREE.LineSegments(
			geoContourGeomtry(tri, radius, thickness),
			new THREE.LineBasicMaterial({
				color: 0xffdd80,
				depthTest: true,
				opacity: 1,
				transparent: false,
				linewidth: 2,
			})
		);
		contour.userData.type = 'border';
		obj.add(contour);

		geoLayer.add(obj);
	});

	return { base, geoLayer }
}

function buildPlane() {
	thickness = 10;
	const base = new THREE.Mesh(
		new THREE.PlaneGeometry(360, 180),
		new THREE.MeshBasicMaterial({ 
			color: 0xdadada,
		})
	);

	const geoLayer = new THREE.Object3D();
	Object.entries(worldTriJson).forEach(([name, tri]) => {
		const obj = new THREE.Object3D();
		obj.name = name;

		const geometry = geoPlaneGeometry(tri, radius, thickness, 2, { top: true, bottom: false, side: false });
		const plane = new THREE.Mesh(
			geometry,
			new THREE.MeshBasicMaterial({
				color: 0x88a080,
				side: THREE.DoubleSide,
			})
		);
		plane.userData.type = 'plane';
		obj.add(plane);
		const planeSide = new THREE.Mesh(
			geoPlaneGeometry(tri, radius, thickness, 2, { top: false, bottom: false, side: true }),
			new THREE.MeshPhongMaterial({
				color: 0x88a080,
				side: THREE.DoubleSide,
			})
		);
		planeSide.userData.type = 'planeSide';
		obj.add(planeSide);

		const contour = new THREE.LineSegments(
			geoContourGeomtry(tri, radius, thickness, 2),
			new THREE.LineBasicMaterial({
				color: 0xffdd80,
				depthTest: true,
				opacity: 1,
				transparent: true,
				linewidth: 0.3,
			})
		);
		contour.userData.type = 'border';
		obj.add(contour);

		geoLayer.add(obj);
	});

	return { base, geoLayer }
}

function run(shape) {
	console.log('run', shape);

	camera.lookAt(0, 0, 0);
	camera.rotation.set(0, 0, 500);

	if (base) {
		scene.remove(base);
		scene.remove(geoLayer);
	}

	const build = shape === 'sphere' ? buildSphere : buildPlane;
	({ base, geoLayer } = build());
	scene.add(base);
	scene.add(geoLayer);
}


/**
 * stats
 */
const stats = new Stats();
el.appendChild(stats.dom);


function render() {
	renderer.render(scene, camera);
	stats.update();

	requestAnimationFrame(render);
}
render();

run(params.shape)