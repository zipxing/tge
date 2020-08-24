tge.initEnvironment("TERM");
let m1 = new AscIIEditor.Model();
let r1 = new AscIIEditor.TermRender();
let g1 = new AscIIEditor.Game(m1, r1);
g1.initGame();
g1.regKeyAction({'s':'S'});
g1.loop();
