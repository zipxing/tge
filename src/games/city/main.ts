import * as tge from "../../engine"
import { Model } from "./model"
import { TermRender } from "./render"
import { Game } from "./game"

export function main(runtype: string) {
    tge.initEnvironment(runtype);
    tge.bindLogPath('tmp/city.log');
    let m = new Model();
    let r = new TermRender();
    let g = new Game(m, r);
    g.initGame();
    g.regKeyAction({'r':'R'});
    g.loop();
}
if((typeof window) !== 'undefined') {
    //browser term...
    window.onload = () => { main("WEBTERM"); }
} else {
    main("TERM");
}
