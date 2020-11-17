//Main entry...
namespace Tetris {
    export function main(runtype: string) {
        tge.initEnvironment(runtype);
        tge.bindLogPath('tmp/tetris.log', tge.LogLevel.INFO);

        let m1 = new Tetris.Model();
        let r1: tge.Render;
        if(runtype == "TERM")
            r1 = new Tetris.TermRender();
        else
            r1 = new Tetris.WebGlRender();
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
    }

    if((typeof window) !== 'undefined') {
        //browser term...
        window.onload = () => { main("WEB"); }
    } else {
        main("TERM");
    }
}
