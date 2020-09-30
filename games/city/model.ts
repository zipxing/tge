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
    export interface MergeFill {
        objCell: Cell;
        mergeCells: Cell[];
        dropCells: Cell[];
    }
    export class Model extends tge.Model {
        static cityw:number = 5;
        static cityh:number = 5;

        unit_map: { [key: number]: Unit} = {};
        units: {[key: number]: Unit} = {};
        grid: Cell[][];

        constructor() {
            super();
            this.grid = [];
            for(let i=0; i<Model.cityh; i++) {
                this.grid[i]=[];
                for(let j=0; j<Model.cityw; j++)
                    this.grid[i][j]={
                        id: i*Model.cityw+j,
                        fromid: 0, toid: 0,
                        color: (Math.floor((Math.random()*4)+1)),
                        level: 0, fromlevel: 0, tolevel: 0
                    };
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

        mergeAndFill(id:number) {
            let x = id % Model.cityw;
            let y = Math.floor(id / Model.cityw);
            let u = this.unit_map[id];
            let c = this.grid[y][x];
            let ret:MergeFill = {objCell:c, mergeCells:[], dropCells:[]};
            if(Object.keys(u.cells).length==1) 
                return ret;
            let nl = 0;
            for(let cid in u.cells) {
                let cx = parseInt(cid) % Model.cityw;
                let cy = Math.floor(parseInt(cid) / Model.cityw);
                let cc = this.grid[cy][cx];
                nl += cc.level;
                if(parseInt(cid) == id) continue;
                ret.mergeCells.push(cc);
                cc.fromid = parseInt(cid);
                cc.toid = id;
            }

        }

        searchUnit() {
            for(let i=0; i<Model.cityh; i++) {
                for(let j=0; j<Model.cityw; j++) {
                    let c = this.grid[i][j];
                    let cur_unit = null;
                    if(c.id in this.unit_map) {
                        cur_unit = this.unit_map[c.id];
                    } else {
                        cur_unit = <Unit> {
                            id: c.id,
                            cells:{}
                        };
                        cur_unit.cells[c.id] = c.id;
                        this.unit_map[c.id] = cur_unit;
                    }
                    let x = c.id % Model.cityw;
                    let y = Math.floor(c.id / Model.cityw);
                    let dd = [
                        [0, -1], //up
                        [0, 1],  //down
                        [-1, 0], //left
                        [1, 0]   //right
                    ];
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
        }
    }
}
