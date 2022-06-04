/***********************************************************************************************
*  Code Written by Zack Gunther
*  If you would like to copy or use this code email me at 19zgunther@gmail.com to ask permission.
************************************************************************************************/
/*
* Matrix Form:
* 0 4 8  12
* 1 5 9  13
* 2 6 10 14
* 3 7 11 15
*/
class mat4 {
    constructor()
    {
        //COLUMN MAJOR ALIGNMENT
        this.f32a = new Float32Array(16); //float 32 array
        for( var i=0; i<16; i++)
        {
            this.f32a[i] = 0;
        }
    }
    setValues(array)
    {
        if (array.length != 16)
        {
            console.error("mat4.set(array) - array.length != 16");
            return;
        }
        for (var i=0; i<16; i++)
        {
            this.f32a[i] = array[i];
        }
        return this;
    }
    setUnit()
    {
        for( var i=0; i<16; i++)
        {
            this.f32a[i] = 0;
        }
        this.f32a[0] = 1;
        this.f32a[5] = 1;
        this.f32a[10] = 1;
        this.f32a[15] = 1;
        return this;
    }
    makePerspective(FOV, aspect, near, far)
    {
        var f = Math.tan(Math.PI * 0.5 - 0.5 * FOV);
        var range = 1.0/(near-far);
        this.f32a[0] = f/aspect;
        this.f32a[4] = 0;
        this.f32a[8] = 0;
        this.f32a[12] = 0;

        this.f32a[1] = 0;
        this.f32a[5] = f;
        this.f32a[9] = 0;
        this.f32a[13] = 0;

        this.f32a[2] = 0;
        this.f32a[6] = 0;
        this.f32a[10] = (near+far)*range,
        this.f32a[14] = -1;

        this.f32a[3] = 0;
        this.f32a[7] = 0;
        this.f32a[11] = near*far*range*2;
        this.f32a[15] = 0;
        return this;
    }
    makeOrthogonal(zoom, aspect, near, far)
    {
        var range = 1.0/(far);

        this.f32a[0] = (1/aspect) * zoom;
        this.f32a[4] = 0;
        this.f32a[8] = 0;
        this.f32a[12] = 0;

        this.f32a[1] = 0;
        this.f32a[5] = zoom;
        this.f32a[9] = 0;
        this.f32a[13] = 0;

        this.f32a[2] = 0;
        this.f32a[6] = 0;
        this.f32a[10] = range;
        this.f32a[14] = 1;

        this.f32a[3] = 0;
        this.f32a[7] = 0;
        this.f32a[11] = 0;
        this.f32a[15] = 1;
        return this;
    }
    makeTranslation(x,y=0,z=0)
    {
        if (x instanceof vec4)
        {
            y = x.y;
            z = x.z;
            x = x.x;
        }

        if (x == null || isNaN(x)) { x = 0;}
        if (y == null || isNaN(y)) { y = 0;}
        if (z == null || isNaN(z)) { z = 0;}

        //COLUMN MAJOR ALIGNMENT
        this.f32a[0] = 1;
        this.f32a[4] = 0;
        this.f32a[8] = 0;
        this.f32a[12] = x;

        this.f32a[1] = 0;
        this.f32a[5] = 1;
        this.f32a[9] = 0;
        this.f32a[13] = y;

        this.f32a[2] = 0;
        this.f32a[6] = 0;
        this.f32a[10] = 1;
        this.f32a[14] = z;

        this.f32a[3] = 0;
        this.f32a[7] = 0;
        this.f32a[11] = 0;
        this.f32a[15] = 1;
        
        return this;
    }
    makeTranslationAndScale(tx,ty,tz=0, sx=1, sy=1, sz=1)
    {
        if (tx instanceof vec4 && ty instanceof vec4)
        {
            sx = ty.x;
            sy = ty.y;
            sz = ty.z;

            ty = tx.y;
            tz = tx.z;
            tx = tx.x;
        } else {
            if (tx == null || isNaN(tx) || ty == null || isNaN(ty)) {
                console.error("mart4.makeTranslationAndScale() requires either 2 vec4s or 6 scalars as inputs. Given null values.");
                return;
            }
        }

        //COLUMN MAJOR ALIGNMENT
        this.f32a[0] = sx;
        this.f32a[4] = 0;
        this.f32a[8] = 0;
        this.f32a[12] = tx;

        this.f32a[1] = 0;
        this.f32a[5] = sy;
        this.f32a[9] = 0;
        this.f32a[13] = ty;

        this.f32a[2] = 0;
        this.f32a[6] = 0;
        this.f32a[10] = sz;
        this.f32a[14] = tz;

        this.f32a[3] = 0;
        this.f32a[7] = 0;
        this.f32a[11] = 0;
        this.f32a[15] = 1;
        
        return this;
    }
    makeScale(x,y=1,z=1,a=1)
    {
        if (x instanceof vec4)
        {
            //COLUMN MAJOR ALIGNMENT
            this.f32a[0] = x.x;
            this.f32a[4] = 0;
            this.f32a[8] = 0;
            this.f32a[12] = 0;

            this.f32a[1] = 0;
            this.f32a[5] = x.y;
            this.f32a[9] = 0;
            this.f32a[13] = 0;

            this.f32a[2] = 0;
            this.f32a[6] = 0;
            this.f32a[10] = x.z;
            this.f32a[14] = 0;

            this.f32a[3] = 0;
            this.f32a[7] = 0;
            this.f32a[11] = 0;
            this.f32a[15] = x.a;
        } else {

            //COLUMN MAJOR ALIGNMENT
            this.f32a[0] = x;
            this.f32a[4] = 0;
            this.f32a[8] = 0;
            this.f32a[12] = 0;

            this.f32a[1] = 0;
            this.f32a[5] = y;
            this.f32a[9] = 0;
            this.f32a[13] = 0;

            this.f32a[2] = 0;
            this.f32a[6] = 0;
            this.f32a[10] = z;
            this.f32a[14] = 0;

            this.f32a[3] = 0;
            this.f32a[7] = 0;
            this.f32a[11] = 0;
            this.f32a[15] = a;
        }
        return this;
    }
    makeRotation(a,b,y) {
        if (a instanceof vec4)
        {
            y = a.z;
            b = a.y;
            a = a.x;
        }

        //COLUMN MAJOR ALIGNMENT
        if (a == null || isNaN(a)) { a = 0;}
        if (b == null || isNaN(b)) { b = 0;}
        if (y == null || isNaN(y)) { y = 0;}
        var sa = Math.sin(a);
        var ca = Math.cos(a);
        var sb = Math.sin(b);
        var cb = Math.cos(b);
        var sy = Math.sin(y);
        var cy = Math.cos(y);

        this.f32a[0] = ca*cb;
        this.f32a[4] = ca*sb*sy-sa*cy;
        this.f32a[8] = ca*sb*cy+sa*sy;
        this.f32a[12] = 0;

        this.f32a[1] = sa*cb;
        this.f32a[5] = sa*sb*sy+ca*cy;
        this.f32a[9] = sa*sb*cy-ca*sy;
        this.f32a[13] = 0;

        this.f32a[2] = -sb;
        this.f32a[6] = cb*sy;
        this.f32a[10] = cb*cy;
        this.f32a[14] = 0;

        this.f32a[3] = 0;
        this.f32a[7] = 0;
        this.f32a[11] = 0;
        this.f32a[15] = 1;
        return this;
    }
    makeTranslationRotationScale(pos=new vec4(), rotation=new vec4(), scale=new vec4(1,1,1)) {
        const f1 = [1,0,0,0, 0,1,0,0, 0,0,1,0, pos.x,pos.y,pos.z,1,]; //f1 is trans matrix 
        const sca = [scale.x,0,0,0, 0,scale.y,0,0, 0,0,scale.z,0, 0,0,0,1]; //sca is scale matrix
        
        //make rot[], rotation matrix
        const y = rotation.z;
        const b = rotation.y;
        const a = rotation.x;
        const sa = Math.sin(a);
        const ca = Math.cos(a);
        const sb = Math.sin(b);
        const cb = Math.cos(b);
        const sy = Math.sin(y);
        const cy = Math.cos(y);

        /*const rot = [
            ca*cb,   ca*sb*sy-sa*cy,   ca*sb*cy+sa*sy,   0,
            sa*cb,   sa*sb*sy+ca*cy,   sa*sb*cy-ca*sy,   0,
            -sb,     cb*sy,            cb*cy,            0,
            0,       0,                0,                1,
        ];*/
        const rot = [
            ca*cb,                     sa*cb,              -sb,            0,
            ca*sb*sy-sa*cy,   sa*sb*sy+ca*cy,              cb*sy,            0,
            ca*sb*cy+sa*sy,          sa*sb*cy-ca*sy,        cb*cy,            0,
            0,                            0,                0,                1,
        ];

        const f2 = [ //rotation * scale
            rot[0]*sca[0] + rot[4]*sca[1] + rot[8]*sca[2] + rot[12]*sca[3],
            rot[1]*sca[0] + rot[5]*sca[1] + rot[9]*sca[2] + rot[13]*sca[3],
            rot[2]*sca[0] + rot[6]*sca[1] + rot[10]*sca[2] + rot[14]*sca[3],
            rot[3]*sca[0] + rot[7]*sca[1] + rot[11]*sca[2] + rot[15]*sca[3],

            rot[0]*sca[4] + rot[4]*sca[5] + rot[8]*sca[6] + rot[12]*sca[7],
            rot[1]*sca[4] + rot[5]*sca[5] + rot[9]*sca[6] + rot[13]*sca[7],
            rot[2]*sca[4] + rot[6]*sca[5] + rot[10]*sca[6] + rot[14]*sca[7],
            rot[3]*sca[4] + rot[7]*sca[5] + rot[11]*sca[6] + rot[15]*sca[7],

            rot[0]*sca[8] + rot[4]*sca[9] + rot[8]*sca[10] + rot[12]*sca[11],
            rot[1]*sca[8] + rot[5]*sca[9] + rot[9]*sca[10] + rot[13]*sca[11],
            rot[2]*sca[8] + rot[6]*sca[9] + rot[10]*sca[10] + rot[14]*sca[11],
            rot[3]*sca[8] + rot[7]*sca[9] + rot[11]*sca[10] + rot[15]*sca[11],

            rot[0]*sca[12] + rot[4]*sca[13] + rot[8]*sca[14] + rot[12]*sca[15],
            rot[1]*sca[12] + rot[5]*sca[13] + rot[9]*sca[14] + rot[13]*sca[15],
            rot[2]*sca[12] + rot[6]*sca[13] + rot[10]*sca[14] + rot[14]*sca[15],
            rot[3]*sca[12] + rot[7]*sca[13] + rot[11]*sca[14] + rot[15]*sca[15],
        ];

        const vals = [
            f1[0]*f2[0] + f1[4]*f2[1] + f1[8]*f2[2] + f1[12]*f2[3],
            f1[1]*f2[0] + f1[5]*f2[1] + f1[9]*f2[2] + f1[13]*f2[3],
            f1[2]*f2[0] + f1[6]*f2[1] + f1[10]*f2[2] + f1[14]*f2[3],
            f1[3]*f2[0] + f1[7]*f2[1] + f1[11]*f2[2] + f1[15]*f2[3],

            f1[0]*f2[4] + f1[4]*f2[5] + f1[8]*f2[6] + f1[12]*f2[7],
            f1[1]*f2[4] + f1[5]*f2[5] + f1[9]*f2[6] + f1[13]*f2[7],
            f1[2]*f2[4] + f1[6]*f2[5] + f1[10]*f2[6] + f1[14]*f2[7],
            f1[3]*f2[4] + f1[7]*f2[5] + f1[11]*f2[6] + f1[15]*f2[7],

            f1[0]*f2[8] + f1[4]*f2[9] + f1[8]*f2[10] + f1[12]*f2[11],
            f1[1]*f2[8] + f1[5]*f2[9] + f1[9]*f2[10] + f1[13]*f2[11],
            f1[2]*f2[8] + f1[6]*f2[9] + f1[10]*f2[10] + f1[14]*f2[11],
            f1[3]*f2[8] + f1[7]*f2[9] + f1[11]*f2[10] + f1[15]*f2[11],

            f1[0]*f2[12] + f1[4]*f2[13] + f1[8]*f2[14] + f1[12]*f2[15],
            f1[1]*f2[12] + f1[5]*f2[13] + f1[9]*f2[14] + f1[13]*f2[15],
            f1[2]*f2[12] + f1[6]*f2[13] + f1[10]*f2[14] + f1[14]*f2[15],
            f1[3]*f2[12] + f1[7]*f2[13] + f1[11]*f2[14] + f1[15]*f2[15],
        ];

        this.setValues(vals);
        
        return this;
    }
    makeIdentity()
    {
        this.f32a[0] = 1;
        this.f32a[4] = 0;
        this.f32a[8] = 0;
        this.f32a[12] = 0;

        this.f32a[1] = 0;
        this.f32a[5] = 1;
        this.f32a[9] = 0;
        this.f32a[13] = 0;

        this.f32a[2] = 0;
        this.f32a[6] = 0;
        this.f32a[10] = 1;
        this.f32a[14] = 0;

        this.f32a[3] = 0;
        this.f32a[7] = 0;
        this.f32a[11] = 0;
        this.f32a[15] = 1;
        return this;
    }
    mul(mat) {
        if (mat instanceof mat4) {
            var f1 = this.getFloat32Array();
            var f2 = mat.getFloat32Array();
            var out = new mat4();
            var vals = [
                f1[0]*f2[0] + f1[4]*f2[1] + f1[8]*f2[2] + f1[12]*f2[3],
                f1[1]*f2[0] + f1[5]*f2[1] + f1[9]*f2[2] + f1[13]*f2[3],
                f1[2]*f2[0] + f1[6]*f2[1] + f1[10]*f2[2] + f1[14]*f2[3],
                f1[3]*f2[0] + f1[7]*f2[1] + f1[11]*f2[2] + f1[15]*f2[3],

                f1[0]*f2[4] + f1[4]*f2[5] + f1[8]*f2[6] + f1[12]*f2[7],
                f1[1]*f2[4] + f1[5]*f2[5] + f1[9]*f2[6] + f1[13]*f2[7],
                f1[2]*f2[4] + f1[6]*f2[5] + f1[10]*f2[6] + f1[14]*f2[7],
                f1[3]*f2[4] + f1[7]*f2[5] + f1[11]*f2[6] + f1[15]*f2[7],

                f1[0]*f2[8] + f1[4]*f2[9] + f1[8]*f2[10] + f1[12]*f2[11],
                f1[1]*f2[8] + f1[5]*f2[9] + f1[9]*f2[10] + f1[13]*f2[11],
                f1[2]*f2[8] + f1[6]*f2[9] + f1[10]*f2[10] + f1[14]*f2[11],
                f1[3]*f2[8] + f1[7]*f2[9] + f1[11]*f2[10] + f1[15]*f2[11],

                f1[0]*f2[12] + f1[4]*f2[13] + f1[8]*f2[14] + f1[12]*f2[15],
                f1[1]*f2[12] + f1[5]*f2[13] + f1[9]*f2[14] + f1[13]*f2[15],
                f1[2]*f2[12] + f1[6]*f2[13] + f1[10]*f2[14] + f1[14]*f2[15],
                f1[3]*f2[12] + f1[7]*f2[13] + f1[11]*f2[14] + f1[15]*f2[15],
            ];
            out.setValues(vals);
            return out;
        } else if (mat instanceof vec4) {
            var f1 = this.getFloat32Array();
            var f2 = mat.getFloat32Array();
            var vals = [
                f1[0]*f2[0] + f1[4]*f2[1] + f1[8]*f2[2] + f1[12]*f2[3],
                f1[1]*f2[0] + f1[5]*f2[1] + f1[9]*f2[2] + f1[13]*f2[3],
                f1[2]*f2[0] + f1[6]*f2[1] + f1[10]*f2[2] + f1[14]*f2[3],
                f1[3]*f2[0] + f1[7]*f2[1] + f1[11]*f2[2] + f1[15]*f2[3],
            ];
            return (new vec4).set(vals);
        } else if (typeof mat == 'number') {
            var newMat = new mat4();
            for(var i=0; i<16; i++)
            {
                newMat.f32a[i] = this.f32a[i] * mat;
            }
            return newMat;
        }
        console.error("mat4.mul() was passed Object it couldn't multiply. Valid types: mat4, vec4, number. ");
        return null;
    }
    muli(mat) {
        //Multiply into mat4 object.
        if (mat instanceof mat4) {
            var f1 = this.getFloat32Array();
            var f2 = mat.getFloat32Array();
            //var out = new mat4();
            
            this.f32a[0] = f1[0]*f2[0] + f1[4]*f2[1] + f1[8]*f2[2] + f1[12]*f2[3];
            this.f32a[1] = f1[1]*f2[0] + f1[5]*f2[1] + f1[9]*f2[2] + f1[13]*f2[3];
            this.f32a[2] = f1[2]*f2[0] + f1[6]*f2[1] + f1[10]*f2[2] + f1[14]*f2[3];
            this.f32a[3] = f1[3]*f2[0] + f1[7]*f2[1] + f1[11]*f2[2] + f1[15]*f2[3];

            this.f32a[4] = f1[0]*f2[4] + f1[4]*f2[5] + f1[8]*f2[6] + f1[12]*f2[7];
            this.f32a[5] = f1[1]*f2[4] + f1[5]*f2[5] + f1[9]*f2[6] + f1[13]*f2[7];
            this.f32a[6] = f1[2]*f2[4] + f1[6]*f2[5] + f1[10]*f2[6] + f1[14]*f2[7];
            this.f32a[7] = f1[3]*f2[4] + f1[7]*f2[5] + f1[11]*f2[6] + f1[15]*f2[7];

            this.f32a[8] = f1[0]*f2[8] + f1[4]*f2[9] + f1[8]*f2[10] + f1[12]*f2[11];
            this.f32a[9] = f1[1]*f2[8] + f1[5]*f2[9] + f1[9]*f2[10] + f1[13]*f2[11];
            this.f32a[10] = f1[2]*f2[8] + f1[6]*f2[9] + f1[10]*f2[10] + f1[14]*f2[11];
            this.f32a[11] = f1[3]*f2[8] + f1[7]*f2[9] + f1[11]*f2[10] + f1[15]*f2[11];

            this.f32a[12] = f1[0]*f2[12] + f1[4]*f2[13] + f1[8]*f2[14] + f1[12]*f2[15];
            this.f32a[13] = f1[1]*f2[12] + f1[5]*f2[13] + f1[9]*f2[14] + f1[13]*f2[15];
            this.f32a[14] = f1[2]*f2[12] + f1[6]*f2[13] + f1[10]*f2[14] + f1[14]*f2[15];
            this.f32a[15] = f1[3]*f2[12] + f1[7]*f2[13] + f1[11]*f2[14] + f1[15]*f2[15];
            
            return this;
        } else if (typeof mat == 'number') {
            for(var i=0; i<16; i++)
            {
                this.f32a[i] = this.f32a[i] * mat;
            }
            return this;
        }
        console.error("mat4.muli() requires either a mat4 or a scalar as an input.");
        return null;
    }
    add(mat) {
        if (mat instanceof mat4)
        {
            var newMat = new mat4();
            for (var i=0; i<16; i++)
            {
                newMat.f32a[i] = this.f32a[i] + mat.f32a[i];
            }
            return newMat;
        } else {
            console.error("mat4.add() requires a mat4 as the argument");
        }
    }
    sub(mat) {
        
        if (mat instanceof mat4)
        {
            var newMat = new mat4();
            for (var i=0; i<16; i++)
            {
                newMat.f32a[i] = this.f32a[i] - mat.f32a[i];
            }
            return newMat;
        } else {
            console.error("mat4.sub() requires a mat4 as the argument");
        }
    }
    getFloat32Array()
    {
        return this.f32a;
    }
    toString()
    {
        //return this.print();
        var s = "";
        var vals = [];
        for (var i=0; i<16; i++)
        {
            vals.push(this.f32a[i].toPrecision(3));
        }
        s += vals[0] + " " + vals[4] + " " + vals[8] + " " + vals[12] + "\n";
        s += vals[1] + " " + vals[5] + " " + vals[9] + " " + vals[13] + "\n";
        s += vals[2] + " " + vals[6] + " " + vals[10] + " " + vals[14] + "\n";
        s += vals[3] + " " + vals[7] + " " + vals[11] + " " + vals[15] + "\n";
        return s;
    }
    print()
    {
        console.log(this.toString());
    }
    copy()
    {
        var m = new mat4();
        m.setValues( this.getFloat32Array() );
        return m;
    }
    invert()
    {        
        //Alrighty this is math I don't really care for but I need so here goes nothing
        
        /*
        0  4  8   12
        1  5  9   13
        2  6  10  14
        3  7  11  15
        */
        var mat = this.copy();
        var mat2 = (new mat4()).makeIdentity();
        /*
        console.log("mat2\n" + mat2.toString());



        for (var column = 0; column < 4; column ++)
        {
            for (var row = 3; row > column; row--)
            {
                var index = column*4 + row;
                
                if (mat.f32a[index] == 0) //if the index is already 0, just continue. We don't need to reduce it!
                {
                    continue;
                } else {
                    //so, at index column row, we have a value we need to reduce.
                    //lets find a different non-zero index in this column
                    var row2 = -1;
                    for(var r2 = row-1; r2 >= 0; r2--)
                    {
                        if (mat.f32a[column*4 + r2] != 0) 
                        {
                            row2 = r2;
                            break;
                        }
                    }
                    if (row2 == -1)
                    {
                        console.error("Cannot find inverse of matrix. Error: no above row to reduce with!");
                        return;
                    }
                    
                    //now, we have 2 row indexes, and we want to remove the item from the bottom row (higher row #)
                    //Formula: valToRemove + otherVal*X = 0    -->   X = -valToRemove/otherVal
                    var X = -mat.f32a[column*4 + row]/mat.f32a[column*4 + row2];

                    for (var column2 = 0; column2 < 4; column2++) //Now, for each column, add the val in row2 * X to row
                    {
                        mat.f32a[column2*4 + row] += X * mat.f32a[column2*4 + row2];
                        mat2.f32a[column2*4 + row] += X * mat2.f32a[column2*4 + row2];
                    }
                }
                
                console.log("C: "+column+"  R: "+row+"\n"+mat.toString());

            }
        }

        //At this point, we should have removed the bottom left triangle and set that to 0. Now, lets scale each row so the diagonal (topleft-bottomright) only has 1's
        for (var i=0; i<4; i++)
        {
            var val = mat.f32a[i*4+i];
            if (val == 0) //if the diagonal index (row i, column i) is not already == 1
            {
                console.error("Cannot find inverse of matrix. Error: cannot get diagonal of 1's! Wil divide by zero.");
                return;
            }

            //Get 1 in diagonal spot
            for (var c=0; c<4; c++)
            {
                mat.f32a[c*4 + i] = mat.f32a[c*4 + i]/val;
                mat2.f32a[c*4 + i] = mat2.f32a[c*4 + i]/val;
            }
        }

        console.log("After getting 1's: \n"+mat.toString());

        //Now, we've reduced to the point where we have a diagonal of 1's with nothing below/left of it.
        //cleanup upper side!
        for (var i=3; i>0; i--)
        {
            for (var r2 = i-1; r2 >=0; r2--)
            {
                // mat[col=i, row=r2] + X*1 = 0    (the 1 comes from index=i*4 + i, the diagonal)
                var X = -mat.f32a[i*4 + r2];

                var c2 = i;
                mat.f32a[c2*4 + r2] += X * mat.f32a[c2*4 + i];
                mat2.f32a[c2*4 + r2] += X * mat2.f32a[c2*4 + i];
                
            }
        }

        console.log("Final: \n"+mat.toString());
        console.log("inverse: \n" + mat2.toString());
        */

        for(var c = 0; c<4; c++)
        {
            //console.log("C: "+c+" \n"+mat.toString()+"\n"+mat2.toString());
            if (mat.f32a[c*4 + c] == 0)
            {
                console.error("Cannot Invert Matrix: Diagonal has a 0. Cannot divide by zero");
                return;
            }

            //divide entire row to get 1.
            var X = mat.f32a[c*4 + c];
            for (var c2 = 0; c2 < 4; c2++)
            {
                mat.f32a[c2*4 + c] = mat.f32a[c2*4 + c]/X;
                mat2.f32a[c2*4 + c] = mat2.f32a[c2*4 + c]/X;
            }

            //console.log("After Div Row by X: " +X+"\n"+mat.toString()+"\n"+mat2.toString());


            //remove all vals in column other than in row c
            var otherRow = -1;
            for (var r=0; r<4; r++)
            {
                if (r != c && mat.f32a[c*4 + r] != 0)
                {
                    //otherIndexVal + 1*X = 0   -->   X = -otherIndexVal
                    var X = mat.f32a[c*4 + r];
                    for (var c2=0; c2<4; c2++)
                    {
                        mat.f32a[c2*4 + r] += -X * mat.f32a[c2*4+c];
                        mat2.f32a[c2*4 + r] += -X * mat2.f32a[c2*4+c];
                    }
                }
                //console.log("After Clearing R: " +r+"\n"+mat.toString()+"\n"+mat2.toString());
            }
        }//-Math.atan(glPos.x*zNear)

        //console.log("REsult: \n"+mat.toString()+"\n"+mat2.toString());
        return mat2;



        mat2 = new mat4();

        mat2.f32a[0] = 1/mat.f32a[0];
        mat2.f32a[5] = 1/mat.f32a[5];
        mat2.f32a[11] = 1/mat.f32a[14];
        mat2.f32a[14] = 1/mat.f32a[11];
        mat2.f32a[15] = -mat.f32a[10] / ( mat.f32a[14] * mat.f32a[11] );

        return mat2;
    }
}

class vec4 {
    constructor(x,y,z,a) {
        if (x == null || isNaN(x)) { x = 0;}
        if (y == null || isNaN(y)) { y = 0;}
        if (z == null || isNaN(z)) { z = 0;}
        if (a == null || isNaN(a)) { a = 0;}
        this.x = x;
        this.y = y;
        this.z = z;
        this.a = a;
    }
    set(x,y,z,a) {
        if (x != null && (x instanceof Array == false))
        {
            this.x = x;
            this.y = y;
            this.z = z;
            this.a = a;
        } else if (x instanceof Array) {
            switch (x.length) {
                case 4: this.x=x[0];this.y=x[1];this.z=x[2];this.a=x[3];break;
                case 3: this.x=x[0];this.y=x[1];this.z=x[2];break;
                case 2: this.x=x[0];this.y=x[1];break;
                case 1: this.x=x[0];break;
            };
        }
        return this;
    }
    add(x,y,z,a)
    {
        if (x instanceof vec4)
        {
            return new vec4(this.x+x.x, this.y+x.y, this.z+x.z, this.a+x.a);
        }
        if (isNaN(x)) { x = 0;}
        if (isNaN(y)) { y = 0;}
        if (isNaN(z)) { z = 0;}
        if (isNaN(a)) { a = 0;}
        return new vec4(this.x+x, this.y+y, this.z+z, this.a+a); 
    }
    addi(x,y=0,z=0,a=0)
    {
        if (x instanceof vec4)
        {
            //return new vec4(this.x+x.x, this.y+x.y, this.z+x.z, this.a+x.a);
            this.x += x.x;
            this.y += x.y;
            this.z += x.z;
            this.a += x.a;
            return this;
        }

        if (isNaN(x)) { x = 0;}
        if (isNaN(y)) { y = 0;}
        if (isNaN(z)) { z = 0;}
        if (isNaN(a)) { a = 0;}
        //return new vec4(this.x+x, this.y+y, this.z+z, this.a+a);
        this.x += x;
        this.y += y;
        this.z += z;
        this.a += a;

        return this;
    }
    sub(x,y,z,a)
    {
        if (x instanceof vec4)
        {
            return new vec4(this.x-x.x, this.y-x.y, this.z-x.z, this.a-x.a);
        }
        if (isNaN(x)) { x = 0;}
        if (isNaN(y)) { y = 0;}
        if (isNaN(z)) { z = 0;}
        if (isNaN(a)) { a = 0;}
        return new vec4(this.x-x, this.y-y, this.z-z, this.a-a); 
    }
    subi(x,y=0,z=0,a=0)
    {
        if (x instanceof vec4)
        {
            //return new vec4(this.x+x.x, this.y+x.y, this.z+x.z, this.a+x.a);
            this.x -= x.x;
            this.y -= x.y;
            this.z -= x.z;
            this.a -= x.a;
            return this;
        }
        if (isNaN(x)) { x = 0;}
        if (isNaN(y)) { y = 0;}
        if (isNaN(z)) { z = 0;}
        if (isNaN(a)) { a = 0;}
        //return new vec4(this.x+x, this.y+y, this.z+z, this.a+a);
        this.x -= x;
        this.y -= y;
        this.z -= z;
        this.a -= a;
        return this;
    }
    mul(x,y=null,z=null,a=null)
    {
        if (x instanceof vec4)
        {
            //multiply by vector
            return new vec4(this.x*x.x, this.y*x.y, this.z*x.z, this.a*x.a);
        } else if ( !isNaN(x) && y == null && z == null && a == null) {
            //multiply by scalar
            return new vec4(this.x*x, this.y*x, this.z*x, this.a*x);
        } else if (x instanceof mat4)
        {
            console.error("vec4.mul() cannot take a mat4 as an argument. Try mat4.mul(vec4).");
        } else {
            //multiple by all scalars
            if (isNaN(x)) { x = 0;}
            if (isNaN(y)) { y = 0;}
            if (isNaN(z)) { z = 0;}
            if (isNaN(a)) { a = 0;}
            return new vec4(this.x*x, this.y*y, this.z*z, this.a*a);
        }
    }
    muli(x,y=null,z=null,a=null)
    {
        //console.log("x: " + x + "  y: " + y + "  z: " + z + "  a: " + a);
        if (x instanceof vec4)
        {
            //multiply by vector
            this.x = this.x*x.x;
            this.y = this.y*x.y;
            this.z = this.z*x.z;
            this.a = this.a*x.a;
        } else if ( !isNaN(Number(x)) && y == null && z == null && a == null) {
            //multiply by scalar
            this.x = this.x*x;
            this.y = this.y*x;
            this.z = this.z*x;
            this.a = this.a*x;
        } else {
            //multiple by all scalars
            if (isNaN(x)) { x = 0;}
            if (isNaN(y)) { y = 0;}
            if (isNaN(z)) { z = 0;}
            if (isNaN(a)) { a = 0;}
            this.x = this.x*x;
            this.y = this.y*y;
            this.z = this.z*z;
            this.a = this.a*a;
        }
        return this;
    }
    dot(vec)
    {
        if (vec instanceof vec4 == false)
        {
            console.error("vec4.dot() was passed a non vec4.")
            return null;
        }
        return this.x*vec.x + this.y*vec.y + this.z*vec.z + this.a*vec.a;
    }
    cross(vec)
    {
        if (vec instanceof vec4 == false)
        {
            console.error("vec4.dot() was passed a non vec4.")
            return null;
        }

        return new vec4(this.z*vec.y + this.y*vec.z, this.z*vec.x - this.x*vec.z, -this.y*vec.x + this.x*vec.y);
        /*
        let x = -this.z*vec.y + this.y*vec.z;
        let y = this.z*vec.x - this.x*vec.z;
        let z = -this.y*vec.x + this.x*vec.y;
        return new vec4(x,y,z);*/
    }
    getFloat32Array()
    {
        return new Float32Array([this.x,this.y,this.z,this.a]);
    }
    copy()
    {
        return new vec4(this.x, this.y, this.z, this.a);
    }
    getLength()
    {
        return Math.sqrt(  this.x*this.x + this.y*this.y + this.z*this.z  );
    }
    getMagnitude() {
        return Math.sqrt(  this.x*this.x + this.y*this.y + this.z*this.z  + this.a * this.a);
    }
    getHash()
    {
        return this.x*1000000 + this.y*1000 + this.z;
    }
    scaleToUnit()
    {
        //divide each component by the length of the vector
        var L = this.getMagnitude();
        if (L == 0) { return this; } 
        this.x = this.x/L;
        this.y = this.y/L;
        this.z = this.z/L;
        this.a = this.a/L;
        return this;
    }
    round(val = 1)
    {   
        this.x = Math.round(this.x/val)*val;
        this.y = Math.round(this.y/val)*val;
        this.z = Math.round(this.z/val)*val;
        return this;
    }
    toString(roundToValue = 0.01)
    {
        var p = 3;
        var s = "< " + (Math.round(this.x/roundToValue)*roundToValue).toPrecision(p)+", "+ (Math.round(this.y/roundToValue)*roundToValue).toPrecision(p)+", "+ (Math.round(this.z/roundToValue)*roundToValue).toPrecision(p)+", "+ (Math.round(this.a/roundToValue)*roundToValue).toPrecision(p)+">";
        return s;
    }
    equals(otherVec4)
    {
        if (otherVec4 instanceof vec4 && otherVec4.x == this.x && otherVec4.y == this.y && otherVec4.z == this.z && otherVec4.a == this.a)
        {
            return true;
        }
        return false;
    }
    greaterThan(otherVec4)
    {
        return this.getHash() > otherVec4.getHash();
    }
    closeTo(vec, delta = 0.000001)
    {
        return ((Math.abs(this.x-vec.x) + Math.abs(this.y-vec.y) + Math.abs(this.z-vec.z)) < delta)
    }
}



function distanceBetweenPoints(v1,v2) //ONLY is for x y z NO a.
{
    return Math.sqrt(  Math.abs(Math.pow(v1.x-v2.x,2)) + Math.abs(Math.pow(v1.y-v2.y,2)) + Math.abs(Math.pow(v1.z-v2.z,2))  );
}
function vectorFromPointToPlane(planePoint, planeNormal, pointPosition, unitVecFromPoint)
{
    //u = x + (n dot (p-x))/(n dot v) * v

    //NOTE: this function is designed so you can "hit" plane from BOTH SIDES.
    //console.log("pointPosition: " + pointPosition.toString() + "\nunitVecFromPoint: "+unitVecFromPoint.toString()+"\nplaneNormal: "+planeNormal.toString()+"\nplanePoint: "+planePoint.toString());

    var denom = planeNormal.dot(unitVecFromPoint);
    if (denom > 0.000001)
    {
        var p0l0 = planePoint.sub(pointPosition);
        var t = ( p0l0.dot(planeNormal)) / denom;
        var p = pointPosition.add(  unitVecFromPoint.mul(t)  );
        p.a = 1;
        return p;
    } else {
        planeNormal.x = -planeNormal.x;
        planeNormal.y = -planeNormal.y;
        planeNormal.z = -planeNormal.z;
        var denom = planeNormal.dot(unitVecFromPoint);
        if (denom > 0.000001)
        {
            var p0l0 = planePoint.sub(pointPosition);
            var t = ( p0l0.dot(planeNormal)) / denom;
            var p = pointPosition.add(  unitVecFromPoint.mul(t)  );
            p.a = 1;
            return p;
        } else {
            return null;
        }
    }
}
function getRotationFromRotationMatrix(mat = new mat4().makeRotation()){ 
    //THis is used in FPC.js to calculate the rotation matrix
    let sy = Math.sqrt( mat.f32a[0]*mat.f32a[0] + mat.f32a[1]*mat.f32a[1]  );
    if (sy > 0.000001)
    {
        const z = Math.atan2( mat.f32a[6], mat.f32a[10] );
        const y = Math.atan2( -mat.f32a[2], sy );
        const x = Math.atan2( mat.f32a[1], mat.f32a[0] );
        return new vec4(x,y,z);
    }
    const z = Math.atan2( -mat.f32a[9], mat.f32a[5] );
    const y = Math.atan2( -mat.f32a[2], sy );
    const x = 0;
    return new vec4(x,y,z)
}
function distanceFromPointToRay(rayStart = new vec4(), rayDirection = new vec4(), point = new vec4())
{
    let t = (point.sub(rayStart)).dot(rayDirection) / rayDirection.dot(rayDirection);
    let p2 = rayStart.add(rayDirection.mul(t));
    return point.sub(p2).getMagnitude();
}
function closestPointOnRayToRay(constraintRayDirection, constraintRayStart, ray2Direction, ray2Start)
{
    // d = sqrt( ( )
    constraintRayDirection.scaleToUnit();
    ray2Direction.scaleToUnit();
    //constraintRayDirection = constraintRayDirection.copy().scaleToUnit();
    //ray2Direction = ray2Direction.copy().scaleToUnit();

    let t = -1;
    let dt = 1;
    let d = 0;
    let pd = 100000000;
    for (var i=0; i<30; i++)
    {
        d = distanceFromPointToRay(ray2Start, ray2Direction, constraintRayStart.add(constraintRayDirection.mul(t)));
        if (d < pd)
        {
            t += dt;
            pd = d;
        }  else {
            t -= dt;
            dt = dt/2;
            pd = d;
        }
    }

    dt = -1;
    pd = 100000000;
    for (var i=0; i<30; i++)
    {
        d = distanceFromPointToRay(ray2Start, ray2Direction, constraintRayStart.add(constraintRayDirection.mul(t)));
        if (d < pd)
        {
            t += dt;
            pd = d;
        }  else {
            t -= dt;
            dt = dt/2;
            pd = d;
        }
    }

    return constraintRayStart.add(constraintRayDirection.mul(t));
}
function distToClosestPointOnRayToRay(constraintRayDirection, constraintRayStart, ray2Direction, ray2Start)
{
    // d = sqrt( ( )
    constraintRayDirection.scaleToUnit();
    ray2Direction.scaleToUnit();
    //constraintRayDirection = constraintRayDirection.copy().scaleToUnit();
    //ray2Direction = ray2Direction.copy().scaleToUnit();

    let t = -1;
    let dt = 1;
    let d = 0;
    let pd = 100000000;
    for (var i=0; i<30; i++)
    {
        d = distanceFromPointToRay(ray2Start, ray2Direction, constraintRayStart.add(constraintRayDirection.mul(t)));
        if (d < pd)
        {
            t += dt;
            pd = d;
        }  else {
            t -= dt;
            dt = dt/2;
            pd = d;
        }
    }

    dt = -1;
    pd = 100000000;
    for (var i=0; i<30; i++)
    {
        d = distanceFromPointToRay(ray2Start, ray2Direction, constraintRayStart.add(constraintRayDirection.mul(t)));
        if (d < pd)
        {
            t += dt;
            pd = d;
        }  else {
            t -= dt;
            dt = dt/2;
            pd = d;
        }
    }

    return t;
}






function distToRayPlaneIntersection(planeNormal = new vec4(), planePoint = new vec4, rayD = new vec4(), rayP = new vec4())
{
    let denom = planeNormal.dot(rayD);

    if (denom > 0)
    {
        let t = (planePoint.sub(rayP)).dot(planeNormal) / denom;
        return t;
    }
    return NaN;
}
function pointLineSegmentIntersectsPlane(planeNormal = new vec4(), planePoint = new vec4(), linePoint1, linePoint2)
{
    let rayD = linePoint2.sub(linePoint1);
    let dist = rayD.getMagnitude();
    rayD.scaleToUnit();

    //now we have rayD and rayP=linePoint1
    let t = (planePoint.sub(linePoint1)).dot(planeNormal) / planeNormal.dot(rayD);
    if (!isNaN(t) && t >= 0 && t <= dist)
    {
        return linePoint1.add(rayD.mul(t));
    }
    return null;
}
function closeTo(n1=1, n2=10, delta = 0.000001)
{
    return (Math.abs(n1-n2) < delta);
}