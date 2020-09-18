namespace Jump {
    export enum GameState {
        Ok = 0,
        Over,
    }

    export class Game extends tge.Game {
        initGame() {
            let m = <Jump.Model>this.model;
            this.gameover=GameState.Ok;
            tge.Timer.register("JUMP", 0.5, ()=>{});
            //tge.Emitter.fire("Jump.REDRAW_GRID");
            //tge.Emitter.fire("Jump.REDRAW_MSG");
        }

        restartGame() {
        }

        playUserAction(dt: number) {
            for(let i=0;i<this.useract.length;i++)
                this.doAction(this.useract[i]);
            this.useract=[];
        }

        playAutoAction(dt: number) {
            let m = <Jump.Model>this.model;
            if(this.timeout_auto>400.0) {
                //this.doAction('');
            } else {
                this.timeout_auto+=dt;
            }
        }

        playAiAction(dt: number) {
        }

        doAction(act: any) {
            let m = <Jump.Model>this.model;
            if(this.gameover!=GameState.Ok) {
                if(act=='R')
                    this.initGame();
                return;
            }
            switch(act) {
                case 'W':
                    let s = tge.Timer.getStage("JUMP");
                    if(s==0) tge.Timer.fire("JUMP", 0);
                    break;
                default:
                    ;
                    //console.log('error act!');
            }
        }

        scheduleUpdate(dt: number) {
            super.scheduleUpdate(dt);
            let m = <Jump.Model>this.model;
            let t = tge.Timer.getRStage("JUMP");
            if(t!=0) {
                m.car_pos.y = 20 + Math.floor((m.jump_speed*t - 0.5*Model.carg*t*t)/10.0);
            } else {
                m.car_pos.y = 20;
            }
        }
    }
}
