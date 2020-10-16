namespace City {
    export enum GameState {
        Normal = 0,
        MergeMovie,
        LevelUpMovie,
        DropMovie,
        NoMove
    }

    export const LEVELUP_STEP_TIME = 0.05;

    export class Game extends tge.Game {
        initGame() {
            let m = <City.Model>this.model;
            this.gamestate=GameState.Normal;
            this.useract=[];
            m.searchUnit();
            tge.log(tge.LogLevel.DEBUG, m.unit_map, m.units);
            tge.Emitter.fire("City.REDRAW_GRID");

            tge.Timer.register("merge", 0.3, ()=>{
                this.gamestate = GameState.LevelUpMovie;
                let lc = m.postMerge();
                tge.Emitter.fire("City.REDRAW_GRID");
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
                tge.Emitter.fire("City.REDRAW_GRID");
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
            let m = <City.Model>this.model;
        }

        playAiAction(dt: number) {
        }

        doAction(act: any) {
            let ag = act.split(":");
            let i=0, j=0;
            if(ag.length==3) {
                i = parseInt(ag[1]);
                j = parseInt(ag[2]);
            }
            let m = <City.Model>this.model;
            switch(ag[0]) {
                case "M":
                    let cid = i*City.WIDTH+j;
                    if(m.mergeCell(cid)) {
                        tge.Timer.fire("merge");
                        this.gamestate = GameState.MergeMovie;
                    } else {
                        if(!m.delCell(cid)) {
                            tge.Emitter.fire("City.REDRAW_GRID");
                        } else {
                            tge.Timer.fire("drop");
                            this.gamestate = GameState.DropMovie;
                        }
                    }
                    break;
                default:
                    break;
            }
        }
    }
}
