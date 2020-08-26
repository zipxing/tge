namespace tge {
    export interface AscIIPoint {
        asc2code: string;
        fgcolor: number;
        bgcolor: number;
    }

    export class AscIIManager {
        static asciiw:number = 96;
        static asciih:number = 24;

        private static arts:{[artname: string]: any} = {};

        static loadArtFile(fpath: string, name: string) {
            try {
                let fs = require("fs");
                let buf = fs.readFileSync(fpath, "utf8");
                let lines = buf.split('\n');
                let row = 0, col = 0;
                let grid: any[][] = [];
                for(let i=0;i<AscIIManager.asciih;i++) {
                    grid[i]=[];
                    for(let j=0;j<AscIIManager.asciiw;j++)
                        grid[i][j]={
                            asc2code:' ',
                            fgcolor:15,
                            bgcolor:0
                        };
                }
                for(let l in lines) {
                    if(row>AscIIManager.asciih) break;
                    let line = lines[l];
                    line.replace(/\x1b\[[\d;]*m/g, '');
                    line.replace(/\r/g, '');
                    for(let c=0; c<line.length; c++) {
                        if(c>AscIIManager.asciiw) break;
                        grid[row][c] = {
                            asc2code: line[c],
                            fgcolor: 15,
                            bgcolor: 0
                        }
                    }
                    row++;
                }
                AscIIManager.arts[name] = grid;
            } catch(error) {
                console.log("read file "+fpath+" error!");
                console.log(error.message);
            }
        }

        static getArt(name: string) {
            return AscIIManager.arts[name];
        }
    }
}
