/* This is a GL Wrapper class that makes rendering basic object easy.
*  Basic Functions:
*       constructor - takes htmlCanvasElement
*       set/get Camera Position/Rotation - gets and sets viewport/camera position and rotation
*       clear - clears the screen
*       create & delete object - create an object with a unique ID or name, with given vertices, indices, normals, and a color or colors.
*       set/get Object Position/Rotation - (given id) modify and get position and rotation of a given object
*       renderObject(objID) - renders a given object (given id) to the screen.
*       renderAll() - renders all objects
*
*       setAmbientLightLevel is setting the lowest light level for directional light (0.01 to 0.99, normal is 0.25)
*       enableDirectionalLighting is enabling/disabling directional lighting.
*       setDirectionalLightingDirection sets the direction the light is coming from
*
*
*       TODO:
*           - Possibly modify base shader to improve performance 
*           - Implement object picker functionality.
*           - Implement optional shadows
*/
class EasyGL {
    constructor(htmlCanvasElement = null) {
        //Make sure htmlCanvasElement is not null.
        if (htmlCanvasElement == null) { console.error("Cannot instantiate GL object without canvasElement"); return null;}
        this.htmlCanvasElement = htmlCanvasElement;
        let bb = this.htmlCanvasElement.getBoundingClientRect();
        this.htmlCanvasElement.width = bb.width;
        this.htmlCanvasElement.height = bb.height;

        this.gl = htmlCanvasElement.getContext('webgl');
        //Make sure this.webgl is instance of WebGlRenderingContext
        if (!(this.gl instanceof WebGLRenderingContext)) { console.error("Failed to create webgl context."); return null;}
    

        //Initialize camera Information
        this.cameraPosition = new vec4(0,0,1);
        this.cameraRotation = new vec4();
        this.cameraTranslationMatrix = new mat4().makeTranslation(this.cameraPosition.mul(-1));
        this.cameraRotationMatrix = new mat4().makeRotation(this.cameraRotation);
        this.viewMatrix = this.cameraTranslationMatrix.mul(this.cameraRotationMatrix);
        this.projectionMatrix = new mat4().makePerspective(1,1,1,1000);
        this._updateViewMatrix();

        //Environment Settings
        this.clearColor = new vec4(0,0,0,1);
        this.ambientLightLevel = 0.25;        //Minimum light level ranging from 0.01 to 0.99
        this.directionalLighting = true;      //Enable/disable directional lighting & use of normals;
        this.directionalLightingDirection = new vec4(0.74, 0.6, 0.4);

        //Rendering settings
        this.renderAllObjectsInOrder = true;   //Enable/disable rendering objects from farthest from camera to nearest, or just in order of instantiation.
                                        //Useful if trying to render semi-transparent objects
        this.renderReverseFaces = true; //Enable/disable rendering or culling faces not facing the camera.



        //Object Information
        this.objects = new Map();
        this.objectIDs = [];

        //Initialize Shader
        this.programInfo = null;
        this.shaderProgram = null;
        this.pickerProgramInfo = null;
        this.pickerShaderProgram = null;
        this._initShader();
        this._initPickerShader();
        this.clear();
    }

    __loadShader(type, source)//helper function used by _initShader() and _initPickerShader()
     {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
    
        // See if it compiled successfully
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('An error occurred compiling the shaders: ' + this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        return shader;
    }
    _initShader()//initialize the default shader
    {
        let vsSource = `
        attribute vec4 aVertexPosition;
        attribute vec4 aNormalVector;
        attribute vec4 aColor;
        uniform mat4 uProjectionMatrix;
        uniform mat4 uViewMatrix;
        uniform mat4 uObjectMatrix;
        varying highp vec4 color;
        void main() {
            vec4 vPos = vec4(aVertexPosition.x, aVertexPosition.y, aVertexPosition.z, 1.0);
            gl_Position = uProjectionMatrix * uViewMatrix * uObjectMatrix * vPos;
            `;
        if(this.directionalLighting==true) {
            const difference = 1 - this.ambientLightLevel; //max brightness vs min brightness for directional ambient light
            const maxDotValue = difference/2;
            const scale = maxDotValue.toPrecision(4);
            const offset = (1-maxDotValue).toPrecision(4);
            const x = this.directionalLightingDirection.x.toPrecision(4); //directional lighting direction
            const y = this.directionalLightingDirection.y.toPrecision(4);
            const z = this.directionalLightingDirection.z.toPrecision(4);
            vsSource +=`float scalar = dot(aNormalVector.xyz, vec3(`+x+`, `+y+`, `+z+`))*`+scale+` + `+offset+`;
            color = aColor * scalar;
            color.w = aColor.w;}`;
        } else {
            vsSource +=` color = aNormalVector;
            color = aColor;}`;
        }
    
        const fsSource = `
        precision mediump float;
        varying vec4 color;
        void main() {
            gl_FragColor = color;
        }
        `;
        const vertexShader = this.__loadShader(this.gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.__loadShader(this.gl.FRAGMENT_SHADER, fsSource);

        // Create the shader program
        const shaderProgram = this.gl.createProgram();
        this.gl.attachShader(shaderProgram, vertexShader);
        this.gl.attachShader(shaderProgram, fragmentShader);
        this.gl.linkProgram(shaderProgram);

        // If creating the shader program failed, alert
        if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
            console.error('Unable to initialize the shader program: ' + this.gl.getProgramInfoLog(shaderProgram));
            return null;
        }


        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexLocation: this.gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                normalLocation: this.gl.getAttribLocation(shaderProgram, 'aNormalVector'),
                colorLocation: this.gl.getAttribLocation(shaderProgram, 'aColor'),
            },
            uniformLocations: {
                projectionMatrix: this.gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                viewMatrix: this.gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
                objectMatrix: this.gl.getUniformLocation(shaderProgram, 'uObjectMatrix'),
            },
        };

        this.shaderProgram = shaderProgram;
        this.programInfo = programInfo;
    }
    _initPickerShader() //initialize shader for object picker
    {
        let vsSource = `
        attribute vec4 aVertexPosition;
        uniform mat4 uProjectionMatrix;
        uniform mat4 uViewMatrix;
        uniform mat4 uObjectMatrix;
        void main() {
            vec4 vPos = vec4(aVertexPosition.x, aVertexPosition.y, aVertexPosition.z, 1.0);
            gl_Position = uProjectionMatrix * uViewMatrix * uObjectMatrix * vPos;
        }`;
    
        const fsSource = `
        precision mediump float;
        uniform vec4 uColorVector;
        void main() {
            gl_FragColor = uColorVector;
        }
        `;
        const vertexShader = this.__loadShader(this.gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.__loadShader(this.gl.FRAGMENT_SHADER, fsSource);

        // Create the shader program
        const shaderProgram = this.gl.createProgram();
        this.gl.attachShader(shaderProgram, vertexShader);
        this.gl.attachShader(shaderProgram, fragmentShader);
        this.gl.linkProgram(shaderProgram);

        // If creating the shader program failed, alert
        if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
            console.error('Unable to initialize the shader program: ' + this.gl.getProgramInfoLog(shaderProgram));
            return null;
        }


        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexLocation: this.gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            },
            uniformLocations: {
                projectionMatrix: this.gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                viewMatrix: this.gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
                objectMatrix: this.gl.getUniformLocation(shaderProgram, 'uObjectMatrix'),
                colorVector: this.gl.getUniformLocation(shaderProgram, 'uColorVector'),
            },
        };

        this.pickerShaderProgram = shaderProgram;
        this.pickerProgramInfo = programInfo;
    }


    //Rendering Functions
    clear() //Clear the screen to default color
    {
        // Clear the canvas before we start drawing on it.
        this.gl.clearColor(this.clearColor.x, this.clearColor.y, this.clearColor.z, this.clearColor.a);    // Clear to white, fully opaque
        this.gl.clearDepth(1);                   // Clear everything

        //Enable depth testing & blending
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LESS);
        this.gl.enable(this.gl.BLEND);
        this.gl.depthMask(true);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        
        if (this.renderReverseFaces == true)
        {
            this.gl.disable(this.gl.CULL_FACE);
        } else {
            this.gl.enable(this.gl.CULL_FACE);
        }
        
    
        
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    
        //Set Viewport
        this.gl.viewport(0, 0, this.htmlCanvasElement.width, this.htmlCanvasElement.height);
    }
    renderObject(objectID = 0) //renders specific object
    {
        const objectData = this.objects.get(objectID);
        if (objectData == null) { console.error("Object: " + objectID + " Does Not Exist. Cannot Render."); return; }

        this.gl.useProgram(this.programInfo.program);

        //BIND BUFFERS ///////////////////////////////////////////
        //Bind Vertices Buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, objectData.verticesBuffer);
        this.gl.vertexAttribPointer(this.programInfo.attribLocations.vertexLocation, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexLocation);

        //Bind Normals Buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, objectData.normalsBuffer);
        this.gl.vertexAttribPointer(this.programInfo.attribLocations.normalLocation, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.programInfo.attribLocations.normalLocation);

        //Bind Colors Buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, objectData.colorsBuffer);
        this.gl.vertexAttribPointer(this.programInfo.attribLocations.colorLocation, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.programInfo.attribLocations.colorLocation);

        //Bind Indices
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, objectData.indicesBuffer);

        
        //BIND UNIFORMS////////////////////////////////////////
        // Set the shader uniforms
        this.gl.uniformMatrix4fv(this.programInfo.uniformLocations.projectionMatrix,  false, this.projectionMatrix.getFloat32Array());
        this.gl.uniformMatrix4fv(this.programInfo.uniformLocations.viewMatrix, false, this.viewMatrix.getFloat32Array());
        this.gl.uniformMatrix4fv(this.programInfo.uniformLocations.objectMatrix, false, objectData.objectMatrix.getFloat32Array());

        //RENDER////////////////////////////////////////////////
        this.gl.drawElements(this.gl.TRIANGLES, objectData.indices.length, this.gl.UNSIGNED_SHORT, 0);
    }
    renderAll() //renders all objects 
    {
        if (this.renderAllObjectsInOrder == true) {
            //Start by putting each object into a list with it's distance to the camera.
            let objs = []; //in form [ {id, distToCamera}, {...}, ... ]
            for (let i=0; i<this.objectIDs.length; i++)
            {
                let dist = distanceBetweenPoints( this.objects.get(this.objectIDs[i]).position, this.cameraPosition);
                objs.push( {id: this.objectIDs[i], dist: dist} );
            }

            //Sort the list, from farthest obejct to closest
            objs.sort((a,b) => (a.dist < b.dist) ? 1 : -1);
            
            //Now, render each object in the new order
            for (let i=0; i<objs.length; i++)
            {
                this.renderObject( objs[i].id );
            }
        } else {
            for (let i=0; i<this.objectIDs.length; i++)
            {
                this.renderObject( this.objectIDs[i] );
            }
        }
    }
    

    //Set & Get for Camera/viewport positioning
    setCameraPosition(position = new vec4(), y=0, z=0)
    {
        if (!(position instanceof vec4))
        {
            this.cameraPosition = new vec4(position, y, z);
        } else {
            this.cameraPosition = position.copy();
        }
        this._updateViewMatrix();
    }
    setCameraRotation(rotation = new vec4(), y=0, z=0)
    {
        if (!(rotation instanceof vec4))
        {
            this.cameraRotation = new vec4(rotation, y, z);
        } else {
            this.cameraRotation = rotation.copy();
        }
        this._updateViewMatrix();
    }
    setViewMatrix(matrix = new ma4().makeRotation())
    {
        if (!(matrix instanceof mat4))
        {
            console.error("Cannot set view matrix if not passed a matrix mat4");
            return;
        }
        this.viewMatrix = matrix;
    }
    _updateViewMatrix()
    {
        this.cameraTranslationMatrix.makeTranslation(this.cameraPosition.mul(-1,-1,1,1));
        this.cameraRotationMatrix.makeRotation(this.cameraRotation);
        this.viewMatrix = this.cameraRotationMatrix.mul(this.cameraTranslationMatrix);
    }
    setPerspective(FOV=1, aspectRatio=null, zNear=1, zFar=1000)
    {
        if (FOV == null || FOV == undefined) {FOV = 1;}
        if (zNear == null || zNear == undefined) {zNear = 1;}
        if (zFar == null || zFar == undefined) {zFar = 1000;}
        if (aspectRatio == null || aspectRatio == undefined) 
        { 
            aspectRatio = this.htmlCanvasElement.width/this.htmlCanvasElement.height; 
        }
        this.projectionMatrix = new mat4().makePerspective(FOV,aspectRatio,zNear,zFar);
    }
    getCameraPosition()
    {
        return this.cameraPosition.copy();
    }
    getCameraRotation()
    {
        return this.cameraRotation.copy();
    }


    //Object Modifiers
    /*
    Creating Objects - takes a name or id 
        objectID: id used to uniquely identify  the object
        vertices: either array of vec4 or array of floats.
        indices: array of integers
        colors: either vec4, array of vec4, or array of floats.
        position: vec4
        rotation: vec4
    */
    createObject(objectID, position=new vec4(), rotation=new vec4(), scale=new vec4(1,1,1), vertices=cubeVertices, indices=cubeIndices, normals=cubeNormals, colors=cubeColors) 
    {
        //Case statements to allow for passing null and undefined values
        if (objectID == null || objectID == undefined)
        {
            objectID = Math.round(Math.random()*10000+1000)
        }
        if (!(position instanceof vec4))
        {
            position = new vec4();
        }
        if (!(rotation instanceof vec4))
        {
            rotation = new vec4();
        }
        if (!(scale instanceof vec4))
        {
            scale = new vec4(1,1,1);
        }
        if (vertices == null || vertices == undefined)
        {
            vertices = cubeVertices;
        }
        if (normals == null || normals == undefined)
        {
            normals = cubeNormals;
        }
        if (indices == null || indices == undefined)
        {
            indices = cubeIndices;
        }
        if (colors == null || colors == undefined)
        {
            colors = cubeColors;
        }


        //Handle indices & check for correct format
        if (indices.length % 3 != 0) {console.error("Cannot make object with non-multiple of 3 length indices"); return;}

        //Handle vertices & check for correct format & Data
        if (vertices instanceof Array && vertices.length > 0)
        {
            if (vertices[0] instanceof vec4)
            {
                //array of vec4s
                let vs = vertices;
                vertices = [];
                for (let i=0; i<v.length; v++)
                {
                    vertices.push(vs.x, vs.y, vs.z);
                }
            } else {
                //assuming vertices are correctly formatted.
                if (vertices.length % 3 != 0) {console.error("Cannot make object with non-multiple of 3 length vertices"); return;}
            }
        } else {
            console.error("Cannot make object with non-array of vertices");
            return;
        }

        //Handle normals & check for correct format & Data
        if (normals instanceof Array && normals.length > 0)
        {
            if (normals[0] instanceof vec4)
            {
                //array of vec4s
                const vs = normals;
                normals = [];
                for (let i=0; i<v.length; v++)
                {
                    normals.push(vs.x, vs.y, vs.z);
                }
            } else {
                //assuming vertices are correctly formatted.
                if (normals.length % 3 != 0) {console.error("Cannot make object with non-multiple of 3 length normals"); return;}
            }
        } else {
            //normals = null;
            //NO NORMALS
            console.error("Cannot make object with non-array of normals", normals);
            return;
        }

        //Handle Colors. Can either be:
        if (colors instanceof vec4)
        {
            //case 1: colors = vec4, so we need to expand to all vertices. 
            let c = colors;
            colors = [];
            for (let i=0; i<vertices.length; i++)
            {
                colors.push(c.x, c.y, c.z, c.a);
            }
        } else if (colors[0] instanceof vec4)
        {
            //case 2: colors = [ vec4, vec4, vec4...]
            let cs = colors;
            colors = [];
            for (let i=0; i<cs.length; i++)
            {
                colors.push(cs.x, cs.y, cs.z, cs.a);
            }
        }



        //Now, initialize the buffers
        const verticesBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, verticesBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

        const normalsBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalsBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(normals), this.gl.STATIC_DRAW);

        const colorsBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorsBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW);

        const indicesBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);

        /*
        scale.a = 1;
        const tmat = new mat4().makeTranslation(position);
        const rmat = new mat4().makeRotation(rotation);
        const smat = new mat4().makeScale(scale);
        const objectMatrix = tmat.mul(rmat.mul(smat));*/
        const objectMatrix = new mat4().makeTranslationRotationScale(position, rotation, scale);

        //Save data to this.objects Map/Dictionary
        const objectData = {
            id: objectID,
            vertices: vertices,
            indices: indices,
            normals: normals,
            colors: colors,

            position: position.copy(),
            rotation: rotation.copy(),
            scale: scale.copy(),
            objectMatrix: objectMatrix,

            verticesBuffer: verticesBuffer,
            indicesBuffer: indicesBuffer, 
            colorsBuffer: colorsBuffer,
            normalsBuffer: normalsBuffer,
        };

        this.deleteObject(objectID);
        this.objects.set(objectID, objectData);
        this.objectIDs.push(objectID);

        return objectID;
    }
    createStandardObject(objectID, position=new vec4(), rotation=new vec4(), scale=new vec4(1,1,1), type='cube', color=new vec4(1,0,0,1)) 
    {
        //create a standard object
        //  position: objects position, vec4
        //  rotation: objects rotation, vec4
        //  color: objects color, vec4
        //  type: type of object: cube, sphere, cylinder,

        //Case statements to allow for passing null and undefined values
        if (objectID == null || objectID == undefined)
        {
            objectID = Math.round(Math.random()*10000+1000)
        }
        if (!(position instanceof vec4))
        {
            position = new vec4();
        }
        if (!(rotation instanceof vec4))
        {
            rotation = new vec4();
        }
        if (!(scale instanceof vec4))
        {
            scale = new vec4();
        }
        if (!(color instanceof vec4))
        {
            console.error("color MUST be a vec4 for this createObject() overload"); return;
        }

        let vertices = null;
        let indices = null;
        let normals = null;
        let colors = null;

        switch(type)
        {
            case 'cube': 
                vertices = cubeVertices;
                indices = cubeIndices;
                normals = cubeNormals;
                break;
            case 'sphere':
                break;
        }
        //Make sure the switch statement found a shape
        if (vertices == null) {
            console.error("Could not create object type: ", color);
            return;
        }

        colors = [];
        for (let i=0; i<vertices.length/3; i++)
        {
            colors.push(color.x, color.y, color.z, color.a);
        }


        //Now, initialize the buffers
        const verticesBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, verticesBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

        const normalsBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalsBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(normals), this.gl.STATIC_DRAW);

        const colorsBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorsBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW);

        const indicesBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);


        /*scale.a = 1;
        const tmat = new mat4().makeTranslation(position);
        const rmat = new mat4().makeRotation(rotation);
        const smat = new mat4().makeScale(scale);
        const objectMatrix = tmat.mul(rmat.mul(smat));*/
        const objectMatrix = new mat4().makeTranslationRotationScale(position, rotation, scale);

        //Save data to this.objects Map/Dictionary
        const objectData = {
            id: objectID,
            vertices: vertices,
            indices: indices,
            normals: normals,
            colors: colors,

            position: position.copy(),
            rotation: rotation.copy(),
            scale: scale.copy(),
            objectMatrix: objectMatrix,

            verticesBuffer: verticesBuffer,
            indicesBuffer: indicesBuffer, 
            colorsBuffer: colorsBuffer,
            normalsBuffer: normalsBuffer,
        };
        this.deleteObject(objectID);
        this.objects.set(objectID, objectData);
        this.objectIDs.push(objectID);

        return objectID;
    }
    deleteObject(objectID)
    {
        this.objects.set(objectID, null);
        for (let i=0; i<this.objectIDs.length; i++)
        {
            if (this.objectIDs[i] == objectID)
            {
                this.objectIDs.splice(i,1);
                //we don't break out of the loop in case of duplicates.
            }
        }
    }
    setObjectPosition(objectID, position = new vec4(), y=0, z=0)
    {
        const objectData = this.objects.get(objectID);
        if (objectData == null) { console.log("Object: "+objectID+" does not exist. Cannot set position."); return;}
        if (!(position instanceof vec4)) {
            position = new vec4(position, y, z);
        }
        objectData.position = position.copy();

        //Update objectMatrix
        /*objectData.scale.a = 1;
        const tmat = new mat4().makeTranslation(objectData.position);
        const rmat = new mat4().makeRotation(objectData.rotation);
        const smat = new mat4().makeScale(objectData.scale);
        objectData.objectMatrix = tmat.mul(rmat.mul(smat));*/
        objectData.objectMatrix = new mat4().makeTranslationRotationScale(objectData.position, objectData.rotation, objectData.scale);
    }
    setObjectRotation(objectID, rotation = new vec4(), y=0, z=0)
    {
        const objectData = this.objects.get(objectID);
        if (objectData == null) { console.log("Object: "+objectID+" does not exist. Cannot set rotation."); return;}
        if (!(rotation instanceof vec4)) {
            rotation = new vec4(rotation, y, z, a);
        }
        objectData.rotation = rotation.copy();

        //Update objectMatrix
        /*objectData.scale.a = 1;
        const tmat = new mat4().makeTranslation(objectData.position);
        const rmat = new mat4().makeRotation(objectData.rotation);
        const smat = new mat4().makeScale(objectData.scale);
        objectData.objectMatrix = tmat.mul(rmat.mul(smat)); */   
        objectData.objectMatrix = new mat4().makeTranslationRotationScale(objectData.position, objectData.rotation, objectData.scale);
    }
    setObjectScale(objectID, scale = new vec4(), y=0, z=0)
    {
        const objectData = this.objects.get(objectID);
        if (objectData == null) { console.log("Object: "+objectID+" does not exist. Cannot set scale."); return;}
        if (!(scale instanceof vec4)) {
            scale = new vec4(scale, y, z, a);
        }
        objectData.scale = scale.copy();

        //Update objectMatrix
        /*objectData.scale.a = 1;
        const tmat = new mat4().makeTranslation(objectData.position);
        const rmat = new mat4().makeRotation(objectData.rotation);
        const smat = new mat4().makeScale(objectData.scale);
        objectData.objectMatrix = tmat.mul(rmat.mul(smat));*/
        objectData.objectMatrix = new mat4().makeTranslationRotationScale(objectData.position, objectData.rotation, objectData.scale);
    }

    //Object Accessors
    getObjectPosition(objectID) //get position of object, given objectID
    {
        const objectData = this.objects.get(objectID);
        if (objectData == null) { console.error("Object: "+objectID+" does not exist. Cannot get position."); return;}
        return objectData.position.copy();
    }
    getObjectRotation(objectID) //get rotation of object, given objectID
    {
        const objectData = this.objects.get(objectID);
        if (objectData == null) { console.error("Object: "+objectID+" does not exist. Cannot get rotation."); return;}
        return objectData.rotation.copy();
    }
    getObjectScale(objectID) //get rotation of object, given objectID
    {
        const objectData = this.objects.get(objectID);
        if (objectData == null) { console.error("Object: "+objectID+" does not exist. Cannot get scale."); return;}
        return objectData.scale.copy();
    }


    //Misc Functions
    //Set ambient light level - WARNING: CPU intensive. Do not do often.
    setAmbientLightLevel(value = 0.25) //sets minimum light level for directional lighting (in shadow, how dark it is)
    {
        if (isNaN(value))
        {
            console.error("Cannot set ambient light level to NaN.");
            return;
        }
        this.ambientLightLevel = value;
        this._initShader();
    }
    enableDirectionalLighting(enable = true) //enables/disables directional lighting
    {
        this.directionalLighting = enable;
        this._initShader();
    }
    setDirectionalLightingDirection(direction = new vec4(0.74, 0.6, 0.4), y=0.6, z=0.4) //sets the direction the light comes from in the scene
    {
        if (!(direction instanceof vec4))
        {
            direction = new vec4(direction, y,z);
        }
        this.directionalLightingDirection = direction.copy();
        this.directionalLightingDirection.scaleToUnit();
        this._initShader();
    }
    resizeListener(event) //call this every time the window is resized
    {
        let bb = this.htmlCanvasElement.getBoundingClientRect();
        this.htmlCanvasElement.width = bb.width;
        this.htmlCanvasElement.height = bb.height;
    }
    enableRenderingReverseFaces(enable = true) //enables rendering faces & triangles not facing the camera (for transparent objects)
    {
        this.renderReverseFaces = enable;
    }
    enableSortingObjects(enable = true) //enables sorting objects so transparent objects render correctly
    {
        //More details: enable sorting so webgl renders objects in order distance to closest to the camera.
        //          this makes it so transparent objects are actually transparent, and objects render behind them.
        this.renderAllObjectsInOrder = enable;
    }

}

//Default Cube
const cubeVertices =  [
    -0.5,0.5,0.5, 0.5,0.5,0.5, 0.5,-0.5,0.5, -0.5,-0.5,0.5, //front
    -0.5,0.5,-0.5, -0.5,-0.5,-0.5, 0.5,-0.5,-0.5, 0.5,0.5,-0.5, //back
    -0.5,0.5,0.5, -0.5,0.5,-0.5, 0.5,0.5,-0.5, 0.5,0.5,0.5, //top
    -0.5,0.5,0.5, -0.5,-0.5,0.5, -0.5,-0.5,-0.5, -0.5,0.5,-0.5, //left
    0.5,0.5,0.5, 0.5,0.5,-0.5, 0.5,-0.5,-0.5, 0.5,-0.5,0.5, //right
    -0.5,-0.5,0.5, 0.5,-0.5,0.5, 0.5,-0.5,-0.5, -0.5,-0.5,-0.5, //bottom
];
const cubeIndices = [
    0,2,1, 0,3,2, //front
    4,6,5, 4,7,6, //back
    8,10,9, 8,11,10, //top
    12,14,13, 12,15,14, //left
    16,18,17, 16,19,18, //right
    20,22,21, 20,23,22, //bottom
];
const cubeNormals = [
    0,0,1, 0,0,1, 0,0,1, 0,0,1,
    0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
    0,1,0, 0,1,0, 0,1,0, 0,1,0,
    -1,0,0, -1,0,0, -1,0,0, -1,0,0, //left
    1,0,0, 1,0,0, 1,0,0, 1,0,0, //right
    0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0, //bottom
];
const cubeColors = [
    0.5,0.5,0.5,1, 0.5,0.5,0.5,1, 0.5,0.5,0.5,1, 0.5,0.5,0.5,1,
    0.5,0.5,0.5,1, 0.5,0.5,0.5,1, 0.5,0.5,0.5,1, 0.5,0.5,0.5,1,
    0.5,0.5,0.5,1, 0.5,0.5,0.5,1, 0.5,0.5,0.5,1, 0.5,0.5,0.5,1,
    0.5,0.5,0.5,1, 0.5,0.5,0.5,1, 0.5,0.5,0.5,1, 0.5,0.5,0.5,1,
    0.5,0.5,0.5,1, 0.5,0.5,0.5,1, 0.5,0.5,0.5,1, 0.5,0.5,0.5,1,
    0.5,0.5,0.5,1, 0.5,0.5,0.5,1, 0.5,0.5,0.5,1, 0.5,0.5,0.5,1,
];