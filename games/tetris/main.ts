//Main entry...
tge.initEnvironment("TERM");
tge.bindLogPath('tmp/tetris.log');

let m1 = new Tetris.Model();
let r1 = new Tetris.TermRender();
let g1 = new Tetris.Game(m1, r1);

g1.initGame();
g1.regKeyAction({
    'up':'T',
    'down':'D',
    'left':'L',
    'right':'R',
    'space':'W',
    's':'S'
});
g1.loop();
