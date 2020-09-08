namespace Tetris {
    //玩家区域网格,关键变量,以及核心处理逻辑
    export class ElsGrid {
        core: ElsCore;
        stat: ElsStat;
        model: Tetris.Model;
        block_queue: number[];
        block_data: any;
        index: number;
        is_active: boolean;
        need_draw: boolean;
        fang_cha: number[];
        ready_wending: number;

        constructor (mod: Tetris.Model, i: number) {
            this.model = mod;
            this.core=new ElsCore();
            this.stat=new ElsStat();
            this.is_active=false;
            this.block_queue=[];
            this.block_data=null;
            this.index=i;
            this.need_draw = true;
            this.fang_cha = [];
            this.ready_wending = 0;
        }

        //用于冒险模式设置10x10地图
        setBmp(bmp: number[][]) {
            let mc = this.core;
            for (let i=0; i<ZONG; i++) {
                for (let j=0; j<HENG; j++) {
                    mc.grid[i*GRIDW + 2+j] =
                        (i>=(ZONG-10)) ?
                        (100 + bmp[i - (ZONG-10)][j]) :
                        0;
                    if(mc.grid[i*GRIDW + 2+j]==100) {
                        mc.grid[i*GRIDW + 2+j]=0;
                    }
                }
            }
        }

        //用于AI模式设置难度
        setLevel(nandu: number) { 
            this.stat.level = nandu; 
        }

        //设置方块类别，目前支持经典和非经典两种，参考block.h
        setBlkDat(bd: any) { 
            this.block_data = bd; 
        }

        //设置方块序列
        setQueue(queue: number[]) { 
            this.block_queue=queue; 
            tge.log(tge.LogLevel.INFO, "mq in setqueue:\n", queue);
        }

        //重置数据，每局开始调用
        reset() {
            let mc = new ElsCore();
            this.core = mc;

            tge.Timer.register(this.index+"next-block", 0.8, ()=>{});

            tge.Timer.register(this.index+"clear-row", 0.3, ()=>{
                this.clearRow(false);
            });

            tge.Timer.register(this.index+"game-over", 0.12, ()=>{
                tge.log(tge.LogLevel.INFO, "OVER"+this.index);
                mc.game_over=true;
                //if(tgrid.index==1)
                //    process.exit(1);
            });

            tge.Timer.register(this.index+"fall", 0.01, ()=>{
                this.fall();
            });

            tge.Timer.register(this.index+"combo", 0.8, ()=>{});

            tge.Timer.register(this.index+"attack", 0.8, ()=>{});

            //设置初始grid.边框置为200，限制方块活动范围
            for (let i=0; i<ZONG+2; i++) 
                for (let j=0; j<HENG+4; j++)
                    mc.grid[i*GRIDW + j]=200;

            for (let i=0; i<ZONG; i++) 
                for (let j=0; j<HENG; j++) 
                    mc.grid[i*GRIDW + 2+j]=0;

            //初始化各种变量
            mc.cur_block  = this.block_queue[0];
            mc.next_block = this.block_queue[1];
            mc.save_block = -1;
            mc.save_lock  = false;
            mc.cur_x = 5;
            mc.cur_y = 0;
            mc.cur_z = 0;
            mc.game_over = false;
            mc.block_index = 0;
            mc.game_result = 0;

            //计算初始col,hole,top
            //UpdateColHoleTop(2, 11);

            //用于判断用户是否主动放弃
            this.fang_cha = [];
        }

        //下一块
        nextBlk(ai:boolean, issave:boolean) {
            if(!ai)
                this.stat.addScore(10);

            let mc = this.core;
            mc.block_index++;
            mc.cur_block = mc.next_block;
            if (!issave)
                tge.Timer.fire(this.index+"next-block", 0.8);
            mc.cur_x=5;
            mc.cur_y=0;
            mc.cur_z=0;
            this.moveBlk(ElsMove.SET, ai);
            mc.next_block = this.block_queue[(mc.block_index+1) % MAXBLKQUEUE];

            if (!ai && this.index==0)
                this.fang_cha[mc.block_index] = this.calcFangCha();
        }

        calcFangCha(){
            let mc = this.core;
            //计算总空
            let top_total = 0;
            for (let i = 0; i < HENG; i++) {
                top_total += mc.col_top[i] * 10;
            }

            //计算平均行高,计算行高方差
            let top_avg = top_total / HENG;
            let fang_cha = 0;
            for (let i = 0; i < HENG; i++) {
                let t = mc.col_top[i] * 10 - top_avg;
                fang_cha += (t * t);
            }
            return fang_cha;
        }

        isUserGiveup() {
            // 先计算一下方差,看看是不是用户自己放弃了
            let giveup = false;

            // 当前方差
            let curfang_cha = this.fang_cha[this.fang_cha.length - 1];
            // 5步之前的方差
            let step = 0;
            if (this.fang_cha.length >= 6)
                step = this.fang_cha.length - 6;
            let prefang_cha = this.fang_cha[step];
            if (curfang_cha > 13000 || Math.abs(curfang_cha - prefang_cha) > 7000)
                giveup = true;

            return giveup;
        }

        //暂存块,每次确认下落后才能再次存(save_lock)
        saveBlk(ai:boolean) {
            let mc = this.core;
            if(!mc.save_lock) {
                mc.save_lock = true;
                this.moveBlk(ElsMove.CLEAR, ai);
                if(mc.save_block>=0) {
                    var blktmp = mc.cur_block;
                    mc.cur_block = mc.save_block;
                    mc.save_block = blktmp;
                    mc.cur_x=5;
                    mc.cur_y=0;
                    mc.cur_z=0;
                    this.moveBlk(ElsMove.SET, ai);
                } else {
                    mc.save_block = mc.cur_block;
                    this.nextBlk(ai, false);
                }
                //触发保存块动画
                //this.mtimer.save_block = 10;
            }
        }

        //消除最底下三行
        clearThreeBottomLines() {
            let mc = this.core;
            if(this.index != 0)
                return;

            for(let i = ZONG-5; i < ZONG; i++){
                for(let j=2; j < HENG+2;j++){
                    mc.grid[i * GRIDW + j] = 
                        101 + Math.floor(Math.random()*1000) % 6;
                }
            }
            mc.fullrows=[16,17,18,19,20];
            this.clearRow(false);
            //this.mtimer.trigger("clear-row", nge.clone(mc.fullrows));
        }

        clearRow(ai: boolean) {
            let mc = this.core;
            if(!ai) {
                if(tge.Timer.getStage(this.index+"game-over") != 0) {
                    tge.Timer.cancel(this.index+"game-over");
                    mc.game_over=false;
                }
            }

            if(mc.fullrows.length%100 != 0) {
                let i,j,n;
                for(n=0; n<mc.fullrows.length%100; n++) {
                    for(i=mc.fullrows[n]; i>=0; i--) {
                        for (j=0; j<HENG; j++) {
                            if(i) {
                                if(mc.grid[(i-1)*GRIDW + j+2]>100 || mc.grid[(i-1)*GRIDW + j+2]==0) {
                                    if(!(mc.grid[i*GRIDW + j+2]<10 && mc.grid[i*GRIDW + j+2]>0))
                                        mc.grid[i*GRIDW + j+2]=mc.grid[(i-1)*GRIDW + j+2];
                                } else if(!(mc.grid[i*GRIDW + j+2]<10 && mc.grid[i*GRIDW + j+2]>0)) {
                                    mc.grid[i*GRIDW + j+2]=0;
                                }
                            } else {
                                if(!(mc.grid[i*GRIDW + j+2]<10 && mc.grid[i*GRIDW + j+2]>0))
                                    mc.grid[i*GRIDW + j+2]=0;
                            }
                        }
                    }
                    mc.fullrows[n]=0;
                }
                this.updateColHoleTop(2, 11);
            }
            mc.fullrows.length=0;
        }

        fall() {
            do{
                if(this.core.game_over) break;
            } while (this.moveBlk(ElsMove.DDOWN, false) != 
                ElsMoveRet.REACH_BOTTOM);
            this.nextBlk(false, false);
            this.testDDown();
        }

        updateColHoleTop(gxs: number, gxe: number) {
            let m, n;
            let mc = this.core;
            for(m=gxs; m<=gxe; m++) {
                mc.col_top[m-2] = 0;
                mc.col_hole[m-2] = 0;
                for (n=ZONG; n>0; n--) {
                    if (mc.grid[(ZONG-n)*GRIDW + m]>100) {
                        mc.col_top[m-2] = n;
                        break;
                    }
                }
                for(; n>0; n--) {
                    if (mc.grid[(ZONG-n)*GRIDW + m]==0)
                        mc.col_hole[m-2]+=n;
                }
            }
            mc.top_line = 0;
            for (m=0; m<HENG; m++) 
                if(mc.col_top[m]>mc.top_line)
                    mc.top_line = mc.col_top[m];

            //检测紧急模式
            // this.mod.checkEmergency();
        }

        //用于预先绘制下落到底部的虚影，用于更好的瞄准
        testDDown() {
            //return 0; //debug...
            let x, y;
            let mc = this.core;
            let tmp = mc.clone();
            while (this.moveBlk(ElsMove.DDOWN, true) != 
                ElsMoveRet.REACH_BOTTOM);
            x = mc.cur_x, y = mc.cur_y;
            mc.recycle();
            mc = tmp.clone();
            tmp.recycle();
            mc.tdx = x, mc.tdy = y;
            return 0;
        }

        //操作方块,更新Grid
        moveBlk(dir:ElsMove, ai:boolean) {
            let i, j, m, n ,fflag;
            let mc = this.core;
            let md = this.block_data;

            if(mc.game_over) {
                if (dir == ElsMove.LEFT || dir == ElsMove.RIGHT)
                    return ElsMoveRet.REACH_BORDER;
                else
                    return ElsMoveRet.REACH_BOTTOM;
            }

            if(!ai)
                this.need_draw = true;

            let blk = mc.cur_block;
            let cx = mc.cur_x;
            let cy = mc.cur_y;
            let cz = mc.cur_z;
            let x=0, y=0, z=0;

            switch (dir) {
                case ElsMove.TURN_CW:
                    x=cx;
                    y=cy;
                    z=(cz+5)%4;
                    this.ready_wending =Tetris.WENDING;
                    break;
                case ElsMove.TURN_CCW:
                    x=cx;
                    y=cy;
                    z=(cz+3)%4;
                    this.ready_wending =Tetris.WENDING;
                    break;
                case ElsMove.DOWN:
                case ElsMove.DDOWN:
                    x=cx,y=cy+1,z=cz;
                    break;
                case ElsMove.LEFT:
                    x=cx-1,y=cy,z=cz;
                    this.ready_wending =Tetris.WENDING;
                    break;
                case ElsMove.RIGHT:
                    x=cx+1,y=cy,z=cz;
                    this.ready_wending =Tetris.WENDING;
                    break;
                case ElsMove.SET:
                    x=cx,y=cy,z=cz;
                    break;
                case ElsMove.CLEAR:
                    x=cx,y=cy,z=cz;
                    break;
            }


            //不稳定块置0,100以上为已经下落稳定的块
            for(i=0; i<4; i++) 
                for(j=0; j<4; j++) 
                    if(this.isInGrid(cy+i, cx+j) && mc.grid[(cy+i)*GRIDW + cx+j]<100)
                        mc.grid[(cy+i) * GRIDW + cx+j]=0;

            if (dir == ElsMove.CLEAR) 
                return ElsMoveRet.NORMAL; //清除漂浮的块

            for(i=0; i<4; i++) {
                for(j=0; j<4; j++) {
                    //检测到了碰撞,可能是到底,到边,或者遇到了别的块,无法下落
                    if(mc.grid[(y+i)*GRIDW + x+j] && md[blk][z][i*4+j]) {
                        let gv = mc.grid[(y+i)*GRIDW + x+j];
                        let mv = md[blk][z][i*4+j];
                        if (dir == ElsMove.DOWN || dir ==ElsMove.DDOWN) {
                            if (dir ==ElsMove.DOWN) {
                                //普通下落（非直落）还没粘住的情况
                                if(this.ready_wending>=0) {
                                    //触发UpdateELS开始对ready_wending计数
                                    if (this.ready_wending == WENDING)
                                        this.ready_wending--;
                                    for(m=0; m<4; m++) {
                                        for(n=0; n<4; n++) {
                                            if(this.isInGrid(cy+m, cx+n) && md[blk][z][m*4+n])
                                                mc.grid[(cy+m)*GRIDW + cx+n] = md[blk][z][m*4+n];
                                        }
                                    }
                                    return ElsMoveRet.READY_BOTTOM;
                                } else {
                                    this.ready_wending = WENDING;
                                }
                            }

                            //加100设置为稳定块，并统计需要显示粘住光晕的块位置
                            if (!ai) {
                                mc.cling_blocks.length=0;
                            }
                            for(m=0; m<4; m++) {
                                for(n=0; n<4; n++) {
                                    if(this.isInGrid(cy+m, cx+n) && md[blk][z][m*4+n]) {
                                        mc.grid[(cy+m)*GRIDW + cx+n] = 100+md[blk][z][m*4+n]; //加100,置为稳定块
                                        if (!ai) {
                                            if(mc.grid[(cy+m)*GRIDW + cx+n]!=100) {
                                                //纪录下需要显示“粘住光晕”的块坐标及个数
                                                let tp:tge.Point = {
                                                    x: cx+n-2,
                                                    y: cy+m
                                                };
                                                mc.cling_blocks.push(tp);
                                            }
                                        }
                                    }
                                }
                            }

                            this.updateColHoleTop(2, 11);

                            //标注满行，检测满行信息 标记到fullrow里 同时标记full_rows_count
                            //扫描判断满行,放入fullrows数组
                            for(m=0; m<4; m++) {
                                fflag=true;
                                for (n = 0; n < HENG; n++) {
                                    if(this.isInGrid(cy+m, n+2)) {
                                        if(mc.grid[(cy+m) * GRIDW + n+2]<100 || 
                                            mc.grid[(cy+m) * GRIDW + n+2]==200) {
                                            fflag=false;
                                            break;
                                        }
                                    }
                                }
                                if(fflag) {
                                    mc.fullrows.push(cy+m);
                                }
                            }
                            //如果有满行，设置full_rows_count
                            if (mc.fullrows.length>0) {
                                if(!ai) { 
                                    //console.log("fullrows......"+this.core.fullrows.length);
                                    if(tge.Timer.getStage(this.index+"game-over") != 0) {
                                        tge.Timer.cancel(this.index+"game-over");
                                        mc.game_over=false;
                                    }
                                }
                                mc.combo++;
                                if (!ai) {
                                    mc.attack[0]=mc.fullrows.length-1;
                                    if(mc.combo>=3) {
                                        this.stat.combo_total+=mc.combo;
                                        if(mc.combo>this.stat.combo_max)
                                            this.stat.combo_max=mc.combo;
                                        this.stat.combo_current=mc.combo;
                                        mc.attack[0]++; // 如果连击数大于等于3   再给别人加一行
                                        tge.Timer.fire(this.index+"combo", mc.combo);
                                        this.stat.addScore(mc.combo * 100);
                                    }
                                    mc.attack[1]=mc.block_index;
                                    this.stat.clear_lines+=mc.fullrows.length;
                                    var fs = [50, 150, 300, 500];
                                    this.stat.addScore(fs[mc.fullrows.length-1]);
                                    tge.Timer.fire(this.index+"clear-row", tge.clone(mc.fullrows));
                                    //if(this.mconf.mode == Tetris.ELS_MODE_AI)
                                    //    this.stat.addScore(mc.attack[0] * 10000);
                                }
                            } else {
                                mc.combo = 0;
                                this.stat.combo_current = 0;
                            }
                            //进入了下一块处理,可以保存块了
                            mc.save_lock = false;
                            return ElsMoveRet.REACH_BOTTOM;
                        } else if (dir == ElsMove.LEFT || dir == ElsMove.RIGHT) {
                            for(i=0; i<4; i++){
                                for(j=0; j<4; j++) {
                                    if(this.isInGrid(cy+i, cx+j) && mc.grid[(cy+i) * GRIDW + cx+j] == 0)
                                        mc.grid[(cy+i) * GRIDW + cx+j]+=md[blk][z][i*4+j];
                                }
                            }
                            return ElsMoveRet.REACH_BORDER;
                        } else {
                            if (dir == ElsMove.TURN_CW || dir == ElsMove.TURN_CCW) {
                                for(i=0; i<4; i++)
                                    for(j=0; j<4; j++) {
                                        if(this.isInGrid(y+i, x+j) && mc.grid[(y+i)*GRIDW + x+j]==0)
                                            mc.grid[(y+i)*GRIDW + x+j]+=md[blk][cz][i*4+j];
                                    }
                                return ElsMoveRet.REACH_BORDER;
                            }
                            //调用NextBlk会调用MoveBlk(SET),
                            //此时方块刚出来就有碰撞表明Game Over了
                            if (dir == ElsMove.SET && !ai) {
                                //console.log("TRIGGER OVER");
                                this.stat.isko = true;
                                tge.Timer.fire(this.index+"game-over", 0.12);
                            }
                            return ElsMoveRet.NORMAL;
                        }
                    }
                }
            }
            //更新真正的Grid,置当前x,y,z,返回
            for(i=0; i<4; i++) {
                for(j=0; j<4; j++) {
                    if (this.isInGrid(y+i, x+j)) {
                        mc.grid[(y+i)*GRIDW + x+j]+=md[blk][z][i*4+j];
                    }
                }
            }
            mc.cur_x=x;
            mc.cur_y=y;
            mc.cur_z=z;
            if(!ai)
                this.testDDown();
            return ElsMoveRet.NORMAL;
        }

        isInGrid(x:number, y:number) {
            return ((x>=0 && x<ZONG+2) && (y>=0 && y<HENG+4));
        }

        checkAttack() {
            let mc = this.core;
            if (mc.game_over) return;

            //检测执行攻击
            if(mc.attack[0]) {
                if(!mc.game_over) {
                    this.attack(this.model.grids[1-this.index], mc.attack[0], mc.attack[1]);
                    this.model.grids[1-this.index].testDDown();
                    tge.Timer.fire(this.index+"attack", mc.attack[0]);
                }
                mc.attack[0]=0;
            }
        }

        //攻击对方
        attack(target:ElsGrid, line:number, spaceseed:number) {
            let i, j, flowflag=0;
            let tgrid:Uint8Array;

            if(target.core.game_over||line<=0) return;
            if(tge.Timer.getStage(target.index+"clear-row")) 
                tge.Timer.cancel(target.index+"clear-row");
            if(tge.Timer.getStage(target.index+"fall")) 
                tge.Timer.cancel(target.index+"fall");

            tge.srand(spaceseed);
            tgrid = new Uint8Array(Tetris.GRIDSIZE);
            tgrid.set(target.core.grid);
            for (i = 0; i <Tetris.ZONG-line; i++) {
                for (j = 0; j <Tetris.HENG; j++) {
                    tgrid[i * Tetris.GRIDW + 2+j]=target.core.grid[(i+line) * Tetris.GRIDW + 2+j];
                    if(tgrid[i * Tetris.GRIDW + 2+j]<10 && tgrid[i * Tetris.GRIDW + 2+j]>0) {
                        flowflag=1;
                        tgrid[i * Tetris.GRIDW + 2+j]=0;
                    }
                }
            }

            for( i=0; i<line; i++) {
                let r = tge.rand() % HENG;
                for(j=0; j<HENG; j++) {
                    if(r == j) {
                        tgrid[(ZONG-1-i)*GRIDW + 2+j]=0;
                    }
                    else {
                        tgrid[(ZONG-1-i)*GRIDW + 2+j]=111;
                    }
                }
            }

            target.core.grid = new Uint8Array(Tetris.GRIDSIZE);
            target.core.grid.set(tgrid);

            if (flowflag) {
                let x=target.core.cur_x;
                let y=target.core.cur_y;
                let z=target.core.cur_z;
                let blk=target.core.cur_block;
                let needUp=false;
                for(i=0; i<4; i++)
                    for(j=0; j<4; j++) {
                        if(this.isInGrid(y+i,x+j)) {
                            if(target.core.grid[(y+i)*GRIDW + x+j]&&target.block_data[blk][z][i*4+j])
                                needUp=true;
                        }
                    }
                if (needUp) {
                    //printf("ATTACK NEED UP CURRENT BLOCK!\n");
                    target.core.cur_y-=line;
                    y=target.core.cur_y;
                }
                for(i=0; i<4; i++)
                    for(j=0; j<4; j++) {
                        if(this.isInGrid(y+i, x+j))
                            target.core.grid[(y+i)*GRIDW + x+j]+=target.block_data[blk][z][i*4+j];
                    }
            }

            for (i = 0; i <Tetris.HENG;i++)
                target.core.col_top[i]+=line;

            if (target.core.fullrows.length!=0) {
                for (let f=0; f<target.core.fullrows.length; f++)
                    target.core.fullrows[f]-=line;
                //DumpELS(idx, "ATTACK add fullrows!!!");
            }
            //TODO:攻击影响col_hole
        }

        update(dt: number) {
            if (this.ready_wending != WENDING) {
                this.ready_wending--;
            }
        }
    }
}
