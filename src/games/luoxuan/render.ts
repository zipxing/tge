import * as tge from "../../engine/index"
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

        this.titlebox = nb.blessed.box({
            width:Model.matnum+2,
            height:4,
            top:0,
            left:3,
            tags:true
        });
        nb.tscreen.append(this.titlebox);

        this.logobox = nb.blessed.box({
            width:12,
            height:4,
            top:0,
            left:Model.matnum+16,
            tags:true
        });
        nb.tscreen.append(this.logobox);

        this.gamebox = nb.blessed.box({
            width:Model.matnum*3+2,
            height:Model.matnum+2,
            top:4,
            left:0,
            border:{type:'line', fg:238},
            tags:true
        });
        nb.tscreen.append(this.gamebox);

        this.gridboxes=[];
        for(let i=0;i<Model.matnum;i++) {
            this.gridboxes[i]=[];
            for(let j=0;j<Model.matnum;j++) {
                this.gridboxes[i][j]=nb.blessed.box({
                    width:3,
                    height:1,
                    top:i+5,
                    left:j*3+1,
                    tags:true
                });
                nb.tscreen.append(this.gridboxes[i][j]);
            }
        }

        this.msgbox = nb.blessed.box({
            width:23,
            height:Model.matnum+2,
            top:4,
            left:Model.matnum+3,
            border:{type:'line', fg:238},
            tags:true
        });
        //nb.tscreen.append(this.msgbox);

        tge.Emitter.register("Luoxuan.REDRAW_MSG", this.redrawMsg, this);
        tge.Emitter.register("Luoxuan.REDRAW_GRID", this.redrawGrid, this);
    }

    drawTitle() {
        let s = tge.AscIIManager.getArt("snake").blessed_lines;
        //let st = tge.Timer.getStage("Snake.Timer.Title");
        this.titlebox.setContent(`${s[0]}\n${s[1]}\n${s[2]}\n${s[3]}`);
    }

    drawLogo() {
        let s = tge.AscIIManager.getArt("tgelogo").blessed_lines;
        this.logobox.setContent(`${s[0]}\n${s[1]}\n${s[2]}\n${s[3]}`);
    }

    redrawMsg() {
        // let msg:string[] =['Press {green-fg}q{/} quit...',
        //     'Game over,press {green-fg}r{/} restart...',
        //     'Game over,press {green-fg}r{/} restart...'];
        // let g = TermRender.game;
        // this.msgbox.setContent(msg[g.gamestate]);
    }

    setPoint(box: any, bg:string, fg:string, cchar:string) {
        box.setContent(`{${bg}-bg}{${fg}-fg}${cchar}{/}`);
    }

    setPoint256(box: any, bg:number, fg:number, cchar:string) {
        box.setContent(`{${bg}-bg}{${fg}-fg}${cchar}{/}`);
    }

    redrawGrid() {
        //let c = ['magenta', 'blue', 'red', 'green', 'yellow', 'cyan'];
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
