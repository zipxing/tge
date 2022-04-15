import * as tge from "../../engine"
import { Game } from "./game"
import { Model } from "./model"
import { TermRender } from "./render"

export function main(runtype: string) {
    tge.initEnvironment(runtype);
    tge.bindLogPath('tmp/tower.log');
    let m = new Model();
    let r = new TermRender();
    let g = new Game(m, r);
    g.initGame();
    g.regKeyAction({
        'i':'W', 'k':'S', 'j':'A', 'l':'D', 'r':'R'});
    g.loop();
}
if((typeof window) !== 'undefined') {
    //browser term...
    window.onload = () => { main("WEBTERM"); }
} else {
    main("TERM");
}
