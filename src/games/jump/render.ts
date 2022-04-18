import * as tge from "../../engine"
import { Model } from "./model"
import { Game } from "./game"

export class TermRender extends tge.Render {
    logobox: any;
    carboxes: any[];

    constructor() {
        super();

        tge.AscIIManager.loadArtFile("ascii_art/tge.txt", "tgelogo");
        tge.AscIIManager.loadArtFile("ascii_art/jump1.txt", "car1");
        tge.AscIIManager.loadArtFile("ascii_art/jump2.txt", "car2");
        tge.AscIIManager.loadArtFile("ascii_art/jump3.txt", "car3");
        tge.AscIIManager.loadArtFile("ascii_art/jump4.txt", "car4");

        let nb = (<tge.TermRun>tge.env);

        this.logobox = this.addBox(12, 4, 1, Model.gamew+16);

        this.carboxes = [];
        for(let i=0; i<4; i++) {
            this.carboxes[i] = this.addBox(Model.carw, Model.carh, 
                20+4, 3 + i * Model.carw);
            let bls = tge.AscIIManager.getArt("car"+(i+1)).blessed_lines;
            this.carboxes[i].setContent(bls.join('\n'));
        }
    }

    drawLogo() {
        let s = tge.AscIIManager.getArt("tgelogo").blessed_lines;
        this.logobox.setContent(s.join('\n'));
    }

    redrawCar() {
        let g = TermRender.game;
        let m = <Model>g.model;
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
