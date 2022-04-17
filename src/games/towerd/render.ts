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

        this.titlebox = this.addBox(Model.towerw+2, 4, 0, 3);
        this.logobox = this.addBox(12, 4, 0, Model.towerw+16);
        this.gamebox = this.addBox(Model.towerw+2, 
            Model.towerh+2, 4, 0, {type:'line', fg:238});

        this.gridboxes=[];
        for(let i=0;i<Model.towerh;i++) {
            this.gridboxes[i]=[];
            for(let j=0;j<Model.towerw;j++) {
                this.gridboxes[i][j]= this.addBox(1, 1, i+5, j+1);
                this.gridboxes[i][j].on('click', (data: any)=>{
                    this.touchCell("M", i, j);
                });
            }
        }

        this.msgbox = this.addBox(23, Model.towerh+2, 4, 
            Model.towerw+3, {type:'line', fg:238});
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
