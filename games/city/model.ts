namespace City {
    export interface Cell {
        id: number;
        fromid: number;
        toid: number;
        color: number;
        level: number;
        fromlevel: number;
        tolevel: number;
    }
    export interface Unit {
        id: number;
        cells: {[key: number]: any};
    }
    export interface Merge {
        objCell: Cell;
        mergeCells: Cell[];
    }
    export class Model extends tge.Model {
        static cityw:number = 5;
        static cityh:number = 5;
        static citycolor:number = 4;

        unit_map: { [key: number]: Unit} = {};
        units: {[key: number]: Unit} = {};
        grid: Cell[][];
        merges: Merge;

        constructor() {
            super();
            tge.srand(8);
            this.grid = [];
            for(let i=0; i<Model.cityh; i++) {
                this.grid[i]=[];
                for(let j=0; j<Model.cityw; j++)
                    this.grid[i][j]={
                        id: i*Model.cityw+j,
                        fromid: 0, toid: 0,
                        color: (Math.floor((tge.rand()%(Model.citycolor-1))+1)),
                        level: 0, fromlevel: 0, tolevel: 0
                    };
            }
            this.merges = {objCell: this.grid[0][0], mergeCells:[]};
        }

        debug = function(...arg: any[]) {
            let util = require('util');
            process.stdout.write(util.format.apply(null, arguments));
        }

        dumpGrid() {
            for(let i=0; i<Model.cityh; i++) {
                for(let j=0; j<Model.cityw; j++) {
                    let c = this.grid[i][j];
                    let ids = c.id<10?'0'+c.id:c.id;
                    this.debug('|', ids, c.color, c.fromid, c.toid, c.level, '|    ');
                }
                process.stdout.write('\n');
            }
        }

        checkLianTong(x:number, y:number, color:number, u:Unit) {
            if(x<0 || y<0 || x>=Model.cityw || y>=Model.cityh)
                return;
            let c = this.grid[y][x];
            if(c.color == color) {
                this.unit_map[c.id] = u;
                u.cells[c.id] = c.id;
            }
        }

        getUnit(x:number, y:number, color:number) {
            if(x<0 || y<0 || x>=Model.cityw || y>=Model.cityh)
                return null;
            let c = this.grid[y][x];
            if(c.color == color) {
                if(c.id in this.unit_map)
                    return this.unit_map[c.id];
            }
            return null;
        }

        checkBorder(x:number, y:number, u:Unit) {
            if(x<0 || y<0 || x>=Model.cityw || y>=Model.cityh)
                return true;
            return !((''+(y*Model.cityw+x)) in u.cells);
        }

        merge(id:number) {
            let x = id % Model.cityw;
            let y = Math.floor(id / Model.cityw);
            let u = this.unit_map[id];
            let c = this.grid[y][x];
            let ret:Merge= {objCell:c, mergeCells:[]};
            if(Object.keys(u.cells).length==1) {
                this.merges = ret;
                return false;
            }
            for(let cid in u.cells) {
                let cx = parseInt(cid) % Model.cityw;
                let cy = Math.floor(parseInt(cid) / Model.cityw);
                let cc = this.grid[cy][cx];
                if(parseInt(cid) == id) continue;
                ret.mergeCells.push(cc);
                cc.fromid = parseInt(cid);
                cc.toid = id;
            }
            this.merges = ret;
            return true;
        }

        postMerge() {
            let c = this.merges.objCell;
            let ms = this.merges.mergeCells;
            for(let cc of ms) {
                c.level += cc.level;
                cc.color = -1;
            }
        }

        drop() {
            for(let x=0; x<Model.cityw; x++) {
                let holes=[], blocks=[];
                //count holes...
                for(let y=0; y<Model.cityh; y++) {
                    let c = this.grid[y][x];
                    if(c.color==-1)
                        holes.push(c);
                }
                if(holes.length==0) continue;
                //set blocks...
                for(let y=0; y<Model.cityh-1; y++) {
                    let c = this.grid[y][x];
                    if(c.color==-1) continue;
                    let dropcnt = 0;
                    for(let n=y+1; n<Model.cityh; n++) {
                        let cc = this.grid[n][x];
                        if(cc.color==-1) dropcnt++;
                    }
                    c.fromid = c.id;
                    c.toid = c.id+dropcnt*Model.cityw;
                    blocks.push(c);
                }
                //set new block(reuse hole)...
                for(let i=0; i<holes.length; i++) {
                    let h = holes[i];
                    h.color = (Math.floor((tge.rand()%Model.citycolor)+1));
                    h.fromid = (i-holes.length)*Model.cityw+x;
                    h.toid = i*Model.cityw+x;
                    h.id = h.toid;
                    this.grid[i][x]=h;
                    this.grid[i][x].id = i*Model.cityw + x;
                }
                for(let i=0; i<blocks.length; i++) {
                    let h = this.grid[i+holes.length][x];
                    this.grid[i+holes.length][x] = blocks[i];
                    this.grid[i+holes.length][x].id = (i+holes.length)*Model.cityw + x;
                }
            }
        }

        searchUnit() {
            for(let i=0; i<Model.cityh; i++) {
                for(let j=0; j<Model.cityw; j++) {
                    let c = this.grid[i][j];
                    let cur_unit = null;
                    let x = c.id % Model.cityw;
                    let y = Math.floor(c.id / Model.cityw);
                    let dd = [
                        [0, -1], //up
                        [0, 1],  //down
                        [-1, 0], //left
                        [1, 0]   //right
                    ];
                    for(let n=0; n<4; n++) {
                        let u = this.getUnit(x+dd[n][0], y+dd[n][1], c.color);
                        if(u!=null) {
                            cur_unit = u;
                            break;
                        }
                    }
                    if(cur_unit == null) {
                        cur_unit = <Unit> {
                            id: c.id,
                            cells:{}
                        };
                        cur_unit.cells[c.id] = c.id;
                        this.unit_map[c.id] = cur_unit;
                    }
                    for(let n=0; n<4; n++)
                        this.checkLianTong(x+dd[n][0], y+dd[n][1], c.color, cur_unit);
                }
            }
            for(let o in this.unit_map) {
                let uid = this.unit_map[o].id;
                if(!(uid in this.units)) {
                    this.units[uid] = this.unit_map[o];
                }
            }
            for(let i in this.units) {
                let cs = this.units[i];
                for(let j in cs.cells) {
                    let jd = parseInt(j);
                    let x = jd % Model.cityw;
                    let y = Math.floor(jd / Model.cityw);
                    let dd = [
                        [0, -1], //up
                        [0, 1],  //down
                        [-1, 0], //left
                        [1, 0]   //right
                    ];
                    let nd = [8, 4, 2, 1];
                    let r = 0;
                    for(let n=0; n<4; n++) {
                        if(this.checkBorder(x+dd[n][0], y+dd[n][1], cs))
                            r+=nd[n];
                    }
                    cs.cells[j] = r;
                }
            }
            tge.log(tge.LogLevel.DEBUG, this.unit_map, this.units);
        }
    }
}
