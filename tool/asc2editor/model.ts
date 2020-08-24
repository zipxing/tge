namespace AscIIEditor {
    export interface Cell {
        asc2code: string;
        fgcolor: number;
        bgcolor: number;
    }
    export enum Pen {
        Asc2code = 1,
        Background,
        Foreground
    }
    export class Model extends tge.Model {
        static asciiw:number = 80;
        static asciih:number = 25;

        static ascii = [
            //0x20~0x7e
            " !\"#$%&'()*+,-./0123456789:;",
            "<=>?@ABCDEFGHIJKLMNOPQRSTUVW",
            "XYZ[\\]^_`abcdefghijklmnopqrs",
            "tuvwxyz{|}~ÇüéâäàåçêëèïîìÄÅÉ",
            "æÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼",
            "¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚",
            "╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣ",
            "σµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■"
        ];

        cursor: tge.Point;
        curpen: Pen;
        curfg: number;
        curbg: number;
        curasc2code: string;
        grid: Cell[][];

        constructor() {
            super();
            this.cursor = {x:0, y:0};
            this.grid = [];
            this.curpen = Pen.Asc2code;
            this.curbg = 0;
            this.curfg = 15;
            this.curasc2code = "*";
            //init grid...
            for(let i=0;i<Model.asciih;i++) {
                this.grid[i]=[];
                for(let j=0;j<Model.asciiw;j++)
                    this.grid[i][j]={
                        asc2code:' ',
                        fgcolor:15,
                        bgcolor:0
                    };
            }
        }
    }
}
