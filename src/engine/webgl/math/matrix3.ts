namespace tge3d {

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
}
