namespace AscIIEditor {
    export enum GameState {
        Ok = 0,
        OverSelf ,
        OverBorder
    }

    export class Game extends tge.Game {
        initGame() {
            let m = <AscIIEditor.Model>this.model;
            tge.Emitter.fire("AscIIEditor.REDRAW_IMAGE");
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
            switch(ag[0]) {
                case "CHAR":
                    console.log("CHAR", ag);
                    break;
                case "COLOR":
                    console.log("COLOR", ag);
                    break;
                case "IMAGE":
                    console.log("IMAGE", ag);
                    break;
                default:
                    ;
            }
        }

        scheduleUpdate(dt: number) {
            super.scheduleUpdate(dt);
        }
    }
}
