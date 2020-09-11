namespace Tetris {
    export class TermRender extends tge.Render {
        titlebox: any;
        logobox: any;
        backbox: any;
        helpbox: any;
        gamebox: any;
        gridboxes: any[2][][];
        msgbox: any;

        constructor() {
            super();

            tge.AscIIManager.loadArtFile("ascii_art/tge.txt", "tgelogo");
            tge.AscIIManager.loadArtFile("ascii_art/tetris2.txt", "tetrislogo");
            tge.AscIIManager.loadArtFile("ascii_art/tetris_back.txt", "tback");
            tge.AscIIManager.loadArtFile("ascii_art/tetris_help.txt", "thelp");

            let nb = (<tge.TermRun>tge.env);

            this.titlebox = nb.blessed.box({
                width:50,
                height:5,
                top:0,
                left:22,
                tags:true
            });
            nb.tscreen.append(this.titlebox);

            this.gamebox = nb.blessed.box({
                width:Tetris.HENG*9-6,
                height:Tetris.ZONG+6,
                top:5,
                left:0,
                border:{type:'line', fg:22},
                tags:true
            });
            nb.tscreen.append(this.gamebox);

            this.backbox = nb.blessed.box({
                width:Tetris.HENG*9-10,
                height: Tetris.ZONG+2,
                top: 5+2,
                left: 2+1,
                tags:true
            });
            nb.tscreen.append(this.backbox);

            this.helpbox = nb.blessed.box({
                width: Tetris.HENG*8,
                height: 1,
                top: Tetris.ZONG+5+6,
                left: 3,
                tags: true
            });
            nb.tscreen.append(this.helpbox);

            this.gridboxes=[[],[]];
            for(let idx=0; idx<=1; idx++) {
                for(let i=0; i<ZONG; i++) 
                    this.gridboxes[idx][i]=new Array(HENG*2);
                for(let i=0; i<ZONG; i++) {
                    for(var j=0;j<HENG;j++) {
                        this.gridboxes[idx][i][j*2]=nb.blessed.box({
                            width:1,
                            height:1,
                            top:i+6+2,
                            left:j*2+idx*53+4+1,
                            tags:true
                        });
                        this.gridboxes[idx][i][j*2+1]=nb.blessed.box({
                            width:1,
                            height:1,
                            top:i+6+2,
                            left:j*2+1+idx*53+4+1,
                            tags:true
                        });
                        nb.tscreen.append(this.gridboxes[idx][i][j*2]);
                        nb.tscreen.append(this.gridboxes[idx][i][j*2+1]);
                    }
                }
            }

            this.logobox = nb.blessed.box({
                width:12,
                height:5,
                top:25,
                left:30+7,
                tags:true
            });
            nb.tscreen.append(this.logobox);


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
            this.titlebox.setContent(`${s[0]}\n${s[1]}\n${s[2]}\n${s[3]}\n${s[4]}`);
        }

        drawLogo() {
            let s = tge.AscIIManager.getArt("tgelogo").blessed_lines;
            this.logobox.setContent(`${s[0]}\n${s[1]}\n${s[2]}\n${s[3]}`);
        }

        drawBack() {
            let s = tge.AscIIManager.getArt("tback").blessed_lines;
            this.backbox.setContent(s.join('\n'));
            let h = tge.AscIIManager.getArt("thelp").blessed_lines;
            this.helpbox.setContent(`${h[0]}`);
        }

        redrawMsg() {
            let msg:string[] =['Press {green-fg}q{/} quit...',
                'Game over,press {green-fg}r{/} restart...',
                'Game over,press {green-fg}r{/} restart...'];
            //this.msgbox.setContent(msg[g.gameover]);
        }

        setCell(idx:number, i:number, j:number, c:number) {
            let g1 = this.gridboxes[idx][i][j*2];
            let g2 = this.gridboxes[idx][i][j*2+1];
            let fgs = [14, 201, 49, 33, 227, 196]
            g1.style.transparent = false;
            g2.style.transparent = false;
            switch(c) {
                case 0: //空白
                    g1.setContent('{black-bg}{/}');
                    g2.setContent('{black-bg}{/}');
                    g1.style.transparent = true;
                    g2.style.transparent = true;
                    break;
                case 11: //被攻击出来的
                    g1.setContent('{240-fg}{0-bg}█{/}');
                    g2.setContent('{240-fg}{0-bg}█{/}');
                    break;
                case 20: //投影
                    g1.setContent('{242-fg}{0-bg}░{/}');
                    g2.setContent('{242-fg}{0-bg}░{/}');
                    break;
                case 30: //满行闪烁
                    g1.setContent('{30-fg}{0-bg}-{/}');
                    g2.setContent('{30-fg}{0-bg}={/}');
                    break;
                default: //正常方块
                    g1.setContent(`{${fgs[c%fgs.length]}-fg}{0-bg}[{/}`);
                    g2.setContent(`{${fgs[c%fgs.length]}-fg}{0-bg}]{/}`);
            }
        }

        redrawGrid() {
            let g = TermRender.game;
            let m = <Tetris.Model>g.model;
            for(let idx=0; idx<=1; idx++) {
                let gr = m.grids[idx];
                let frs = tge.Timer.getStage(idx+"clear-row");
                let fr = tge.Timer.getExData(idx+"clear-row");
                if(frs==0) {
                    if(gr.need_draw)
                        gr.need_draw = false;
                    else {
                        //tge.log(tge.LogLevel.DEBUG, "skip not need draw...");
                        continue;
                    }
                } else {
                    //tge.log(tge.LogLevel.DEBUG, "FFFF", frs);
                    //tge.log(tge.LogLevel.DEBUG, "FFFF", fr);
                }
                for(let i=0;i<ZONG;i++) {
                    for(let j=0;j<HENG;j++) {
                        let gv = gr.core.grid[i*GRIDW + j+2];
                        let hidden_fullrow = false;
                        if(frs!=undefined && frs!=0) {
                            if(fr.indexOf(i)!=-1 && (Math.floor(frs/3)%2==0))
                                hidden_fullrow = true;
                        }
                        //let hidden_fullrow = fr.indexOf(i)!=-1 && frs && frs%10==0;
                        if(gv==0) {
                            this.setCell(idx, i, j, 0);
                        } else {
                            if(hidden_fullrow) 
                                this.setCell(idx, i, j, 30);
                            else
                                this.setCell(idx, i, j, gv%100);
                        }
                    }
                }
                let md = gr.block_data;
                for(let i=0; i<4; i++) {
                    for(let j=0; j<4; j++) {
                        let ttx = gr.core.tdx+j;
                        let tty = gr.core.tdy+i;
                        if (gr.isInGrid(tty, ttx)) {
                            if(md[gr.core.cur_block][gr.core.cur_z][i*4+j]!=0) {
                                let g1=this.gridboxes[idx][tty][ttx*2-4];
                                let g2=this.gridboxes[idx][tty][ttx*2+1-4];
                                if(g1 && g2) {
                                    this.setCell(idx, tty, ttx-2, 20);
                                }
                            }
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
