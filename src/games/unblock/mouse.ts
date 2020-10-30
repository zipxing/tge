namespace Unblock {
    export class MouseHandler {
        static region: tge.Rect = {
            x:0, y:0, 
            width:Unblock.CELLSIZEX*Unblock.WIDTH,
            height:Unblock.CELLSIZEY*Unblock.HEIGHT
        };

        mouse_pressed: boolean = false;
        lastx: number = 0;
        lasty: number = 0;

        constructor() {
        }

        mouseDown(x:number, y:number) {
            let nb = (<tge.TermRun>tge.env);
            if(!TermRender.game) return;
            let g = TermRender.game;
            let m = <Unblock.Model>g.model;
            if(g.gamestate!=GameState.Playing) return;
            let point = {x:x, y:y};
            if (tge.pointInRect(MouseHandler.region, point)) {
                this.mouse_pressed = true;
                this.lastx = x;
                this.lasty = y;
                let index = m.selectPiece(point);
                m.selected_piece = index;
                g.useract.splice(0, 0, `S:${index}`);
                return true;
            }
            return false;
        }

        mouseUp(x:number, y:number) {
            let nb = (<tge.TermRun>tge.env);
            if(!TermRender.game) return;
            let g = TermRender.game;
            let m = <Unblock.Model>g.model;
            if(g.gamestate!=GameState.Playing) return;
            this.mouse_pressed = false;
            let point = {x:x, y:y};
            if(m.selected_piece == -1) return;
            let hp = m.homingPiece(m.selected_piece);
            if(hp!=null) {
                m.layout_run.pieces[hp.pindex] = hp.end;
                let ok = m.checkSuccess(hp.end);
                let act = `H:${ok}`;
                g.useract.splice(0, 0, act);
            }
        }

        mouseMove(x:number, y:number) {
            let nb = (<tge.TermRun>tge.env);
            if(!TermRender.game) return;
            let g = TermRender.game;
            let m = <Unblock.Model>g.model;
            if(g.gamestate!=GameState.Playing) return;
            if(!this.mouse_pressed) return;
            if(m.selected_piece == -1) return;
            let point = {x:x, y:y};
            let mp = m.movePiece(m.selected_piece,
                {x:this.lastx, y:this.lasty}, point);
            if(mp!=null) {
                m.layout_run.pieces[mp.pindex] = mp.end;
                g.useract.splice(0, 0, `M:${mp}`);
                this.lastx = x;
                this.lasty = y;
            }
            if (tge.pointInRect(MouseHandler.region, point)) {
                return true;
            } else {
                this.mouseUp(0,0);
                m.selected_piece = -1;
            }
        }
    }
}
