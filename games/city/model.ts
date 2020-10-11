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
        grid: Cell[][] = [];
        merges: Merge;

        constructor() {
            super();
            this.reset();
            this.merges = {objCell: this.grid[0][0], mergeCells:[]};
        }

        reset() {
            //tge.srand(new Date().valueOf());
            tge.srand(8);
            this.grid = [];
            for(let i=0; i<Model.cityh; i++) {
                this.grid[i]=[];
                for(let j=0; j<Model.cityw; j++)
                    this.grid[i][j]={
                        id: i*Model.cityw+j,
                        fromid: -1, toid: -1,
                        color: tge.rand() % (Model.citycolor-1) + 1,
                        level: tge.rand()%2, fromlevel: 0, tolevel: 0
                    };
            }
            this.merges = {objCell: this.grid[0][0], mergeCells:[]};
        }

        //debug...
        dumpGrid() {
            let dgs = '---------------DUMPGRID-----------------\n';
            for(let i=0; i<Model.cityh; i++) {
                for(let j=0; j<Model.cityw; j++) {
                    let c = this.grid[i][j];
                    let ids = c.id<10?'0'+c.id:c.id;
                    dgs+=('| '+ids+' '+c.color+' '+c.fromid+' '+c.toid+' '+c.level+' |    ');
                }
                dgs+='\n';
            }
            dgs+='-----------------------------------------';
            tge.log(tge.LogLevel.DEBUG, dgs);
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

        mergeUnit(us: any) {
            if(us.length==0)
                return null;
            //if(us.length==1)
            //    return us[0];
            for(let i=1; i<us.length; i++) {
                for(let c in us[i].cells) {
                    us[0].cells[c] = 1;
                    this.unit_map[parseInt(c)] = us[0];
                }
            }
            return us[0];
        }

        searchUnit() {
            this.unit_map = {};
            this.units = {};
            for(let i=0; i<Model.cityh; i++) {
                for(let j=0; j<Model.cityw; j++) {
                    let c = this.grid[i][j];
                    c.fromid = -1;
                    c.toid = -1;
                    let cur_unit = null;
                    let x = c.id % Model.cityw;
                    let y = Math.floor(c.id / Model.cityw);
                    let dd = [
                        [0, -1], //up
                        [0, 1],  //down
                        [-1, 0], //left
                        [1, 0]   //right
                    ];
                    let us = [];
                    for(let n=0; n<4; n++) {
                        let u = this.getUnit(x+dd[n][0], y+dd[n][1], c.color);
                        if(u!=null) us.push(u);
                    }
                    cur_unit = this.mergeUnit(us);
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
        }

        copyCell(s: Cell, d: Cell) {
            d.id = s.id;
            d.fromid = s.fromid;
            d.toid = s.toid;
            d.color = s.color;
            d.level = s.level;
            d.fromlevel = s.fromlevel;
            d.tolevel = s.tolevel;
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
                let tmpcs:Cell[] = [];
                for(let i=0; i<Model.cityh; i++) {
                    tmpcs[i] = {
                        id: 0, fromid: -1, toid: -1,
                        color: 0, level: 0, fromlevel: 0, tolevel: 0
                    };
                }
                //this.dumpGrid();
                //set blocks...
                for(let y=0; y<Model.cityh; y++) {
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
                    this.copyCell(h, tmpcs[i]);
                }
                for(let i=0; i<blocks.length; i++) {
                    blocks[i].id = (i+holes.length)*Model.cityw + x;
                    this.copyCell(blocks[i], tmpcs[i+holes.length]);
                }
                for(let i=0; i<Model.cityh; i++) 
                    this.copyCell(tmpcs[i], this.grid[i][x]);
                //this.dumpGrid();
            }
            //this.searchUnit();
            //tge.log(tge.LogLevel.DEBUG, "AFTER DROP", this.unit_map, this.units);
        }

        //merge cells in a unit...
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
                cc.fromid = -1;
                cc.toid = -1;
            }
        }
    }
}
