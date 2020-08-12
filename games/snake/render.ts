namespace Snake {
    export class TermRender extends nge.Render {
        gridboxes: any[][];
        msgbox: any;
        gamebox: any;
        constructor() {
            super();
            let nb = (<nge.TermRun>nge.mode);
            this.gamebox = nb.blessed.box({
                width:Model.snakew+2, height:Model.snakeh+2, top:0,
                left:0, border:{type:'line'}, tags:true });
            nb.tscreen.append(this.gamebox);
            this.gridboxes=[];
            for(let i=0;i<Model.snakeh;i++) {
                this.gridboxes[i]=[];
                for(let j=0;j<Model.snakew;j++) {
                    this.gridboxes[i][j]=nb.blessed.box({
                        width:1, height:1, top:i+1, left:j+1, tags:true
                    });
                    nb.tscreen.append(this.gridboxes[i][j]);
                }
            }
            this.msgbox = nb.blessed.box({
                width:Model.snakew+2, height:3, top:Model.snakeh+1, 
                left:0, border:{type:'line'}, tags:true });
            nb.tscreen.append(this.msgbox);
        }
        draw() {
            let msg:string[] =['SnakeGame1.0,press {green-fg}q{/} quit...',
                'Game over,press {green-fg}r{/} restart...',
                'Game over,press {green-fg}r{/} restart...'];
            let c = ['magenta', 'blue', 'red', 'green', 'yellow', 'cyan'];
            let g = TermRender.game;
            let m = <Snake.Model>g.model;
            this.msgbox.setContent(msg[g.gameover]);
            for(let i=0;i<Model.snakeh;i++) {
                for(let j=0;j<Model.snakew;j++) {
                    let gv = m.grid[i][j];
                    let gb = this.gridboxes[i][j];
                    switch(gv) {
                        case 0:
                            if(g.gameover==Snake.GameState.Ok) 
                                gb.setContent('{white-bg} {/}');
                            else
                                gb.setContent('{yellow-bg} {/}');
                            break;
                        case 10000:
                            gb.setContent('{white-bg}{red-fg}*{/}');
                            break;
                        default:
                            gb.setContent(`{${c[gv%c.length]}-bg} {/}`);
                    }
                }
            }
            let nb = (<nge.TermRun>nge.mode);
            nb.tscreen.render();
        }
    }
}
