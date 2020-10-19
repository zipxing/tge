namespace City {
    export class TermRender extends tge.Render {
        titlebox: any;
        logobox: any;
        gamebox: any;
        gridboxes: any[][];
        msgbox: any;
        static colors: number[] = [0, 71, 22, 94, 241, 51, 141, 135, 129];

        constructor() {
            super();

            tge.AscIIManager.loadArtFile("ascii_art/tge.txt", "tgelogo");
            tge.AscIIManager.loadArtFile("ascii_art/city.txt", "city");
            tge.AscIIManager.loadArtFileSEQ("ascii_art/", "cc", 16);

            let nb = (<tge.TermRun>tge.env);

            this.titlebox = nb.blessed.box({
                width:City.WIDTH*10+10,
                height:7,
                top:0,
                left:2,
                tags:true
            });
            nb.tscreen.append(this.titlebox);

            this.logobox = nb.blessed.box({
                width:12,
                height:4,
                top:3,
                left:City.WIDTH*10+16,
                tags:true
            });
            nb.tscreen.append(this.logobox);

            this.gamebox = nb.blessed.box({
                width:City.WIDTH*10+2,
                height:City.HEIGHT*5+2,
                top:7,
                left:0,
                border:{type:'line', fg:238},
                tags:true
            });
            nb.tscreen.append(this.gamebox);

            this.gridboxes=[];
            for(let i=0;i<City.HEIGHT;i++) {
                this.gridboxes[i]=[];
                for(let j=0;j<City.WIDTH;j++) {
                    this.gridboxes[i][j]=nb.blessed.box({
                        width:10,
                        height:5,
                        top:i*5+8,
                        left:j*10+1,
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
                height:City.HEIGHT*5+2,
                top:7,
                left:City.WIDTH*10+3,
                border:{type:'line', fg:238},
                tags:true
            });
            nb.tscreen.append(this.msgbox);

            this.drawTitle();
            this.drawLogo();

            tge.Emitter.register("City.REDRAW_GRID", this.redrawGrid, this);
        }

        touchCell(t:string, i:number, j:number) {
            let nb = (<tge.TermRun>tge.env);
            if(!TermRender.game) return;
            let g = TermRender.game;
            let m = <City.Model>g.model;
            if(g.gamestate!=GameState.Normal) return;
            g.useract.splice(0,0,`${t}:${i}:${j}`);
        }

        drawTitle() {
            let s = tge.AscIIManager.getArt("city").blessed_lines;
            this.titlebox.setContent(`${s[0]}\n${s[1]}\n${s[2]}\n${s[3]}\n${s[4]}\n${s[5]}\n${s[6]}`);
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

        drawReady2TUnits() {
            let g = TermRender.game;
            let m = <City.Model>g.model;
            if(g.gamestate != GameState.Normal)
                return;
            for(let i of m.ready2TUnits) {
                let cs = m.units[i].cells;
                for(let j in cs) {
                    let jd = parseInt(j);
                    let [x, y] = m.getxyById(jd);
                    let b = this.gridboxes[y][x];
                    let mc = 18 + Math.floor((g.stage / 2)) % 212;
                    this.drawMsgInCell(b, 1, 4, '∙', mc);
                }
            }
        }

        drawLevelUp(s: number) {
            let g = TermRender.game;
            let m = <City.Model>g.model;
            if(g.gamestate != GameState.LevelUpMovie)
                return;
            let [x, y] = m.getxyById(m.levelUp.cellid);
            let b = this.gridboxes[y][x];
            let l = 0, step = tge.Game._frameHz*City.LEVELUP_STEP_TIME;
            if(m.levelUp.from==30)
                l = m.levelUp.from + Math.floor(s/step)*30;
            else
                l = m.levelUp.from + Math.floor(s/step);
            let ss = this.drawLevelInfo(b, 15, 1, l, true);
        }

        //Some Emoji display exceptions, such as:🏛⛪️
        drawLevelInfo(b:any, index:number, c:number, level:number, cellmode:boolean) {
            let ss = '';
            let pad = ' ';

            let s = tge.AscIIManager.getArt(`cc${index}`).blessed_lines;
            b.setContent(`${s[0]}\n${s[1]}\n${s[2]}\n${s[3]}\n${s[4]}`);

            if(index==0 && cellmode) return;

            //Base level...
            if(level<30 && c!=-1) {
                let ll = Math.ceil(level/3.0);
                let ss = (''+ll).padStart(2);
                let emoji = ' 🏠 ';
                if(ll<=3) 
                    emoji = ' 🏡 ';
                else if(ll<=6)
                    emoji = ' 🏠 ';
                else
                    emoji = ' 🏬 ';
                if(tge.env.kind == 'TERM')
                    this.drawMsgInCell(b, 2, 2, emoji, -1, -1);
                else
                    this.drawMsgInCell(b, 2, 2, ' BB ', -1);
                this.drawMsgInCell(b, 3, 2, ' '+ss);

            }
            //Tower
            if(level==30) {
                ss = 'T';
                if(tge.env.kind == 'TERM')
                    this.drawMsgInCell(b, 2, 2, ' 🏭 ', -1, -1);
                else
                    this.drawMsgInCell(b, 2, 2, ' TO ', -1);
                this.drawMsgInCell(b, 3, 3, ' '+ss);
            }
            //Wonder
            if(level>30) {
                let ll = Math.floor(level/30);
                ss = ' W'+ (''+ll).padStart(2, '0');
                /*this.drawMsgInCell(b, 1, 1, ' \\≈Θ≈/ ');
                this.drawMsgInCell(b, 2, 1, ' /÷÷÷\\ ');
                this.drawMsgInCell(b, 3, 1, '/'+ss+' \\');*/
                if(tge.env.kind == 'TERM')
                    this.drawMsgInCell(b, 2, 2, ' 🗿 ', -1, -1);
                else
                    this.drawMsgInCell(b, 2, 2, ' WD ', -1);
                this.drawMsgInCell(b, 3, 2, ss);
            }
        }

        drawCell(b:any, index:number, bd:Cell, cellmode:boolean = false) {
            b.style.fg = TermRender.colors[bd.color%100];

            this.drawLevelInfo(b, index, bd.color, bd.level, cellmode);
            if(index!=0) {
                if(bd.color>100 && !cellmode) {
                    let ss = 'DEL?';
                    this.drawMsgInCell(b, 0, 3, ss, 197);
                }
            }
        }

        drawUnits() {
            let g = TermRender.game;
            let m = <City.Model>g.model;

            for(let i in m.units) {
                let cs = m.units[i];
                if(cs.mergeing)
                    continue;
                for(let j in cs.cells) {
                    let jd = parseInt(j);
                    let [x, y] = m.getxyById(jd);
                    let b = this.gridboxes[y][x];
                    b.top = Math.floor(y*5.0+8.0);
                    b.left = Math.floor(x*10.0+1.0);
                    let bd = m.grid[y][x];
                    this.drawCell(b, parseInt(cs.cells[j]), bd);
                }
            }
        }

        drawMovingCells(per:number) {
            let g = TermRender.game;
            let m = <City.Model>g.model;

            for(let cid of m.moveCellIds) {
                let [j, i] = m.getxyById(cid);
                let b = this.gridboxes[i][j];
                let bd = m.grid[i][j];
                if(bd.fromid!=-1 && bd.toid!=-1) {
                    let [fx, fy] = m.getxyById(bd.fromid);
                    let [tx, ty] = m.getxyById(bd.toid);
                    let x = fx + (tx-fx)*(1.0-per);
                    let y = fy + (ty-fy)*(1.0-per);
                    b.top = Math.floor(y*5.0+8.0);
                    b.left = Math.floor(x*10.0+1.0);
                } else {
                    b.top = i*5+8;
                    b.left = j*10+1;
                }
                if(bd.color>=0)
                    this.drawCell(b, 15, bd, true);
                else
                    this.drawCell(b, 0, bd, true);
            }
        }

        drawMovie() {
            let g = TermRender.game;
            let m = <City.Model>g.model;
            let p = 0;
            let s = 0;
            switch(g.gamestate) {
                case GameState.MergeMovie:
                    p = tge.Timer.getPercent("merge");
                    this.drawMovingCells(p);
                    break;
                case GameState.LevelUpMovie:
                    p = tge.Timer.getPercent("levelup");
                    s = tge.Timer.getRStage("levelup");
                    this.drawMovingCells(p);
                    this.drawLevelUp(s);
                    break;
                case GameState.DropMovie:
                    p = tge.Timer.getPercent("drop");
                    this.drawMovingCells(p);
                    break;
                default:
                    break;
            }
            this.drawReady2TUnits();
        }

        redrawGrid() {
            this.drawUnits();
        }

        draw() {
            this.drawMovie();
            let nb = (<tge.TermRun>tge.env);
            nb.tscreen.render();
        }
    }
}
