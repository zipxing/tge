namespace AscIIEditor {
    export interface Cell {
        content: string;
        fgcolor: number;
        bgcolor: number;
    }
    export enum Pen {
        Content = 1,
        Background,
        Foreground
    }
    export class Model extends tge.Model {
        static asciiw:number = 80;
        static asciih:number = 25;
        static ascii:string = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■";
        cursor: tge.Point;
        curpen: Pen;
        curfg: number;
        curbg: number;
        curcontent: string;
        grid_con: Cell[][];
        grid_color: Cell[][];
        grid: Cell[][];

        constructor() {
            super();
            this.cursor = {x:0, y:0};
            this.grid = [];
            this.curpen = Pen.Content;
            this.curbg = 0;
            this.curfg = 15;
            this.curcontent = " ";
            for(let i=0;i<Model.asciih;i++) {
                this.grid[i]=[];
                for(let j=0;j<Model.asciiw;j++)
                    this.grid[i][j]={
                        content:' ',
                        fgcolor:15,
                        bgcolor:0
                    };
            }
        }
    }
}
