namespace Jump {
    export class TermRender extends tge.Render {
        logobox: any;
        carboxes: any[];
        //msgbox: any;

        constructor() {
            super();

            tge.AscIIManager.loadArtFile("ascii_art/tge.txt", "tgelogo");
            tge.AscIIManager.loadArtFile("ascii_art/jump1.txt", "car1");
            tge.AscIIManager.loadArtFile("ascii_art/jump2.txt", "car2");
            tge.AscIIManager.loadArtFile("ascii_art/jump3.txt", "car3");
            tge.AscIIManager.loadArtFile("ascii_art/jump4.txt", "car4");

            let nb = (<tge.TermRun>tge.env);

            this.logobox = nb.blessed.box({
                width:12,
                height:4,
                top:1,
                left:Model.gamew+16,
                tags:true
            });
            nb.tscreen.append(this.logobox);

            this.carboxes = [];
            for(let i=0; i<4; i++) {
                this.carboxes[i] = nb.blessed.box({
                    width:Model.carw,
                    height:Model.carh,
                    top: 20 + 4,
                    left: 3+i*Model.carw,
                    tags:true
                });
                let bls = tge.AscIIManager.getArt("car"+(i+1)).blessed_lines;
                this.carboxes[i].setContent(bls.join('\n'));
                nb.tscreen.append(this.carboxes[i]);
            }

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

        drawLogo() {
            let s = tge.AscIIManager.getArt("tgelogo").blessed_lines;
            this.logobox.setContent(s.join('\n'));
        }

        redrawMsg() {
            let msg:string[] =['Press {green-fg}q{/} quit...',
                'Game over,press {green-fg}r{/} restart...',
                'Game over,press {green-fg}r{/} restart...'];
            let g = TermRender.game;
            //this.msgbox.setContent(msg[g.gamestate]);
        }

        redrawCar() {
            let g = TermRender.game;
            let m = <Jump.Model>g.model;
            let s = m.car_pos;
            for(let i=0; i<4; i++) {
                this.carboxes[i].top = s[i].y;
            }
        }

        draw() {
            this.drawLogo();
            this.redrawCar();
            let nb = (<tge.TermRun>tge.env);
            nb.tscreen.render();
        }
    }
}
