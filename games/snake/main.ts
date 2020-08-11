nge.initMode("TERM");
let m = new Snake.Model();
let r = new Snake.TermRender();
let g = new Snake.Game(m, r);
g.initGame();
g.regKeyAction({'up':'W', 'down':'S', 'left':'A', 'right':'D', 'r':'R'});
g.loop();
