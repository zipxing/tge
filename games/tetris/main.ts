//Main entry...
tge.initEnvironment("TERM");
tge.bindLogPath('tmp/tetris.log');

let m1 = new Tetris.Model();
let r1 = new Tetris.TermRender();
let g1 = new Tetris.Game(m1, r1);

g1.initGame();
g1.regKeyAction({
    'i':'T',
    'k':'D',
    'j':'L',
    'l':'R',
    'r':'I',
    'space':'W',
    's':'S'
});
g1.loop();
