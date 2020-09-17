namespace Jump {
    export enum GameState {
        Ok = 0,
        Over,
    }

    export class Game extends tge.Game {
        initGame() {
            let m = <Jump.Model>this.model;
            this.gameover=GameState.Ok;
            tge.Emitter.fire("Jump.REDRAW_GRID");
            tge.Emitter.fire("Jump.REDRAW_MSG");
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
                this.doAction('');
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
            let dx, dy, cx, cy: number;
            switch(act) {
                case 'W':
                    dx=0,dy=-1;
                    break;
                default:
                    dx=0,dy=0;
                    //console.log('error act!');
            }
            this.timeout_auto=0.0;
        }
    }
}
