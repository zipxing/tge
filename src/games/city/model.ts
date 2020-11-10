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
        mergeing: boolean;
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

    export const WIDTH:number = 5;
    export const HEIGHT:number = 5;
    export const COLOR_COUNT:number = 4;

    export class Model extends tge.Model {
        unit_map: { [key: number]: Unit} = {};
        units: {[key: number]: Unit} = {};
        grid: Cell[][] = [];
        merges: Merge;
        readyDel: number = -1;
        ready2TUnits: number[] = [];
        moveCellIds: number[] = [];
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
            for(let i=0; i<City.HEIGHT; i++) {
                this.grid[i]=[];
                for(let j=0; j<City.WIDTH; j++)
                    this.grid[i][j]={
                        id: i*City.WIDTH+j,
                        fromid: -1, toid: -1,
                        color: tge.rand() % (City.COLOR_COUNT-1) + 1,
                        level: tge.rand()%2 + 1
                    };
            }
            this.merges = {objCell: this.grid[0][0], mergeCells:[]};
            this.levelUp = {cellid:-1, from:-1, to:-1};
        }

        //debug...
        dumpGrid(msg:string = '') {
            //return;
            let dgs = `---------DUMPGRID.${msg}------------\n`;
            for(let i=0; i<City.HEIGHT; i++) {
                for(let j=0; j<City.WIDTH; j++) {
                    let c = this.grid[i][j];
                    let ids = (''+c.id).padStart(2);
                    let ccs = (''+c.color).padStart(3);
                    let cls = (''+c.level).padStart(3);
                    //dgs+=('| '+ids+' '+c.color+' '+c.fromid+' '+c.toid+' '+c.level+' |    ');
                    dgs+=('| '+ids+' '+ccs+' '+cls+' |    ');
                }
                dgs+='\n';
            }
            dgs+='-----------------------------------------';
            tge.debug(dgs);
        }

        checkLianTong(x:number, y:number, ic:Cell, u:Unit, sx:number, ex:number) {
            if(x<sx || y<0 || x>=ex || y>=City.HEIGHT)
                return;
            let c = this.grid[y][x];
            if((c.color == ic.color) && c.level<=30 && ic.level<=30) {
                this.unit_map[c.id] = u;
                u.cells[c.id] = c.id;
            }
        }

        getUnit(x:number, y:number, color:number, sx:number, ex:number) {
            if(x<sx || y<0 || x>=ex || y>=City.HEIGHT)
                return null;
            let c = this.grid[y][x];
            if(c.color == color) {
                if(c.id in this.unit_map)
                    return this.unit_map[c.id];
            }
            return null;
        }

        checkBorder(x:number, y:number, u:Unit, sx:number, ex:number) {
            if(x<sx || y<0 || x>=ex || y>=City.HEIGHT)
                return true;
            return !((''+(y*City.WIDTH+x)) in u.cells);
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
            x = (id+25) % City.WIDTH;
            y = Math.floor(id / City.WIDTH);
            return [x, y];
        }

        searchUnit() {
            this.unit_map = {};
            this.units = {};
            this.ready2TUnits = [];
            this.searchUnitByXRange(0, City.WIDTH);
        }

        searchUnitByXRange(startx: number, endx: number) {
            for(let i=0; i<City.HEIGHT; i++) {
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
            this.moveCellIds = [];
            for(let x=0; x<City.WIDTH; x++) {
                let holes=[], blocks=[];
                //count holes...
                for(let y=0; y<City.HEIGHT; y++) {
                    let c = this.grid[y][x];
                    if(c.color==-1)
                        holes.push(c);
                }
                if(holes.length==0) continue;
                let tmpcs:Cell[] = [];
                for(let i=0; i<City.HEIGHT; i++) {
                    tmpcs[i] = {
                        id: 0, fromid: -1, toid: -1,
                        color: 0, level: 0
                    };
                }
                this.dumpGrid('bdrop');
                //set blocks...
                for(let y=0; y<City.HEIGHT; y++) {
                    let c = this.grid[y][x];
                    if(c.color==-1) continue;
                    let dropcnt = 0;
                    for(let n=y+1; n<City.HEIGHT; n++) {
                        let cc = this.grid[n][x];
                        if(cc.color==-1) dropcnt++;
                    }
                    c.fromid = c.id;
                    c.toid =   c.id + dropcnt*City.WIDTH;
                    blocks.push(c);
                }
                //set new block(reuse hole)...
                for(let i=0; i<holes.length; i++) {
                    let h = holes[i];
                    h.color = tge.rand()%City.COLOR_COUNT + 1;
                    h.level = tge.rand()%2 + 1;
                    h.fromid = (i-holes.length)*City.WIDTH + x;
                    h.toid = i*City.WIDTH + x;
                    h.id = h.toid;
                    this.copyCell(h, tmpcs[i]);
                }
                for(let i=0; i<blocks.length; i++) {
                    blocks[i].id = (i+holes.length)*City.WIDTH + x;
                    this.copyCell(blocks[i], tmpcs[i+holes.length]);
                }
                for(let i=0; i<City.HEIGHT; i++) {
                    this.copyCell(tmpcs[i], this.grid[i][x]);
                    let c = this.grid[i][x];
                    if(c.fromid != c.toid) {
                        this.moveCellIds.push(c.id);
                    }
                }
                this.dumpGrid('adrop');
            }
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
            this.moveCellIds = [];
            for(let cid in u.cells) {
                this.moveCellIds.push(parseInt(cid));
                let [cx, cy] = this.getxyById(parseInt(cid));
                let cc = this.grid[cy][cx];
                if(parseInt(cid) == id) continue;
                ret.mergeCells.push(cc);
                cc.fromid = parseInt(cid);
                cc.toid = id;
            }
            this.merges = ret;
            u.mergeing = true;
            if(this.readyDel != -1) {
                let [rx, ry] = this.getxyById(this.readyDel);
                let rc = this.grid[ry][rx];
                rc.color-=100;
                this.readyDel = -1;
            }
            return true;
        }

        postMerge() {
            tge.debug('POSTMERGE..........');
            this.dumpGrid('bpostm');
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
                    c.color = City.COLOR_COUNT + 1;
                    this.levelUp.to = c.level;
                    this.dumpGrid('apostm1');
                    return Math.ceil((c.level-this.levelUp.from)/3.0);
                } else {
                    c.color = City.COLOR_COUNT + (c.level / 30);
                    this.levelUp.to = c.level;
                    this.dumpGrid('apostm2');
                    return Math.floor(c.level/30 - 1);
                }
            } else {
                this.levelUp.to = c.level;
                this.dumpGrid('apostm3');
                return c.level - this.levelUp.from;
            }
        }

        delCell(id:number) {
            tge.debug("DELCELL!!!!!");
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
