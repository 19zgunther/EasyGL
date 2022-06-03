# EasyGL
A library built on webgl which makes rendering 3d objects and scenes easier and simple to do.

## Requirements To Run
- webgl-capable browser

## Setup
All that is needed is the easyGL.js and myMath.js files to be included in your project.

1. Link In your html file, with the myMath.js listed first.
2. instantiate an instance of the EasyGL class, passing an html canvas element to it.
> const easyGL = new EasyGL( myHTMLcanvasElement );
3. Create a default object
> easyGL.createObject('myObject1');
4. Set camera position.
> easyGL.setCameraPosition(0,0,-2);
5. Clear the canvas
> easyGL.clear();
6. Render the object to the screen
> easyGL.renderAll();

7. Now, you can move, rotate, and scale the objects by 
> easyGL.setObjectPosition('myObject1', x, y, z);
> easyGL.setObjectRotation('myObject1', x, y, z);
> easyGL.setObjectScale('myObject1', x, y, z); 

8. and move and rotate the camera by
> easyGL.setCameraPosition( x, y, z);
> easyGL.setCameraRotation( x, y, z);

9. To adjust FOV, aspect ratio, and...


To Be Continued...

## Functions

