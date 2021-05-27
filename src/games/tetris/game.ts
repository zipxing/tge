import * as tge from "../../engine"
import * as constant from "./constant"
import * as block from "./block"
import { Model } from "./model"
import { ElsGrid } from "./grid"

export class Game extends tge.Game {
    mode: constant.ElsMode;
    bmp: number;
    seed: number;

    constructor(m:Model, r:tge.Render) {
        super(m, r);
        this.mode = constant.ElsMode.AI;
        this.bmp = 0;
        tge.srand(new Date().getTime());
        this.seed = tge.rand();
    }

    initGame() {
        let m = <Model>this.model;
        this.seed = tge.rand();
        m.init(this.bmp, this.seed);
        this.useract = [];
        this.doAction('D', 0);
        tge.Emitter.fire("Tetris.REDRAW_MSG");
    }

    restartGame() {
        this.initGame();
    }

    scheduleUpdate(dt: number) {
        let m = <Model>this.model;

        switch(this.mode) {
            case constant.ElsMode.SINGLE:
            case constant.ElsMode.ADVENTURE:
                if(m.pause) return;
                if(m.grids[0].core.game_over) return;
                this.playAutoAction(dt);
                this.playUserAction(dt);
                break;
            case constant.ElsMode.AI:
                if(m.pause) return;
                if(m.grids[0].core.game_over || m.grids[1].core.game_over) {
                    for(let i=0;i<this.useract.length;i++) {
                        if(this.useract[i] == 'I')
                            this.doAction(this.useract[i], 0);
                    }
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
        super.scheduleUpdate(dt);
    }

    //自然下落...
    playAutoAction(dt: number) {
        let m = <Model>this.model;
        //tdtime=DOWN_TIME[this.model.mgrid[0].mstat.level];
        let tdtime = constant.DOWN_TIME[0]*1000;
        if(this.timeout_auto>tdtime) {
            this.timeout_auto=0;
            //如果正在直落，不进行以下处理
            if(tge.Timer.getStage("0fall")!=0) 
                return;
            this.doAction('D', 0);
        } else {
            this.timeout_auto+=dt;
        }
    }

    //AI动作
    playAiAction(dt: number) {
        let m = <Model>this.model;
        if(m.mai.work2idx>=0)
            m.mai.getAIAct(m.grids[1]);
        if(this.timeout_ai>constant.AI_SPEED[0]*300) {
            //if(this.timeout_ai>0.0) {   //AIWORK
            let aiact = m.mai.getAIAct(m.grids[1]);
            this.doAction(aiact, 1);
            if(aiact=='W')
                tge.debug("play ai action.....");
            this.timeout_ai=0;
        } else {
            this.timeout_ai+=dt;
        }
    }

    //用户键盘输入
    playUserAction(dt: number) {
        for(let i=0;i<this.useract.length;i++) {
            this.doAction(this.useract[i], 0);
        }
        this.useract=[];
    }

    //检测攻击
    updateELS(id:number, dt:number) {
        let m = <Model>this.model;
        m.grids[0].checkAttack();
        m.grids[1].checkAttack();
    }

    //旋转动作的辅助函数
    _testTurn(pg: ElsGrid, dir: constant.ElsMove, testcmd: string) {
        let tcore=pg.core.clone();
        let mret;

        for(let i=0; i<testcmd.length; i++) {
            if(testcmd[i]=='L')
                pg.moveBlk(constant.ElsMove.LEFT, false);
            if(testcmd[i]=='R')
                pg.moveBlk(constant.ElsMove.RIGHT, false);
        }
        mret=pg.moveBlk(dir, false);
        if (mret==constant.ElsMoveRet.NORMAL) {
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
    doAction(act: string, index: number) {
        let dir;
        let pg = (<Model>this.model).grids[index];

        if(tge.Timer.getStage(index+"fall")!=0) 
            tge.Timer.cancel(index+"fall");

        switch (act) {
            case 'T':
            case 'U':
                //顺时针旋转。到边时，如果旋转遇到碰撞，就尝试自动左右移动，看看能否不碰撞了
                dir = (act=='T')?constant.ElsMove.TURN_CW:constant.ElsMove.TURN_CCW;
                //this.mrep.recordAction(index, act);
                if(pg.moveBlk(dir, false)==constant.ElsMoveRet.NORMAL) {
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
                //tge.debug("DOWN...");
                if(pg.moveBlk(constant.ElsMove.DOWN, false)==constant.ElsMoveRet.REACH_BOTTOM)
                    pg.nextBlk(false, false);
                //pg.testDDown();
                break;
            case 'Z':      //only for replay “ZHANZHU"
                pg.moveBlk(constant.ElsMove.DDOWN, false);
                pg.nextBlk(false, false);
                pg.testDDown();
                break;
            case 'L':
                pg.moveBlk(constant.ElsMove.LEFT, false);
                pg.testDDown();
                //this.mrep.recordAction(index, act);
                break;
            case 'R':
                pg.moveBlk(constant.ElsMove.RIGHT, false);
                pg.testDDown();
                //this.mrep.recordAction(index, act);
                break;
            case 'S':
                //this.mrep.recordAction(index, act);
                pg.saveBlk(false);
                pg.testDDown();
                break;
            case 'I':
                this.initGame();
                break;
            case 'N':
                //this.mrep.recordAction(index, act);
                break;
        }
    }
}
