namespace City {
    export enum GameState {
        Normal = 0,
        MergeMovie,
        LevelUpMovie,
        DropMovie,
        NoMove
    }

    export class Game extends tge.Game {
        readyDel:number = -1;

        initGame() {
            let m = <City.Model>this.model;
            this.gamestate=GameState.Normal;
            this.useract=[];
            m.searchUnit();
            tge.log(tge.LogLevel.DEBUG, m.unit_map, m.units);
            tge.Emitter.fire("City.REDRAW_GRID");
            tge.Timer.register("merge", 0.3, ()=>{
                m.postMerge();
                tge.Emitter.fire("City.REDRAW_GRID");
                tge.Timer.fire("levelup");
                this.gamestate = GameState.LevelUpMovie;
            });
            tge.Timer.register("levelup", 0.2, ()=>{
                m.drop();
                tge.Timer.fire("drop");
                this.gamestate = GameState.DropMovie;
            });
            tge.Timer.register("drop", 0.4, ()=>{
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
                    let cid = i*City.Model.cityw+j;
                    if(m.mergeCell(cid)) {
                        tge.Timer.fire("merge");
                        this.gamestate = GameState.MergeMovie;
                    } else {
                        let dcid = m.delCell(cid);
                        if(dcid!=-1) {
                            if(this.readyDel != dcid) {
                                if(this.readyDel!=-1) {
                                    let [x, y] = m.getxyById(this.readyDel);
                                    let c = m.grid[y][x];
                                    c.color-=100;
                                }
                                this.readyDel = dcid;
                            }
                            tge.Emitter.fire("City.REDRAW_GRID");
                        } else {
                            this.readyDel = -1;
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
