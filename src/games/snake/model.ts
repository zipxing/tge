import * as tge from "../../engine/tge"
import * as util from "../../engine/util"

export class Model extends tge.Model {
    static snakew:number = 50;
    static snakeh:number = 18;
    seed: util.Point;
    body: util.Point[];
    grid: number[][];
    dir: string;

    constructor() {
        super();
        this.seed = {x:0, y:0};
        this.body = [];
        this.grid = [];
        for(let i=0;i<Model.snakeh;i++) {
            this.grid[i]=[];
            for(let j=0;j<Model.snakew;j++)
                this.grid[i][j]=0;
        }
        this.dir='D';
        this.makeGrid();
    }

    makeGrid() {
        for(let i=0;i<Model.snakeh;i++) 
            for(let j=0;j<Model.snakew;j++)
                this.grid[i][j]=0;
        for(let i=0;i<this.body.length;i++)
            this.grid[this.body[i].y][this.body[i].x]=i+1;
        this.grid[this.seed.y][this.seed.x]=10000;
    }
}
