# EasyGL - EasyWebGL
A library built in javascript on webgl which makes rendering 3d objects and scenes quick and easy to do. Use predefined shapes or make your own (vertex & indice form), and easily move and arrange them and the camera in 3D space.

Go to https://zgunther.com/easyGL/easyGL.html to view a few live demos!

## Requirements To Run
- webgl-capable browser (most current browsers)
- Simply include myMath.js, easyGL.js, and fpc.js (optinal) in your project!

## Examples:
### Rotating Cube
![](https://github.com/19zgunther/EasyGL/blob/main/resources/rotatingCubeExample.gif)
```
const canvasElement = document.getElementById( "myCanvas" );
const easygl = new EasyGL( canvasElement );
easygl.setCameraPosition( 0, 0, -2 );
easygl.setPerspective();
easygl.createObject( 'myObject1' );
 
let t=0;
let updateInterval = setInterval( update, 20 );
function update() {
    t += 0.03;
    easygl.setObjectRotation( 'myObject1', t, t/2, t/3 );
    easygl.clear();
    easygl.renderAll();
}
```

### Rotating Sun
![](https://github.com/19zgunther/EasyGL/blob/main/resources/rotatingSunExample.gif)
```
const canvasElement = document.getElementById( "myCanvas" );
const easygl = new EasyGL( canvasElement );
easygl.setCameraPosition( 0, 0, -2 );
easygl.setPerspective();
easygl.createObject( 'myObject1' );
easygl.setObjectRotation( 'myObject1', 0.8, .1, 1);

let t=0;
let updateInterval = setInterval( update, 20 );
function update() {
    t += 0.1;
    easygl.setDirectionalLightingDirection( 
        Math.cos(t), 
        Math.sin(t/2), 
        Math.sin(t/3) );
    easygl.clear();
    easygl.renderAll();
}
```

### Rotating Camera Around Scene
![](https://github.com/19zgunther/EasyGL/blob/main/resources/rotatingCameraExample.gif)
```
const canvasElement = document.getElementById( "testCanvas" );
const easygl = new EasyGL( canvasElement );
easygl.setPerspective();
easygl.createObject( 'myObject1' );
easygl.createObject( 'myObject2' );
easygl.createObject( 'myObject3' );
easygl.setObjectPosition( 'myObject1', 1, 1, 1,);
easygl.setObjectPosition( 'myObject2', -1, -1, -1,);
easygl.setObjectRotation( 'myObject1', 0.8, .1, 1);
easygl.setObjectColor( 'myObject1', new vec4(1,0,0,1));
easygl.setObjectColor( 'myObject2', new vec4(0,1,0,1));
easygl.setObjectColor( 'myObject3', new vec4(0,0,1,1));

let t=0;
let updateInterval = setInterval( update, 20 );
function update() {
    t += 0.03;
    easygl.setObjectRotation( 'myObject2', t,t,t);
    easygl.setCameraPosition( 4*Math.cos(t), 0, 4*Math.sin(t) );
    easygl.setCameraRotation( 0, -t -Math.PI/2, 0);
    easygl.clear();
    easygl.renderAll();
}
```

### First Person Controllable Camera
![](https://github.com/19zgunther/EasyGL/blob/main/resources/fpcExample.gif)
```
//INIT///////////////////////////////////////////////////////////////
//This is abasic test program to test the EasyGL & FPC libraries
//First, get the canvas element
const canvasElement = document.getElementById('testCanvas');
if (canvasElement == null) { throw "no testCanvas."; }

//Create the EasyGL and FPC objects
const gl = new EasyGL(canvasElement);
const fpc = new FPC();

//SETUP////////////////////////////////////////////////////////////////////////////////////
//Add the event listeners for the FPC
['keydown', 'keyup'].forEach( function(e) {
    document.addEventListener(e, function(event) {fpc.eventListener(event)});
});
['mousedown','mouseup','mousemove'].forEach( function(e) {
    canvasElement.addEventListener(e, function(event) {fpc.eventListener(event)});
});

//add event listener for window resize, so the gl canvas can be resized
window.addEventListener('resize', function(event) {gl.resizeListener(event)} )


//Set some basic parameters for the EasyGL instance
gl.setPerspective(); //set to default perspective mode values

//Create some EasyGL objects
gl.createObject(0, new vec4(0,0,2), null, null, [-0.7,0,0, 0.7,0,0, 0,1,0],  [0,1,2],  [1,0,0, 0,1,0, 0,0,1], [1,0,0,1, 1,1,0,1, 1,0,1,1]);
gl.createObject(1, new vec4(0,0,-2), null, null, [-0.7,0,0, 0.7,0,0, 0,1,0],  [0,1,2],  [1,0,0, 0,1,0, 0,0,1], [1,0,0,1, 0,1,0,1, 0,0,1,1]);
gl.createObject('myCube', new vec4(2,0,0), new vec4(0,3.14/4), new vec4(1,2,3));
gl.createObject(null, new vec4(-2), null, null, undefined, undefined, undefined, new vec4(1,0,0,.1));
gl.createObject(null, new vec4(0,2,0), null, null, undefined, undefined, undefined, new vec4(0,1,0,1));

fpc.setPosition(0, 2, -4);

//RUN////////////////////////////////////////////////////////////////////////////////////
//The update loop runs every frame
let interval = setInterval(update, 10); //set update interval for 10ms, this determines frame rate

//Update function, which runs once every frame. 1000/10 = 100FPS
function update()
{
    //Update FPC, and send data (rotation & position) to EasyGL
    fpc.update();
    gl.setCameraPosition(fpc.getPosition());
    gl.setCameraRotation(fpc.getRotation());

    //Rendering! first, clearing the screen, then, rendering all objects
    gl.clear(); //clear the screen
    gl.renderAll(); //can also use gl.renderObject(objID) to render only specific objects instead of all objects
}
```

## Reference Material
- clear( tempClearColor_Vec4 );
    - Clears screen to either default clear color or to passed value \n
        - tempClearColor_Vec4: vec4, color in form <r,g,b,a>

- renderObject( objectID )
    - Renders a specific object to the screen
        - objectID: any

- renderAll()
    - Renders all stored objects to the screen, from farthest objects from camera to closest.

- setCameraPosition( position, y, z )
    - Sets the camera position in 3d space. Can either pass a single vec4 or 3 numbers.
        - position: vec4 or number,
        - y: number
        - z: number

- setCameraRotation( rotation, y, z )
    - Sets the camera rotation in 3d space. Can either pass a single vec4 or 3 numbers.
        - rotation: vec4 or number,
        - y: number
        - z: number

- setPerspective( FOV, aspectRatio, zNear, zFar )
    - Sets the perspective of the scene to be rendered.
        - FOV: number, in radians (FieldOfView)
        - aspectRatio: number, pass null for auto-aspectRatio, sets scene height to width ratio
        - zNear: number, the near culling plane (objects in front are not rendered)
        - zFar: number, the far culling plane (objects farther away are not rendered)
    
- getCameraPosition()
    - Returns camera position (vec4)

- getCameraRotation()
    - Returns camera rotation (vec4 euler angles)


- createObject( objectID, position, rotation, scale, vertices, indices, normals, colors)
    - creates a new object which can be rendered. 
        - position: vec4
        - rotation: vec4
        - scale: vec4
        - vertices: Array of Vec4 points or Array of numbers (serialized points, 3 per vertex)
        - indices: Array of positive integers (including 0), specifying the vertex index for each triangle.
        - normals: same as vertices, but represent the normals to each vertex's triangle
        - colors: vec4 or array of vec4 or array of numbers, specifying the object or each vertices' color.

- deleteObject( objectID )
    - removes object from the scene
        - objectID: any

- setObjectShape( objectID, vertices, indices, normals, colors)
    - modifies object objectID, look to createObject for input value information

- setObjectPosition/Rotation/Scale( objectID, positon/rotation/scale, y, z )
    - sets the object position, rotation, or scale.
        - Input: either a single vec4 or 3 numbers

- getObjectPosition/Rotation/Scale/( objectID )
    - returns position/rotation/scale of object objectID
        - objectID: any

- getObjectData( objectID )
    - returns all stored data on object objectID
        - objectID: any

- resizeListener(event)
    - Should be called everytime a window resize event occurs, so that the htmlCanvasElement's resolution is scaled appropriately
        - event: HtmlEvent

- setAmbientLightLevel( value )
    - Sets the darkest the shadows from directional lighting are. (0.01 to 0.99, 0.25 is recommended)
        -value: number

- enableDirectionalLighting( enable )
    - enables/disables directional lighting
        - enable: boolean true or false

- setDirectionalLightingDirection( direction , y, z)
    - sets the direction the light comes from
        - direction: vec4 or number (x)
        - y: number (y)
        - z: number (z)

- enableRenderingReverseFaces( enable )
    - enable/disable rendering faces not visible from the camera's perspective. Becomes relevant when rendering semi-transparent objects.
        - enable: boolean true or false

- enableSortingObjects( enable )
    - enable/disable sorting the objects when calling renderAll() (enabled is recommended, but takes more cpu power)
        - enable: boolean true or false
