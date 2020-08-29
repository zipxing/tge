var nge = require("./engine.js");
var els = require("./els.js");
var ElsAi = require("./ai.js");
var Class = nge.Class;

var ElsModel = nge.Model.extend({
    ctor: function (ElsGrid) {
        this.mgrid=[];
        this.stage=0;
        this.emergencyCount = 1;
        this.pause=false;
        this.currentStage = 0;
        this.currentStatus = els.ELS_GAME_STATE.HOMEPAGE;
        this.ElsGrid = ElsGrid;
        this.allowDoPopAction = true;
        for(var i=0;i<2;i++) {
            this.mgrid[i]=new ElsGrid(this, i);
        }
        this.mBlockQueue = new Array(els.MAXBLKQUEUE);

        tywx.NotificationCenter.listen(tywx.EventType.GAME_SHOW, this.onForGround, this);
    },

    //生成随机块序列
    genRandomBlockQueue: function(seed)
    {
        nge.srand(seed);
        if(els.ELS_CLASSIC) 
            this.mconf.block_type=1;
        else 
            this.mconf.block_type=0;
        if (this.mconf.block_type==1) {
            var tmptype;
            var block_tmp = -1;
            //生成500个块的序列
            for (var i = 0; i <els.MAXBLKQUEUE; i++) {
                while (true) {
                    tmptype = nge.rand()%9;
                    if (block_tmp!=tmptype)
                        break;
                }
                var tmpreplace = nge.rand();
                if (tmpreplace%2==0) {
                    if (tmptype==5 || tmptype==6) tmptype=0;
                    if (tmptype==3 || tmptype==4) tmptype=8;
                    if (tmptype==1 || tmptype==2) tmptype=7;
                }
                this.mBlockQueue[i]=tmptype;
                block_tmp = tmptype;
            }
        }
        if (this.mconf.block_type==0) {
            for (var i = 0; i <els.MAXBLKQUEUE; i++) {
                var tmpreplace = nge.rand();
                var tmptype    = nge.rand()%9;
                if (tmpreplace%3==0)
                    if (tmptype==3 || tmptype==4)
                        tmptype=2;
                this.mBlockQueue[i]=tmptype;
            }
        }
    },

    init: function(bmpindex, seed) {
        var bmp = [
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

        //记录上一关卡的mode
        if(this.mconf && this.mconf.mode != undefined){
            var _mode = this.mconf.mode;
            this.mconf = new ElsConfig();
            this.mconf.mode = _mode;
        }else{
            this.mconf = new ElsConfig();
        }

        this.mrep = new ElsReplay();
        this.mai = new ElsAi();
        this.genRandomBlockQueue(seed);
        this.mrender=[];
        for(var i=0;i<2;i++) {
            this.mgrid[i] = new this.ElsGrid(this, i);
            this.mgrid[i].mconf = this.mconf;
            if(els.ELS_CLASSIC) {
                this.mgrid[i].setBlkDat(els.BLKDAT_C);
            }
            else {
                this.mgrid[i].setBlkDat(els.BLKDAT_NC);
            }
            this.mgrid[i].setQueue(this.mBlockQueue);
            this.mgrid[i].reset();
            this.currentStage = bmpindex;
            var bi = (bmpindex+3) % Object.keys(els.ELSBMP).length;
            //this.mgrid[i].setBmp(els.ELSBMP["i"+bi]);
        }
    },

    checkEmergency : function () {
        if(this.getGameStatus() != els.ELS_GAME_STATE.PLAYING){
            return;
        }

        if(this.mconf.mode != els.ELS_MODE_AI){
            return;
        }

        // var maxLine = 0;    //最高的行数

        // console.log('checkEmergency:' + JSON.stringify(this.mgrid[0].mcore.col_top));

        // for(var i in this.mgrid[0].mcore.col_top){
        //     maxLine = maxLine >= this.mgrid[0].mcore.col_top[i]?
        //                         maxLine : this.mgrid[0].mcore.col_top[i];
        // }

        this.emergencyCount ++;
        if(this.emergencyCount < 4)return;

        //触发概率0.5
        if(this.mgrid[0].mcore.top_line >= 17 && Math.random() > 0.50){

            

            console.log('checkEmergency:' + this.mgrid[0].mcore.top_line);
            // this.stopTimerCountdown();
            this.setGameStatus(els.ELS_GAME_STATE.EMERGENCY);
        }
        this.emergencyCount=0;
    },

    setGameStatus : function(_status) {
        this.currentStatus = _status;
    },

    getGameStatus : function () {
        return this.currentStatus;
    },

    onForGround  : function() {

        if (this.bgAudioContext){
            try{
            //     // this.bgAudioContext.stop();
                this.bgAudioContext.play();
            }catch(e){
                this.bgAudioContext.destroy();
                this.playMusic(els.ELS_VOICE.BG_MUSIC, true, 0.2);
            }
        }else{
            this.playMusic(els.ELS_VOICE.BG_MUSIC, true, 0.2);
        }

    },

    playMusic : function(_audioName, _loop, volume){

        //console.log('playMusic ===>  ' + _audioName + this.stage);
        var _audioContext = wx.createInnerAudioContext();
        _audioContext.src = _audioName;
        _audioContext.autoPlay = true;
        _audioContext.loop = _loop;
        _audioContext.volume = volume == undefined ? 1.0 : volume;
        _audioContext.play();

        if (_audioName == els.ELS_VOICE.BG_MUSIC){
            this.bgAudioContext = _audioContext;
        }

    },


});

//数据结构
var ElsCore = Class.extend({
    ctor: function() {
        this.grid = new Uint8Array(els.GRIDSIZE);
        this.col_top = new Array(els.HENG);
        this.col_hole = new Array(els.HENG);
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
    },

    _pool: [],
    clone: function () {
        var cloned = undefined;
        if (this._pool.length > 0){
            cloned = this._pool.pop();
        }
        else {
            cloned = new ElsCore();
        }
        this._assign(this, cloned);
        return cloned;
    },

    recycle: function () {
        this._pool.push(this);
    },

    _assign: function (src, dst) {
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
});

var ElsTimer = nge.Timer.extend({
    ctor: function() {
        this._super();
        this.ready_wending=0;
    }
});

var ElsStat = Class.extend({
    ctor: function() {
        this.combo_total;
        this.combo_max;
        this.combo_current;
        this.level = 0;
        this.score = 0;
        this.clear_lines;
        this.isKO = false;
    },
    
    addScore(s) {
        this.score += s;
        for(var i=0; i<els.UPGRADE_STANTARD.length; i++) {
            if(this.score<=els.UPGRADE_STANTARD[i+1] && this.score>=els.UPGRADE_STANTARD[i]) {
                this.level = i;
                break;
            }
        }
    }
});


var ElsReplay = Class.extend({
    ctor: function() {
        this.areaId=0;
        this.stage=0;
        this.blkindex=0;
        this.act='';
    }
});

var ElsConfig = Class.extend({
    ctor: function() {
        this.isreplay=false;
        this.mode =els.ELS_MODE_SINGLE;
        //this.mode=els.ELS_MODE_AI;
    }
});

(function (window, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        window.nge = factory();
    }
})(this, function () {
    return {
        "ElsModel": ElsModel,
        "ElsCore": ElsCore,
        "ElsTimer": ElsTimer,
        "ElsStat": ElsStat,
        "ElsReplay": ElsReplay,
        "ElsConfig": ElsConfig,
    }
});
