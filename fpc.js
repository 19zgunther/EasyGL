/*
*   FPC is a basic input to position & rotation controller.
*   Controls: WASD to move, arrow keys & mouse drag to rotate,
*   
*   How To Implement: 
*       Instantiate and add document listeners for keydown, keyup, mousedown, mouseup, and mousemove.
*       Ex: 
*           document.addEventListener('keydown', function(e) {
*               fpc.eventListener(e);
*           });
*       Or Add this:
*           ['keydown', 'keyup', 'mousedown','mouseup','mousemove'].forEach( function(eventType) {
*                canvasElement.addEventListener(eventType, function(event) {fpc.eventListener(event)});
*            });
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
            this.rotation.x -= rspeed;
        }
        if (this.pressedKeys.get('arrowdown') == true)
        {
            this.viewMatNeedsUpdate = true;
            this.rotation.x += rspeed;
        }
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
        /*let v = new vec4(0,0,1);
        let yMat = new mat4().makeRotation(0, this.rotation.y, 0);
        let xMat = new mat4().makeRotation(this.rotation.x, 0, 0);
        v = yMat.mul(v);
        console.log(v);*/
        //console.error("not implemented properly");
        //return this.rotation;
        //let ry = this.rotation.y;
        //let rx = this.rotation.x * 1;//Math.cos(ry);
        //let rz = 0;
        //console.log(ry);
        //return new vec4( 0 , ry, rx );
        /*
        let yMat = new mat4().makeRotation(0,this.rotation.y, 0);
        let xMat = new mat4().makeRotation(0,0,this.rotation.x, 0, 0);
        this.rotationMatrix = xMat.mul(yMat);
        let f32a = this.rotationMatrix.getFloat32Array();
        //let rx = Math.atan2( f32a[] )

        let r = getRotationFromRotationMatrix(this.rotationMatrix);
        console.log(r.toString(0.1))*/
        return this.rotation;
    }
    getViewMatrix()
    {
        if (this.viewMatNeedsUpdate == true)
        {
            this.translationMatrix.makeTranslation(-this.position.x, -this.position.y, this.position.z);
            let yMat = new mat4().makeRotation(0,this.rotation.y, 0);
            let xMat = new mat4().makeRotation(0,0,this.rotation.x, 0, 0);
            this.rotationMatrix = xMat.mul(yMat);
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
                    this.rotation.x -= event.movementY*this.mouseSensitivityMultiplier/1000;
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