import * as tge from "../../engine"
import { Model, Pen } from "./model"
import { Game } from "./game"
import { TermRender } from "./render"

tge.initEnvironment("TERM");
tge.bindLogPath('tmp/ascii.log');

let am = new Model();
let ar = new TermRender();
let ag = new Game(am, ar);

tge.debug("Welcome to AscIIEditor, powered by TGE.");

if(process.argv.length==3) {
    ag.setAsciiArtFile(process.argv[2]);
}
ag.initGame();
ag.regKeyAction({'s':'SAVE'});
ag.loop();

