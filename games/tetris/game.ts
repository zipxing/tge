namespace Tetris {
    export class Game extends tge.Game {
        mode: ElsMode;
        bmp: number;
        seed: number;

        constructor(m:Tetris.Model, r:Tetris.TermRender) {
            super(m, r);
            this.mode = ElsMode.AI;
            this.bmp = 0;
            this.seed = 0;
        }

        initGame() {
            let m = <Tetris.Model>this.model;
            m.init(this.bmp, this.seed);
            this.playActionBase(0, 'D');
        }

        restartGame() {
            this.initGame();
        }

        scheduleUpdate(dt: number) {
            let m = <Tetris.Model>this.model;

            switch(this.mode) {
                case ElsMode.SINGLE:
                case ElsMode.ADVENTURE:
                    if(m.pause) return;
                    if(m.grids[0].core.game_over) return;
                    this.playAutoAction(dt);
                    this.playUserAction(dt);
                    break;
                case ElsMode.AI:
                    if(m.pause) return;
                    if(m.grids[0].core.game_over || m.grids[1].core.game_over) {
                        return;
                    }
                    this.playAutoAction(dt);
                    this.playUserAction(dt);
                    this.playAiAction(dt);
                    //if(this.model.mgrid[1].mcore.top_line<3 && this.model.mgrid[1].mcore.block_index>1) {
                    //AIWORK
                    //nge.log("success!!!");
                    //process.exit();
                    //}
                    break;
                default:
                    ;
            }
            for(let i=0; i<2; i++) 
                this.updateELS(i, dt);
        }

        //自然下落...
        playAutoAction(dt: number) {
            //自然下落...
            let m = <Model>this.model;
            //tdtime=DOWN_TIME[this.model.mgrid[0].mstat.level];
            let tdtime = DOWN_TIME[0]*1000;
            if(this.timeout_auto>tdtime) {
                this.timeout_auto=0;
                //如果正在直落，不进行以下处理
                if(tge.Timer.getStage("0fall")!=0) 
                    return;
                this.playActionBase(0, 'D');
            } else {
                this.timeout_auto+=dt;
            }
        }

        //AI动作
        playAiAction(dt: number) {
            /*
            //if(this.timeoai>AI_SPEED[this.model.mgrid[1].mstat.level]) {
        if(this.timeoai>AI_SPEED[0]*1000) {
            //if(this.timeoai>0.0) {   //AIWORK
            var aiact = this.model.mai.getAIAct(this.model.mgrid[1]);
            this.playActionBase(1, aiact);
            if(aiact=='W')
                nge.log("play ai action.....");
            this.timeoai=0;
        } else {
            this.timeoai+=dt;
        }*/
        }

        //用户键盘输入
        playUserAction(dt: number) {
            for(let i=0;i<this.useract.length;i++)
                this.playActionBase(0, this.useract[i]);
            this.useract=[];
        }

        //检测攻击
        updateELS(id:number, dt:number)
        {
            let m = <Model>this.model;
            m.grids[0].checkAttack();
            m.grids[1].checkAttack();
            //更新内部定时器等操作
            m.grids[id].update(dt);
        }

        //旋转动作的辅助函数
        _testTurn(pg: ElsGrid, dir: ElsMove, testcmd: string) {
            let tcore=pg.core.clone();
            let mret;

            for(let i=0; i<testcmd.length; i++) {
                if(testcmd[i]=='L')
                    pg.moveBlk(ElsMove.LEFT, false);
                if(testcmd[i]=='R')
                    pg.moveBlk(ElsMove.RIGHT, false);
            }
            mret=pg.moveBlk(dir, false);
            if (mret==ElsMoveRet.NORMAL) {
                pg.testDDown();
                return true;
            } else {
                pg.core.recycle();
                pg.core=tcore.clone();
                tcore.recycle();
            }
            return false;
        }

        //执行动作码的基础方法
        playActionBase(index: number, act: string) {
            let dir;
            let pg = (<Model>this.model).grids[index];

            if(tge.Timer.getStage(index+"fall")!=0) 
                tge.Timer.cancel(index+"fall");

            switch (act) {
                case 'T':
                case 'U':
                    //顺时针旋转。到边时，如果旋转遇到碰撞，就尝试自动左右移动，看看能否不碰撞了
                    dir = (act=='T')?ElsMove.TURN_CW:ElsMove.TURN_CCW;
                    //this.mrep.recordAction(index, act);
                    if(pg.moveBlk(dir, false)==ElsMoveRet.NORMAL) {
                        pg.testDDown();
                        break;
                    } else {
                        //开始尝试左右移动再转...
                        if(this._testTurn(pg, dir, "L"))
                            break;
                        if(this._testTurn(pg, dir, "LL"))
                            break;
                        if(this._testTurn(pg, dir, "R"))
                            break;
                        if(this._testTurn(pg, dir, "RR"))
                            break;
                    }
                    break;
                case 'W':
                    //this.mrep.recordAction(index, act);
                    tge.Timer.fire(index+"fall", '');
                    break;
                case 'D':
                    //this.mrep.recordAction(index, act);
                    if(pg.moveBlk(ElsMove.DOWN, false)==ElsMoveRet.REACH_BOTTOM)
                        pg.nextBlk(false, false);
                    pg.testDDown();
                    break;
                case 'Z':      //only for replay “ZHANZHU"
                    pg.moveBlk(ElsMove.DDOWN, false);
                    pg.nextBlk(false, false);
                    pg.testDDown();
                    break;
                case 'L':
                    pg.moveBlk(ElsMove.LEFT, false);
                    pg.testDDown();
                    //this.mrep.recordAction(index, act);
                    break;
                case 'R':
                    pg.moveBlk(ElsMove.RIGHT, false);
                    pg.testDDown();
                    //this.mrep.recordAction(index, act);
                    break;
                case 'S':
                    //this.mrep.recordAction(index, act);
                    pg.saveBlk(false);
                    pg.testDDown();
                    break;
                case 'N':
                    //this.mrep.recordAction(index, act);
                    break;
            }
        }
    }
}
