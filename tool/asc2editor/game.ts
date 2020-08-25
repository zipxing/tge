namespace AscIIEditor {
    export enum GameState {
        Ok = 0,
        OverSelf ,
        OverBorder
    }

    export class Game extends tge.Game {
        initGame() {
            let m = <AscIIEditor.Model>this.model;
            tge.Emitter.fire("AscIIEditor.REDRAW_IMAGE");
            tge.Emitter.fire("AscIIEditor.REDRAW_MSG");
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
            let i = parseInt(ag[1]);
            let j = parseInt(ag[2]);
            let m = <AscIIEditor.Model>this.model;
            switch(ag[0]) {
                case "CHAR":
                    m.curasc2code = Model.ascii[i][j];
                    m.curpen = Pen.Asc2code;
                    tge.Emitter.fire("AscIIEditor.REDRAW_MSG");
                    break;
                case "COLOR":
                    m.curfg = i*32+j;
                    m.curpen = Pen.Foreground;
                    tge.Emitter.fire("AscIIEditor.REDRAW_MSG");
                    break;
                case "BCOLOR":
                    m.curbg = i*32+j;
                    m.curpen = Pen.Background;
                    tge.Emitter.fire("AscIIEditor.REDRAW_MSG");
                    break;
                case "IMAGE":
                    m.grid[i][j] = {
                        asc2code: m.curasc2code,
                        fgcolor: m.curfg,
                        bgcolor: m.curbg
                    };
                    tge.Emitter.fire("AscIIEditor.REDRAW_IMAGE");
                    break;
                default:
                    ;
            }
        }

        scheduleUpdate(dt: number) {
            super.scheduleUpdate(dt);
        }
    }
}
