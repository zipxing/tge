namespace Unblock {
    export enum GameState {
        Playing = 0,
        Win = 1,
        Ready = 2
    }

    //export const LEVELUP_STEP_TIME = 0.05;

    export class Game extends tge.Game {
        initGame() {
            let m = <Unblock.Model>this.model;
            this.gamestate=GameState.Playing;
            this.useract=[];

            tge.Emitter.fire("Unblock.RESET_GRID");

            tge.Timer.register("success", 3.0, ()=>{
                m.reset();
                tge.Emitter.fire("Unblock.RESET_GRID");
                this.gamestate = GameState.Playing;
            });
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
            let i=0, j=0;
            if(ag.length==2) {
                i = parseInt(ag[1]);
                j = parseInt(ag[2]);
            }
            let m = <Unblock.Model>this.model;
            switch(ag[0]) {
                case "M":
                    tge.Emitter.fire("Unblock.REDRAW_GRID");
                    break;
                case "S":
                    tge.Emitter.fire("Unblock.REDRAW_GRID");
                    break;
                case "H":
                    tge.Emitter.fire("Unblock.REDRAW_GRID");
                    if(ag[1]=='true') {
                        this.gamestate = GameState.Win;
                        tge.Timer.fire('success', 0);
                    }
                    break;
                default:
                    break;
            }
        }
    }
}
