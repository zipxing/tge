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
        static asciiw:number = 96;
        static asciih:number = 24;

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

        loadAsciiArtFile(fpath: string) {
            let fs = require("fs");
            let buf = fs.readFileSync(fpath, "utf8"); 
            let lines = buf.split('\n');
            let row = 0, col = 0;
            for(let l in lines) {
                let line = lines[l];
                line.replace(/\x1b\[[\d;]*m/g, '');
                line.replace(/\r/g, '');
                if(row>Model.asciih) break;
                for(let c=0; c<line.length; c++) {
                    if(c>Model.asciiw) break;
                    this.grid[row][c] = {
                        asc2code: line[c],
                        fgcolor: 15,
                        bgcolor: 0
                    }
                }
                row++;
            }
        }

        saveAsciiArtFile(fpath: string) {
        }
    }
}
