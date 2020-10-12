namespace City {
    export function main(runtype: string) {
        tge.initEnvironment(runtype);
        tge.bindLogPath('tmp/city.log');
        let m = new City.Model();
        let r = new City.TermRender();
        let g = new City.Game(m, r);
        g.initGame();
        g.regKeyAction({'r':'R'});
        g.loop();
        /*
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
        m.dumpGrid();*/
    }
    if((typeof window) !== 'undefined') {
        //browser term...
        window.onload = () => { main("WEBTERM"); }
    } else {
        main("TERM");
    }
}
