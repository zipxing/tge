namespace Tetris {
    export class TermRender extends tge.Render {
        titlebox: any;
        logobox: any;
        gamebox: any;
        gridboxes: any[][];
        msgbox: any;

        constructor() {
            super();

            tge.AscIIManager.loadArtFile("ascii_art/tge.txt", "tgelogo");
            tge.AscIIManager.loadArtFile("ascii_art/tetris2.txt", "tetrislogo");

            let nb = (<tge.TermRun>tge.env);

            this.titlebox = nb.blessed.box({
                width:Tetris.HENG+2,
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
                left:Tetris.HENG+16,
                tags:true
            });
            nb.tscreen.append(this.logobox);

            this.gamebox = nb.blessed.box({
                width:Tetris.HENG+2,
                height:Tetris.HENG+2,
                top:4,
                left:0,
                border:{type:'line', fg:238},
                tags:true
            });
            nb.tscreen.append(this.gamebox);

            this.gridboxes=[];
            for(let i=0;i<Tetris.HENG;i++) {
                this.gridboxes[i]=[];
                for(let j=0;j<Tetris.HENG;j++) {
                    this.gridboxes[i][j]=nb.blessed.box({
                        width:1,
                        height:1,
                        top:i+5,
                        left:j+1,
                        tags:true
                    });
                    nb.tscreen.append(this.gridboxes[i][j]);
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
            nb.tscreen.append(this.msgbox);

            /*tge.Emitter.register("Snake.REDRAW_MSG", this.redrawMsg, this);
            tge.Emitter.register("Snake.REDRAW_GRID", this.redrawGrid, this);
            tge.Timer.register("Snake.Timer.Title", 1.0, ()=>{
                tge.Timer.fire("Snake.Timer.Title", 0);
            });
            tge.Timer.fire("Snake.Timer.Title", 0);*/
        }

        drawTitle() {
            let s = tge.AscIIManager.getArt("tetrislogo").blessed_lines;
            //let st = tge.Timer.getStage("Snake.Timer.Title");
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
            this.msgbox.setContent(msg[g.gameover]);
        }

        setPoint(box: any, bg:string, fg:string, cchar:string) {
            box.setContent(`{${bg}-bg}{${fg}-fg}${cchar}{/}`);
        }

        setPoint256(box: any, bg:number, fg:number, cchar:string) {
            box.setContent(`{${bg}-bg}{${fg}-fg}${cchar}{/}`);
        }

        redrawGrid() {
        }

        draw() {
            this.drawTitle();
            this.drawLogo();
            let nb = (<tge.TermRun>tge.env);
            nb.tscreen.render();
        }
    }
}
