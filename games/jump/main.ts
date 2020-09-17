namespace Jump {
    export function main(runtype: string) {
        tge.initEnvironment(runtype);
        tge.bindLogPath('tmp/jump.log');
        let m = new Jump.Model();
        let r = new Jump.TermRender();
        let g = new Jump.Game(m, r);
        g.initGame();
        g.regKeyAction({
            'space':'W', 
            'r':'R'
        });
        g.loop();
    }
    if((typeof window) !== 'undefined') {
        //browser term...
        window.onload = () => { main("WEBTERM"); }
    } else {
        main("TERM");
    }
}
