namespace Simple3d {
    export enum GameState {
        Playing = 0,
        Win = 1,
        Ready = 2
    }

    export class Game extends tge.Game {
        initGame() {
            let m = <Simple3d.Model>this.model;
            this.gamestate=GameState.Playing;
            this.useract=[];
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
        }
    }
}
