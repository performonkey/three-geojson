# Installation

```
npm install three-geojson
```

# Perpare Data

use http://makc.github.io/three.js/map2globe/ tranform GeoJSON to triangle json

# Example

```js
import { geoPlaneGeometry, geoContourGeomtry } from 'three-geojson';


const geo = Object.entries(triJson).reduce((geoLayer, [name, tri]) => {
	const plane = new THREE.Mesh(
		geoPlaneGeometry(tri, radius, thickness, dimension),
		new THREE.MeshStandardMaterial({
			color: 0x808080,
			transparent: true,
			opacity: 0.9,
			side: THREE.DoubleSide,
		})
	);
	plane.userData.type = 'plane';

	const contour = new THREE.LineSegments(
		geoContourGeomtry(tri, radius, thickness, dimension),
		new THREE.LineBasicMaterial({
			color: 0xff8080,
			depthTest: true,
			opacity: 1,
			transparent: true,
			linewidth: 0.3,
		})
	);
	contour.userData.type = 'border';

	const obj = new THREE.Object3D();
	obj.name = name;
	obj.add(plane);
	obj.add(contour);

	geoLayer.add(obj);

	return geoLayer;
}, new THREE.Object3D());

scene.add(geo);
```
