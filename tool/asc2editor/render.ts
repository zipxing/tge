namespace AscIIEditor {
    export class TermRender extends tge.Render {
        titlebox: any;
        logobox: any;
        gamebox: any;
        gridboxes: any[][];
        colorbox: any;
        gridcolor: any[][];
        charbox: any;
        gridchar: any[][];
        msgbox: any;

        constructor() {
            super();
            let nb = (<tge.TermRun>tge.env);

            this.titlebox = nb.blessed.box({
                width:Model.asciiw+2,
                height:4,
                top:0,
                left:3,
                tags:true
            });
            nb.tscreen.append(this.titlebox);

            this.logobox = nb.blessed.box({
                width:12,
                height:4,
                top:0,
                left:Model.asciiw+16,
                tags:true
            });
            nb.tscreen.append(this.logobox);

            this.gamebox = nb.blessed.box({
                width:Model.asciiw+2,
                height:Model.asciih+2,
                top:4,
                left:0,
                border:{type:'line'},
                tags:true
            });
            nb.tscreen.append(this.gamebox);

            this.gridboxes=[];
            for(let i=0;i<Model.asciih;i++) {
                this.gridboxes[i]=[];
                for(let j=0;j<Model.asciiw;j++) {
                    this.gridboxes[i][j]=nb.blessed.box({
                        width:1,
                        height:1,
                        top:i+5,
                        left:j+1,
                        tags:true
                    });
                    nb.tscreen.append(this.gridboxes[i][j]);
                    this.gridboxes[i][j].on('click', (data: any)=>{
                        if(!TermRender.game) return;
                        let g = TermRender.game;
                        g.useract.splice(0,0,`IMAGE:${i}:${j}`);
                    });
                }
            }

            this.gridchar=[];
            for(let i=0;i<Model.ascii.length;i++) {
                this.gridchar[i]=[];
                for(let j=0;j<Model.ascii[i].length;j++) {
                    this.gridchar[i][j]=nb.blessed.box({
                        width:1,height:1,
                        content:`{15-fg}{238-bg}${Model.ascii[i][j]}{/}`,
                        top:Model.asciih+6+i,
                        left:j,
                        tags:true
                    });
                    nb.tscreen.append(this.gridchar[i][j]);
                    this.gridchar[i][j].on('click', (data: any)=>{
                        if(!TermRender.game) return;
                        let g = TermRender.game;
                        g.useract.splice(0,0,`CHAR:${i}:${j}`);
                    });
                }
            }
             //init grid content...
            this.gridcolor=[];
            for(let i=0;i<8;i++) {
                this.gridcolor[i]=[];
                for(let j=0;j<32;j++) {
                    let cn = i*32+j;
                    let nstr = cn.toString(10);
                    let pad = 3-nstr.length;
                    for(let n=0; n<pad; n++) 
                        nstr+=' ';
                    nstr=' ';
                    this.gridcolor[i][j]=nb.blessed.box({
                        width:1,height:1,
                        content:`{${cn}-bg}{${0}-fg}${nstr}{/}`,
                        top:i+5,
                        left:Model.asciiw+j+5,
                        tags:true

                    });
                    nb.tscreen.append(this.gridcolor[i][j]);
                    this.gridcolor[i][j].on('click', (data: any)=>{
                        if(!TermRender.game) return;
                        let g = TermRender.game;
                        g.useract.splice(0,0,`COLOR:${i}:${j}`);
                    });
                }
            }

            this.msgbox = nb.blessed.box({
                width:23,
                height:Model.asciih+2,
                top:4,
                left:Model.asciiw+3,
                border:{type:'line'},
                tags:true
            });
            //nb.tscreen.append(this.msgbox);

            tge.Emitter.register("AscIIEditor.REDRAW_GRID", this.redrawGrid, this);
        }

        drawTitle() {
            let s1="   ____          __      ";
            let s2="  / __/__  ___ _/ /_____ ";
            let s3=" _\\ \\/ _ \\/ _ \`/  '_/ -_)";
            let s4="/___/_//_/\\_,_/_/\\_\\\\__/ ";
            this.titlebox.setContent(`${s1}\n${s2}\n${s3}\n${s4}`);
        }

        drawLogo() {
            let s1="PoweredBy";
            let s2="╔╦╗╔═╗╔═╗";
            let s3=" ║ ║ ╦║╣ ";
            let s4=" ╩ ╚═╝╚═╝";
            this.logobox.setContent(`${s1}\n${s2}\n${s3}\n${s4}`);
        }

        redrawMsg() {
            let msg:string[] =['Press {green-fg}q{/} quit...',
                'Game over,press {green-fg}r{/} restart...',
                'Game over,press {green-fg}r{/} restart...'];
            //this.msgbox.setContent(msg[g.gameover]);
        }

        setPoint(box: any, bg:string, fg:string, cchar:string) {
            box.setContent(`{${bg}-bg}{${fg}-fg}${cchar}{/}`);
        }

        redrawGrid() {
        }

        draw() {
            this.drawTitle();
            this.drawLogo();
            let nb = (<tge.TermRun>tge.env);
            nb.tscreen.render();
        }
    }
}
