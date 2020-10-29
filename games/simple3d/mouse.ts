namespace Simple3d {
    export class MouseHandler {
        mouse_pressed: boolean = false;
        lastx: number = -1;
        lasty: number = -1;
        rotate_z: boolean = false;

        constructor() {
        }

        mouseDown(event: any) {
            let x = event.clientX;
            let y = event.clientY;
            let rect = event.target.getBoundingClientRect();
            if(x>=rect.left && x<rect.right && y>=rect.top && y<rect.bottom){
                this.lastx = x;
                this.lasty = y;
                this.mouse_pressed = true;
                this.rotate_z = event.ctrlKey;
            }
        }

        mouseUp(event: any) {
            this.mouse_pressed = false;
        }

        mouseMove(event: any) {
            if(!WebGlRender.game) return;
            let g = WebGlRender.game;
            let m = <Simple3d.Model>g.model;
            let x = event.clientX;
            let y = event.clientY;
            let canvas = (<tge.WebRun>tge.env).canvas;
            if(this.mouse_pressed){
                let factor = 300/canvas.height;
                let dx = factor * (x-this.lastx);
                let dy = factor * (y-this.lasty);
                m.onDrag(dx, dy, this.rotate_z);
                g.useract.splice(0, 0, `M:${dx}:${dy}:${this.rotate_z}`);
            }
            this.lastx = x;
            this.lasty = y;
        }
    }
}
