namespace Tetris {
    export class TermRender extends tge.Render {
        titlebox: any;
        logobox: any;
        backbox: any;
        helpbox: any;
        gamebox: any;
        gridboxes: any[2][][];
        nextbox: any;
        nextboxes: any[4][8];
        holdbox: any;
        holdboxes: any[4][8];
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
            this.holdbox = nb.blessed.box({
                width:10,
                height:6,
                top:8,
                left:43,
                border:{type:'line', fg:238},
                label:{text:'hold',side:'left'},
                tags:true
            });
            nb.tscreen.append(this.holdbox);

            this.holdboxes=[];
            for(let i=0; i<4; i++) {
                this.holdboxes[i] = new Array(4);
                for(let j=0; j<4; j++) {
                    this.holdboxes[i][j*2] = nb.blessed.box({
                        width:1,
                        height:1,
                        top:i+8+1,
                        left:j*2+1+43,
                        tags:true
                    });
                    this.holdboxes[i][j*2+1] = nb.blessed.box({
                        width:1,
                        height:1,
                        top:i+8+1,
                        left:j*2+1+1+43,
                        tags:true
                    });
                    nb.tscreen.append(this.holdboxes[i][j*2]);
                    nb.tscreen.append(this.holdboxes[i][j*2+1]);
                }
            }

            this.nextbox = nb.blessed.box({
                width:10,
                height:6,
                top:8,
                left:30,
                border:{type:'line', fg:238},
                label:{text:'next',side:'left'},
                tags:true
            });
            nb.tscreen.append(this.nextbox);

            this.nextboxes=[];
            for(let i=0; i<4; i++) {
                this.nextboxes[i] = new Array(4);
                for(let j=0; j<4; j++) {
                    this.nextboxes[i][j*2] = nb.blessed.box({
                        width:1,
                        height:1,
                        top:i+8+1,
                        left:j*2+1+30,
                        tags:true
                    });
                    this.nextboxes[i][j*2+1] = nb.blessed.box({
                        width:1,
                        height:1,
                        top:i+8+1,
                        left:j*2+1+1+30,
                        tags:true
                    });
                    nb.tscreen.append(this.nextboxes[i][j*2]);
                    nb.tscreen.append(this.nextboxes[i][j*2+1]);
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
                height:11,
                top:14,
                left:30,
                border:{type:'line', fg:238},
                align:'center',
                //label:{text:"Message", side:"left"},
                tags:true
            });
            nb.tscreen.append(this.msgbox);

            tge.Emitter.register("Tetris.REDRAW_MSG", this.redrawMsg, this);
            tge.Emitter.register("Tetris.REDRAW_NEXT", this.redrawNext, this);
            tge.Emitter.register("Tetris.REDRAW_HOLD", this.redrawHold, this);

            this.drawTitle();
            this.drawLogo();
            this.drawBack();
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
            let msg:string[] =[
                'Come on human, defeat the AI!',
                'YOU WIN\npress {green-fg}r{/} restart...',
                'GAME OVER\npress {green-fg}r{/} restart...'];
            let g = TermRender.game;
            let m = <Tetris.Model>g.model;
            let c1 = m.grids[0].core.game_over;
            let c2 = m.grids[1].core.game_over;
            if(!c1 && !c2) this.msgbox.setContent(msg[0]);
            if(!c1 && c2) this.msgbox.setContent(msg[1]);
            if(c1 && !c2) this.msgbox.setContent(msg[2]);
        }

        redrawNext() {
            let g = TermRender.game;
            let m = <Tetris.Model>g.model;
            let gr = m.grids[0];
            let md = gr.block_data;
            for(let i=0; i<4; i++) {
                for(let j=0; j<4; j++) {
                    let g1=this.nextboxes[i][j*2];
                    let g2=this.nextboxes[i][j*2+1];
                    if(md[gr.core.next_block][0][i*4+j]!=0) {
                        this.setCellBasic(g1, g2, gr.core.next_block+1);
                    } else {
                        this.setCellBasic(g1, g2, 0);
                    }
                }
            }
        }

        redrawHold() {
            let g = TermRender.game;
            let m = <Tetris.Model>g.model;
            let gr = m.grids[0];
            let md = gr.block_data;
            for(let i=0; i<4; i++) {
                for(let j=0; j<4; j++) {
                    let g1=this.holdboxes[i][j*2];
                    let g2=this.holdboxes[i][j*2+1];
                    if(md[gr.core.save_block][0][i*4+j]!=0) {
                        this.setCellBasic(g1, g2, gr.core.save_block+1);
                    } else {
                        this.setCellBasic(g1, g2, 0);
                    }
                }
            }
        }

        setCellBasic(g1:any, g2:any, c: number) {
            let fgs = [14, 201, 49, 33, 227, 196];
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
                    g1.setContent('{231-fg}{0-bg}-{/}');
                    g2.setContent('{231-fg}{0-bg}={/}');
                    break;
                default: //正常方块
                    g1.setContent(`{${fgs[c%fgs.length]}-fg}{0-bg}[{/}`);
                    g2.setContent(`{${fgs[c%fgs.length]}-fg}{0-bg}]{/}`);
            }
        }

        setCell(idx:number, i:number, j:number, c:number) {
            let g1 = this.gridboxes[idx][i][j*2];
            let g2 = this.gridboxes[idx][i][j*2+1];
            this.setCellBasic(g1, g2, c);
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
            this.redrawGrid();
            let nb = (<tge.TermRun>tge.env);
            nb.tscreen.render();
        }
    }
}
