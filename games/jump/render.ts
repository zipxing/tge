namespace Jump {
    export class TermRender extends tge.Render {
        titlebox: any;
        logobox: any;
        //gamebox: any;
        carbox: any;
        //msgbox: any;

        constructor() {
            super();

            tge.AscIIManager.loadArtFile("ascii_art/tge.txt", "tgelogo");
            tge.AscIIManager.loadArtFile("ascii_art/jump.txt", "jump");

            let nb = (<tge.TermRun>tge.env);

            this.titlebox = nb.blessed.box({
                width:Model.gamew+2,
                height:6,
                top:0,
                left:3,
                tags:true
            });
            nb.tscreen.append(this.titlebox);

            this.logobox = nb.blessed.box({
                width:12,
                height:4,
                top:1,
                left:Model.gamew+16,
                tags:true
            });
            nb.tscreen.append(this.logobox);

            this.carbox = nb.blessed.box({
                width:Model.carw,
                height:Model.carh,
                top: 20 + 4,
                left: 3,
                border:{type:'line', fg:38},
            });
            nb.tscreen.append(this.carbox);

            /*this.msgbox = nb.blessed.box({
                width:23,
                height:Model.carh+2,
                top:4,
                left:Model.carw+3,
                border:{type:'line', fg:238},
                tags:true
            });
            nb.tscreen.append(this.msgbox);*/

            //tge.Emitter.register("Jump.REDRAW_MSG", this.redrawMsg, this);
        }

        drawTitle() {
            let s = tge.AscIIManager.getArt("jump").blessed_lines;
            //let st = tge.Timer.getStage("Jump.Timer.Title");
            this.titlebox.setContent(`${s[0]}\n${s[1]}\n${s[2]}\n${s[3]}\n${s[4]}\n${s[5]}`);
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
            //this.msgbox.setContent(msg[g.gameover]);
        }

        redrawCar() {
            let g = TermRender.game;
            let m = <Jump.Model>g.model;
            let s = m.car_pos;
            this.carbox.top = s.y;
        }

        draw() {
            this.drawTitle();
            this.drawLogo();
            this.redrawCar();
            let nb = (<tge.TermRun>tge.env);
            nb.tscreen.render();
        }
    }
}
