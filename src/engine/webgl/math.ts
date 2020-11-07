namespace tge3d {

    export const Pi = 3.141592654;
    export const TwoPi = 6.283185307;
    export const HalfPi = 1.570796327;
    export const Epsilon = 0.000001;
    export const ZeroEpsilon = 32.0 * 1.175494351e-38; // Very small epsilon for checking against 0.0f

    export class MathUtils{
        constructor(){
        }

        static degToRad(degree:number){
            return degree * 0.017453293;
        }

        static radToDeg(rad:number){
            return rad * 57.29577951;
        }

        static clamp(f:number, min:number, max:number){
            if(f<min) f = min;
            else if(f>max) f = max;
            return f;
        }
    }

    export class Matrix4 {
        elements: Float32Array;

        constructor(){
            this.elements = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
        }

        /**
         * Set the identity matrix.
         */
        setIdentity(){
            let e = this.elements;
            e[0] = 1; e[4] = 0; e[8] = 0;  e[12] = 0;
            e[1] = 0; e[5] = 1; e[9] = 0;  e[13] = 0;
            e[2] = 0; e[6] = 0; e[10] = 1; e[14] = 0;
            e[3] = 0; e[7] = 0; e[11] = 0; e[15] = 1;
            return this;
        }

        /**
         * Copy matrix.
         */
        set(other: Matrix4){
            let src = other.elements;
            let dst = this.elements;
            if(src === dst){
                return this;
            }
            for(let i=0; i<16; i++){
                dst[i] = src[i];
            }
            return this;
        }

        /**
         * Multiply the matrix from the right.
         * @param {Matrix4} other The multiply matrix
         * @returns this
         */
        multiply(other: Matrix4){
            let i, e, a, b, ai0, ai1, ai2, ai3;

            // Calculate e = a * b
            e = this.elements;
            a = this.elements;
            b = other.elements;

            // If e equals b, copy b to temporary matrix.
            if (e === b) {
                b = new Float32Array(16);
                for (i = 0; i < 16; ++i) {
                    b[i] = e[i];
                }
            }

            for (i = 0; i < 4; i++) {
                ai0=a[i];  ai1=a[i+4];  ai2=a[i+8];  ai3=a[i+12];
                e[i]    = ai0 * b[0]  + ai1 * b[1]  + ai2 * b[2]  + ai3 * b[3];
                e[i+4]  = ai0 * b[4]  + ai1 * b[5]  + ai2 * b[6]  + ai3 * b[7];
                e[i+8]  = ai0 * b[8]  + ai1 * b[9]  + ai2 * b[10] + ai3 * b[11];
                e[i+12] = ai0 * b[12] + ai1 * b[13] + ai2 * b[14] + ai3 * b[15];
            }

            return this;
        }

        /**
         * Set the matrix for translation.
         */
        setTranslate(x: number, y: number, z: number){
            let e = this.elements;
            e[0] = 1; e[4] = 0; e[8] = 0;  e[12] = x;
            e[1] = 0; e[5] = 1; e[9] = 0;  e[13] = y;
            e[2] = 0; e[6] = 0; e[10] = 1; e[14] = z;
            e[3] = 0; e[7] = 0; e[11] = 0; e[15] = 1;
            return this;
        }

        /**
         * Multiply the matrix for translation from the right.
         */
        translate(x: number, y: number, z: number) {
            let e = this.elements;
            e[12] += e[0] * x + e[4] * y + e[8]  * z;
            e[13] += e[1] * x + e[5] * y + e[9]  * z;
            e[14] += e[2] * x + e[6] * y + e[10] * z;
            e[15] += e[3] * x + e[7] * y + e[11] * z;
            return this;
        };

        /**
         * Set the matrix for scaling.
         */
        setScale(sx: number, sy: number, sz: number){
            let e = this.elements;
            e[0] = sx; e[4] = 0;  e[8] = 0;   e[12] = 0;
            e[1] = 0;  e[5] = sy; e[9] = 0;   e[13] = 0;
            e[2] = 0;  e[6] = 0;  e[10] = sz; e[14] = 0;
            e[3] = 0;  e[7] = 0;  e[11] = 0;  e[15] = 1;
            return this;
        }

        /**
         * Multiply the matrix for scaling from the right.
         */
        scale(sx: number, sy: number, sz: number){
            let e = this.elements;
            e[0] *= sx; e[4] *= sy;  e[8] *= sz;
            e[1] *= sx; e[5] *= sy;  e[9] *= sz;
            e[2] *= sx; e[6] *= sy;  e[10] *= sz;
            e[3] *= sx; e[7] *= sy;  e[11] *= sz;
            return this;
        }

        /**
         * Set the matrix for rotation.
         * The vector of rotation axis may not be normalized.
         * @param angle The angle of rotation (degrees)
         * @param x The X coordinate of vector of rotation axis.
         * @param y The Y coordinate of vector of rotation axis.
         * @param z The Z coordinate of vector of rotation axis.
         */
        setRotate(angle: number, x: number, y: number, z: number){
            let e, s, c, len, rlen, nc, xy, yz, zx, xs, ys, zs;

            angle = Math.PI * angle / 180;
            e = this.elements;

            s = Math.sin(angle);
            c = Math.cos(angle);

            if (0 !== x && 0 === y && 0 === z) {
                // Rotation around X axis
                if (x < 0) {
                    s = -s;
                }
                e[0] = 1;  e[4] = 0;  e[ 8] = 0;  e[12] = 0;
                e[1] = 0;  e[5] = c;  e[ 9] =-s;  e[13] = 0;
                e[2] = 0;  e[6] = s;  e[10] = c;  e[14] = 0;
                e[3] = 0;  e[7] = 0;  e[11] = 0;  e[15] = 1;
            } else if (0 === x && 0 !== y && 0 === z) {
                // Rotation around Y axis
                if (y < 0) {
                    s = -s;
                }
                e[0] = c;  e[4] = 0;  e[ 8] = s;  e[12] = 0;
                e[1] = 0;  e[5] = 1;  e[ 9] = 0;  e[13] = 0;
                e[2] =-s;  e[6] = 0;  e[10] = c;  e[14] = 0;
                e[3] = 0;  e[7] = 0;  e[11] = 0;  e[15] = 1;
            } else if (0 === x && 0 === y && 0 !== z) {
                // Rotation around Z axis
                if (z < 0) {
                    s = -s;
                }
                e[0] = c;  e[4] =-s;  e[ 8] = 0;  e[12] = 0;
                e[1] = s;  e[5] = c;  e[ 9] = 0;  e[13] = 0;
                e[2] = 0;  e[6] = 0;  e[10] = 1;  e[14] = 0;
                e[3] = 0;  e[7] = 0;  e[11] = 0;  e[15] = 1;
            } else {
                // Rotation around another axis
                len = Math.sqrt(x*x + y*y + z*z);
                if (len !== 1) {
                    rlen = 1 / len;
                    x *= rlen;
                    y *= rlen;
                    z *= rlen;
                }
                nc = 1 - c;
                xy = x * y;
                yz = y * z;
                zx = z * x;
                xs = x * s;
                ys = y * s;
                zs = z * s;

                e[ 0] = x*x*nc +  c;
                e[ 1] = xy *nc + zs;
                e[ 2] = zx *nc - ys;
                e[ 3] = 0;

                e[ 4] = xy *nc - zs;
                e[ 5] = y*y*nc +  c;
                e[ 6] = yz *nc + xs;
                e[ 7] = 0;

                e[ 8] = zx *nc + ys;
                e[ 9] = yz *nc - xs;
                e[10] = z*z*nc +  c;
                e[11] = 0;

                e[12] = 0;
                e[13] = 0;
                e[14] = 0;
                e[15] = 1;
            }

            return this;
        }

        /**
         * Multiply the matrix for rotation from the right.
         * The vector of rotation axis may not be normalized.
         */
        rotate(angle: number, x: number, y: number, z: number){
            return this.multiply(new Matrix4().setRotate(angle, x, y, z));
        }

        /**
         * Set the viewing matrix.
         * @param eyeX, eyeY, eyeZ The position of the eye point.
         * @param centerX, centerY, centerZ The position of the reference point.
         * @param upX, upY, upZ The direction of the up vector.
         * @return this
         */
        setLookAt(eyeX: number, eyeY: number, eyeZ: number, 
            targetX: number, targetY: number, targetZ: number, 
            upX: number, upY: number, upZ: number) {
            // N = eye - target
            let nx, ny, nz;
            nx = eyeX - targetX;
            ny = eyeY - targetY;
            nz = eyeZ - targetZ;
            let rl = 1/Math.sqrt(nx*nx+ny*ny+nz*nz);
            nx *= rl;
            ny *= rl;
            nz *= rl;
            // U = UP cross N
            let ux, uy, uz;
            ux = upY * nz - upZ * ny;
            uy = upZ * nx - upX * nz;
            uz = upX * ny - upY * nx;
            rl = 1/Math.sqrt(ux*ux+uy*uy+uz*uz);
            ux *= rl;
            uy *= rl;
            uz *= rl;
            // V = N cross U
            let vx, vy, vz;
            vx = ny * uz - nz * uy;
            vy = nz * ux - nx * uz;
            vz = nx * uy - ny * ux;
            rl = 1/Math.sqrt(vx*vx+vy*vy+vz*vz);
            vx *= rl;
            vy *= rl;
            vz *= rl;

            let e = this.elements;
            e[0] = ux;
            e[1] = vx;
            e[2] = nx;
            e[3] = 0;

            e[4] = uy;
            e[5] = vy;
            e[6] = ny;
            e[7] = 0;

            e[8] = uz;
            e[9] = vz;
            e[10] = nz;
            e[11] = 0;

            e[12] = 0;
            e[13] = 0;
            e[14] = 0;
            e[15] = 1;

            return this.translate(-eyeX, -eyeY, -eyeZ);
        }

        setOrtho(left: number, right: number, bottom: number, 
            top: number, near: number, far: number) {
            if (left === right || bottom === top || near === far) {
                tge.log(tge.LogLevel.ERROR, "wrong param");
                return;
            }

            let rw = 1 / (right - left);
            let rh = 1 / (top - bottom);
            let rd = 1 / (far - near);

            let e = this.elements;

            e[0]  = 2 * rw;
            e[1]  = 0;
            e[2]  = 0;
            e[3]  = 0;

            e[4]  = 0;
            e[5]  = 2 * rh;
            e[6]  = 0;
            e[7]  = 0;

            e[8]  = 0;
            e[9]  = 0;
            e[10] = -2 * rd;
            e[11] = 0;

            e[12] = -(right + left) * rw;
            e[13] = -(top + bottom) * rh;
            e[14] = -(far + near) * rd;
            e[15] = 1;

            return this;
        }

        setFrustum(left: number, right: number, bottom: number, 
            top: number, near: number, far: number) {
            if (left === right || bottom === top || near === far) {
                tge.log(tge.LogLevel.ERROR, "wrong param");
                return;
            }
            if(near <= 0){
                tge.log(tge.LogLevel.ERROR, "wrong near");
                return;
            }
            if(far <= 0){
                tge.log(tge.LogLevel.ERROR, "wrong far");
                return;
            }

            let rw = 1 / (right - left);
            let rh = 1 / (top - bottom);
            let rd = 1 / (far - near);

            let e = this.elements;

            e[0]  = 2 * near * rw;
            e[1]  = 0;
            e[2]  = 0;
            e[3]  = 0;

            e[4]  = 0;
            e[5]  = 2 * near * rh;
            e[6]  = 0;
            e[7]  = 0;

            e[8]  = (right + left) * rw;
            e[9]  = (top + bottom) * rh;
            e[10] = -(far + near) * rd;
            e[11] = -1;

            e[12] = 0
            e[13] = 0
            e[14] = -2 * near * far * rd;
            e[15] = 0;

            return this;
        }

        setPerspective(fovy: number, aspect: number, near: number, far: number){
            if(near === far || aspect === 0 || near <= 0 || far <= 0){
                tge.log(tge.LogLevel.ERROR, "wrong param");
                return;
            }

            let radius = fovy * Math.PI / 180 / 2;
            let sin = Math.sin(radius);
            if(sin === 0){
                tge.log(tge.LogLevel.ERROR, "wrong param");
                return;
            }
            let cot = Math.cos(radius) / sin;
            let rd = 1 / (far - near);

            let e =  this.elements;
            e[0] = cot / aspect;
            e[1] = 0;
            e[2] = 0;
            e[3] = 0;

            e[4] = 0;
            e[5] = cot;
            e[6] = 0;
            e[7] = 0;

            e[8] = 0;
            e[9] = 0;
            e[10] = -(far + near) * rd;
            e[11] = -1;

            e[12] = 0;
            e[13] = 0;
            e[14] = -2 * near * far * rd;
            e[15] = 0;

            return this;
        }

        /**
     * Calculate the inverse matrix of source matrix, and set to this.
     * @param {Matrix4} source The source matrix.
     * @returns this
     */
        setInverseOf(source:Matrix4){
            let s = source.elements;
            let d = this.elements;
            let inv = new Float32Array(16);

            //使用标准伴随阵法计算逆矩阵：
            //标准伴随阵 = 方阵的代数余子式组成的矩阵的转置矩阵
            //逆矩阵 = 标准伴随阵/方阵的行列式

            //计算代数余子式并转置后放入inv矩阵中
            inv[0]  =   s[5]*s[10]*s[15] - s[5] *s[11]*s[14] - s[9] *s[6]*s[15]
                + s[9]*s[7] *s[14] + s[13]*s[6] *s[11] - s[13]*s[7]*s[10];
            inv[4]  = - s[4]*s[10]*s[15] + s[4] *s[11]*s[14] + s[8] *s[6]*s[15]
                - s[8]*s[7] *s[14] - s[12]*s[6] *s[11] + s[12]*s[7]*s[10];
            inv[8]  =   s[4]*s[9] *s[15] - s[4] *s[11]*s[13] - s[8] *s[5]*s[15]
                + s[8]*s[7] *s[13] + s[12]*s[5] *s[11] - s[12]*s[7]*s[9];
            inv[12] = - s[4]*s[9] *s[14] + s[4] *s[10]*s[13] + s[8] *s[5]*s[14]
                - s[8]*s[6] *s[13] - s[12]*s[5] *s[10] + s[12]*s[6]*s[9];

            inv[1]  = - s[1]*s[10]*s[15] + s[1] *s[11]*s[14] + s[9] *s[2]*s[15]
                - s[9]*s[3] *s[14] - s[13]*s[2] *s[11] + s[13]*s[3]*s[10];
            inv[5]  =   s[0]*s[10]*s[15] - s[0] *s[11]*s[14] - s[8] *s[2]*s[15]
                + s[8]*s[3] *s[14] + s[12]*s[2] *s[11] - s[12]*s[3]*s[10];
            inv[9]  = - s[0]*s[9] *s[15] + s[0] *s[11]*s[13] + s[8] *s[1]*s[15]
                - s[8]*s[3] *s[13] - s[12]*s[1] *s[11] + s[12]*s[3]*s[9];
            inv[13] =   s[0]*s[9] *s[14] - s[0] *s[10]*s[13] - s[8] *s[1]*s[14]
                + s[8]*s[2] *s[13] + s[12]*s[1] *s[10] - s[12]*s[2]*s[9];

            inv[2]  =   s[1]*s[6]*s[15] - s[1] *s[7]*s[14] - s[5] *s[2]*s[15]
                + s[5]*s[3]*s[14] + s[13]*s[2]*s[7]  - s[13]*s[3]*s[6];
            inv[6]  = - s[0]*s[6]*s[15] + s[0] *s[7]*s[14] + s[4] *s[2]*s[15]
                - s[4]*s[3]*s[14] - s[12]*s[2]*s[7]  + s[12]*s[3]*s[6];
            inv[10] =   s[0]*s[5]*s[15] - s[0] *s[7]*s[13] - s[4] *s[1]*s[15]
                + s[4]*s[3]*s[13] + s[12]*s[1]*s[7]  - s[12]*s[3]*s[5];
            inv[14] = - s[0]*s[5]*s[14] + s[0] *s[6]*s[13] + s[4] *s[1]*s[14]
                - s[4]*s[2]*s[13] - s[12]*s[1]*s[6]  + s[12]*s[2]*s[5];

            inv[3]  = - s[1]*s[6]*s[11] + s[1]*s[7]*s[10] + s[5]*s[2]*s[11]
                - s[5]*s[3]*s[10] - s[9]*s[2]*s[7]  + s[9]*s[3]*s[6];
            inv[7]  =   s[0]*s[6]*s[11] - s[0]*s[7]*s[10] - s[4]*s[2]*s[11]
                + s[4]*s[3]*s[10] + s[8]*s[2]*s[7]  - s[8]*s[3]*s[6];
            inv[11] = - s[0]*s[5]*s[11] + s[0]*s[7]*s[9]  + s[4]*s[1]*s[11]
                - s[4]*s[3]*s[9]  - s[8]*s[1]*s[7]  + s[8]*s[3]*s[5];
            inv[15] =   s[0]*s[5]*s[10] - s[0]*s[6]*s[9]  - s[4]*s[1]*s[10]
                + s[4]*s[2]*s[9]  + s[8]*s[1]*s[6]  - s[8]*s[2]*s[5];

            //计算行列式，选择方阵的第一列，对该列中的四个元素S[0],s[1],s[2],s[3]分别乘以对应的代数余子式，然后相加
            let det = s[0]*inv[0] + s[1]*inv[4] + s[2]*inv[8] + s[3]*inv[12];
            //注：选择任意一行，例如第一行，也是可以的
            //let det = s[0]*inv[0] + s[4]*inv[1] + s[8]*inv[2] + s[12]*inv[3];

            if(det===0){
                return this;
            }

            det = 1 / det;
            for(let i=0; i<16; ++i){
                d[i] = inv[i] * det;
            }

            return this;
        }

        /**
         * Transpose this matrix.
         * @returns this
         */
        transpose(){
            let e = this.elements;

            //转置4x4矩阵，分别交换 1,4; 2,8; 3,12; 6,9; 7,13; 11,14
            let t;
            t = e[1]; e[1] = e[4]; e[4] = t;
            t = e[2]; e[2] = e[8]; e[8] = t;
            t = e[3]; e[3] = e[12]; e[12] = t;
            t = e[6]; e[6] = e[9]; e[9] = t;        
            t = e[7]; e[7] = e[13]; e[13] = t;
            t = e[11]; e[11] = e[14]; e[14] = t;

            return this;
        }
    }

    export class Matrix3 {
        elements: Float32Array;

        constructor(){
            this.elements = new Float32Array([1,0,0, 0,1,0, 0,0,1]);
        }

        /**
         * Set the identity matrix.
         */
        setIdentity(){
            let e = this.elements;
            e[0] = 1; e[3] = 0; e[6] = 0;
            e[1] = 0; e[4] = 1; e[7] = 0;
            e[2] = 0; e[5] = 0; e[8] = 1;
            return this;
        }

        setValue(m0: number, m1: number, m2: number, 
            m3:number, m4:number, m5:number, 
            m6:number, m7:number, m8: number){
            let e = this.elements;
            e[0] = m0; e[3] = m3; e[6] = m6;
            e[1] = m1; e[4] = m4; e[7] = m7;
            e[2] = m2; e[5] = m5; e[8] = m8;
            return this;
        }

        /**
         * Copy matrix.
         */
        set(other:Matrix3){
            let src = other.elements;
            let dst = this.elements;
            if(src === dst){
                return this;
            }

            for(let i=0; i<9; i++){
                dst[i] = src[i];
            }

            return this;
        }

        /**
         * Set value from Matrix4
         * @param {Matrix4} mat4
         */
        setFromMatrix4(mat4:Matrix4){
            let src = mat4.elements;
            let e = this.elements;
            e[0] = src[0];  e[3] = src[4]; e[6] = src[8];
            e[1] = src[1];  e[4] = src[5]; e[7] = src[9];
            e[2] = src[2];  e[5] = src[6]; e[8] = src[10];
            return this;
        }

        /**
         * Multiply the matrix from the right.
         * @param {Matrix3} other The multiply matrix
         * @returns this
         */
        multiply(other:Matrix3){
            let i, e, a, b, ai0, ai1, ai2;

            // Calculate e = a * b
            e = this.elements;
            a = this.elements;
            b = other.elements;

            // If e equals b, copy b to temporary matrix.
            if (e === b) {
                b = new Float32Array(9);
                for (i = 0; i < 9; ++i) {
                    b[i] = e[i];
                }
            }

            for (i = 0; i < 3; i++) {
                ai0=a[i];  ai1=a[i+3];  ai2=a[i+6];
                e[i]    = ai0 * b[0]  + ai1 * b[1]  + ai2 * b[2];
                e[i+3]  = ai0 * b[3]  + ai1 * b[4]  + ai2 * b[5];
                e[i+6]  = ai0 * b[6]  + ai1 * b[7]  + ai2 * b[8];
            }

            return this;
        }


        /**
         * Set the Look at matrix.
         * 根据lookAt和up方向构建旋转矩阵。注意此矩阵不是camera的lookAt view matrix。
         * 它是一个UVN矩阵。而camera的lookAt矩阵是camera世界矩阵的逆矩阵。
         * @param eyeX, eyeY, eyeZ The position of the eye point.
         * @param targetX, targetY, targetZ The position of the target point.
         * @param upX, upY, upZ The direction of the up vector.
         * @return this
         */
        setLookAt(eyeX:number, eyeY:number, eyeZ:number, 
            targetX:number, targetY:number, targetZ:number, 
            upX:number, upY:number, upZ:number){
            // N = eye - target
            const eps = tge3d.ZeroEpsilon;
            let nx, ny, nz;
            let rl;
            nx = targetX - eyeX;
            ny = targetY - eyeY;
            nz = targetZ - eyeZ;
            let lenSqr = nx*nx+ny*ny+nz*nz;
            if(lenSqr < eps){
                // eye and target are in the same position
                nz = 1;
            } else {
                rl = 1/Math.sqrt(lenSqr);
                nx *= rl;
                ny *= rl;
                nz *= rl;
            }

            // U = UP cross N
            let ux, uy, uz;
            ux = upY * nz - upZ * ny;
            uy = upZ * nx - upX * nz;
            uz = upX * ny - upY * nx;
            lenSqr = ux*ux+uy*uy+uz*uz;
            if(lenSqr < eps){
                // UP and N are parallel
                if(Math.abs(upZ)===1){
                    nx += 0.0001;
                } else {
                    nz += 0.0001;
                }
                rl = 1/Math.sqrt(nx*nx+ny*ny+nz*nz);
                nx *= rl;
                ny *= rl;
                nz *= rl;

                ux = upY * nz - upZ * ny;
                uy = upZ * nx - upX * nz;
                uz = upX * ny - upY * nx;
                lenSqr = ux*ux+uy*uy+uz*uz;
            }

            rl = 1/Math.sqrt(lenSqr);
            ux *= rl;
            uy *= rl;
            uz *= rl;


            // V = N cross U
            let vx, vy, vz;
            vx = ny * uz - nz * uy;
            vy = nz * ux - nx * uz;
            vz = nx * uy - ny * ux;
            rl = 1/Math.sqrt(vx*vx+vy*vy+vz*vz);
            vx *= rl;
            vy *= rl;
            vz *= rl;

            let e = this.elements;
            e[0] = ux;
            e[1] = uy;
            e[2] = uz;

            e[3] = vx;
            e[4] = vy;
            e[5] = vz;

            e[6] = nx;
            e[7] = ny;
            e[8] = nz;
        }



        /**
         * Calculate the inverse matrix of source matrix, and set to this.
         * @param {Matrix3} source The source matrix.
         * @returns this
         */
        setInverseOf(source: Matrix3){
            let s = source.elements;
            let d = this.elements;
            let inv = new Float32Array(9);

            //使用标准伴随阵法计算逆矩阵：
            //标准伴随阵 = 方阵的代数余子式组成的矩阵的转置矩阵
            //逆矩阵 = 标准伴随阵/方阵的行列式

            //计算代数余子式并转置后放入inv矩阵中（先计算第一列的代数余子式，因为计算det要用）
            inv[0] = s[4]*s[8] - s[5]*s[7];
            inv[3] = -(s[3]*s[8] - s[5]*s[6]);
            inv[6] = s[3]*s[7] - s[4]*s[6];

            //计算行列式，选择方阵的第一列，对该列中的三个元素S[0],s[1],s[2]分别乘以对应的代数余子式，然后相加
            let det = s[0]*inv[0] + s[1]*inv[3] + s[2]*inv[6];
            //注：选择任意一行，例如第一行，也是可以的

            if(det===0){
                return this;
            }

            //继续计算其他列的代数余子式
            inv[1] = -(s[1]*s[8] - s[2]*s[7]);
            inv[4] = s[0]*s[8] - s[2]*s[6];
            inv[7] = -(s[0]*s[7] - s[1]*s[6]);

            inv[2] = s[1]*s[5] - s[2]*s[4];
            inv[5] = -(s[0]*s[5] - s[2]*s[3]);
            inv[8] = s[0]*s[4] - s[1]*s[3];


            det = 1 / det;
            for(let i=0; i<9; ++i){
                d[i] = inv[i] * det;
            }

            return this;
        }

        /**
         * Invert this matrix
         * @returns this
         */
        invert(){
            return this.setInverseOf(this);
        }

        /**
         * Transpose this matrix.
         * @returns this
         */
        transpose(){
            let e = this.elements;

            //转置3x3矩阵，分别交换 1,3; 2,6; 5,7
            let t;
            t = e[1]; e[1] = e[3]; e[3] = t;
            t = e[2]; e[2] = e[6]; e[6] = t;
            t = e[5]; e[5] = e[7]; e[7] = t;

            return this;
        }

        static multiply(m1:Matrix3,m2:Matrix3,dst:Matrix3){
            let i, e, a, b, ai0, ai1, ai2;

            // Calculate e = a * b
            e = dst.elements;
            a = m1.elements;
            b = m2.elements;

            // If e equals b, copy b to temporary matrix.
            if (e === b) {
                b = new Float32Array(9);
                for (i = 0; i < 9; ++i) {
                    b[i] = e[i];
                }
            }

            for (i = 0; i < 3; i++) {
                ai0=a[i];  ai1=a[i+3];  ai2=a[i+6];
                e[i]    = ai0 * b[0]  + ai1 * b[1]  + ai2 * b[2];
                e[i+3]  = ai0 * b[3]  + ai1 * b[4]  + ai2 * b[5];
                e[i+6]  = ai0 * b[6]  + ai1 * b[7]  + ai2 * b[8];
            }

            return dst;
        }
    }

    export class Vector3{
        x: number;
        y: number;
        z: number;
        w: number = 0;

        constructor(x=0,y=0,z=0){
            this.x = x;
            this.y = y;
            this.z = z;
        }

        clone(){
            return new Vector3(this.x, this.y, this.z);
        }

        set(x: number,y: number,z: number){
            this.x = x;
            this.y = y;
            this.z = z;
            return this;
        }

        length(){
            return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z);
        }

        lengthSquare(){
            return this.x*this.x+this.y*this.y+this.z*this.z;
        }

        equals(rhs:Vector3){
            let eps = tge3d.Epsilon;
            return (this.x > rhs.x - eps && this.x < rhs.x + eps &&
                this.y > rhs.y - eps && this.y < rhs.y + eps &&
                this.z > rhs.z - eps && this.z < rhs.z + eps);
        }

        copyFrom(rhs:Vector3){
            this.x = rhs.x;
            this.y = rhs.y;
            this.z = rhs.z;
            return this;
        }

        negative(){
            this.x = -this.x;
            this.y = -this.y;
            this.z = -this.z;
            return this;
        }

        add(rhs:Vector3){
            this.x += rhs.x;
            this.y += rhs.y;
            this.z += rhs.z;
            return this;
        }

        sub(rhs:Vector3){
            this.x -= rhs.x;
            this.y -= rhs.y;
            this.z -= rhs.z;
            return this;
        }

        multiply(rhs:Vector3){
            this.x *= rhs.x;
            this.y *= rhs.y;
            this.z *= rhs.z;
            return this;
        }

        scale(s:number){
            this.x *= s;
            this.y *= s;
            this.z *= s;
            return this;
        }

        normalize(){
            let lensq =this.x*this.x+this.y*this.y+this.z*this.z;
            if(lensq > 0){
                let g = 1/Math.sqrt(lensq);
                this.x *= g;
                this.y *= g;
                this.z *= g;
            }

            return this;
        }

        static copyTo(src:Vector3, dst:Vector3){
            dst.x = src.x;
            dst.y = src.y;
            dst.z = src.z;
            return dst;
        }

        static negativeTo(src:Vector3, dst:Vector3){
            dst.x = -src.x;
            dst.y = -src.y;
            dst.z = -src.z;
            return dst;
        }

        static add(a:Vector3, b:Vector3, dst:Vector3){
            dst.x = a.x + b.x;
            dst.y = a.y + b.y;
            dst.z = a.z + b.z;
            return dst;
        }

        static sub(a:Vector3, b:Vector3, dst:Vector3){
            dst.x = a.x - b.x;
            dst.y = a.y - b.y;
            dst.z = a.z - b.z;
            return dst;
        }

        static multiply(a:Vector3, b:Vector3, dst:Vector3){
            dst.x = a.x * b.x;
            dst.y = a.y * b.y;
            dst.z = a.z * b.z;
            return dst;
        }

        static scaleTo(a:Vector3, s:number, dst:Vector3){
            dst.x = a.x * s;
            dst.y = a.y * s;
            dst.z = a.z * s;
            return dst;
        }

        static dot(a:Vector3, b:Vector3){
            return a.x * b.x + a.y * b.y + a.z * b.z;
        }

        static cross(a:Vector3, b:Vector3, dst:Vector3){
            dst.x = a.y * b.z - a.z * b.y;
            dst.y = a.z * b.x - a.x * b.z;
            dst.z = a.x * b.y - a.y * b.x;
            return dst;
        }

        static lerp(a:Vector3, b:Vector3, f:number, dst:Vector3){
            dst.x = a.x + (b.x-a.x)*f;
            dst.y = a.y + (b.y-a.y)*f;
            dst.z = a.z + (b.z-a.z)*f;
            return dst;
        }

        static distance(a:Vector3, b:Vector3){
            let dx = a.x - b.x;
            let dy = a.y - b.y;
            let dz = a.z - b.z;
            return Math.sqrt(dx*dx+dy*dy+dz*dz);
        }

        static distanceSquare(a:Vector3,b:Vector3){
            let dx = a.x - b.x;
            let dy = a.y - b.y;
            let dz = a.z - b.z;
            return dx*dx+dy*dy+dz*dz;
        }
    }

    export class Quaternion {
        x: number;
        y: number;
        z: number;
        w: number;

        constructor(x = 0, y = 0, z = 0, w = 1) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
        }

        /**
         * Return a clone of this quaternion.
         */
        clone() {
            return new Quaternion(this.x, this.y, this.z, this.w);
        }

        /**
         * Set the x,y,z,w of this quaternion.
         * @param {Number} x
         * @param {Number} y
         * @param {Number} z
         * @param {Number} w
         */
        set(x:number, y:number, z:number, w:number) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
            return this;
        }

        /**
         * Copy the x,y,z,w from rhs to this quaternion.
         * @param {Quaternion} rhs
         */
        copyFrom(rhs: Quaternion) {
            this.x = rhs.x;
            this.y = rhs.y;
            this.z = rhs.z;
            this.w = rhs.w;
            return this;
        }

        /**
         * Make this quaternion identity.
         */
        identity() {
            this.x = 0.0;
            this.y = 0.0;
            this.z = 0.0;
            this.w = 1.0;
            return this;
        }

        /**
         * Check if the quaternion rhs is equal to this quaternion.
         * @param {Quaternion} rhs
         */
        equals(rhs: Quaternion) {
            let eps = tge3d.Epsilon;
            return (this.x > rhs.x - eps && this.x < rhs.x + eps &&
                this.y > rhs.y - eps && this.y < rhs.y + eps &&
                this.z > rhs.z - eps && this.z < rhs.z + eps &&
                this.w > rhs.w - eps && this.w < rhs.w + eps);
        }

        setFromAxisAngle(axis: Vector3, angle: number) {
            let halfAngle = MathUtils.degToRad(angle * 0.5);
            let s = Math.sin(halfAngle);
            return this.set(s * axis.x, s * axis.y, s * axis.z, Math.cos(halfAngle));
        }

        /**
         * Sets the euler angle representation of the rotation.
         * @param {Vector3} eulerAngles order is ZXY
         */
        setFromEulerAngles(eulerAngles:Vector3) {
            let ex = MathUtils.degToRad(eulerAngles.x * 0.5);
            let ey = MathUtils.degToRad(eulerAngles.y * 0.5);
            let ez = MathUtils.degToRad(eulerAngles.z * 0.5);

            let cx = Math.cos(ex);
            let sx = Math.sin(ex);
            let cy = Math.cos(ey);
            let sy = Math.sin(ey);
            let cz = Math.cos(ez);
            let sz = Math.sin(ez);

            let qx = new Quaternion(sx, 0.0, 0.0, cx);
            let qy = new Quaternion(0.0, sy, 0.0, cy);
            let qz = new Quaternion(0.0, 0.0, sz, cz);

            // q = (qy * qx) * qz
            Quaternion.multiply(qy, qx, this);
            Quaternion.multiply(this, qz, this);
            return this;
        }

        /**
         * Set the quaternion from a 3X3 rotation matrix.
         * @param {Matrix3} matrix3
         */
        setFromRotationMatrix(matrix3: Matrix3) {
            let e = matrix3.elements;
            let m00 = e[0]; let m01 = e[3]; let m02 = e[6];
            let m10 = e[1]; let m11 = e[4]; let m12 = e[7];
            let m20 = e[2]; let m21 = e[5]; let m22 = e[8];

            let trace = m00 + m11 + m22;
            if (trace > 0) {
                let s = 0.5 / Math.sqrt(trace + 1.0);

                this.w = 0.25 / s;
                this.x = (m21 - m12) * s;
                this.y = (m02 - m20) * s;
                this.z = (m10 - m01) * s;

            } else if ((m00 > m11) && (m00 > m22)) {
                let s = 2.0 * Math.sqrt(1.0 + m00 - m11 - m22);

                this.w = (m21 - m12) / s;
                this.x = 0.25 * s;
                this.y = (m01 + m10) / s;
                this.z = (m02 + m20) / s;

            } else if (m11 > m22) {
                let s = 2.0 * Math.sqrt(1.0 + m11 - m00 - m22);

                this.w = (m02 - m20) / s;
                this.x = (m01 + m10) / s;
                this.y = 0.25 * s;
                this.z = (m12 + m21) / s;

            } else {
                let s = 2.0 * Math.sqrt(1.0 + m22 - m00 - m11);

                this.w = (m10 - m01) / s;
                this.x = (m02 + m20) / s;
                this.y = (m12 + m21) / s;
                this.z = 0.25 * s;
            }

            return this;
        }

        /**
         * Create a rotation which rotates from fromDir to toDir.
         * @param {Vector3} fromDir
         * @param {Vector3} toDir
         */
        setFromToRotation(fromDir:Vector3, toDir:Vector3) {

        }

        /**
         * Create a rotation which looks in forward and the up direction is upwards.
         * @param {Vector3} eye The eye position.
         * @param {Vector3} target The target position to look in.
         * @param {Vector3} upwards The up direction.
         */
        setLookRotation(eye:Vector3, target:Vector3, upwards:Vector3) {
            let _tmpMatrix3 = new Matrix3();
            _tmpMatrix3.setLookAt(eye.x, eye.y, eye.z, target.x, target.y, target.z, upwards.x, upwards.y, upwards.z);
            this.setFromRotationMatrix(_tmpMatrix3);
            this.normalize();
        }

        /**
         * Normalize this quaternion.
         */
        normalize() {
            let mag = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
            if (mag > 0.0) {
                let g = 1.0 / mag;
                this.x *= g;
                this.y *= g;
                this.z *= g;
                this.w *= g;
            } else {
                this.identity();
            }
            return this;
        }

        /**
         * Converts a rotation to angle-axis representation. (angeles in degrees)
         * @returns { angle:Number, axis:[x,y,z]}
         */
        toAngleAxis() {

        }

        invert(){
            this.x *=-1;
            this.y *=-1;
            this.z *=-1;
        }

        setInverseOf(source:Quaternion){
            this.x = -source.x;
            this.y = -source.y;
            this.z = -source.z;
            this.w = source.w;
        }

        /**
         * Create a rotation which rotates angle degrees around axis.
         * @param {Vector3} axis The rotation axis.
         * @param {Number} angle Rotation angle in degrees.
         * @returns {Quaternion} The rotation quaternion.
         */
        static axisAngle(axis:Vector3, angle:number) {
            let halfAngle = MathUtils.degToRad(angle * 0.5);
            let s = Math.sin(halfAngle);
            return new Quaternion(s * axis.x, s * axis.y, s * axis.z, Math.cos(halfAngle));
        }

        /**
         * Returns a rotation that rotates z degrees around the z axis,
         * x degrees around the x axis, and y degrees around the y axis; applied in that order.
         * @param {Number} x
         * @param {Number} y
         * @param {Number} z
         * @returns {Quaternion} The rotation quaternion.
         */
        static euler(x:number, y:number, z:number) {
            let ex = MathUtils.degToRad(x * 0.5);
            let ey = MathUtils.degToRad(y * 0.5);
            let ez = MathUtils.degToRad(z * 0.5);

            let cx = Math.cos(ex);
            let sx = Math.sin(ex);
            let cy = Math.cos(ey);
            let sy = Math.sin(ey);
            let cz = Math.cos(ez);
            let sz = Math.sin(ez);

            let qx = new Quaternion(sx, 0.0, 0.0, cx);
            let qy = new Quaternion(0.0, sy, 0.0, cy);
            let qz = new Quaternion(0.0, 0.0, sz, cz);

            // q = (qy * qx) * qz
            let q = new Quaternion();
            Quaternion.multiply(qy, qx, q);
            Quaternion.multiply(q, qz, q);
            return q;
        }

        /**
         * Create a rotation which rotates from fromDir to toDir.
         * @param {Vector3} fromDir
         * @param {Vector3} toDir
         * @returns {Quaternion} The rotation quaternion.
         */
        static fromToRotation(fromDir:Vector3, toDir:Vector3) {

        }

        /**
         * Create a rotation which looks in forward and the up direction is upwards.
         * @param {Vector3} forward The direction to look in.
         * @param {Vector3} upwards The up direction.
         * @returns {Quaternion} The rotation quaternion.
         *  Returns identity if forward or upwards magnitude is zero or forward and upwards are colinear.
         */
        static lookRotation(forward:Vector3, upwards:Vector3) {

        }

        /**
         * Rotates a rotation from towards to.
         * The from quaternion is rotated towards to by an angular step of maxDegreesDelta.
         * Negative values of maxDegreesDelta will move away from to until the rotation is exactlly the opposite direction.
         * @param {Quaternion} from
         * @param {Quaternion} to
         * @param {Number} maxDegreesDelta
         * @returns The rotatoin quaternion.
         */
        static rotateTowards(from:Quaternion, to:Quaternion, maxDegreesDelta:number) {

        }

        /**
         * Returns the conjugate of q.
         * @param {Quaternion} q
         */
        static conjugate(q:Quaternion) {
            return new Quaternion(-q.x, -q.y, -q.z, q.w);
        }

        /**
         * Returns the inverse of q.
         * @param {Quaternion} q
         */
        static inverse(q:Quaternion) {
            return Quaternion.conjugate(q);
        }

        /**
         * Returns the angle in degrees between two quaternion qa & qb.
         * @param {Quaternion} qa
         * @param {Quaternion} ab
         * @returns {Number} The angle in degrees.
         */
        static angleBetween(qa:Quaternion, ab:Quaternion) {

        }

        /**
         * The dot product between two quaternions.
         * @param {Quaternion} qa
         * @param {Quaternion} qb
         * @returns {Number} The dot product.
         */
        static dot(qa:Quaternion, qb:Quaternion) {
            return qa.x * qb.x + qa.y * qb.y + qa.z * qb.z + qa.w * qb.w;
        }

        /**
         * Multiply the quaternion qa and qb.
         * @param {Quaternion} qa
         * @param {Quaternion} qb
         * @param {Quaternion} dst The result set to dst.
         */
        static multiply(qa:Quaternion, qb:Quaternion, dst:Quaternion) {
            dst.set(
                qa.w * qb.x + qa.x * qb.w + qa.y * qb.z - qa.z * qb.y,
                qa.w * qb.y + qa.y * qb.w + qa.z * qb.x - qa.x * qb.z,
                qa.w * qb.z + qa.z * qb.w + qa.x * qb.y - qa.y * qb.x,
                qa.w * qb.w - qa.x * qb.x - qa.y * qb.y - qa.z * qb.z
            );
        }

        /**
         * Rotate the vector by quaternion.
         * @param {Quaternion} q
         * @param {Vector3} v
         * @param {Vector3} dst
         */
        static rotateVector(q:Quaternion, v:Vector3, dst:Vector3) {
            // dst = q * v * inv_q

            // t = q * v
            let tx = q.w * v.x + q.y * v.z - q.z * v.y;
            let ty = q.w * v.y + q.z * v.x - q.x * v.z;
            let tz = q.w * v.z + q.x * v.y - q.y * v.x;
            let tw = -q.x * v.x - q.y * v.y - q.z * v.z;

            //  dst = t * inv_q
            dst.x = tw * -q.x + tx * q.w + ty * -q.z - tz * -q.y;
            dst.y = tw * -q.y + ty * q.w + tz * -q.x - tx * -q.z;
            dst.z = tw * -q.z + tz * q.w + tx * -q.y - ty * -q.x;
            return dst;
        }

        /**
         * Convert quaternion to rotatoin matrix.
         * @param {Matrix4} matrix The rotation matrix.
         */
        static toMatrix4(q:Quaternion, matrix:Matrix4) {
            let x = q.x * 2.0;
            let y = q.y * 2.0;
            let z = q.z * 2.0;
            let xx = q.x * x;
            let yy = q.y * y;
            let zz = q.z * z;
            let xy = q.x * y;
            let xz = q.x * z;
            let yz = q.y * z;
            let wx = q.w * x;
            let wy = q.w * y;
            let wz = q.w * z;

            let e = matrix.elements;
            e[0] = 1.0 - (yy + zz);
            e[1] = xy + wz;
            e[2] = xz - wy;
            e[3] = 0.0;

            e[4] = xy - wz;
            e[5] = 1.0 - (xx + zz);
            e[6] = yz + wx;
            e[7] = 0.0;

            e[8] = xz + wy;
            e[9] = yz - wx;
            e[10] = 1.0 - (xx + yy);
            e[11] = 0.0;

            e[12] = 0.0;
            e[13] = 0.0;
            e[14] = 0.0;
            e[15] = 1.0;
        }

        /**
         * Interpolates between qa and qb by t and normalizes the result afterwards.
         * This is faster then slerp but looks worse if the rotations are far apart.
         * @param {Quaternion} qa
         * @param {Quaternion} qb
         * @param {Number} t The interpolation factor.
         * @returns The result quaternion.
         */
        static lerp(qa:Quaternion, qb:Quaternion, t:number) {
            let result = new Quaternion();
            // If dot < 0, qa and qb are more than 360 degrees apart.
            // The quaternions are 720 degrees of freedom, so negative all components when lerping.
            if (Quaternion.dot(qa, qb) < 0) {
                result.set(qa.x + t * (-qb.x - qa.x),
                    qa.y + t * (-qb.y - qa.y),
                    qa.z + t * (-qb.z - qa.z),
                    qa.w + t * (-qb.w - qa.w));
            } else {
                result.set(qa.x + t * (qb.x - qa.x),
                    qa.y + t * (qb.y - qa.y),
                    qa.z + t * (qb.z - qa.z),
                    qa.w + t * (qb.w - qa.w));
            }
            return result;
        }

        /**
         * Spherically interpolates between qa and qb by t.
         * Use this to create a rotation which smoothly interpolates between qa to qb.
         * If the value of t is close to 0, the output will be close to qa, if it is close to 1, the output will be close to qb.
         * @param {Quaternion} qa
         * @param {Quaternion} qb
         * @param {Number} t The interpolation factor.
         * @returns The result quaternion.
         */
        static slerp(qa:Quaternion, qb:Quaternion, t:number) {
            let dot = Quaternion.dot(qa, qb);
            let result = new Quaternion();

            if (dot < 0.0) {
                dot = -dot;
                result.set(-qb.x, -qb.y, -qb.z, -qb.w);
            } else {
                result.copyFrom(qb);
            }

            let scale0 = 0;
            let scale1 = 0;

            if (dot < 0.95) {
                let angle = Math.acos(dot);
                let sin_div = 1.0 / Math.sin(angle);
                scale1 = Math.sin(angle * t) * sin_div;
                scale0 = Math.sin(angle * (1.0 - t)) * sin_div;
            } else {
                scale0 = 1.0 - t;
                scale1 = t;
            }

            result.set(qa.x * scale0 + result.x * scale1,
                qa.y * scale0 + result.y * scale1,
                qa.z * scale0 + result.z * scale1,
                qa.w * scale0 + result.w * scale1);
            return result;
        }

    }
    export let Vec3Right = new Vector3(1, 0, 0);
    export let Vec3Up = new Vector3(0, 1, 0);
}
