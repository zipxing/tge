import * as tge from "../../engine"

export class Model extends tge.Model {
    rot_x: number = 30;
    rot_y: number = 30;
    rot_z: number = 0;
    rotQuat: tge.Quaternion;
    matRot: tge.Matrix4;

    constructor() {
        super();
        this.rotQuat= new tge.Quaternion();
        this.matRot= new tge.Matrix4();
    }

    onDrag(dx: number, dy: number, rotz: boolean) {
        if(rotz) {
            this.rot_z += dx;
        } else {
            this.rot_x = Math.max(Math.min(this.rot_x + dy, 90.0), -90.0);
            this.rot_y += dx;
            tge.info("ONDRAG...", this.rot_x, this.rot_y, this.rot_z);
            let qx = tge.Quaternion.axisAngle(tge.Vec3Right, this.rot_x);
            let qy = tge.Quaternion.axisAngle(tge.Vec3Up, this.rot_y);
            tge.Quaternion.multiply(qx, qy, this.rotQuat);
            tge.Quaternion.toMatrix4(this.rotQuat, this.matRot);
        }
    }
}
