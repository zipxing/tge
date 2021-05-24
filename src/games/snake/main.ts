import * as tge from "../../engine/tge"
import * as log from "../../engine/log"
import { Model } from "./model"
import { Game } from "./game"
import { TermRender } from "./render"

export function main(runtype: string) {
    tge.initEnvironment(runtype);
    log.bindLogPath('tmp/snake.log');
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
