namespace Obj3d {
    export function main(runtype: string) {
        tge.initEnvironment(runtype);
        tge.bindLogPath('tmp/obj3d.log', tge.LogLevel.INFO);
        let m = new Obj3d.Model();
        let r = new Obj3d.WebGlRender();
        let g = new Obj3d.Game(m, r);
        g.initGame();
        g.regKeyAction({'r':'R'});
        g.loop();
    }
    if((typeof window) !== 'undefined') {
        //browser...
        window.onload = () => { 
            let rm = (<any>window).run_mode;
            if(rm !== undefined) {
                main(rm); 
            }
        }
    } else {
        tge.info("Must in web...");
    }
}

