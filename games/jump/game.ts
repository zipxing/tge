namespace Jump {
    export enum GameState {
        Ok = 0,
        Over,
    }

    export class Game extends tge.Game {
        initGame() {
            let m = <Jump.Model>this.model;
            this.gamestate=GameState.Ok;
            tge.Timer.register("JUMP", 0.8333333333333, ()=>{});
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
            if(this.gamestate!=GameState.Ok) {
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
            }
        }

        scheduleUpdate(dt: number) {
            super.scheduleUpdate(dt);
            let m = <Jump.Model>this.model;
            if(tge.Timer.getStage("JUMP")==0) {
                for(let i=0; i<4; i++) m.car_pos[i].y = 20;
                return;
            }
            let rt = tge.Timer.getRStage("JUMP");
            for(let i=0; i<4; i++) {
                let t = rt-i*4;
                if(t>0) {
                    m.car_pos[i].y = 20 - Math.floor((m.jump_speed*t - 0.5*Model.carg*t*t)/10.0);
                } else {
                    m.car_pos[i].y = 20;
                }
            }
        }
    }
}
