namespace Unblock {
    export interface Cell {
        x: number;
        y: number;
        kind: number; //see ascii_art/cc0.txt ... cc16.txt
    }

    export interface Piece {
        kind: number;
        x: number;
        y: number;
        cells: Cell[];
    }

    export interface Layout {
        moves: number;
        pieces: Piece[];
    }

    export class Model extends tge.Model {
        map_index: number = 0;
        layout_origin: Layout = {moves:0, pieces:[]};
        layout_run: Layout = {moves:0, pieces:[]};
        layouts_undo: Layout[] = [];
        selected_piece: number = -1;

        constructor() {
            super();
            this.reset();
        }

        reset() {
            this.map_index = tge.rand()%8880;
            this.layout_origin = this.getPuzzle(this.map_index);
            this.layout_run = tge.clone(this.layout_origin);
            this.layouts_undo = [tge.clone(this.layout_origin)];
            this.selected_piece = -1;
            //this.state = unblock.State.READY;//PLAYING...
        }

        getPuzzle(mapidx: number) {
            let d = Unblock.MAP[mapidx];
            let r:Layout = {
                moves: 50,
                pieces: []
            };
            for(let i=0; i<d.length; i++) {
                let x = parseInt(d[i][0]);
                let y = parseInt(d[i][1]);
                let k = parseInt(d[i][2]);
                let cs:Cell[] = [];
                switch(k) {
                    case 1:
                    case 2:
                        cs.push({x:x, y:y, kind:14});
                        cs.push({x:x+1, y:y, kind:13});
                        break;
                    case 3:
                        cs.push({x:x, y:y, kind:11});
                        cs.push({x:x, y:y+1, kind:7});
                        break;
                    case 4:
                        cs.push({x:x, y:y, kind:14});
                        cs.push({x:x+1, y:y, kind:12});
                        cs.push({x:x+2, y:y, kind:13});
                        break;
                    case 5:
                        cs.push({x:x, y:y, kind:11});
                        cs.push({x:x, y:y+1, kind:3});
                        cs.push({x:x, y:y+2, kind:7});
                        break;
                    default:
                        break;
                }
                let b:Piece = {kind:k, x:x, y:y, cells:cs};
                r.pieces.push(b);
            }
            return r;
        }

        piece2Rect(p:Piece) {
            let adj = Unblock.PADJ[p.kind - 1];
            return [
                p.x*Unblock.CELLSIZEX,
                p.y*Unblock.CELLSIZEY,
                (p.x + adj[0])*Unblock.CELLSIZEX,
                (p.y + adj[1])*Unblock.CELLSIZEY
            ];
        }

        selectPiece(pt:tge.Point) {
            let sp = -1;
            let p = this.layout_run.pieces;
            for(let i=0; i<p.length; i++) {
                let r = this.piece2Rect(p[i]);
                if (pt.x<=r[2] && pt.x>=r[0] && pt.y<=r[3] && pt.y>=r[1])
                    sp = i;
            }
            return sp;
        }

        movePiece(pindex: number, bpt:tge.Point, ept:tge.Point) {
            let p = this.layout_origin.pieces;
            let mp:Piece = tge.clone(p[pindex]);
            let chkpoints:number[] = [];
            let adj = Unblock.PADJ[mp.kind - 1];
            let dr:boolean = (adj[0]>adj[1]);
            let ov:number = dr ? mp.x : mp.y;
            let dv:number = dr ? 
                (ept.x-bpt.x) / Unblock.CELLSIZEX :
                (ept.y-bpt.y) / Unblock.CELLSIZEY;
            if (dv==0) return null;
            let nv:number = ov + dv;
            if(nv<0) nv = 0;
            if(nv > Unblock.MAX[mp.kind - 1])
                nv = Unblock.MAX[mp.kind - 1];
            let fh = dv>0 ? 1 : -1;
            for(let i=ov+fh; fh*i < fh*nv; i+=fh) {
                let bnv = parseInt(''+i) + ((dv>0)?0:1);
                if(bnv!=ov && bnv!=i)
                    chkpoints[chkpoints.length] = bnv;
                chkpoints[chkpoints.length] = i;
            }
            chkpoints[chkpoints.length] = nv;
            tge.log(tge.LogLevel.DEBUG, "dirIsX=", dr, "old=", ov, "dv=", dv, "chk=", chkpoints);
            let ret = null;
            for(let i=0; i<chkpoints.length; i++) {
                dr? mp.x=chkpoints[i] : mp.y=chkpoints[i];
                if(!this.chkOverlap(pindex, mp))
                    ret = dr?mp.x:mp.y;
                else
                    break;
            }
            if(ret == null) return null;
            dr? mp.x=ret : mp.y=ret;
            return {pindex:pindex, start:p[pindex], end:mp};
        }

        homingPiece(pindex:number) {
            let p = this.layout_origin.pieces;
            let mp = tge.clone(p[pindex]);
            let adj = Unblock.PADJ[mp.kind - 1];
            if(adj[0]>adj[1]) {
                mp.x = Math.round(mp.x);
            } else {
                mp.y = Math.round(mp.y);
            }
            return {pindex:pindex, end:mp};
        }

        isOverlap(p1:Piece, p2:Piece): boolean {
            let adj1 = Unblock.PADJ[p1.kind - 1],
                adj2 = Unblock.PADJ[p2.kind - 1];

            return (p1.x + adj1[0] > p2.x &&
                p2.x + adj2[0] > p1.x &&
                p1.y + adj1[1] > p2.y &&
                p2.y + adj2[1] > p1.y
            );
        }

        chkOverlap(pindex:number, mp:Piece) {
            let p = this.layout_run.pieces;
            for(var i=0; i<p.length; i++) {
                if(i==pindex) continue;
                if(this.isOverlap(mp, p[i]))
                    return true;
            }
            return false;
        }
    }
}
