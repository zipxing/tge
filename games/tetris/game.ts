namespace Tetris {
    export class Game extends tge.Game {
        mode: ElsMode;
        bmp: number;
        seed: number;

        constructor(m:ElsModel, r:ElsRender) {
            super(m, r);
            this.mode = ElsMode.AI;
            this.bmp = 0;
            this.seed = 0;
        }

        initGame() {
            let m = <Tetris.ElsModel>this.model;
            m.init(this.bmp, this.seed);
            this.playActionBase(0, 'D');
        }

        restartGame() {
            this.initGame();
        }

        scheduleUpdate(dt: number) {
            let m = <Tetris.ElsModel>this.model;

            switch(this.mode) {
                case ElsMode.SINGLE:
                    if(m.pause) return;
                    if(m.mgrid[0].mcore.game_over) return;
                    this.playAutoDownAction(dt);
                    this.playUserAction(dt);
                    break;
                case ElsMode.ADVENTURE:
                    if(m.pause) return;
                    if(m.mgrid[0].mcore.game_over) return;
                    //if(this.model.timeUsed>=this.model.mconf.bmp_time[0]) 
                    //    this.model.mgrid[0].mtimer.trigger("game-over"); 
                    this.playAutoDownAction(dt);
                    this.playUserAction(dt);
                    break;
                case ElsMode.AI:
                    if(m.pause) return;
                    if(m.mgrid[0].mcore.game_over || m.mgrid[1].mcore.game_over) {
                        return;
                    }
                    this.playAutoDownAction(dt);
                    this.playUserAction(dt);
                    this.playAIAction(dt);
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
        playAutoDownAction(dt: number) {
            //自然下落...
            let m = <ElsModel>this.model;
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
        playAIAction(dt: number) {
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
            let m = <ElsModel>this.model;
            m.mgrid[0].checkAttack();
            m.mgrid[1].checkAttack();
            //更新内部定时器等操作
            m.mgrid[id].update(dt);
        }

                    //旋转动作的辅助函数
                    _testTurn: function(pg, dir, testcmd) {
                                 var tcore=nge.clone(pg.mcore);
                                 var mret;

                                 for(var i=0; i<testcmd.length; i++) {
                                   if(testcmd[i]=='L')
                                     pg.moveBlk(LEFT, false);
                                   if(testcmd[i]=='R')
                                     pg.moveBlk(RIGHT, false);
                                 }
                                 mret=pg.moveBlk(dir, false);
                                 if (mret==NORMAL) {
                                   pg.testDDown();
                                   return true;
                                 } else 
                                   pg.mcore=nge.clone(tcore);
                                 return false;
                               },

                    //执行动作码的基础方法
                    playActionBase: function(index, act)
                    {
                      var dir;
                      var pg = this.model.mgrid[index];

                      if(pg.mtimer.getstat("fall")!=0) pg.mtimer.cancel("fall");
                      switch (act)
                      {
                        case 'T':
                        case 'U':
                          //顺时针旋转。到边时，如果旋转遇到碰撞，就尝试自动左右移动，看看能否不碰撞了
                          dir = (act=='T')?TURN_CW:TURN_CCW;
                          //this.mrep.recordAction(index, act);
                          if(pg.moveBlk(dir, false)==NORMAL) {
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
                          pg.mtimer.trigger("fall");
                          break;
                        case 'D':
                          //this.mrep.recordAction(index, act);
                          if(pg.moveBlk(DOWN, false)==REACH_BOTTOM)
                            pg.nextBlk(false);
                          pg.testDDown();
                          break;
                        case 'Z':      //only for replay “ZHANZHU"
                          pg.moveBlk(DDOWN, false);
                          pg.nextBlk(false);
                          pg.testDDown();
                          break;
                        case 'L':
                          pg.moveBlk(LEFT, false);
                          pg.testDDown();
                          //this.mrep.recordAction(index, act);
                          break;
                        case 'R':
                          pg.moveBlk(RIGHT, false);
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
                    },
});

//Main entry...
var m = new ElsModel();
var r = new ElsRender();
var game = new ElsGame(m, r);
if(nge.mode=="TERMINAL") {
  //game.initGame(ELS_MODE_NET,0,REPSEED);
  //game.model.mconf.isreplay=true;
  game.initGame(ELS_MODE_AI, process.argv[2], process.argv[3]);
  game.regKeyAction({'up':'T', 'down':'D', 'left':'L', 'right':'R', 'space':'W'});
}
if(nge.mode=="WEB") {
  nge.regCanva("main");
  nge.regCanva("l2");
  game.initGame(REPMODE,-1,REPSEED,true);
  //game.initGame(ELS_MODE_AI, 0, 0);
}
nge.run(game);

