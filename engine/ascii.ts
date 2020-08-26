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

        static processToken(ps:tge.AscIIPoint[], isSpace:boolean) {
            if(isSpace) {
                return ps.map(e=>e.asc2code).join('');
            } else {
                let lp = ps[ps.length-1];
                let colors = `\x1b[38;5;${lp.fgcolor}m\x1b[48;5;${lp.bgcolor}m`;
                let txts = ps.map(e=>e.asc2code).join('');
                return colors+txts+'\x1b[0m';
            }
        }

        static processGridLine(g: tge.AscIIPoint[]) {
            let ps: tge.AscIIPoint[] = [];
            let outs = '';
            for(let i=0;i<AscIIManager.asciiw;i++) {
                if(g[i].asc2code == ' ') {
                    if(ps.length>0 && ps[ps.length-1].asc2code!=' ') {
                        outs+=AscIIManager.processToken(ps, false);
                        ps = [];
                    }
                    ps[ps.length]={asc2code:' ', fgcolor:15, bgcolor:0};
                } else {
                    if(ps.length>0 && ps[ps.length-1].asc2code==' ') {
                        outs+=AscIIManager.processToken(ps, true);
                        ps = [];
                    } else {
                        if(ps.length!=0) {
                            let lp = ps[ps.length-1];
                            if(g[i].bgcolor!=lp.bgcolor || g[i].fgcolor!=lp.fgcolor){
                                outs+=AscIIManager.processToken(ps, false);
                                ps=[];
                            }
                        }
                    }
                    ps[ps.length]=g[i];
                }
            }
            if(ps.length>0) {
                if(ps[ps.length-1].asc2code==' ') 
                    outs+=AscIIManager.processToken(ps, true);
                else
                    outs+=AscIIManager.processToken(ps, false);
            }
            return outs.replace(/ *$/g, '');
        }

        static getArt(name: string) {
            return AscIIManager.arts[name];
        }
    }
}
