namespace tge {
    export interface AscIIPoint {
        asc2code: string;
        fgcolor: number;
        bgcolor: number;
    }

    export class AscIIManager {
        static width:number = 96;
        static height:number = 24;

        private static arts:{[artname: string]: any} = {};

        static loadArtFile(fpath: string, name: string) {
            try {
                let fs = require("fs");
                let lines = fs.readFileSync(fpath, "utf8").split('\n');
                let row = 0;
                let grid: any[][] = [];
                let blessed_lines: string[] = [];

                for(let i=0;i<AscIIManager.height;i++) {
                    grid[i]=[];
                    for(let j=0;j<AscIIManager.width;j++)
                        grid[i][j]={
                            asc2code:' ',
                            fgcolor:15,
                            bgcolor:0
                        };
                }
                for(let l in lines) {
                    if(row>AscIIManager.height) 
                        break;
                    let line = lines[l];
                    line = line.replace(/\r/g, '');
                    blessed_lines[blessed_lines.length] = 
                        line.replace(/\x1b\[38;5;(\d+)m\x1b\[48;5;(\d+)m(.*?)\x1b\[0m/g,
                        "{$1-fg}{$2-bg}$3{/}");
                    let ocount = 0;
                    while(true) {
                        let m = line.match(/\x1b\[38;5;(\d+)m\x1b\[48;5;(\d+)m(.*?)\x1b\[0m/);
                        if(m==null) break;
                        //console.log(m);
                        let shead = line.substring(0, m.index);
                        let fg = parseInt(m[1]);
                        let bg = parseInt(m[2]);
                        let colorstr = m[3];
                        //log(LogLevel.DEBUG, m.index, m[0].length, fg, bg, colorstr);
                        for(let i=0;i<shead.length;i++) {
                            if(ocount>AscIIManager.width) break;
                            grid[row][ocount] = {
                                asc2code: shead[i],
                                fgcolor: 15,
                                bgcolor: 0
                            };
                            ocount++;
                        }
                        for(let i=0;i<colorstr.length;i++) {
                            if(ocount>AscIIManager.width) break;
                            grid[row][ocount] = {
                                asc2code: colorstr[i],
                                fgcolor: fg,
                                bgcolor: bg
                            };
                            ocount++;
                        }
                        line = line.substring(m.index+m[0].length);
                    }
                    for(let i=0;i<line.length;i++) {
                        if(ocount>AscIIManager.width) break;
                        grid[row][ocount] = {
                            asc2code: line[i],
                            fgcolor: 15,
                            bgcolor: 0
                        };
                        ocount++;
                    }
                    row++;
                }
                AscIIManager.arts[name] = {grid: grid, blessed_lines:blessed_lines};
            } catch(error) {
                log(LogLevel.ERROR, "read file "+fpath+" error!");
                log(LogLevel.ERROR, error.message);
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
            for(let i=0;i<AscIIManager.width;i++) {
                if(g[i].asc2code == ' ') {
                    if(ps.length>0 && ps[ps.length-1].asc2code!=' ') {
                        outs+=AscIIManager.processToken(ps, false);
                        ps = [];
                    }
                    ps[ps.length]={
                        asc2code:' ',
                        fgcolor:15,
                        bgcolor:0
                    };
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
