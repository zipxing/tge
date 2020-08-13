namespace Snake {
    export enum GameState {
        Ok = 0,
        OverSelf ,
        OverBorder
    }

    export class Game extends tge.Game {
        initGame() {
            let m = <Snake.Model>this.model;
            m.body[0] = {x:Model.snakew/2, y:Model.snakeh/2};
            m.body.length=1;
            m.seed = {
                x:Math.floor(Math.random()*Model.snakew), 
                y:Math.floor(Math.random()*Model.snakeh)
            };
            m.makeGrid();
            m.dir='D';
            this.gameover=GameState.Ok;
            tge.Emitter.fire("Snake.REDRAW_GRID");
            tge.Emitter.fire("Snake.REDRAW_MSG");
        }

        restartGame() {
        }

        playUserAction(dt: number) {
            for(let i=0;i<this.useract.length;i++)
                this.doAction(this.useract[i]);
            this.useract=[];
        }

        playAutoAction(dt: number) {
            let m = <Snake.Model>this.model;
            if(this.timeout_auto>400.0) {
                this.doAction(m.dir);
            } else {
                this.timeout_auto+=dt;
            }
        }

        playAiAction(dt: number) {
        }

        doAction(act: any) {
            let m = <Snake.Model>this.model;
            if(this.gameover!=GameState.Ok) {
                if(act=='R')
                    this.initGame();
                return;
            }
            let dx, dy, cx, cy: number;
            switch(act) {
                case 'W':
                    if(m.dir=='S') return;
                    dx=0,dy=-1;
                    break;
                case 'S':
                    if(m.dir=='W') return;
                    dx=0,dy=1;
                    break;
                case 'A':
                    if(m.dir=='D') return;
                    dx=-1,dy=0;
                    break;
                case 'D':
                    if(m.dir=='A') return;
                    dx=1,dy=0;
                    break;
                default:
                    dx=0,dy=0;
                    console.log('error act!');
            }
            cx = m.body[0].x+dx;
            cy = m.body[0].y+dy;
            if(cx>=Model.snakew || cy>=Model.snakeh || cx<0 || cy<0) {
                this.gameover=GameState.OverBorder;
                tge.Emitter.fire("Snake.REDRAW_MSG");
                tge.Emitter.fire("Snake.REDRAW_GRID");
                return;
            }
            //check head meet seed
            if(m.grid[cy][cx]==10000) {
                let sok = false;
                for(var n=0;n<888;n++) {
                    var _nx = Math.floor(Math.random()*Snake.Model.snakew);
                    var _ny = Math.floor(Math.random()*Snake.Model.snakeh);
                    var _np = m.grid[_ny][_nx];
                    if(_np==10000 || _np==0) {
                        m.seed = {x:_nx, y:_ny};
                        sok = true;
                        break;
                    }
                }
                if(!sok) {
                    //TODO····
                }
            } else {
                if(m.grid[cy][cx]!=0) {
                    this.gameover=GameState.OverSelf;
                    tge.Emitter.fire("Snake.REDRAW_MSG");
                    tge.Emitter.fire("Snake.REDRAW_GRID");
                    return;
                }
                m.body.pop();
            }
            m.body.splice(0,0,{x:cx,y:cy});
            m.dir = act;
            m.makeGrid();
            tge.Emitter.fire("Snake.REDRAW_GRID");
            this.timeout_auto=0.0;

        }

        scheduleUpdate(dt: number) {
            super.scheduleUpdate(dt);
            //console.log("update...", this.stage);
        }
    }
}
