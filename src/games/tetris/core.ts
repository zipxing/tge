namespace Tetris {
    export class ElsCore {
        static _pool: any[] = [];
        grid: Uint8Array;
        col_top: number[];
        col_hole: number[];
        combo: number;
        cur_x: number;
        cur_y: number;
        cur_z: number;
        cur_block: number;
        next_block: number;
        save_block: number;
        top_line: number;
        tdx: number;
        tdy: number;
        fullrows: number[];
        cling_blocks: any[];
        block_index: number;
        attack: number[];
        ai_mode: string;
        save_lock: boolean;
        game_over: boolean;
        game_result: number;

        constructor() {
            this.grid = new Uint8Array(Tetris.GRIDSIZE);
            this.col_top = new Array(Tetris.HENG);
            this.col_hole = new Array(Tetris.HENG);
            this.combo=0;
            this.cur_x=this.cur_y=this.cur_z=0;
            this.cur_block=0;  //当前块
            this.next_block=0; //下一块
            this.save_block=0; //保存块
            this.top_line=0;
            this.tdx=this.tdy=0;           //记录将要落下虚影的坐标
            this.fullrows=[];
            this.cling_blocks=[];
            this.block_index=0;
            this.attack=new Array(2);//攻击行数和生成空洞随机种子 ０:行数,１:seed
            this.ai_mode="";
            this.save_lock=false;
            this.game_over=false;
            this.game_result=0;//0未得出结果, 1普通结束(经典模式), 2胜利, 3失败
        }

        clone() {
            let cloned = undefined;
            if (ElsCore._pool.length > 0){
                cloned = ElsCore._pool.pop();
            } else {
                cloned = new ElsCore();
            }
            this._assign(this, cloned);
            return cloned;
        }

        recycle() {
            ElsCore._pool.push(this);
        }

        _assign(src: ElsCore, dst: ElsCore) {
            dst.combo = src.combo;
            dst.cur_x = src.cur_x;
            dst.cur_y = src.cur_y;
            dst.cur_z = src.cur_z;
            dst.cur_block = src.cur_block;
            dst.next_block = src.next_block;
            dst.save_block = src.save_block;
            dst.top_line = src.top_line;
            dst.tdx = src.tdx;
            dst.tdy = src.tdy;
            dst.block_index = src.block_index;
            dst.ai_mode = src.ai_mode;
            dst.save_lock = src.save_lock;
            dst.game_over = src.game_over;
            dst.game_result = src.game_result;
            var d = dst.col_top;
            var s = src.col_top;
            d[0] = s[0];
            d[1] = s[1];
            d[2] = s[2];
            d[3] = s[3];
            d[4] = s[4];
            d[5] = s[5];
            d[6] = s[6];
            d[7] = s[7];
            d[8] = s[8];
            d[9] = s[9];
            d = dst.col_hole;
            s = src.col_hole;
            d[0] = s[0];
            d[1] = s[1];
            d[2] = s[2];
            d[3] = s[3];
            d[4] = s[4];
            d[5] = s[5];
            d[6] = s[6];
            d[7] = s[7];
            d[8] = s[8];
            d[9] = s[9];
            dst.attack[0] = src.attack[0];
            dst.attack[1] = src.attack[1];
            dst.fullrows = src.fullrows.slice();
            //dst.cling_blocks = src.cling_blocks.slice();
            dst.grid.set(src.grid);
        }
    }
}
