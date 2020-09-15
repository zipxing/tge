var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var tge;
(function (tge) {
    var AscIIManager = /** @class */ (function () {
        function AscIIManager() {
        }
        AscIIManager.loadArtFile = function (fpath, name) {
            try {
                var fs = require("fs");
                var lines = fs.readFileSync(fpath, "utf8").split('\n');
                var row = 0;
                var grid = [];
                var blessed_lines = [];
                for (var i = 0; i < AscIIManager.height; i++) {
                    grid[i] = [];
                    for (var j = 0; j < AscIIManager.width; j++)
                        grid[i][j] = {
                            asc2code: ' ',
                            fgcolor: 15,
                            bgcolor: 0
                        };
                }
                for (var l in lines) {
                    if (row > AscIIManager.height)
                        break;
                    var line = lines[l];
                    line = line.replace(/\r/g, '');
                    blessed_lines[blessed_lines.length] =
                        line.replace(/\x1b\[38;5;(\d+)m\x1b\[48;5;(\d+)m(.*?)\x1b\[0m/g, "{$1-fg}{$2-bg}$3{/}");
                    var ocount = 0;
                    while (true) {
                        var m = line.match(/\x1b\[38;5;(\d+)m\x1b\[48;5;(\d+)m(.*?)\x1b\[0m/);
                        if (m == null)
                            break;
                        var shead = line.substring(0, m.index);
                        var fg = parseInt(m[1]);
                        var bg = parseInt(m[2]);
                        var colorstr = m[3];
                        //log(LogLevel.DEBUG, m.index, m[0].length, fg, bg, colorstr);
                        for (var i = 0; i < shead.length; i++) {
                            if (ocount > AscIIManager.width)
                                break;
                            grid[row][ocount] = {
                                asc2code: shead[i],
                                fgcolor: 15,
                                bgcolor: 0
                            };
                            ocount++;
                        }
                        for (var i = 0; i < colorstr.length; i++) {
                            if (ocount > AscIIManager.width)
                                break;
                            grid[row][ocount] = {
                                asc2code: colorstr[i],
                                fgcolor: fg,
                                bgcolor: bg
                            };
                            ocount++;
                        }
                        line = line.substring(m.index + m[0].length);
                    }
                    for (var i = 0; i < line.length; i++) {
                        if (ocount > AscIIManager.width)
                            break;
                        grid[row][ocount] = {
                            asc2code: line[i],
                            fgcolor: 15,
                            bgcolor: 0
                        };
                        ocount++;
                    }
                    row++;
                }
                AscIIManager.arts[name] = { grid: grid, blessed_lines: blessed_lines };
            }
            catch (error) {
                tge.log(tge.LogLevel.ERROR, "read file " + fpath + " error!");
                tge.log(tge.LogLevel.ERROR, error.message);
            }
        };
        AscIIManager.processToken = function (ps, isSpace) {
            if (isSpace) {
                return ps.map(function (e) { return e.asc2code; }).join('');
            }
            else {
                var lp = ps[ps.length - 1];
                var colors = "\u001B[38;5;" + lp.fgcolor + "m\u001B[48;5;" + lp.bgcolor + "m";
                var txts = ps.map(function (e) { return e.asc2code; }).join('');
                return colors + txts + '\x1b[0m';
            }
        };
        AscIIManager.processGridLine = function (g) {
            var ps = [];
            var outs = '';
            for (var i = 0; i < AscIIManager.width; i++) {
                if (g[i].asc2code == ' ') {
                    if (ps.length > 0 && ps[ps.length - 1].asc2code != ' ') {
                        outs += AscIIManager.processToken(ps, false);
                        ps = [];
                    }
                    ps[ps.length] = {
                        asc2code: ' ',
                        fgcolor: 15,
                        bgcolor: 0
                    };
                }
                else {
                    if (ps.length > 0 && ps[ps.length - 1].asc2code == ' ') {
                        outs += AscIIManager.processToken(ps, true);
                        ps = [];
                    }
                    else {
                        if (ps.length != 0) {
                            var lp = ps[ps.length - 1];
                            if (g[i].bgcolor != lp.bgcolor || g[i].fgcolor != lp.fgcolor) {
                                outs += AscIIManager.processToken(ps, false);
                                ps = [];
                            }
                        }
                    }
                    ps[ps.length] = g[i];
                }
            }
            if (ps.length > 0) {
                if (ps[ps.length - 1].asc2code == ' ')
                    outs += AscIIManager.processToken(ps, true);
                else
                    outs += AscIIManager.processToken(ps, false);
            }
            return outs.replace(/ *$/g, '');
        };
        AscIIManager.getArt = function (name) {
            return AscIIManager.arts[name];
        };
        AscIIManager.width = 96;
        AscIIManager.height = 24;
        AscIIManager.arts = {};
        AscIIManager.arts_jsdef = {};
        return AscIIManager;
    }());
    tge.AscIIManager = AscIIManager;
})(tge || (tge = {}));
var tge;
(function (tge) {
    var LogLevel;
    (function (LogLevel) {
        LogLevel[LogLevel["DEBUG"] = 1] = "DEBUG";
        LogLevel[LogLevel["INFO"] = 2] = "INFO";
        LogLevel[LogLevel["WARNING"] = 3] = "WARNING";
        LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
    })(LogLevel = tge.LogLevel || (tge.LogLevel = {}));
    function bindLogPath(fpath) {
        if (tge.env.kind == "WEBTERM")
            return;
        var fs = require('fs');
        var util = require('util');
        var logFile = fs.createWriteStream(fpath, { flags: 'a' });
        //let logso = process.stdout;
        console.log = function () {
            logFile.write(util.format.apply(null, arguments) + '\n');
            //logso.write(util.format.apply(null, arguments)+'\n');
        };
        console.error = console.log;
    }
    tge.bindLogPath = bindLogPath;
    function log(level) {
        var arg = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            arg[_i - 1] = arguments[_i];
        }
        var d = new Date();
        console.log.apply(console, __spreadArrays([LogLevel[level], d], arg));
    }
    tge.log = log;
})(tge || (tge = {}));
var tge;
(function (tge) {
    //Init environment...
    function initEnvironment(runenv) {
        switch (runenv) {
            case "WEB":
                tge.env = {
                    kind: runenv,
                    context: {},
                    canvas: {}
                };
                break;
            case "WEBTERM":
                var b = require('blessed');
                var tjs = require('term.js');
                var Terminal = tjs.Terminal;
                var term = new Terminal({
                    cols: 80,
                    rows: 24,
                    useStyle: true,
                    screenKeys: true
                });
                term.open(document.body);
                term.columns = term.cols;
                term.isTTY = true;
                term.resize(100, 36);
                var opts = { input: term, output: term, tput: false };
                var p = b.program(opts);
                //smartCSR or fastCSR...
                var s = b.screen(__assign({ smartCSR: true }, opts));
                //let s = b.screen({fastCSR: true});
                tge.env = {
                    kind: runenv,
                    blessed: b,
                    program: p,
                    tscreen: s
                };
                break;
            case "TERM":
                var bt = require('blessed');
                var pt = bt.program();
                var st = bt.screen({ smartCSR: true });
                tge.env = {
                    kind: runenv,
                    blessed: bt,
                    program: pt,
                    tscreen: st
                };
                break;
            default:
                console.log("ERROR:error runenv string...");
        }
    }
    tge.initEnvironment = initEnvironment;
    function clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    tge.clone = clone;
    //采用Microsoft的LCG,c代码和javascript代码生成随机序列可以方便的对上
    var randomNext = 0;
    function srand(seed) {
        randomNext = seed >>> 0;
    }
    tge.srand = srand;
    function rand() {
        randomNext = (randomNext * 214013 + 2531011) & 0x7FFFFFFF;
        return ((randomNext >> 16) & 0x7FFF);
    }
    tge.rand = rand;
    var Game = /** @class */ (function () {
        function Game(m, r) {
            this.render = r;
            Render.game = this;
            this.model = m;
            this.useract = [];
            this.gameover = 0;
            this.stage = 0;
            this.timeout_auto = 0;
            this.timeout_ai = 0;
        }
        //abstract doAction(act: any): any;
        Game.prototype.scheduleUpdate = function (dt) {
            this.stage++;
            tge.Timer.update();
            this.playUserAction(dt);
            this.playAutoAction(dt);
            this.playAiAction(dt);
            this.render.draw();
        };
        Game.prototype.regKeyAction = function (keyDefine) {
            if (tge.env.kind == "TERM" || tge.env.kind == "WEBTERM") {
                var that_1 = this;
                for (var k in keyDefine) {
                    tge.env.program.key(k, function (ch, key) {
                        that_1.useract.splice(0, 0, keyDefine[key.name]);
                    });
                }
            }
        };
        Game.prototype.loop = function () {
            var _this = this;
            switch (tge.env.kind) {
                case "TERM":
                case "WEBTERM":
                    var now = Date.now();
                    Game._actualTicks++;
                    if (Game._previousTick + Game._tickLengthMs <= now) {
                        var delta = now - Game._previousTick;
                        Game._previousTick = now;
                        this.scheduleUpdate(delta);
                        Game._actualTicks = 0;
                    }
                    if (Date.now() - Game._previousTick < Game._tickLengthMs - 16) {
                        setTimeout(function () { _this.loop(); });
                    }
                    else {
                        setImmediate(function () { _this.loop(); });
                    }
                    break;
                default:
                    console.log("RunEnv must be TERM | COCOS | WEB...");
            }
        };
        Game._frameHz = 36;
        Game._tickLengthMs = 1000 / Game._frameHz;
        Game._previousTick = Date.now();
        Game._actualTicks = 0;
        return Game;
    }());
    tge.Game = Game;
    var Model = /** @class */ (function () {
        function Model() {
        }
        return Model;
    }());
    tge.Model = Model;
    var Render = /** @class */ (function () {
        function Render() {
            if (tge.env.kind == "TERM" || tge.env.kind == "WEBTERM") {
                var mp_1 = tge.env.program;
                mp_1.key('q', function (ch, key) {
                    mp_1.clear();
                    mp_1.disableMouse();
                    mp_1.showCursor();
                    mp_1.normalBuffer();
                    process.exit(0);
                });
                tge.env.program.on('mouse', function (data) {
                    if (data.action === 'mousemove') {
                    }
                });
                mp_1.alternateBuffer();
                mp_1.enableMouse();
                mp_1.hideCursor();
                mp_1.clear();
            }
        }
        return Render;
    }());
    tge.Render = Render;
})(tge || (tge = {}));
var tge;
(function (tge) {
    var Timer = /** @class */ (function () {
        function Timer() {
        }
        Timer.register = function (name, time, endcall) {
            Timer.timers[name] = {
                time: 0,
                count: Math.ceil(time * tge.Game._frameHz),
                endcall: endcall,
                exdata: 0
            };
        };
        Timer.fire = function (name, exdata) {
            var tmo = Timer.timers[name];
            if (!tmo)
                return;
            tmo.time = tmo.count;
            tmo.exdata = exdata;
        };
        Timer.cancel = function (name, nocall) {
            if (nocall === void 0) { nocall = false; }
            var tmo = Timer.timers[name];
            if (!tmo)
                return;
            tmo.time = 0;
            if (!nocall) {
                if (tmo.endcall)
                    tmo.endcall();
            }
        };
        Timer.getExData = function (name) {
            var tmo = Timer.timers[name];
            if (!tmo)
                return;
            return tmo.exdata;
        };
        Timer.getStage = function (name) {
            var tmo = Timer.timers[name];
            if (!tmo)
                return 0;
            return tmo.time;
        };
        Timer.getPercent = function (name) {
            var tmo = Timer.timers[name];
            if (!tmo)
                return;
            var t = tmo;
            return t.time * 1.0 / t.count * 1.0;
        };
        Timer.update = function () {
            for (var t in Timer.timers) {
                if (Timer.timers[t].time > 0) {
                    Timer.timers[t].time--;
                    if (Timer.timers[t].time == 0) {
                        Timer.cancel(t);
                    }
                }
            }
        };
        Timer.timers = {};
        return Timer;
    }());
    tge.Timer = Timer;
})(tge || (tge = {}));
//art2js <artfile> <namespace> <var_name> <js_name>
var artfile = process.argv[2];
var ns = process.argv[3];
var vn = process.argv[4];
var jn = process.argv[5];
tge.AscIIManager.loadArtFile(artfile, 'AH');
var a = tge.AscIIManager.getArt('AH');
console.log("namespace " + ns + " {");
console.log('    tge.AscIIManager.arts_jsdef["' + vn + '"] = [];');
for (var i = 0; i < a.blessed_lines.length; i++)
    console.log('    tge.AscIIManager.arts_jsdef["' + vn + '"][' + i + '] = "' + Buffer.from(a.blessed_lines[i]).toString('base64') + '";');
console.log('}');
