namespace Luoxuan {
    export function main(runtype: string) {
        tge.initEnvironment(runtype);
        tge.bindLogPath('tmp/luoxuan.log');
        let m = new Luoxuan.Model();
        let r = new Luoxuan.TermRender();
        let g = new Luoxuan.Game(m, r);
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
