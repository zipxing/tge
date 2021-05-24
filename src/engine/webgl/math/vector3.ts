import * as math from "./math"

export class Vector3{
    x: number;
    y: number;
    z: number;
    w: number = 0;

    constructor(x=0,y=0,z=0) {
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
        let eps = math.Epsilon;
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

export const Vec3Right = new Vector3(1, 0, 0);
export const Vec3Up = new Vector3(0, 1, 0);
