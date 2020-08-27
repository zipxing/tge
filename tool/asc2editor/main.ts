tge.initEnvironment("TERM");
tge.bindLogPath('tmp/ascii.log');

let am = new AscIIEditor.Model();
let ar = new AscIIEditor.TermRender();
let ag = new AscIIEditor.Game(am, ar);

tge.log(tge.LogLevel.DEBUG, "Welcome to AscIIEditor, powered by TGE.");

if(process.argv.length==3) {
    ag.setAsciiArtFile(process.argv[2]);
}
ag.initGame();
ag.regKeyAction({'s':'SAVE'});
ag.loop();

