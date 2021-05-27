import * as tge from "../../engine"
import { Model, Pen } from "./model"

export class Game extends tge.Game {
    asciiart: string = '/tmp/test.art';

    initGame() {
        let m = <Model>this.model;
        m.loadAsciiArtFile(this.asciiart);
        tge.Emitter.fire("AscIIEditor.REDRAW_IMAGE");
        tge.Emitter.fire("AscIIEditor.REDRAW_MSG");
    }

    restartGame() {
    }

    setAsciiArtFile(fpath: string) {
        this.asciiart = fpath;
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
        let m = <Model>this.model;
        switch(ag[0]) {
            case "SAVE":
                m.saveAsciiArtFile(this.asciiart);
                break;
            case "CHAR":
                m.curasc2code = Model.ascii[i][j];
                m.curpen = Pen.Asc2code;
                tge.Emitter.fire("AscIIEditor.REDRAW_MSG");
                break;
            case "FG-COLOR":
                m.curfg = i*32+j;
                m.curpen = Pen.Foreground;
                tge.Emitter.fire("AscIIEditor.REDRAW_MSG");
                break;
            case "BG-COLOR":
                m.curbg = i*32+j;
                m.curpen = Pen.Background;
                tge.Emitter.fire("AscIIEditor.REDRAW_MSG");
                break;
            case "IMAGE":
                switch(m.curpen) {
                    case Pen.Asc2code:
                        m.grid[i][j].asc2code = m.curasc2code;
                        if(m.grid[i][j].asc2code == ' ') {
                            m.grid[i][j].bgcolor = 0;
                            m.grid[i][j].fgcolor = 15;
                        }
                        break;
                    case Pen.Background:
                        if(m.grid[i][j].asc2code == ' ')
                            break;
                        m.grid[i][j].bgcolor = m.curbg;
                        break;
                    case Pen.Foreground:
                        if(m.grid[i][j].asc2code == ' ')
                            break;
                        m.grid[i][j].fgcolor = m.curfg;
                        break;
                    default:
                        ;
                }
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
