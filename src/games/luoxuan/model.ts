namespace Luoxuan {
    export class Model extends tge.Model {
        static matnum: number = 20;
        grid: number[][];
        loc: tge.Point;
        step: number;
        dir: number;

        constructor() {
            super();
            this.loc = { x: 0, y: 0 };
            this.grid = [];
            for (let i = 0; i < Model.matnum; i++) {
                this.grid[i] = [];
                for (let j = 0; j < Model.matnum; j++)
                    this.grid[i][j] = 0;
            }
            this.dir = 0;
            this.step = 0;
        }

        inbox(l:tge.Point):boolean {
            return(
                (l.x>=0) && (l.x<Model.matnum) && 
                (l.y>=0) && (l.y<Model.matnum)
            );
        }

        next_step(dir:number, l:tge.Point) {
            let dnum: number[][] = [
                [1,  0],
                [0,  1],
                [-1, 0],
                [0, -1]
            ];
            l.x+=dnum[dir][0];
            l.y+=dnum[dir][1];
        }

        walk() {
            if(this.step>=Model.matnum*Model.matnum) 
                return;
            //填充当前位置
            this.step += 1;
            this.grid[this.loc.y][this.loc.x] = this.step;


            //备份xy，尝试走下一步
            let bloc: tge.Point = tge.clone(this.loc);
            this.next_step(this.dir, bloc);
            //走出格或者碰到了已经填充过的位置则调整方向...
            if (!this.inbox(bloc) || this.grid[bloc.y][bloc.x] != 0)
                this.dir = (this.dir + 1) % 4;

            //按正确方向操作xy
            this.next_step(this.dir, this.loc);
        }
    }
}
