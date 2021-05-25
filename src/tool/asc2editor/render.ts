import * as tge from "../../engine/index"
import { Model, Pen } from "./model"

export class TermRender extends tge.Render {
    titlebox: any;
    logobox: any;

    imagebox: any;
    gridimage: any[][];

    colorbox: any;
    gridcolor: any[][];

    colorbbox: any;
    gridbcolor: any[][];

    charbox: any;
    gridchar: any[][];

    msgbox: any;
    mousedown: boolean;

    constructor() {
        super();
        tge.AscIIManager.loadArtFile("ascii_art/tge.txt", "tgelogo");
        tge.AscIIManager.loadArtFile("ascii_art/ascii_title.txt", "title");
        let nb = (<tge.TermRun>tge.env);
        this.mousedown = false;

        this.titlebox = nb.blessed.box({
            width:Model.asciiw+2,
            height:4,
            top:0,
            left:0,
            tags:true
        });
        nb.tscreen.append(this.titlebox);

        this.logobox = nb.blessed.box({
            width:12,
            height:4,
            top:0,
            left:Model.asciiw-7,
            tags:true
        });
        nb.tscreen.append(this.logobox);

        this.imagebox = nb.blessed.box({
            width:Model.asciiw+2,
            height:Model.asciih+2,
            top:4,
            left:0,
            border:{type:'line'},
            tags:true
        });
        this.imagebox.setLabel("Image");
        nb.tscreen.append(this.imagebox);

        this.gridimage=[];
        for(let i=0;i<Model.asciih;i++) {
            this.gridimage[i]=[];
            for(let j=0;j<Model.asciiw;j++) {
                this.gridimage[i][j]=nb.blessed.box({
                    width:1,
                    height:1,
                    top:i+5,
                    left:j+1,
                    tags:true
                });
                nb.tscreen.append(this.gridimage[i][j]);
                this.gridimage[i][j].on('mousedown', (data: any)=>{
                    this.mousedown = true;
                    this.touchCell("IMAGE", i, j);
                });
                this.gridimage[i][j].on('mouseup', (data: any)=>{
                    this.mousedown = false;
                });
                this.gridimage[i][j].on('mouseover', (data: any)=>{
                    if(!this.mousedown) return;
                    this.touchCell("IMAGE", i, j);
                });
            }
        }

        this.charbox = nb.blessed.box({
            width:28+2,
            height:8+2,
            top:Model.asciih+6,
            left:0,
            border:{type:'line'},
            tags:true
        });
        this.charbox.setLabel("ASCII");
        nb.tscreen.append(this.charbox);

        this.gridchar=[];
        for(let i=0;i<Model.ascii.length;i++) {
            this.gridchar[i]=[];
            for(let j=0;j<Model.ascii[i].length;j++) {
                this.gridchar[i][j]=nb.blessed.box({
                    width:1,height:1,
                    content:`{15-fg}{238-bg}${Model.ascii[i][j]}{/}`,
                    top:Model.asciih+7+i,
                    left:j+1,
                    tags:true
                });
                nb.tscreen.append(this.gridchar[i][j]);
                this.gridchar[i][j].on('click', (data: any)=>{
                    this.touchCell("CHAR", i, j);
                });
            }
        }

        this.colorbox = nb.blessed.box({
            width:32+2,
            height:8+2,
            top:Model.asciih+6,
            left:30,
            border:{type:'line'},
            tags:true
        });
        this.colorbox.setLabel("FGColor");
        nb.tscreen.append(this.colorbox);

        //init color content...
        this.gridcolor=[];
        for(let i=0;i<8;i++) {
            this.gridcolor[i]=[];
            for(let j=0;j<32;j++) {
                let cn = i*32+j;
                let nstr=' ';
                this.gridcolor[i][j]=nb.blessed.box({
                    width:1,height:1,
                    content:`{${cn}-bg}{${0}-fg}${nstr}{/}`,
                    top:Model.asciih+7+i,
                    left:j+31,
                    tags:true

                });
                nb.tscreen.append(this.gridcolor[i][j]);
                this.gridcolor[i][j].on('click', (data: any)=>{
                    this.touchCell("FG-COLOR", i, j);
                });
            }
        }

        this.colorbbox = nb.blessed.box({
            width:32+2,
            height:8+2,
            top:Model.asciih+6,
            left:64,
            border:{type:'line'},
            tags:true
        });
        this.colorbbox.setLabel("BGColor");
        nb.tscreen.append(this.colorbbox);

        //init back color content...
        this.gridbcolor=[];
        for(let i=0;i<8;i++) {
            this.gridbcolor[i]=[];
            for(let j=0;j<32;j++) {
                let cn = i*32+j;
                let nstr=' ';
                this.gridbcolor[i][j]=nb.blessed.box({
                    width:1,height:1,
                    content:`{${cn}-bg}{${0}-fg}${nstr}{/}`,
                    top:Model.asciih+7+i,
                    left:j+65,
                    tags:true

                });
                nb.tscreen.append(this.gridbcolor[i][j]);
                this.gridbcolor[i][j].on('click', (data: any)=>{
                    this.touchCell("BG-COLOR", i, j);
                });
            }
        }

        this.msgbox = nb.blessed.box({
            width:35,
            height:4,
            top:0,
            left:53,
            border:{type:'line', fg:238},
            align:'center',
            tags:true
        });
        nb.tscreen.append(this.msgbox);

        this.drawTitle();
        this.drawLogo();

        tge.Emitter.register("AscIIEditor.REDRAW_IMAGE", this.redrawGrid, this);
        tge.Emitter.register("AscIIEditor.REDRAW_MSG", this.redrawMsg, this);
    }

    drawTitle() {
        let s = tge.AscIIManager.getArt("title").blessed_lines;
        this.titlebox.setContent(`${s[0]}\n${s[1]}\n${s[2]}`);
    }

    drawLogo() {
        let s = tge.AscIIManager.getArt("tgelogo").blessed_lines;
        this.logobox.setContent(`${s[0]}\n${s[1]}\n${s[2]}\n${s[3]}`);
    }

    touchCell(t:string, i:number, j:number) {
        let nb = (<tge.TermRun>tge.env);
        if(!TermRender.game) return;
        let g = TermRender.game;
        let m = <Model>g.model;
        if(t=='IMAGE') {
            this.gridimage[i][j].setContent('#');
        }
        g.useract.splice(0,0,`${t}:${i}:${j}`);
    }

    redrawMsg() {
        let g = TermRender.game;
        let m = <Model>g.model;
        let msg:string[] =['Press {green-fg}s{/} save. {green-fg}u{/} undo.',
            `PEN:${m.curpen} fg:${m.curfg} bg:${m.curbg}`];
        this.msgbox.setContent(msg[0]+'\n'+msg[1]);
    }

    redrawGrid() {
        let g = TermRender.game;
        let m = <Model>g.model;
        if(!m.grid) return;
        for(let i=0; i<Model.asciih; i++) {
            for(let j=0; j<Model.asciiw; j++) {
                let b = m.grid[i][j];
                this.gridimage[i][j].setContent(`{${b.bgcolor}-bg}{${b.fgcolor}-fg}${b.asc2code}{/}`);
            }
        }
    }

    draw() {
        let nb = (<tge.TermRun>tge.env);
        nb.tscreen.render();
    }
}
