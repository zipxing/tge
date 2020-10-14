namespace City {
    export interface Cell {
        id: number;
        fromid: number;
        toid: number;
        //1,2,3,4:base, 5:T, 6,7,8,9...:W
        color: number;
        //1~29:base, 30:tower, 60,90,120...:wonder
        level: number;
    }
    export interface Unit {
        id: number;
        cells: {[key: number]: any};
        ready2T: boolean;
    }
    export interface Merge {
        objCell: Cell;
        mergeCells: Cell[];
    }
    export interface LevelUp {
        cellid: number;
        from: number, to: number;
    }
    export class Model extends tge.Model {
        static cityw:number = 5;
        static cityh:number = 5;
        static citycolor:number = 4;

        unit_map: { [key: number]: Unit} = {};
        units: {[key: number]: Unit} = {};
        grid: Cell[][] = [];
        merges: Merge;
        readyDel: number = -1;
        ready2TUnits: number[] = [];
        levelUp: LevelUp;

        constructor() {
            super();
            this.reset();
            this.merges = {objCell: this.grid[0][0], mergeCells:[]};
            this.levelUp = {cellid:-1, from:-1, to:-1};
        }

        reset() {
            tge.srand(new Date().valueOf());
            //tge.srand(8);
            this.grid = [];
            this.readyDel = -1;
            for(let i=0; i<Model.cityh; i++) {
                this.grid[i]=[];
                for(let j=0; j<Model.cityw; j++)
                    this.grid[i][j]={
                        id: i*Model.cityw+j,
                        fromid: -1, toid: -1,
                        color: tge.rand() % (Model.citycolor-1) + 1,
                        level: tge.rand()%2 + 1
                    };
            }
            this.merges = {objCell: this.grid[0][0], mergeCells:[]};
            this.levelUp = {cellid:-1, from:-1, to:-1};
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

        checkLianTong(x:number, y:number, ic:Cell, u:Unit, sx:number, ex:number) {
            if(x<sx || y<0 || x>=ex || y>=Model.cityh)
                return;
            let c = this.grid[y][x];
            if((c.color == ic.color) && c.level<=30 && ic.level<=30) {
                this.unit_map[c.id] = u;
                u.cells[c.id] = c.id;
            }
        }

        getUnit(x:number, y:number, color:number, sx:number, ex:number) {
            if(x<sx || y<0 || x>=ex || y>=Model.cityh)
                return null;
            let c = this.grid[y][x];
            if(c.color == color) {
                if(c.id in this.unit_map)
                    return this.unit_map[c.id];
            }
            return null;
        }

        checkBorder(x:number, y:number, u:Unit, sx:number, ex:number) {
            if(x<sx || y<0 || x>=ex || y>=Model.cityh)
                return true;
            return !((''+(y*Model.cityw+x)) in u.cells);
        }

        mergeUnit(us: any) {
            if(us.length==0)
                return null;
            for(let i=1; i<us.length; i++) {
                for(let c in us[i].cells) {
                    us[0].cells[c] = 1;
                    this.unit_map[parseInt(c)] = us[0];
                }
            }
            return us[0];
        }

        getxyById(id:number) {
            let x = 0;
            let y = 0;
            x = (id+25) % Model.cityw;
            y = Math.floor(id / Model.cityw);
            return [x, y];
        }

        searchUnit() {
            this.unit_map = {};
            this.units = {};
            this.ready2TUnits = [];
            //this.searchUnitByXRange(0, Model.cityw);
            this.searchUnitByXRange(0, Model.cityw-1);
        }

        searchUnitByXRange(startx: number, endx: number) {
            for(let i=0; i<Model.cityh; i++) {
                for(let j=startx; j<endx; j++) {
                    let c = this.grid[i][j];
                    if(c.color>100)
                        c.color-=100;
                    c.fromid = -1;
                    c.toid = -1;
                    let cur_unit = null;
                    let [x, y] = this.getxyById(c.id);
                    let dd = [ [0, -1], [0, 1], [-1, 0], [1, 0] ];
                    let us = [];
                    for(let n=0; n<4; n++) {
                        let u = this.getUnit(x+dd[n][0], y+dd[n][1], c.color, startx, endx);
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
                        this.checkLianTong(x+dd[n][0], y+dd[n][1], c, cur_unit, startx, endx);
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
                let tl = 0;
                let allisT = true;
                for(let j in cs.cells) {
                    let jd = parseInt(j);
                    let [x, y] = this.getxyById(jd);
                    let gl = this.grid[y][x].level;
                    if(gl!=30) allisT = false;
                    tl+=gl;
                    let dd = [ [0, -1], [0, 1], [-1, 0], [1, 0] ];
                    let nd = [8, 4, 2, 1];
                    let r = 0;
                    for(let n=0; n<4; n++) {
                        if(this.checkBorder(x+dd[n][0], y+dd[n][1], cs, startx, endx))
                            r+=nd[n];
                    }
                    cs.cells[j] = r;
                }
                cs.ready2T = (tl>=30 && !allisT)  && (Object.keys(cs.cells).length>1);
                if(cs.ready2T)
                    this.ready2TUnits.push(parseInt(i));
            }
        }

        copyCell(s: Cell, d: Cell) {
            d.id = s.id;
            d.fromid = s.fromid;
            d.toid = s.toid;
            d.color = s.color;
            d.level = s.level;
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
                        color: 0, level: 0
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
                    c.toid =   c.id + dropcnt*Model.cityw;
                    blocks.push(c);
                }
                //set new block(reuse hole)...
                for(let i=0; i<holes.length; i++) {
                    let h = holes[i];
                    h.color = tge.rand()%Model.citycolor + 1;
                    h.level = tge.rand()%2 + 1;
                    h.fromid = (i-holes.length)*Model.cityw + x;
                    h.toid = i*Model.cityw + x;
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
        mergeCell(id:number) {
            let [x, y] = this.getxyById(id);
            let u = this.unit_map[id];
            let c = this.grid[y][x];
            let ret:Merge= {objCell:c, mergeCells:[]};
            if(Object.keys(u.cells).length==1) {
                this.merges = ret;
                return false;
            }
            for(let cid in u.cells) {
                let [cx, cy] = this.getxyById(parseInt(cid));
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
            let isbase = (c.level < 30);
            this.levelUp.cellid = c.id;
            this.levelUp.from = c.level;
            for(let cc of ms) {
                c.level += cc.level;
                cc.color = -1;
                cc.fromid = -1;
                cc.toid = -1;
            }
            if(c.level>=30) {
                if(isbase) {
                    c.level = 30;
                    c.color = Model.citycolor + 1;
                    this.levelUp.to = c.level;
                    return c.level - this.levelUp.from;
                } else {
                    c.color = Model.citycolor + (c.level / 30);
                    this.levelUp.to = c.level;
                    return Math.floor(c.level/30 - 1);
                }
            } else {
                this.levelUp.to = c.level;
                return c.level - this.levelUp.from;
            }
        }

        delCell(id:number) {
            tge.log(tge.LogLevel.DEBUG, "DELCELL!!!!!");
            let [x, y] = this.getxyById(id);
            let c = this.grid[y][x];
            if(c.color<100) {
                c.color+=100;
                if(this.readyDel != id) {
                    if(this.readyDel != -1) {
                        let [rx, ry] = this.getxyById(this.readyDel);
                        let rc = this.grid[ry][rx];
                        rc.color-=100;
                    }
                    this.readyDel = id;
                }
                return false;
            } else {
                c.color=-1;
                this.readyDel = -1;
                this.drop();
                return true;
            }
        }
    }
}
