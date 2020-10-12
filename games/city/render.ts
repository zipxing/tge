namespace City {
    export class TermRender extends tge.Render {
        titlebox: any;
        logobox: any;
        gamebox: any;
        gridboxes: any[][];
        msgbox: any;

        constructor() {
            super();

            tge.AscIIManager.loadArtFile("ascii_art/tge.txt", "tgelogo");
            tge.AscIIManager.loadArtFile("ascii_art/city.txt", "city");
            tge.AscIIManager.loadArtFile("ascii_art/cc0.txt", "cc0");
            tge.AscIIManager.loadArtFile("ascii_art/cc1.txt", "cc1");
            tge.AscIIManager.loadArtFile("ascii_art/cc2.txt", "cc2");
            tge.AscIIManager.loadArtFile("ascii_art/cc3.txt", "cc3");
            tge.AscIIManager.loadArtFile("ascii_art/cc4.txt", "cc4");
            tge.AscIIManager.loadArtFile("ascii_art/cc5.txt", "cc5");
            tge.AscIIManager.loadArtFile("ascii_art/cc6.txt", "cc6");
            tge.AscIIManager.loadArtFile("ascii_art/cc7.txt", "cc7");
            tge.AscIIManager.loadArtFile("ascii_art/cc8.txt", "cc8");
            tge.AscIIManager.loadArtFile("ascii_art/cc9.txt", "cc9");
            tge.AscIIManager.loadArtFile("ascii_art/cc10.txt", "cc10");
            tge.AscIIManager.loadArtFile("ascii_art/cc11.txt", "cc11");
            tge.AscIIManager.loadArtFile("ascii_art/cc12.txt", "cc12");
            tge.AscIIManager.loadArtFile("ascii_art/cc13.txt", "cc13");
            tge.AscIIManager.loadArtFile("ascii_art/cc14.txt", "cc14");
            tge.AscIIManager.loadArtFile("ascii_art/cc15.txt", "cc15");

            let nb = (<tge.TermRun>tge.env);

            this.titlebox = nb.blessed.box({
                width:Model.cityw*10+10,
                height:7,
                top:0,
                left:8,
                tags:true
            });
            nb.tscreen.append(this.titlebox);

            this.logobox = nb.blessed.box({
                width:12,
                height:4,
                top:3,
                left:Model.cityw*10+16,
                tags:true
            });
            nb.tscreen.append(this.logobox);

            this.gamebox = nb.blessed.box({
                width:Model.cityw*10+2,
                height:Model.cityh*5+2,
                top:7,
                left:0,
                border:{type:'line', fg:238},
                tags:true
            });
            nb.tscreen.append(this.gamebox);

            this.gridboxes=[];
            for(let i=0;i<Model.cityh;i++) {
                this.gridboxes[i]=[];
                for(let j=0;j<Model.cityw;j++) {
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
                height:Model.cityh*5+2,
                top:7,
                left:Model.cityw*10+3,
                border:{type:'line', fg:238},
                tags:true
            });
            nb.tscreen.append(this.msgbox);

            tge.Emitter.register("City.REDRAW_GRID", this.redrawGrid, this);
        }

        touchCell(t:string, i:number, j:number) {
            let nb = (<tge.TermRun>tge.env);
            if(!TermRender.game) return;
            let g = TermRender.game;
            let m = <City.Model>g.model;
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

        drawMsgInCell(b:any, lineno:number, start:number, msg:string, color:number = -1) {
            let s = b.getLine(lineno);
            let cs = '', ce = '';
            if(color>=0) {
                cs = `{${color}-fg}`;
                ce = '{/}'
            }
            let os = s.slice(0, start) + cs + msg + ce + s.slice(start+msg.length);
            b.setLine(lineno, os);
        }

        drawCell(b:any, index:number, bd:Cell, cellmode:boolean = false) {
            let level = bd.level;
            let s = tge.AscIIManager.getArt(`cc${index}`).blessed_lines;
            b.setContent(`${s[0]}\n${s[1]}\n${s[2]}\n${s[3]}\n${s[4]}`);

            let ss = '';
            let pad = ' ';
            if(index!=0) {
                //if(bd.color==-1) 
                //    ss = s[2];
                if(level<30 && bd.color!=-1) {
                    let slv = ''+level;
                    for(let i=0; i<3-slv.length; i++) 
                        slv=pad+slv;
                    ss = slv;
                } 
                if(level==30) {
                    ss = ' T ';
                }
                if(level>30) {
                    let slv = ''+(level/30);
                    for(let i=0; i<4-slv.length; i++) 
                        slv+=pad;
                    ss = ' W'+slv;
                }
                this.drawMsgInCell(b, 2, 3, ss);
                if(bd.color>100 && !cellmode) {
                    ss = 'DEL?';
                    this.drawMsgInCell(b, 3, 2, ss, 197);
                }
            }
        }

        redrawGridUnitMode() {
            let c = [27, 51, 26, 128, 146, 152, 147, 141, 135, 129];
            let g = TermRender.game;
            let m = <City.Model>g.model;

            for(let i in m.units) {
                let cs = m.units[i];
                for(let j in cs.cells) {
                    let jd = parseInt(j);
                    let [x, y] = m.getxyById(jd);
                    let b = this.gridboxes[y][x];
                    b.top = Math.floor(y*5.0+8.0);
                    b.left = Math.floor(x*10.0+1.0);
                    let bd = m.grid[y][x];
                    b.style.fg = c[bd.color%100];
                    this.drawCell(b, parseInt(cs.cells[j]), bd);
                }
            }
        }

        redrawGridCellMode(per:number) {
            let bdr = '┌┐└┘─│'
            let c = [27, 51, 26, 128, 146, 152, 147, 141, 135, 129];
            let g = TermRender.game;
            let m = <City.Model>g.model;

            for(let i=0; i<Model.cityh; i++) {
                for(let j=0; j<Model.cityw; j++) {
                    let b = this.gridboxes[i][j];
                    let bd = m.grid[i][j];
                    if(bd.fromid!=-1 && bd.toid!=-1) {
                        let [fx, fy] = m.getxyById(bd.fromid);
                        let [tx, ty] = m.getxyById(bd.toid);
                        let x = fx + (tx-fx)*(1.0-per);
                        let y = fy + (ty-fy)*(1.0-per);
                        //tge.log(tge.LogLevel.DEBUG, bd.fromid, bd.toid, fx, fy, tx, ty, x, y, per);
                        b.top = Math.floor(y*5.0+8.0);
                        b.left = Math.floor(x*10.0+1.0);
                    } else {
                        b.top = i*5+8;
                        b.left = j*10+1;
                    }
                    b.style.fg = c[bd.color%100];
                    if(bd.color>=0)
                        this.drawCell(b, 15, bd, true);
                    else
                        this.drawCell(b, 0, bd, true);
                }
            }
        }

        drawMovie() {
            let g = TermRender.game;
            let m = <City.Model>g.model;
            let p = 0;
            switch(g.gamestate) {
                case GameState.MergeMovie:
                    p = tge.Timer.getPercent("merge");
                    this.redrawGridCellMode(p);
                    break;
                case GameState.LevelUpMovie:
                    p = tge.Timer.getPercent("levelup");
                    this.redrawGridCellMode(p);
                    break;
                case GameState.DropMovie:
                    p = tge.Timer.getPercent("drop");
                    this.redrawGridCellMode(p);
                    break;
                default:
                    break;
            }
        }

        redrawGrid() {
            this.redrawGridUnitMode();
        }

        draw() {
            this.drawTitle();
            this.drawLogo();
            this.drawMovie();
            let nb = (<tge.TermRun>tge.env);
            nb.tscreen.render();
        }
    }
}
