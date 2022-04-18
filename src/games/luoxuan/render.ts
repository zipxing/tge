import * as tge from "../../engine"
import { Model } from "./model"

export class TermRender extends tge.Render {
    titlebox: any;
    logobox: any;
    gamebox: any;
    gridboxes: any[][];
    msgbox: any;

    constructor() {
        super();

        tge.AscIIManager.loadArtFile("ascii_art/tge.txt", "tgelogo");
        tge.AscIIManager.loadArtFile("ascii_art/snake.txt", "snake");

        let nb = (<tge.TermRun>tge.env);

        this.titlebox = this.addBox(
            50+2,
            4,
            0,
            3,
        );

        this.logobox = this.addBox(
            12,
            4,
            0,
            Model.matnum+16
        );

        this.gamebox = this.addBox(
            Model.matnum*3+2,
            Model.matnum+2,
            4,
            0,
            {border:{type:'line', fg:238}}
        );

        this.gridboxes=[];
        for(let i=0;i<Model.matnum;i++) {
            this.gridboxes[i]=[];
            for(let j=0;j<Model.matnum;j++) {
                this.gridboxes[i][j] = this.addBox(
                    3,
                    1,
                    i+5,
                    j*3+1
                );
            }
        }

        tge.Emitter.register("Luoxuan.REDRAW_MSG", this.redrawMsg, this);
        tge.Emitter.register("Luoxuan.REDRAW_GRID", this.redrawGrid, this);
    }

    drawTitle() {
        let s = tge.AscIIManager.getArt("snake").blessed_lines;
        this.titlebox.setContent(`${s[0]}\n${s[1]}\n${s[2]}\n${s[3]}`);
    }

    drawLogo() {
        let s = tge.AscIIManager.getArt("tgelogo").blessed_lines;
        this.logobox.setContent(`${s[0]}\n${s[1]}\n${s[2]}\n${s[3]}`);
    }

    redrawMsg() {
    }

    setPoint256(box: any, bg:number, fg:number, cchar:string) {
        box.setContent(`{${bg}-bg}{${fg}-fg}${cchar}{/}`);
    }

    redrawGrid() {
        let c = [27, 33, 39, 45, 51, 50, 44, 38, 32, 26,
            128, 134, 140, 146, 152, 147, 141, 135, 129];
        let g = TermRender.game;
        let m = <Model>g.model;

        for(let i=0;i<Model.matnum;i++) {
            for(let j=0;j<Model.matnum;j++) {
                let gv = m.grid[i][j];
                let gb = this.gridboxes[i][j];
                switch(gv) {
                    case 0:
                        this.setPoint256(gb, 232, 15, " ");
                        break;
                    default:
                        this.setPoint256(gb, 0, c[gv%c.length], ''+gv);
                }
            }
        }
    }

    draw() {
        this.drawTitle();
        this.drawLogo();
        let nb = (<tge.TermRun>tge.env);
        nb.tscreen.render();
    }
}
