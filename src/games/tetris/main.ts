import * as tge from "../../engine"
import { Model } from "./model"
import { Game } from "./game"
import { TermRender } from "./render"
import { WebGlRender } from "./render_webgl"

//Main entry...
export function main(runtype: string) {
    tge.initEnvironment(runtype);
    tge.bindLogPath('tmp/tetris.log', tge.LogLevel.INFO);
    //tge.bindLogPath(tge.STDOUT, tge.LogLevel.INFO);

    let m1 = new Model();
    let r1: tge.Render;
    if(runtype == "TERM" || runtype == "WEBTERM")
        r1 = new TermRender();
    else
        r1 = new WebGlRender();
    let g1 = new Game(m1, r1);

    g1.initGame();
    g1.regKeyAction({
        'i':'T',
        'k':'D',
        'j':'L',
        'l':'R',
        'r':'I',
        'space':'W',
        's':'S'
    });
    g1.loop();
}

if((typeof window) !== 'undefined') {
    //browser...
    window.onload = () => { 
        let rm = (<any>window).run_mode;
        if(rm !== undefined) {
            main(rm); 
        }
    }
} else {
    main("TERM");
}
