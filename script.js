

{
    //INIT///////////////////////////////////////////////////////////////
    //This is abasic test program to test the EasyGL & FPC libraries
    //First, get the canvas element
    const canvasElement = document.getElementById('testCanvas');
    if (canvasElement == null) { throw "no testCanvas."; }

    //Create the EasyGL and FPC objects
    const gl = new EasyGL(canvasElement);
    const fpc = new FPC();

    //Add the event listeners for the FPC
    ['keydown', 'keyup'].forEach( function(e) {
        document.addEventListener(e, function(event) {fpc.eventListener(event)});
    });
    ['mousedown','mouseup','mousemove'].forEach( function(e) {
        canvasElement.addEventListener(e, function(event) {fpc.eventListener(event)});
    });
    
    //add event listener for window resize, so the gl canvas can be resized
    window.addEventListener('resize', function(event) {gl.resizeListener(event)} )


    //SETUP////////////////////////////////////////////////////////////////////////////////////
    //Set some basic parameters for the EasyGL instance
    gl.setPerspective(); //set to default perspective mode values
    gl.setAmbientLightLevel();
    gl.setCameraPosition();
    gl.setDirectionalLightingDirection();

    //Create some EasyGL objects
    gl.createObject(0, new vec4(0,0,2), null, null, [-0.7,0,0, 0.7,0,0, 0,1,0],  [0,1,2],  [1,0,0, 0,1,0, 0,0,1], [1,0,0,1, 1,1,0,1, 1,0,1,1]);
    gl.createObject(1, new vec4(0,0,-2), null, null, [-0.7,0,0, 0.7,0,0, 0,1,0],  [0,1,2],  [1,0,0, 0,1,0, 0,0,1], [1,0,0,1, 0,1,0,1, 0,0,1,1]);
    gl.createObject('myCube', new vec4(2,0,0), new vec4(0,3.14/4), new vec4(1,2,3));
    gl.createObject(null, new vec4(-2), null, null, undefined, undefined, undefined, new vec4(1,0,0,.1));
    gl.createObject(null, new vec4(0,2,0), null, null, undefined, undefined, undefined, new vec4(0,1,0,1));

    //RUN////////////////////////////////////////////////////////////////////////////////////
    let interval = setInterval(update, 10); //set update interval for 30ms

    //Update function, which runs once every frame. 1000/10 = 100FPS
    function update()
    {
        fpc.update();
        gl.setCameraPosition(fpc.getPosition());
        //gl.setCameraRotation(fpc.getRotation());
        gl.setViewMatrix(fpc.getViewMatrix()); //Moving camera perspective can also be accomplished by gl.setRotation() and gl.setPosition()
        gl.clear(); //clear the screen
        gl.renderAll(); //can also use gl.renderObject(objID) to render only specific objects instead of all objects
    }

}