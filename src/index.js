import { Vector3, BufferAttribute, BufferGeometry, MeshBasicMaterial, LineBasicMaterial, Object3D, Mesh } from 'three';

export function latLonToVector3(lat, lon, radius = 1){
	const phi = (lat) * Math.PI / 180;
	const theta = (360 - lon) * Math.PI / 180;
	return new Vector3(
	  radius * Math.cos(phi) * Math.cos(theta),
	  radius * Math.sin(phi),
	  radius * Math.cos(phi) * Math.sin(theta),
	);
}

function prepare({ vertices: v, triangles: t, polygons }, radius, thickness) {
	const triangles = [...t] ;
	const vertices = [];
	for (let i = 0; i < v.length; i += 2) {
		const lon = v[i];
		const lat = v[i + 1];
		const vec3 = latLonToVector3(lat, lon, radius);
		vertices.push(vec3);
	}

	if (thickness > 0) {
		vertices.forEach(v => {
			vertices.push(
				v.clone().multiplyScalar(1 + thickness)
			);
		});
		const vecLenHalf = vertices.length / 2;
		triangles.forEach(x => {
			triangles.push(x + vecLenHalf);
		});
		polygons.forEach((polyWithHoles) => {
			polyWithHoles.forEach((p, i) => {
				p.forEach((idx) => {
					const a = p[idx];
					const b = p[(idx + 1) % p.length];
					if (i === 0) {
						triangles.push(a, b, a + vecLenHalf);
					} else {
						triangles.push(b, a, a + vecLenHalf);
					}
				});
			});
		});
	}

	return { vertices, triangles, polygons };
}

export function geoPlaneGeometry(triJson, radius = 1, thickness = 0) {
	const { triangles, vertices } = prepare(triJson, radius, thickness);
	const g = new BufferGeometry();
	g.setAttribute(
		'position',
		new BufferAttribute(
			new Float32Array(vertices.reduce((arr, x) => {
				arr.push(x.x, x.y, x.z);
				return arr;
			}, [])),
			3
		)
	);
	g.setIndex(triangles);
	return g;
}

export function buildPlane(
	triJson,
	radius = 1,
	thickness = 0,
	material = new MeshBasicMaterial({
		color: 0x080808,
		transparent: true,
		opacity: 0.2
	})
) {
	const obj = new Object3D();

	Object.entries(triJson).forEach(([name, tri]) => {
		const plane = new Mesh(
			geoPlaneGeometry(tri, radius, thickness),
			material
		);
		plane.userData.type = 'plane';
		obj.name = name;
		obj.add(plane);
	});

	return obj;
}

export function geoContourGeomtry(triJson, radius, thickness) {
	const { polygons, vertices } = prepare(triJson, radius, thickness);
	const segments = polygons.reduce((obj, lines) => {
		lines.forEach((pts) => {
			const shift = thickness > 0 ? (vertices.length / 2) : 0;
			pts.forEach((idx, i) => {
				obj.vertices.push(vertices[idx + shift]);
				if (i > 0) {
					obj.indices.push(obj.vertices.length - 2, obj.vertices.length - 1);
				}
			});
		});
		return obj;
	}, { vertices: [], indices: [] });
	var geometry = new BufferGeometry();
	geometry.setAttribute(
		'position',
		new BufferAttribute(
			new Float32Array(
				segments.vertices.reduce((arr, x) => {
					arr.push(x.x, x.y, x.z);
					return arr;
				}, [])
			),
			3
		)
	);
	geometry.setIndex(new BufferAttribute(new Uint16Array(segments.indices), 1));

	return geometry;
}

export function buildContour(
	triJson,
	radius = 1,
	thickness = 0,
	material = new LineBasicMaterial({
		color: 0x999999,
		depthTest: true,
		opacity: 1,
		transparent: true,
		linewidth: 0.3,
	})
) {
	const obj = new THREE.Object3D();

	Object.entries(triJson).forEach(([name, tri]) => {
		const contour = new THREE.LineSegments(
			geoContourGeomtry(tri, radius, thickness),
			material
		);
		contour.name = name
		contour.userData.type = 'border';
		obj.add(contour);
	});

	return obj;
}
