namespace City {
    export function main(runtype: string) {
        /*tge.initEnvironment(runtype);
        tge.bindLogPath('tmp/snake.log');
        let m = new Snake.Model();
        let r = new Snake.TermRender();
        let g = new Snake.Game(m, r);
        g.initGame();
        g.regKeyAction({
            'i':'W', 'k':'S', 'j':'A', 'l':'D', 'r':'R'});
        g.loop();*/
        let m = new City.Model();
        m.searchUnit();
        console.log(m.unit_map);
        console.log("--------------");
        console.log(m.units);
        m.dumpGrid();
        console.log("merge.............");
        m.merge(7);
        m.dumpGrid();
        console.log("postMerge.........");
        m.postMerge();
        m.dumpGrid();
        console.log("drop.........");
        m.drop();
        m.dumpGrid();
    }
    if((typeof window) !== 'undefined') {
        //browser term...
        window.onload = () => { main("WEBTERM"); }
    } else {
        main("TERM");
    }
}
