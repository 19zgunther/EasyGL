# EasyGL
A library built on webgl which makes rendering 3d objects and scenes easier and simple to do.

## Requirements To Run
- webgl-capable browser

## Setup
All that is needed is the easyGL.js and myMath.js files to be included in your project.

1.) Link In your html file, with the myMath.js listed first.
2.) instantiate an instance of the EasyGL class, passing an html canvas element to it.
> const easyGL = new EasyGL( myHTMLcanvasElement );
3.) Create a default object
> easyGL.createObject('myObject1');
4.) Set camera position.
> easyGL.setCameraPosition(0,0,-2);
5.) Clear the canvas
> easyGL.clear();
6.) Render the object to the screen
> easyGL.renderAll();

To Be Continued...

## Functions

