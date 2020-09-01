namespace Tetris {
    export class ElsModel extends tge.Model {
        mgrid: ElsGrid[];
        stage: number;
        emergencyCount: number;
        pause: boolean;
        currentStage: number;
        currentStatus: ElsGameState;
        allowDoPopAction: boolean;
        mBlockQueue: number[];

        constructor() {
            super();
            this.mgrid=[];
            this.stage=0;
            this.emergencyCount = 1;
            this.pause=false;
            this.currentStage = 0;
            this.currentStatus = ElsGameState.HOMEPAGE;
            this.allowDoPopAction = true;
            for(var i=0;i<2;i++) {
                this.mgrid[i]=new ElsGrid('', i);
            }
            this.mBlockQueue = new Array(MAXBLKQUEUE);
        }

        //生成随机块序列
        genRandomBlockQueue(seed:number)
        {
            tge.srand(seed);
            if (ELS_CLASSIC) {
                let tmptype;
                let block_tmp = -1;
                //生成500个块的序列
                for (let i = 0; i <MAXBLKQUEUE; i++) {
                    while (true) {
                        tmptype = tge.rand()%9;
                        if (block_tmp!=tmptype)
                            break;
                    }
                    let tmpreplace = tge.rand();
                    if (tmpreplace%2==0) {
                        if (tmptype==5 || tmptype==6) tmptype=0;
                        if (tmptype==3 || tmptype==4) tmptype=8;
                        if (tmptype==1 || tmptype==2) tmptype=7;
                    }
                    this.mBlockQueue[i]=tmptype;
                    block_tmp = tmptype;
                }
            } else {
                for (let i = 0; i <MAXBLKQUEUE; i++) {
                    let tmpreplace = tge.rand();
                    let tmptype    = tge.rand()%9;
                    if (tmpreplace%3==0)
                        if (tmptype==3 || tmptype==4)
                            tmptype=2;
                    this.mBlockQueue[i]=tmptype;
                }
            }
        }

        init(bmpindex: number, seed: number) {
            let bmp = [
                [0,0,1,1,1,1,1,1,0,0],
                [0,1,1,1,1,1,1,1,1,0],
                [2,2,2,2,2,0,2,2,2,2],
                [2,2,2,2,2,2,0,2,2,2],
                [3,3,3,0,0,3,3,3,3,3],
                [3,3,0,0,0,0,3,3,3,3],
                [4,4,0,0,0,0,4,4,4,4],
                [4,4,4,0,0,4,4,4,4,4],
                [0,5,5,5,5,5,5,5,5,0],
                [0,0,5,5,5,5,5,5,0,0]
            ];

            //this.mrep = new ElsReplay();
            //this.mai = new ElsAi();
            this.genRandomBlockQueue(seed);
            //this.mrender=[];
            for(var i=0;i<2;i++) {
                this.mgrid[i] = new ElsGrid('', i);
                if(ELS_CLASSIC) {
                    this.mgrid[i].setBlkDat(BLKDAT_C);
                } else {
                    this.mgrid[i].setBlkDat(BLKDAT_NC);
                }
                this.mgrid[i].setQueue(this.mBlockQueue);
                this.mgrid[i].reset();
                this.currentStage = bmpindex;
                let bi = (bmpindex+3) % Object.keys(ELSBMP).length;
            }
        }

        checkEmergency() {
        }

        setGameStatus(s: ElsGameState) {
            this.currentStatus = s;
        }

        getGameStatus() {
            return this.currentStatus;
        }
    }
}
