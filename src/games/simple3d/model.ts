import * as tge from "../../engine"

export class Model extends tge.Model {
    rot_x: number = 30;
    rot_y: number = 30;
    rot_z: number = 0;

    constructor() {
        super();
    }

    onDrag(dx: number, dy: number, rotz: boolean) {
        if(rotz) {
            this.rot_z += dx;
        } else {
            this.rot_x = Math.max(Math.min(this.rot_x + dy, 90.0), -90.0);
            this.rot_y += dx;
        }
    }
}
