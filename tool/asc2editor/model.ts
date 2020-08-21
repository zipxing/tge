namespace AscIIEditor {
    export interface Cell {
        content: string;
        //40:黑 41:深红 42:绿 43:黄色 44:蓝色 45:紫色 46:深绿 47:白色
        fgcolor: number;
        //30:黑 31:红 32:绿 33:黄 34:蓝色 35:紫色 36:深绿 37:白色
        //高亮+100
        bgcolor: number;
    }
    export class Model extends tge.Model {
        static asciiw:number = 80;
        static asciih:number = 25;
        cursor: tge.Point;
        pen: number; //ascii<1000,color>1000
        grid: Cell[][];

        constructor() {
            super();
            this.cursor = {x:0, y:0};
            this.grid = [];
            this.pen = 10000;
            for(let i=0;i<Model.asciih;i++) {
                this.grid[i]=[];
                for(let j=0;j<Model.asciiw;j++)
                    this.grid[i][j]={
                        content:' ',
                        fgcolor:0,
                        bgcolor:0
                    };
            }
        }
    }
}
