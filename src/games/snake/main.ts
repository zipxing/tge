namespace Snake {
    export function main(runtype: string) {
        tge.initEnvironment(runtype);
        tge.bindLogPath('tmp/snake.log');
        let m = new Snake.Model();
        let r = new Snake.TermRender();
        let g = new Snake.Game(m, r);
        g.initGame();
        g.regKeyAction({
            'i':'W', 'k':'S', 'j':'A', 'l':'D', 'r':'R'});
        g.loop();
    }
    if((typeof window) !== 'undefined') {
        //browser term...
        window.onload = () => { main("WEBTERM"); }
    } else {
        main("TERM");
    }
}
