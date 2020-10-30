namespace AscIIEditor {
    export enum Pen {
        Asc2code = 1,
        Background,
        Foreground
    }
    export class Model extends tge.Model {
        static asciiw:number = tge.AscIIManager.width;
        static asciih:number = tge.AscIIManager.height;

        static ascii = [
            " !\"#$%&'()*+,-./0123456789:;",
            "<=>?@ABCDEFGHIJKLMNOPQRSTUVW",
            "XYZ[\\]^_`abcdefghijklmnopqrs",
            "tuvwxyz{|}~ÇüéâäàåçêëèïîìÄÅÉ",
            "æÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼",
            "¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚",
            "╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣ",
            "σµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■"
        ];

        curpen: Pen;
        curfg: number;
        curbg: number;
        curasc2code: string;
        grid: tge.AscIIPoint[][];

        constructor() {
            super();
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
            tge.AscIIManager.loadArtFile(fpath, "MainGrid");
            let g = tge.AscIIManager.getArt("MainGrid");
            if(g) {
                this.grid = g.grid;
                tge.log(tge.LogLevel.DEBUG, g.blessed_lines);
            }
        }

        saveAsciiArtFile(fpath: string) {
            let ots = [];
            for(let i=0; i<Model.asciih; i++) {
                ots[ots.length]=tge.AscIIManager.processGridLine(this.grid[i]);
                console.log(ots[i].length);
            }
            let blank_count = 0;
            for(let i=ots.length-1; i>=0; i--) {
                if(ots[i].length!=0) break;
                blank_count++;
            }
            ots = ots.slice(0, ots.length-blank_count);
            let fs=require('fs');
            fs.writeFileSync(fpath, ots.join('\n'));
        }
    }
}
