tge.initEnvironment("TERM");
let am = new AscIIEditor.Model();
let ar = new AscIIEditor.TermRender();
let ag = new AscIIEditor.Game(am, ar);
if(process.argv.length==3) {
    ag.setAsciiArtFile(process.argv[2]);
}
ag.initGame();
ag.regKeyAction({'s':'S'});
ag.loop();
