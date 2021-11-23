# Installation

```
npm install three-geojson
```

# Perpare Data

use http://makc.github.io/three.js/map2globe/ tranform GeoJSON to triangle json

# Example

```
import { buildPlane, buildContour } from 'three-geojson';

const plane = buildPlane(triJson, radius, thickness, material);
scene.add(plan);

const contour = buildContour(triJson, radius, thickness, material);
scene.add(contour);
```
