namespace Scene3d {
    export function main(runtype: string) {
        tge.initEnvironment(runtype);
        tge.bindLogPath('tmp/simple3d.log', tge.LogLevel.INFO);
        let m = new Scene3d.Model();
        let r = new Scene3d.WebGlRender();
        let g = new Scene3d.Game(m, r);
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

