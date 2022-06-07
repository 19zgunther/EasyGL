

/*
{
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
}*/

/*
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
}*/



{
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
        canvasElement.addEventListener(e, function(event) {fpc.eventListener(event);
        });
    });

    canvasElement.addEventListener('mousedown', function(event)
    {
        //console.log(event);
        let x = event.offsetX;
        let y = event.offsetY;
        let ret = gl.getObjectFromScreen(x,y);
        console.log(ret);
    })
    
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

}