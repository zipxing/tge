namespace City {
    export enum GameState {
        Normal = 0,
        MergeMovie,
        LevelUpMovie,
        DropMovie,
        NoMove
    }

    export class Game extends tge.Game {
        initGame() {
            let m = <City.Model>this.model;
            this.gamestate=GameState.Normal;
            this.useract=[];
            m.searchUnit();
            tge.log(tge.LogLevel.DEBUG, m.unit_map, m.units);
            tge.Emitter.fire("City.REDRAW_GRID");
            tge.Timer.register("merge", 1.0, ()=>{
                m.postMerge();
                tge.Emitter.fire("City.REDRAW_GRID");
                tge.Timer.fire("levelup", 0);
            });
            tge.Timer.register("levelup", 0.2, ()=>{
                m.drop();
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
                    if(m.merge(i*City.Model.cityw+j)) {
                        tge.Timer.fire("merge", 0);
                        this.gamestate = GameState.MergeMovie;
                    }
                    break;
                case 'W':
                    m.searchUnit();
                    break;

                default:
                    break;
            }
        }
    }
}
