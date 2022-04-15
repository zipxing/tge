import * as tge from "../../engine"

//export interface 
//https://www.cnblogs.com/huansky/p/5572631.html
//

export class Model extends tge.Model {
    static towerw:number = 50;
    static towerh:number = 18;
    seed: tge.Point;
    body: tge.Point[];
    grid: number[][];
    dir: string;

    constructor() {
        super();
        this.seed = {x:0, y:0};
        this.body = [];
        this.grid = [];
        for(let i=0;i<Model.towerh;i++) {
            this.grid[i]=[];
            for(let j=0;j<Model.towerw;j++)
                this.grid[i][j]=0;
        }
        this.dir='D';
        this.makeGrid();
    }

    makeGrid() {
        for(let i=0;i<Model.towerh;i++) 
            for(let j=0;j<Model.towerw;j++)
                this.grid[i][j]=0;
        for(let i=0;i<this.body.length;i++)
            this.grid[this.body[i].y][this.body[i].x]=i+1;
        this.grid[this.seed.y][this.seed.x]=10000;
    }
}
