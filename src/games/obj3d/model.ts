namespace Obj3d {
    export class Model extends tge.Model {
        rot_x: number = 30;
        rot_y: number = 30;
        rot_z: number = 0;
        rotQuat: tge3d.Quaternion;
        matRot: tge3d.Matrix4;

        constructor() {
            super();
            this.rotQuat= new tge3d.Quaternion();
            this.matRot= new tge3d.Matrix4();
        }

        onDrag(dx: number, dy: number, rotz: boolean) {
            if(rotz) {
                this.rot_z += dx;
            } else {
                this.rot_x = Math.max(Math.min(this.rot_x + dy, 90.0), -90.0);
                this.rot_y += dx;
                let qx = tge3d.Quaternion.axisAngle(tge3d.Vec3Right, this.rot_x);
                let qy = tge3d.Quaternion.axisAngle(tge3d.Vec3Up, this.rot_y);
                tge3d.Quaternion.multiply(qx, qy, this.rotQuat);
                tge3d.Quaternion.toMatrix4(this.rotQuat, this.matRot);
            }
        }
    }
}
