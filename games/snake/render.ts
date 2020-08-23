namespace Snake {
    export class TermRender extends tge.Render {
        titlebox: any;
        logobox: any;
        gamebox: any;
        gridboxes: any[][];
        msgbox: any;

        constructor() {
            super();
            let nb = (<tge.TermRun>tge.env);

            this.titlebox = nb.blessed.box({
                width:Model.snakew+2,
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
                left:Model.snakew+16,
                tags:true
            });
            nb.tscreen.append(this.logobox);

            this.gamebox = nb.blessed.box({
                width:Model.snakew+2,
                height:Model.snakeh+2,
                top:4,
                left:0,
                border:{type:'line'},
                tags:true
            });
            nb.tscreen.append(this.gamebox);

            this.gridboxes=[];
            for(let i=0;i<Model.snakeh;i++) {
                this.gridboxes[i]=[];
                for(let j=0;j<Model.snakew;j++) {
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
                height:Model.snakeh+2,
                top:4,
                left:Model.snakew+3,
                border:{type:'line'},
                tags:true
            });
            nb.tscreen.append(this.msgbox);

            tge.Emitter.register("Snake.REDRAW_MSG", this.redrawMsg, this);
            tge.Emitter.register("Snake.REDRAW_GRID", this.redrawGrid, this);
            tge.Timer.register("Snake.Timer.Title", 1.0, ()=>{
                tge.Timer.fire("Snake.Timer.Title", 0);
            });
            tge.Timer.fire("Snake.Timer.Title", 0);
        }

        drawTitle() {
            let s1="   ____          __      ";
            let s2="  / __/__  ___ _/ /_____ ";
            let s3=" _\\ \\/ _ \\/ _ \`/  '_/ -_)";
            let s4="/___/_//_/\\_,_/_/\\_\\\\__/ ";
            let st = tge.Timer.getStage("Snake.Timer.Title");
            this.titlebox.setContent(`${s1}\n${s2}\n${s3}\n${s4}`);
        }

        drawLogo() {
            let s1="PoweredBy";
            let s2="╔╦╗╔═╗╔═╗";
            let s3=" ║ ║ ╦║╣ ";
            let s4=" ╩ ╚═╝╚═╝";
            this.logobox.setContent(`${s1}\n${s2}\n${s3}\n${s4}`);
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
            //let c = ['magenta', 'blue', 'red', 'green', 'yellow', 'cyan'];
            let c = [27, 33, 39, 45, 51, 50, 44, 38, 32, 26,
                     128, 134, 140, 146, 152, 147, 141, 135, 129];
            let g = TermRender.game;
            let m = <Snake.Model>g.model;

            for(let i=0;i<Model.snakeh;i++) {
                for(let j=0;j<Model.snakew;j++) {
                    let gv = m.grid[i][j];
                    let gb = this.gridboxes[i][j];
                    switch(gv) {
                        case 0:
                            if(g.gameover==Snake.GameState.Ok) 
                                this.setPoint256(gb, 0, 15, " ");
                            else
                                this.setPoint256(gb, 239, 15, " ");
                            break;
                        case 10000:
                            break;
                        default:
                            if(g.gameover==Snake.GameState.Ok) {
                                if(gv==1)
                                    this.setPoint256(gb, 0, 196, "█");
                                else
                                    this.setPoint256(gb, 0, c[gv%c.length], "▒");
                            }
                            else
                                this.setPoint256(gb, 15, c[gv%c.length], "█");
                    }
                }
            }
        }

        drawSeed() {
            let g = TermRender.game;
            let m = <Snake.Model>g.model;
            let gb = this.gridboxes[m.seed.y][m.seed.x];
            let tc = 18 + Math.floor((g.stage / 2)) % 212;
            if(g.gameover==Snake.GameState.Ok) 
                this.setPoint256(gb, 0, tc, "∙");
            else
                this.setPoint256(gb, 239, 203, "∙");
        }

        draw() {
            this.drawTitle();
            this.drawLogo();
            this.drawSeed();
            let nb = (<tge.TermRun>tge.env);
            nb.tscreen.render();
        }
    }
}
