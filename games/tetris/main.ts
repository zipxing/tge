//Main entry...
tge.initEnvironment("TERM");
tge.bindLogPath('tmp/tetris.log');
let m1 = new Tetris.Model();
let r1 = new Tetris.TermRender();
let g1 = new Tetris.Game(m1, r1);
//game.initGame(ELS_MODE_NET,0,REPSEED);
//game.model.mconf.isreplay=true;
//g1.initGame(ELS_MODE_AI, process.argv[2], process.argv[3]);
g1.initGame();
g1.regKeyAction({'up':'T', 'down':'D', 'left':'L', 'right':'R', 'space':'W'});
g1.loop();
