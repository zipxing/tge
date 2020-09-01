namespace Tetris {
    //是否自动下落的选项
    export var ELS_AUTO = true;

    //是否经典块
    export var ELS_CLASSIC = true;

    //定义行数列数
    export const HENG:number = 10, ZONG:number = 21;
    export const GRIDW:number =HENG+4;
    export const GRIDH:number =ZONG+2;
    export const GRIDSIZE:number =(HENG+4)*(ZONG+2);


    //落到底后，达到稳定状态的延时
    export const WENDING=15;

    //为了保证AB两人的方块序列完全一致，事先生成好500个方块序列，500块后轮回取块
    export const MAXBLKQUEUE=500;

    //游戏的状态
    export enum ElsGameState  {
        HOMEPAGE = 0,       //HOMEPAGE
        PLAYING ,        //游戏中
        EMERGENCY ,      //紧急求助
        RESULT_LOSE ,    //本局失败
        RESULT_WIN ,     //本局胜利
        PAUSE ,          //暂停
        PASS_ALL ,       //通关所有关卡
        HELP ,           //帮助界面
        RANK ,           //排行榜界面
    };

    //游戏支持的几种模式
    export enum ElsMode {
        SINGLE = 0 ,
        ADVENTURE ,
        AI
    };

    //用于MoveBlk的参数
    export enum ElsMove {
        TURN_CW   = 0,  //顺时针旋转
        TURN_CCW  = 1,  //逆时针旋转
        DOWN      = 2,  //下落
        LEFT      = 3,  //左移
        RIGHT     = 4,  //右移
        SET       = 5,  //不移动，仅填充Grid
        CLEAR     = 6,  //不移动，在Grid中清除
        DDOWN     = 7   //直落，不会留滑动时间
    };

    //用于MoveBlk的返回值
    export enum ElsMoveRet {
        NORMAL        = 0,  //移动正常
        READY_BOTTOM  = 1,  //到达最底
        REACH_BORDER  = 2,  //到达两边
        REACH_BOTTOM  = 3
    }

    export var ELSTIMER_INIT=[30,30,30,30,30];

    //不同级别对应的下落时间
    export var DOWN_TIME=
        [1.0, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55,
            0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0.05];
    export var DOWN_TIME_NET=
        [1.0, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55,
            0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0.05];
    //升级的分数标准
    export var UPGRADE_STANTARD = 
        [0,269,728,1473,2651,4472,7241,11500,14500,18500,
            23000,29368,36387,45000,55000,70000, 90000,
            120000,160000,300000,1600000];

    //AI难度
    export var AI_SPEED = 
        [1.500, 1.000, 0.800, 0.600, 0.400,
            0.990, 0.980, 0.970, 0.960, 0.950,
            0.860, 0.850, 0.828, 0.800, 0.800,
            0.760, 0.730, 0.700, 0.680, 0.600,
            0.540, 0.500, 0.480, 0.430, 0.400,
            0.380, 0.360, 0.340, 0.320, 0.300,
            0.280, 0.260, 0.240, 0.220, 0.200,
            0.198, 0.196, 0.194, 0.192, 0.190,
            0.188, 0.186, 0.184, 0.182, 0.180,
            0.178, 0.176, 0.174, 0.172, 0.160
        ];
    //AI对战时候的每局计数时间的上限
    export var TIMER_COUNT = [
        50, 50, 50, 50, 50, 50, 50, 50, 50, 50,
        55, 55, 55, 55, 55, 55, 55, 55, 55, 55,
        60, 60, 60, 60, 60, 60, 60, 60, 60, 60,
        80, 80, 80, 80, 80, 80, 80, 80, 80, 80,
        100, 100, 100, 100, 100, 120, 120, 120, 120, 120,
        150, 150, 150, 150, 150, 150, 150, 150, 150, 150
    ];
}
