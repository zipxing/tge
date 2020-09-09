namespace Tetris {
    export class TermRender extends tge.Render {
        titlebox: any;
        logobox: any;
        backbox: any;
        gamebox: any;
        gridboxes: any[2][][];
        msgbox: any;

        constructor() {
            super();

            tge.AscIIManager.loadArtFile("ascii_art/tge.txt", "tgelogo");
            tge.AscIIManager.loadArtFile("ascii_art/tetris2.txt", "tetrislogo");
            tge.AscIIManager.loadArtFile("ascii_art/tetris_back.txt", "tback");

            let nb = (<tge.TermRun>tge.env);

            this.titlebox = nb.blessed.box({
                width:50,
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
                left:50+16,
                tags:true
            });
            nb.tscreen.append(this.logobox);

            this.gamebox = nb.blessed.box({
                width:Tetris.HENG*9,
                height:Tetris.ZONG+2,
                top:4,
                left:0,
                border:{type:'line', fg:238},
                tags:true
            });
            nb.tscreen.append(this.gamebox);

            this.backbox = nb.blessed.box({
                width:Tetris.HENG*9,
                height: Tetris.ZONG+2,
                top: 4,
                left: 2,
                tags:true
            });
            nb.tscreen.append(this.backbox);

            this.gridboxes=[[],[]];
            for(let idx=0; idx<=1; idx++) {
                for(let i=0; i<ZONG; i++) 
                    this.gridboxes[idx][i]=new Array(HENG*2);
                for(let i=0; i<ZONG; i++) {
                    for(var j=0;j<HENG;j++) {
                        this.gridboxes[idx][i][j*2]=nb.blessed.box({
                            width:1,
                            height:1,
                            top:i+5, 
                            left:j*2+idx*53+5,
                            tags:true
                        });
                        this.gridboxes[idx][i][j*2+1]=nb.blessed.box({
                            width:1, 
                            height:1, 
                            top:i+5, 
                            left:j*2+1+idx*53+5,
                            tags:true
                        });
                        nb.tscreen.append(this.gridboxes[idx][i][j*2]);
                        nb.tscreen.append(this.gridboxes[idx][i][j*2+1]);
                    }
                }
            }

            this.msgbox = nb.blessed.box({
                width:23,
                height:ZONG+2,
                top:4,
                left:HENG+3,
                border:{type:'line', fg:238},
                tags:true
            });
            //nb.tscreen.append(this.msgbox);

            /*tge.Emitter.register("Snake.REDRAW_MSG", this.redrawMsg, this);
            tge.Emitter.register("Snake.REDRAW_GRID", this.redrawGrid, this);
            tge.Timer.register("Snake.Timer.Title", 1.0, ()=>{
                tge.Timer.fire("Snake.Timer.Title", 0);
            });
            tge.Timer.fire("Snake.Timer.Title", 0);*/
        }

        drawTitle() {
            let s = tge.AscIIManager.getArt("tetrislogo").blessed_lines;
            this.titlebox.setContent(`${s[0]}\n${s[1]}\n${s[2]}\n${s[3]}`);
        }

        drawLogo() {
            let s = tge.AscIIManager.getArt("tgelogo").blessed_lines;
            this.logobox.setContent(`${s[0]}\n${s[1]}\n${s[2]}\n${s[3]}`);
        }

        drawBack() {
            let s = tge.AscIIManager.getArt("tback").blessed_lines;
            this.backbox.setContent(s.join('\n'));
        }

        redrawMsg() {
            let msg:string[] =['Press {green-fg}q{/} quit...',
                'Game over,press {green-fg}r{/} restart...',
                'Game over,press {green-fg}r{/} restart...'];
            //this.msgbox.setContent(msg[g.gameover]);
        }

        redrawGrid() {
            let g = TermRender.game;
            let m = <Tetris.Model>g.model;
            for(let idx=0; idx<=1; idx++) {
                for(let i=0;i<ZONG;i++) {
                    for(let j=0;j<HENG;j++) {
                        let gr = m.grids[idx];
                        let gv = gr.core.grid[i*GRIDW + j+2];
                        if(gv==0) {
                            this.gridboxes[idx][i][j*2].setContent('{black-bg}{/}');
                            this.gridboxes[idx][i][j*2+1].setContent('{black-bg}{/}');
                            this.gridboxes[idx][i][j*2].style.transparent = true;
                            this.gridboxes[idx][i][j*2+1].style.transparent = true;
                        } else {
                            let c = ['magenta', 'blue', 'red', 'green', 'yellow', 'cyan'];
                            let gvh = (gv&0xF0)>>4;
                            this.gridboxes[idx][i][j*2].setContent('{'+c[gv%100%c.length]+'-bg}'+gvh+'{/}');
                            this.gridboxes[idx][i][j*2+1].setContent('{'+c[gv%100%c.length]+'-bg}`{/}');
                            this.gridboxes[idx][i][j*2].style.transparent = false;
                            this.gridboxes[idx][i][j*2+1].style.transparent = false;
                        }
                    }
                }
            }
        }

        draw() {
            this.drawTitle();
            this.drawLogo();
            this.drawBack();
            this.redrawGrid();
            let nb = (<tge.TermRun>tge.env);
            nb.tscreen.render();
        }
    }
}
