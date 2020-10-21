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
            this.gamestate=GameState.Ready;
            this.useract=[];

            tge.Emitter.fire("Unblock.REDRAW_GRID");

            /*tge.Timer.register("merge", 0.3, ()=>{
                this.gamestate = GameState.LevelUpMovie;
                let lc = m.postMerge();
                tge.Emitter.fire("Unblock.REDRAW_GRID");
                tge.Timer.setTime("levelup", lc*LEVELUP_STEP_TIME);
                tge.Timer.fire("levelup");
            });

            tge.Timer.register("levelup", 0.2, ()=>{
                this.gamestate = GameState.DropMovie;
                m.drop();
                tge.Timer.fire("drop");
            });

            tge.Timer.register("drop", 0.3, ()=>{
                this.gamestate = GameState.Normal;
                m.searchUnit();
                tge.Emitter.fire("Unblock.REDRAW_GRID");
            });*/
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
                    break;
                case "S":
                    break;
                case "H":
                    break;
                default:
                    break;
            }
        }
    }
}
