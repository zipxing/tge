import * as tge from "../../engine"
import { Model } from "./model"
import * as game from "./game"

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
            width:Model.towerw+2,
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
            left:Model.towerw+16,
            tags:true
        });
        nb.tscreen.append(this.logobox);

        this.gamebox = nb.blessed.box({
            width:Model.towerw+2,
            height:Model.towerh+2,
            top:4,
            left:0,
            border:{type:'line', fg:238},
            tags:true
        });
        nb.tscreen.append(this.gamebox);

        this.gridboxes=[];
        for(let i=0;i<Model.towerh;i++) {
            this.gridboxes[i]=[];
            for(let j=0;j<Model.towerw;j++) {
                this.gridboxes[i][j]=nb.blessed.box({
                    width:1,
                    height:1,
                    top:i+5,
                    left:j+1,
                    tags:true
                });
                nb.tscreen.append(this.gridboxes[i][j]);
                this.gridboxes[i][j].on('click', (data: any)=>{
                    this.touchCell("M", i, j);
                });
            }
        }

        this.msgbox = nb.blessed.box({
            width:23,
            height:Model.towerh+2,
            top:4,
            left:Model.towerw+3,
            border:{type:'line', fg:238},
            tags:true
        });
        nb.tscreen.append(this.msgbox);

        tge.Emitter.register("Tower.REDRAW_GRID", this.redrawGrid, this);
    }

    touchCell(t:string, i:number, j:number) {
        let nb = (<tge.TermRun>tge.env);
        if(!TermRender.game) return;
        let g = TermRender.game;
        let m = <Model>g.model;
        if(g.gamestate!=game.GameState.Normal) return;
        g.useract.splice(0,0,`${t}:${i}:${j}`);
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
        let msg:string[] =['Press {green-fg}q{/} quit...',
            'Game over,press {green-fg}r{/} restart...',
            'Game over,press {green-fg}r{/} restart...'];
        let g = TermRender.game;
        this.msgbox.setContent(msg[g.gamestate]);
    }

    setPoint(box: any, bg:string, fg:string, cchar:string) {
        box.setContent(`{${bg}-bg}{${fg}-fg}${cchar}{/}`);
    }

    setPoint256(box: any, bg:number, fg:number, cchar:string) {
        box.setContent(`{${bg}-bg}{${fg}-fg}${cchar}{/}`);
    }

    redrawGrid() {
        let c = [27, 33, 39, 45, 51, 50, 44, 38, 32, 26,
            128, 134, 140, 146, 152, 147, 141, 135, 129];
        let g = TermRender.game;
        let m = <Model>g.model;

        for(let i=0;i<Model.towerh;i++) {
            for(let j=0;j<Model.towerw;j++) {
                let gv = m.grid[i][j];
                let gb = this.gridboxes[i][j];
                switch(gv) {
                    case 0:
                        this.setPoint256(gb, 232, 15, " ");
                        break;
                    case 1:
                        this.setPoint256(gb, 232, 15, "O");
                        break;
                    default:
                        this.setPoint256(gb, 232, 15, " ");
                        /*
                        if(g.gamestate==game.GameState.Normal) {
                            if(gv==1)
                                this.setPoint256(gb, 0, 196, "█");
                            else
                                this.setPoint256(gb, 0, c[gv%c.length], "▒");
                        }
                        else
                            this.setPoint256(gb, 15, c[gv%c.length], "█");
                        */
                }
            }
        }
    }

    drawWay() {
        let g = TermRender.game;
        let m = <Model>g.model;
        for(let p of m.result) {
            let gb = this.gridboxes[p.y][p.x];
            this.setPoint256(gb, 232, 15, ".");
        }
    }

    draw() {
        this.drawTitle();
        this.drawLogo();
        this.drawWay();
        let nb = (<tge.TermRun>tge.env);
        nb.tscreen.render();
    }
}
