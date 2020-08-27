tge.initEnvironment("TERM");
let am = new AscIIEditor.Model();
let ar = new AscIIEditor.TermRender();
let ag = new AscIIEditor.Game(am, ar);
tge.bindLogPath('tmp/asciiedit.log');
tge.log(tge.LogLevel.DEBUG, 111, "aaa", 222);
if(process.argv.length==3) {
    ag.setAsciiArtFile(process.argv[2]);
}
ag.initGame();
ag.regKeyAction({'s':'SAVE'});
ag.loop();

