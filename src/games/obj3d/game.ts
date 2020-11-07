namespace Obj3d {
    export class Game extends tge.Game {
        initGame() {
            let m = <Obj3d.Model>this.model;
            this.useract=[];
            tge.Emitter.fire("Obj3d.REDRAW");
        }

        restartGame() {
        }

        playUserAction(dt: number) {
            for(let i=0;i<this.useract.length;i++)
                this.doAction(this.useract[i]);
            this.useract=[];
        }

        playAutoAction(dt: number) {
        }

        playAiAction(dt: number) {
        }

        doAction(act: any) {
            let ag = act.split(":");
            let m = <Obj3d.Model>this.model;
            switch(ag[0]) {
                case "M":
                    tge.Emitter.fire("Obj3d.REDRAW");
                    break;
                default:
                    break;
            }
        }
    }
}
