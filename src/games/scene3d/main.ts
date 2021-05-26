import * as tge from "../../engine"
import { Model } from "./model"
import { WebGlRender } from "./render"
import { Game } from "./game"
namespace Scene3d {
    export function main(runtype: string) {
        tge.initEnvironment(runtype);
        tge.bindLogPath('tmp/simple3d.log', tge.LogLevel.INFO);
        let m = new Model();
        let r = new WebGlRender();
        let g = new Game(m, r);
        g.initGame();
        g.regKeyAction({'r':'R'});
        g.loop();
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
        tge.info("Must in web...");
    }
}

