namespace Unblock {
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

            this.titlebox = nb.blessed.box({
                width:Unblock.WIDTH*10+10,
                height:4,
                top:0,
                left:2,
                tags:true
            });
            nb.tscreen.append(this.titlebox);

            this.logobox = nb.blessed.box({
                width:12,
                height:4,
                top:0,
                left:Unblock.WIDTH*10+16,
                tags:true
            });
            nb.tscreen.append(this.logobox);

            this.gamebox = nb.blessed.box({
                width:Unblock.WIDTH*10+2,
                height:Unblock.HEIGHT*5+2,
                top:4,
                left:0,
                border:{type:'line', fg:238},
                tags:true
            });
            nb.tscreen.append(this.gamebox);

            this.gridboxes=[];
            for(let i=0;i<Unblock.HEIGHT;i++) {
                this.gridboxes[i]=[];
                for(let j=0;j<Unblock.WIDTH;j++) {
                    this.gridboxes[i][j]=nb.blessed.box({
                        width:10,
                        height:5,
                        top:i*5+5,
                        left:j*10+1,
                        hidden: true,
                        tags:true
                    });
                    nb.tscreen.append(this.gridboxes[i][j]);
                 }
            }

            this.msgbox = nb.blessed.box({
                width:23,
                height:Unblock.HEIGHT*5+2,
                top:4,
                left:Unblock.WIDTH*10+3,
                border:{type:'line', fg:238},
                tags:true
            });
            nb.tscreen.append(this.msgbox);

            tge.Emitter.register("Unblock.REDRAW_GRID", this.redrawGrid, this);
            tge.Emitter.register("Unblock.RESET_GRID", this.resetGrid, this);

            let adjx = 1, adjy = 5;
            nb.tscreen.on("mousedown", (data:any)=>{
                if(!mh.touchbegin)
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
            for(let i=0;i<Unblock.HEIGHT;i++) {
                for(let j=0;j<Unblock.WIDTH;j++) {
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
            let msg:string[] =['Press {green-fg}q{/} quit...',
                'Game over,press {green-fg}r{/} restart...',
                'Game over,press {green-fg}r{/} restart...'];
            let g = TermRender.game;
            let m = <Unblock.Model>g.model;
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
                b.left = Math.floor((p.x+count*adj[p.kind-1][0]) * Unblock.CELLSIZEX) + 1;
                b.top  = Math.floor((p.y+count*adj[p.kind-1][1]) * Unblock.CELLSIZEY) + 5;
                this.drawCell(b, c.kind);
                if(p.kind==1 && count==1) {
                    this.drawMsgInCell(b, 2, 4, " 🚀 ", -1, -1);
                }
                count++;
            }
        }

        redrawGrid() {
            let g = TermRender.game;
            let m = <Unblock.Model>g.model;
            for(let p of m.layout_run.pieces) {
                this.drawPiece(p);
            }
        }

        drawSuccessMovie() {
            let g = TermRender.game;
            let m = <Unblock.Model>g.model;
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
}
