tge.initEnvironment("TERM");
let am = new AscIIEditor.Model();
let ar = new AscIIEditor.TermRender();
let ag = new AscIIEditor.Game(am, ar);
ag.initGame();
ag.regKeyAction({'s':'S'});
ag.loop();
