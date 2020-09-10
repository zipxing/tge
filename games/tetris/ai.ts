namespace Tetris {
    const elsAiPolicyVS = {
        getMode: function(core: ElsCore) {
            core.ai_mode = (core.top_line > 10)?"safe":"normal"; 
            return core.ai_mode;
        },
        "safe": {
            init: 5000,
            clear_line: [0,6000,7200,10800,14400],
            fangcha: -0.5,
            top_avg: -300,
            hole: -2000,
            combo: [300000, 2500],
            xiagu_max: 2,
            xiagu: -500
        },
        "normal": {
            init: 5000,
            clear_line: [0,-7000,-6400,160,240],
            fangcha: -0.5,
            top_avg: -30,
            hole: -2500,
            combo: [300000, 2500],
            xiagu_max: 2,
            xiagu: -500
        }
    };

    const elsAiPolicyADV = {
        getMode: function(core: ElsCore) {
            core.ai_mode = (core.top_line > 10)?"safe":"normal"; 
            return core.ai_mode;
        },
        "safe": {
            init: 5000,
            clear_line: [0,6000,7200,10800,14400],
            fangcha: -0.5,
            top_avg: -300,
            hole: -2000,
            combo: [300000, 2500],
            xiagu_max: 1,
            xiagu: -500
        },
        "normal": {
            init: 5000,
            clear_line: [0,6000,7200,10800,14400],
            fangcha: -0.5,
            top_avg: -30,
            hole: -2500,
            combo: [300000, 2500],
            xiagu_max: 1,
            xiagu: -500
        }
    };

    //var AIP = elsAiPolicyVS;
    let AIP = elsAiPolicyADV;
    console.log(AIP["safe"]);

    export class ElsAi {
        mActQueue: string;
        tActQueue: string;
        maxScore: number;
        debugai: boolean;
        ms_scan: any[];
        work2idx: number;

        constructor() {
            this.mActQueue='';
            this.tActQueue='';
            this.maxScore=0;
            this.ms_scan = [];
            this.work2idx = -1;
            //this.fs=require("fs");
            //this.debuglog=this.fs.openSync("debugai.log", "w+");
            this.debugai=false;
        }

        //布局评分,用于AI计算最合理的摆法...
        getGridScore(tg: ElsGrid, cx: number, cy: number, 
            cf: number, nf: number, ccombo: number) {
            let core = tg.core;
            let am: string = core.ai_mode;
            let aip = AIP["safe"];
            if(am=="safe" || am=="normal")
                aip = AIP[am];
            let i, score=aip["init"], hole_count=0, top_total=0;
            let xiagu=new Array(HENG), xiagu_count=0, xiagu_total=0;
            //计算总空
            for(i=0; i<HENG; i++) {
                hole_count += core.col_hole[i];
                top_total += core.col_top[i]*10;
                xiagu[i] = 0;
                if(i==0) {
                    if(core.col_top[1] > core.col_top[0])
                        xiagu[i] = core.col_top[1]-core.col_top[0];
                } else if(i == HENG-1) {
                    if(core.col_top[i-1]>core.col_top[i])
                        xiagu[i]=core.col_top[i-1]-core.col_top[i];
                } else {
                    if((core.col_top[i+1]>core.col_top[i]) &&
                        (core.col_top[i-1]>core.col_top[i]))
                        xiagu[i]=Math.min(core.col_top[i-1],core.col_top[i+1])-core.col_top[i];
                }
                if(xiagu[i]>2)
                    xiagu_count++;
                xiagu_total+=xiagu[i];
            }

            //计算平均行高,计算行高方差
            let top_avg = top_total/HENG;
            let fangcha = 0;
            for(i=0; i<HENG; i++) {
                let t=core.col_top[i]*10-top_avg;
                fangcha+=(t*t);
            }

            //按方差评分
            score += fangcha*aip["fangcha"];

            //鼓励靠边...
            score += ((cx-5)*(cx-5)+(core.cur_x-5)*(core.cur_x-5))*5;

            //进攻模式不鼓励只消一两行，鼓励消掉两行以上
            score += aip.clear_line[cf];
            score += aip.clear_line[nf];

            //局面越低约均衡越好
            score += top_avg*aip.top_avg;

            //空洞越少越好
            score += hole_count*aip.hole;

            //连击加分
            if (ccombo>2)
            score += ccombo*aip.combo[0];
            else
            score += ccombo*aip.combo[1];

            //连击加分
            if(core.combo>2)
            score += core.combo*aip.combo[0];
            else
            score += core.combo*aip.combo[1];

            //峡谷越少越好，有一个大峡谷不怕，怕出现两个峡谷
            if(xiagu_count>=aip.xiagu_max)
            score+=aip.xiagu*xiagu_total;

            return score;
        }

        AI_F1(tg: ElsGrid, cx: number, cy: number, cf: number, 
            combo: number, fs: any, save: boolean, scan: boolean) {
            let b1 = tg.core.clone();
            let b2=null,b3=null;
            let bq='',bq1='',bq2='';

            bq=this.tActQueue;
            var tmpz;
            if(ELS_CLASSIC) 
            tmpz = ZCOUNT_C[tg.core.cur_block];
            else
            tmpz = ZCOUNT_NC[tg.core.cur_block];

            var tmpsave = save?1:0;

            for(var s2=0; s2<=tmpsave; s2++) {
                tg.core.recycle();
                tg.core = b1.clone();
                this.tActQueue=bq;
                if(s2!=0) {
                    this.tActQueue+='S';
                    tg.saveBlk(true);
                }
                b2 = tg.core.clone();
                bq1 = this.tActQueue;

                for(var nz=0; nz<tmpz; nz++) {
                    tg.core.recycle();
                    tg.core = b2.clone();
                    this.tActQueue = bq1;
                    //旋转
                    for(var n=0; n<nz; n++) {
                        this.tActQueue+='T';
                        tg.moveBlk(ElsMove.TURN_CW, true);
                    }

                    b3 = tg.core.clone();
                    bq2 = this.tActQueue;

                    for(var x2=0;x2<3;x2++) {
                        tg.core.recycle();
                        tg.core = b3.clone();
                        this.tActQueue = bq2
                        //左移
                        if(x2==1)
                            while(tg.moveBlk(ElsMove.LEFT, true)!=ElsMoveRet.REACH_BORDER) {
                                this.tActQueue+='L';
                                fs(this, tg, cx, cy, cf, combo, scan);
                            }
                        //右移
                        if(x2==2)
                            while(tg.moveBlk(ElsMove.RIGHT, true)!=ElsMoveRet.REACH_BORDER) {
                                this.tActQueue+='R';
                                fs(this, tg, cx, cy, cf, combo, scan);
                            }
                        if(x2==0)
                            fs(this, tg, cx, cy, cf, combo, scan);
                    }
                    b3.recycle();
                }
                b2.recycle();
            }
            b1.recycle();
        }

        AI_F2(tai: ElsAi, tg: ElsGrid, cxs: number, cys: number, 
            cfs: number, combo: number, scan:boolean) {
            let cx, cy, cf, ccombo;
            let bq0 = '';

            //保存现场
            let b0 = tg.core.clone();
            bq0 = tai.tActQueue;

            //直接下落
            while(tg.moveBlk(ElsMove.DDOWN, true)!=ElsMoveRet.REACH_BOTTOM);
            tai.tActQueue+='W';
            ccombo = tg.core.combo;
            cf = tg.core.fullrows.length;
            tg.clearRow(true);
            cx = tg.core.cur_x;
            cy = tg.core.cur_y;
            tg.nextBlk(true, false);
            tai.tActQueue+='N';

            let s = tai.getGridScore(tg, cx, cy, cf, 0, combo);
            if(scan) {
                tai.ms_scan[tai.ms_scan.length] = 
                    [s, tai.tActQueue, tg.core, cx, cy, cf, ccombo];
            } else {
                //if(s > tai.maxscore_scan)
                //    tai.AI_F1(tg, cx, cy, cf, ccombo, tai.AI_F3);
            }

            //恢复现场
            if(!scan) tg.core.recycle();
            tg.core = b0.clone();
            b0.recycle();
            tai.tActQueue=bq0;
        }

        AI_F3(tai: ElsAi, tg: ElsGrid, cx:number, cy:number, 
            cf:number, combo: number, scan:boolean) {
            let s, nf;
            let b;
            let bq='';
            b=tg.core.clone();
            bq=tai.tActQueue;

            let mx = 0;
            for(let i=0; i<4; i++) {
                let xx = tg.core.cur_x+i;
                if(xx>=HENG)
                    break;
                if(tg.core.col_top[xx]>mx)
                    mx=tg.core.col_top[xx];
            }
            tg.moveBlk(ElsMove.SET, true);

            //直接下落
            while(tg.moveBlk(ElsMove.DDOWN, true)!=ElsMoveRet.REACH_BOTTOM);
            tai.tActQueue+='W';
            nf = tg.core.fullrows.length;
            tg.clearRow(true);
            s = tai.getGridScore(tg, cx, cy, cf, nf, combo);
            if(s>tai.maxScore) {
                tai.mActQueue = tai.tActQueue;
                tai.mActQueue+='N';
                tai.maxScore=s;
            }

            tg.core.recycle();
            tg.core = b.clone();
            b.recycle();
            tai.tActQueue=bq;
        }

        //如果自动运行动作序列为空则计算生成指令序列，否则返回动作指令  
        getAIAct(tg: ElsGrid) {
            //return ''; //debug...
            let tai = this;
            let len = tai.mActQueue.length;
            let optN = 6;
            let minScore = -9000000000;

            //需要计算自动队列,第一帧先扫描第一块
            if(len==0 && tai.work2idx<0) {
                tai.maxScore = minScore;
                //保存现场
                let b = tg.core.clone();
                //遍历第一块获取分数和ms_scan列表
                tai.tActQueue='';
                tg.clearRow(true);
                AIP.getMode(tg.core);
                tai.ms_scan = [];
                tai.AI_F1(tg, 0, 0, 0, 0, tai.AI_F2, false, true);
                //高分在前面
                tai.ms_scan.sort(function _(a,b) {return (b[0]-a[0]);});
                //console.log('AISORT'+tai.ms_scan.length+':'+tai.ms_scan);
                //删除并释放topN个最低分数
                if(tai.ms_scan.length>optN) {
                    for(let i=0; i<optN; i++) {
                        let tmp = tai.ms_scan.pop();
                        tmp[2].recycle();
                    }
                }
                tai.work2idx = tai.ms_scan.length-1;
                tg.core.recycle();
                tg.core = b.clone();
                b.recycle();
                return '';
            }

            //针对ms_scan列表,进行第二块的遍历运算,每帧只算1个布局
            if(tai.work2idx>=0) {
                let b = tg.core.clone();
                let m = tai.ms_scan[tai.work2idx];
                tg.core = m[2];
                tai.tActQueue = m[1];
                tai.AI_F1(tg, m[3], m[4], m[5], m[6], tai.AI_F3, false, false);
                tg.core.recycle();
                tg.core = b.clone();
                b.recycle();
                tai.work2idx-=1;
                if(tai.work2idx==-1) 
                    tai.ms_scan = [];
                return '';
            }

            //取走第一个动作码，返回
            let cret = tai.mActQueue[0];
            tai.mActQueue = tai.mActQueue.slice(1);
            return cret;
        }
    }
}

