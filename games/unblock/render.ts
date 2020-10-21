namespace Unblock {
    export class TermRender extends tge.Render {
        titlebox: any;
        logobox: any;
        gamebox: any;
        gridboxes: any[][];
        msgbox: any;

        region: tge.Rect = {
            x:0, y:0, 
            width:Unblock.CELLSIZEX*Unblock.WIDTH,
            height:Unblock.CELLSIZEY*Unblock.HEIGHT
        };

        touchbegin: boolean = false;
        touch_beganx: number = 0;
        touch_begany: number = 0;

        static colors: number[] = [30, 71, 22, 94, 241, 51, 141, 135, 129];

        constructor() {
            super();

            tge.AscIIManager.loadArtFile("ascii_art/tge.txt", "tgelogo");
            tge.AscIIManager.loadArtFile("ascii_art/snake.txt", "unblock");
            tge.AscIIManager.loadArtFileSEQ("ascii_art/", "cc", 16);

            let nb = <tge.TermRun>tge.env;

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

            nb.tscreen.on("mousedown", (data:any)=>{
                this.mouseDown(data.x, data.y);
            });
            nb.tscreen.on("mousemove", (data:any)=>{
                this.mouseMove(data.x, data.y);
            });
            nb.tscreen.on("mouseup", (data:any)=>{
                this.mouseUp(data.x, data.y);
            });

            this.drawTitle();
            this.drawLogo();
        }

        mouseDown(x:number, y:number) {
            let nb = (<tge.TermRun>tge.env);
            if(!TermRender.game) return;
            let g = TermRender.game;
            let m = <Unblock.Model>g.model;
            if(g.gamestate!=GameState.Playing) return;
            let point = {x:x, y:y};
            tge.log(tge.LogLevel.DEBUG, "zipxing , touch began : {x:"+x+", y:"+y+"}");
            if (tge.pointInRect(this.region, point)) {
                this.touchbegin = true;
                this.touch_beganx = x;
                this.touch_begany = y;
                let index = m.selectPiece(point);
                m.selected_piece = index;
                g.useract.splice(0, 0, `S:${index}`);
                return true;
            }
            /*if(x<=320 && x>40 && y<=740 && y>672) {
                this.game.reset();
                this.touchbegin = false;
            }
            if(x<=630 && x>342 && y<=740 && y>672) {
                this.game.undo();
                this.touchbegin = false;
            }*/
            return false;
        }

        mouseUp(x:number, y:number) {
            let nb = (<tge.TermRun>tge.env);
            if(!TermRender.game) return;
            let g = TermRender.game;
            let m = <Unblock.Model>g.model;
            if(g.gamestate!=GameState.Playing) return;
            this.touchbegin = false;
            let point = {x:x, y:y};
            if(m.selected_piece == -1) return;
            let hp = m.homingPiece(m.selected_piece);
            if(hp!=null) {
                m.layout_run.pieces[hp.pindex] = hp.end;
                g.useract.splice(0, 0, `H:${hp}`);
            }
        }

        mouseMove(x:number, y:number) {
            let nb = (<tge.TermRun>tge.env);
            if(!TermRender.game) return;
            let g = TermRender.game;
            let m = <Unblock.Model>g.model;
            if(g.gamestate!=GameState.Playing) return;
            if(!this.touchbegin) return;
            if(m.selected_piece == -1) return;
            let point = {x:x, y:y};
            let mp = m.movePiece(m.selected_piece,
                {x:this.touch_beganx, y:this.touch_begany}, point);
            if(mp!=null) {
                m.layout_run.pieces[mp.pindex] = mp.end;
                g.useract.splice(0, 0, `M:${mp}`);
                this.touch_beganx = x;
                this.touch_begany = y;
            }
            if (tge.pointInRect(this.region, point)) {
                return true;
            } else {
                this.mouseUp(0,0);
                m.selected_piece = -1;
            }
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
            this.msgbox.setContent(msg[g.gamestate]);
        }

        drawCell(b:any, kind:number) {
            let s = tge.AscIIManager.getArt(`cc${kind}`).blessed_lines;
            b.setContent(`${s[0]}\n${s[1]}\n${s[2]}\n${s[3]}\n${s[4]}`);
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
            let leftadj = 0;
            let topadj = 0;
            switch(p.kind) {
                case 1:
                case 2:
                case 4:
                    leftadj = 1;
                    topadj = 0;
                    break;
                case 3:
                case 5:
                    leftadj = 0;
                    topadj = 1;
                    break;
            }
            if(p.kind==1) color = 2;
            let count = 0;
            for(let c of p.cells) {
                let b = this.gridboxes[c.y][c.x];
                b.style.fg = TermRender.colors[color];
                b.left = Math.floor((p.x+count*leftadj) * Unblock.CELLSIZEX) + 1;
                b.top = Math.floor((p.y+count*topadj) * Unblock.CELLSIZEY) + 5;
                this.drawCell(b, c.kind);
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

        draw() {
            let nb = (<tge.TermRun>tge.env);
            nb.tscreen.render();
        }
    }
}
