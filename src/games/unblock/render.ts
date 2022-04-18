import * as tge from "../../engine"
import * as constant from "./constant"
import { Model, Piece } from "./model"
import { MouseHandler } from "./mouse"
import { Game, GameState } from "./game"

export class TermRender extends tge.Render {
    titlebox: any;
    logobox: any;
    gamebox: any;
    gridboxes: any[][];
    msgbox: any;

    static colors: number[] = [50, 71, 9, 94, 241, 51, 141, 135, 129];

    constructor() {
        super();

        tge.AscIIManager.loadArtFile("ascii_art/tge.txt", "tgelogo");
        tge.AscIIManager.loadArtFile("ascii_art/unblock.txt", "unblock");
        tge.AscIIManager.loadArtFileSEQ("ascii_art/", "cc", 16);

        let nb = <tge.TermRun>tge.env;
        let mh = new MouseHandler();

        this.titlebox = this.addBox(
            constant.WIDTH*10+10,
            4,
            0,
            2,
        );

        this.logobox = this.addBox(
            12,
            4,
            0,
            constant.WIDTH*10+16,
        );

        this.gamebox = this.addBox(
            constant.WIDTH*10+2,
            constant.HEIGHT*5+2,
            4,
            0,
            {border:{type:'line', fg:238}},
        );

        this.gridboxes=[];
        for(let i=0;i<constant.HEIGHT;i++) {
            this.gridboxes[i]=[];
            for(let j=0;j<constant.WIDTH;j++) {
                this.gridboxes[i][j] = this.addBox(
                    10,
                    5,
                    i*5+5,
                    j*10+1,
                    {hidden: true}
                );
            }
        }

        this.msgbox = this.addBox(
            23,
            constant.HEIGHT*5+2,
            4,
            constant.WIDTH*10+3,
            {border:{type:'line', fg:238}}
        );

        tge.Emitter.register("Unblock.REDRAW_GRID", this.redrawGrid, this);
        tge.Emitter.register("Unblock.RESET_GRID", this.resetGrid, this);

        let adjx = 1, adjy = 5;
        nb.tscreen.on("mousedown", (data:any)=>{
            if(!mh.mouse_pressed)
                mh.mouseDown(data.x - adjx, data.y - adjy);
            else
                mh.mouseMove(data.x - adjx, data.y - adjy);
        });
        nb.tscreen.on("mousemove", (data:any)=>{
            mh.mouseMove(data.x - adjx, data.y - adjy);
        });
        nb.tscreen.on("mouseup", (data:any)=>{
            mh.mouseUp(data.x - adjx, data.y - adjy);
        });

        this.drawTitle();
        this.drawLogo();
    }

    resetGrid() {
        for(let i=0;i<constant.HEIGHT;i++) {
            for(let j=0;j<constant.WIDTH;j++) {
                this.gridboxes[i][j].hidden = true;
            }
        }
        this.redrawGrid();
        this.redrawMsg();
    }

    drawTitle() {
        let s = tge.AscIIManager.getArt("unblock").blessed_lines;
        this.titlebox.setContent(`${s[0]}\n${s[1]}\n${s[2]}\n${s[3]}`);
    }

    drawLogo() {
        let s = tge.AscIIManager.getArt("tgelogo").blessed_lines;
        this.logobox.setContent(`${s[0]}\n${s[1]}\n${s[2]}\n${s[3]}`);
    }

    redrawMsg() {
        let g = TermRender.game;
        let m = <Model>g.model;
        this.msgbox.setContent(`Stage ${m.map_index}`);
    }

    drawCell(b:any, kind:number) {
        let s = tge.AscIIManager.getArt(`cc${kind}`).blessed_lines;
        b.setContent(`${s[0]}\n${s[1]}\n${s[2]}\n${s[3]}\n${s[4]}`);
        b.hidden = false;
    }

    drawMsgInCell(b:any, lineno:number, start:number, msg:string, color:number = -1, adj:number = 0) {
        let s = b.getLine(lineno).replace(/\{.*?\}/g, '').replace(/\x1b\[[\d;]*m/g, '');
        let cs = '', ce = '';
        if(color>=0) {
            cs = `{${color}-fg}`;
            ce = '{/}'
        }
        let os = s.slice(0, start) + cs + msg + ce + s.slice(start+msg.length+adj);
        b.setLine(lineno, os);
    }

    drawPiece(p:Piece) {
        let color = 0;
        let adj = [[1,0], [1,0], [0,1], [1,0], [0,1]];

        if(p.kind==1) color = 2;
        let count = 0;
        for(let c of p.cells) {
            let b = this.gridboxes[c.y][c.x];
            b.style.fg = TermRender.colors[color];
            b.left = Math.floor((p.x+count*adj[p.kind-1][0]) * constant.CELLSIZEX) + 1;
            b.top  = Math.floor((p.y+count*adj[p.kind-1][1]) * constant.CELLSIZEY) + 5;
            this.drawCell(b, c.kind);
            if(p.kind==1 && count==1) {
                if(tge.env.kind == 'TERM')
                    this.drawMsgInCell(b, 2, 4, " 🚀 ", -1, -1);
                else 
                    this.drawMsgInCell(b, 2, 4, " >> ");
            }
            count++;
        }
    }

    redrawGrid() {
        let g = TermRender.game;
        let m = <Model>g.model;
        for(let p of m.layout_run.pieces) {
            this.drawPiece(p);
        }
    }

    drawSuccessMovie() {
        let g = TermRender.game;
        let m = <Model>g.model;
        if(g.gamestate!=GameState.Win) return;
        let b = this.gridboxes[m.main_piece.y][m.main_piece.x];
        let mc = 18 + Math.floor((g.stage / 2)) % 212;
        let sidx = Math.floor(g.stage / 6.0) % 3;
        let strs = [
            'esc>>  ',
            ' esc>> ',
            '  esc>>',
        ]
        this.drawMsgInCell(b, 2, 2, strs[sidx], mc);
    }

    draw() {
        let nb = (<tge.TermRun>tge.env);
        nb.tscreen.render();
        this.drawSuccessMovie();
    }
}
