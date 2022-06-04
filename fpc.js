/*
*   FPC is a basic input to position & rotation controller.
*   Controls: WASD to move, arrow keys & mouse drag to rotate,
*   
*   How To Implement: 
*       Instantiate and add document listeners for keydown, keyup, mousedown, mouseup, and mousemove.
*       Ex: 
*           document.addEventListener('keydown', function(e) {
*               fpc.eventListener(e);
*           }); for each event
*       Or Add this:
*           ['keydown', 'keyup', 'mousedown','mouseup','mousemove'].forEach( function(eventType) {
*                canvasElement.addEventListener(eventType, function(event) {fpc.eventListener(event)});
*            });
*       
*       Call update() to update position and rotation, generally every render frame.
*/


class FPC {
    constructor(position = new vec4(), rotation = new vec4())
    {
        this.position = position;
        this.rotation = rotation;

        //Constants
        this.movementSpeed = 4;
        this.rotationSpeed = 2;
        this.mouseSensitivityMultiplier = 4;

        //Variables remembering which keys are down
        this.pressedKeys = new Map();
        this.mouseIsDown = false;

        this.translationMatrix = new mat4();
        this.rotationMatrix = new mat4();
        
        //Boolean to prevent excessive matrix operations
        this.viewMatNeedsUpdate = true;
        this.pUpdateTime = new Date().getTime();
    }

    update() {
        const currentTime = new Date().getTime();
        const dTime = (currentTime - this.pUpdateTime)/1000;
        this.pUpdateTime = currentTime;
        const mspeed = this.movementSpeed * dTime;
        const rspeed = this.rotationSpeed * dTime;

        if (this.pressedKeys.get('w') == true)
        {
            this.viewMatNeedsUpdate = true;
            this.position.x += Math.sin(this.rotation.y)*mspeed; this.position.z += Math.cos(this.rotation.y)*mspeed;
        }
        if (this.pressedKeys.get('s') == true)
        {
            this.viewMatNeedsUpdate = true;
            this.position.x -= Math.sin(this.rotation.y)*mspeed; this.position.z -= Math.cos(this.rotation.y)*mspeed;
        }
        if (this.pressedKeys.get('a') == true)
        {
            this.viewMatNeedsUpdate = true;
            this.position.x -= Math.cos(this.rotation.y)*mspeed; this.position.z += Math.sin(this.rotation.y)*mspeed;
        }
        if (this.pressedKeys.get('d') == true)
        {
            this.viewMatNeedsUpdate = true;
            this.position.x += Math.cos(this.rotation.y)*mspeed; this.position.z -= Math.sin(this.rotation.y)*mspeed;
        }
        if (this.pressedKeys.get(' ') == true)
        {
            this.viewMatNeedsUpdate = true;
            this.position.y += mspeed;
        }
        if (this.pressedKeys.get('shift') == true)
        {
            this.viewMatNeedsUpdate = true;
            this.position.y -= mspeed;
        }

        
        if (this.pressedKeys.get('arrowright') == true)
        {
            this.viewMatNeedsUpdate = true;
            this.rotation.y += rspeed;
        }
        if (this.pressedKeys.get('arrowleft') == true)
        {
            this.viewMatNeedsUpdate = true;
            this.rotation.y -= rspeed;
        }
        if (this.pressedKeys.get('arrowup') == true)
        {
            this.viewMatNeedsUpdate = true;
            this.rotation.z -= rspeed;
        }
        if (this.pressedKeys.get('arrowdown') == true)
        {
            this.viewMatNeedsUpdate = true;
            this.rotation.z += rspeed;
        }
        /*
        if (this.pressedKeys.get('u') == true) {this.rotation.x += rspeed;}
        if (this.pressedKeys.get('j') == true) {this.rotation.x -= rspeed;}
        if (this.pressedKeys.get('i') == true) {this.rotation.y += rspeed;}
        if (this.pressedKeys.get('k') == true) {this.rotation.y -= rspeed;}
        if (this.pressedKeys.get('o') == true) {this.rotation.z += rspeed;}
        if (this.pressedKeys.get('l') == true) {this.rotation.z -= rspeed;}*/
    }
    setPosition(pos=new vec4(), y=0,z=0)
    {
        if (!(pos instanceof vec4))
        {
            pos = new vec4(pos,y,z);
        }
        this.position = pos.copy();
    }
    setRotation(rot=new vec4(), y=0,z=0)
    {
        if (!(rot instanceof vec4))
        {
            rot = new vec4(rot,y,z);
        }
        this.rotation = rot.copy();
    }
    getPosition()
    {
        return this.position.copy();
    }
    getRotation()
    {        
        const yMat = new mat4().makeRotation(0,this.rotation.y, 0);
        const xMat = new mat4().makeRotation(0,0,this.rotation.z);
        this.rotationMatrix = xMat.mul(yMat);
        let r = getRotationFromRotationMatrix(this.rotationMatrix);
        return r;
    }
    getViewMatrix()
    {
        console.error("FPC.getViewMatrix(). DO NOT USE THIS FUNCTION.");
        return;
        if (this.viewMatNeedsUpdate == true)
        {
            this.translationMatrix.makeTranslation(-this.position.x, -this.position.y, this.position.z);
            const yMat = new mat4().makeRotation(0,this.rotation.y, 0);
            const zMat = new mat4().makeRotation(0,0,this.rotation.x);
            this.rotationMatrix = zMat.mul(yMat);
            this.viewMatNeedsUpdate = false;
        }
        return this.rotationMatrix.mul( this.translationMatrix );
    }
    eventListener(event)
    {
        switch (event.type)
        {
            case 'keydown': this.pressedKeys.set(event.key.toLowerCase(), true); break;
            case 'keyup': this.pressedKeys.set(event.key.toLowerCase(), false); break;
            case 'mousedown': this.mouseIsDown = true; break;
            case 'mouseup': this.mouseIsDown = false; break;
            case 'mousemove': 
                if (this.mouseIsDown)
                {
                    this.viewMatNeedsUpdate = true;
                    this.rotation.y -= event.movementX*this.mouseSensitivityMultiplier/1000;
                    this.rotation.z -= event.movementY*this.mouseSensitivityMultiplier/1000;
                }
                break;
        }
    }


    setMovementSpeed(speed = 0.15)
    {
        this.movementSpeed = speed;
    }
    setRotationSpeed(speed = 0.08)
    {
        this.rotationSpeed = speed;
    }
    setMouseSensitivity(speed = 2)
    {
        this.mouseSensitivityMultiplier = speed;
    }
    getMovementSpeed()
    {
        return this.movementSpeed;
    }
    getRotationSpeed()
    {
        return this.rotationSpeed;
    }
    getMouseSensitivity()
    {
        return this.mouseSensitivityMultiplier;
    }
}


/*

//FOR y, YMAT
const y = 0;
const b = y;
const a = 0;
const sa = Math.sin(0) = 0;
const ca = Math.cos(0) = 1;
const sb = Math.sin(y);
const cb = Math.cos(y);
const sy = Math.sin(0) = 0;
const cy = Math.cos(0) = 1;

const rot = [
    cy,   0,   sy,  0,
    0,    1,   0,   0,
    -sy,  0,   cy,  0,
    0,    0,    0,  1,
];


//FOR z, ZMAT
const y = rotation.z;
const b = 0;
const a = 0;
const sa = 0;
const ca = 1;
const sb = 0;
const cb = 1;
const sy = Math.sin(y);
const cy = Math.cos(y);

const rot = [
    1,   0,   0,   0,
    0,   cy,  sy,   0,
    0,   sy,  cy,   0,
    0,   0,    0,   1,
];



ZMAT x YMAT
1,   0,   0,   0,         cy,   0,   sy,  0,
0,   cz,  sz,   0,   x     0,    1,   0,   0,
0,   sz,  cz,   0,        -sy,  0,   cy,  0,
0,   0,    0,   1,         0,    0,    0,  1,


cy,      0,   sy,     0,
-sz*sy, cz,   sz*cy,  0,
-cz*sy, sz,   cz*cy,  0, 
0,       0,    0,     1, 


*/