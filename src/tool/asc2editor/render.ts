import * as tge from "../../engine"
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
        this.mousedown = false;

        this.titlebox = this.addBox( Model.asciiw+2, 4, 0, 0);

        this.logobox = this.addBox( 12, 4, 0, Model.asciiw-7 );

        this.imagebox = this.addBox( Model.asciiw+2, Model.asciih+2, 4, 0,
            {border:{type:'line'}, label:'Image'});

        this.gridimage=[];
        for(let i=0;i<Model.asciih;i++) {
            this.gridimage[i]=[];
            for(let j=0;j<Model.asciiw;j++) {
                this.gridimage[i][j] = this.addBox( 1, 1, i+5, j+1,);
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

        this.charbox = this.addBox(
            28+2,
            8+2,
            Model.asciih+6,
            0,
            {border:{type:'line'}}
        );
        this.charbox.setLabel("ASCII");

        this.gridchar=[];
        for(let i=0;i<Model.ascii.length;i++) {
            this.gridchar[i]=[];
            for(let j=0;j<Model.ascii[i].length;j++) {
                this.gridchar[i][j]= this.addBox(
                    1,1,
                    Model.asciih+7+i,
                    j+1,
                    {content:`{15-fg}{238-bg}${Model.ascii[i][j]}{/}`}
                );
                this.gridchar[i][j].on('click', (data: any)=>{
                    this.touchCell("CHAR", i, j);
                });
            }
        }

        this.colorbox = this.addBox(
            32+2,
            8+2,
            Model.asciih+6,
            30,
            {border:{type:'line'}}
        );
        this.colorbox.setLabel("FGColor");

        //init color content...
        this.gridcolor=[];
        for(let i=0;i<8;i++) {
            this.gridcolor[i]=[];
            for(let j=0;j<32;j++) {
                let cn = i*32+j;
                let nstr=' ';
                this.gridcolor[i][j]=this.addBox(
                    1,1,
                    Model.asciih+7+i,
                    j+31,
                    {content:`{${cn}-bg}{${0}-fg}${nstr}{/}`}
                );
                this.gridcolor[i][j].on('click', (data: any)=>{
                    this.touchCell("FG-COLOR", i, j);
                });
            }
        }

        this.colorbbox = this.addBox(
            32+2,
            8+2,
            Model.asciih+6,
            64,
            {border:{type:'line'}},
        );
        this.colorbbox.setLabel("BGColor");

        //init back color content...
        this.gridbcolor=[];
        for(let i=0;i<8;i++) {
            this.gridbcolor[i]=[];
            for(let j=0;j<32;j++) {
                let cn = i*32+j;
                let nstr=' ';
                this.gridbcolor[i][j]=this.addBox(
                    1,1,
                    Model.asciih+7+i,
                    j+65,
                    {content:`{${cn}-bg}{${0}-fg}${nstr}{/}`}
                );
                this.gridbcolor[i][j].on('click', (data: any)=>{
                    this.touchCell("BG-COLOR", i, j);
                });
            }
        }

        this.msgbox = this.addBox(
            35,
            4,
            0,
            53,
            {border:{type:'line', fg:238}, align:'center'}
        );

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
