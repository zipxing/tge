namespace Simple3d {
    export function main(runtype: string) {
        tge.initEnvironment(runtype);
        tge.bindLogPath('tmp/simple3d.log');
        let m = new Simple3d.Model();
        let r = new Simple3d.WebGlRender();
        let g = new Simple3d.Game(m, r);
        let am = new tge3d.AssetManager();
        am.loadAsset(
            "../readme.md", 
            tge3d.AssetType.Text, 
            (asset: any) => {
                tge.log(tge.LogLevel.DEBUG, asset);
            }
        );
        g.initGame();
        g.regKeyAction({'r':'R'});
        g.loop();
    }
    if((typeof window) !== 'undefined') {
        //browser term...
        window.onload = () => { main("WEB"); }
    } else {
        tge.log(tge.LogLevel.INFO, "Must in web...");
    }
}

