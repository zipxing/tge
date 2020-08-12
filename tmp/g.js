var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var nge;
(function (nge) {
    function initMode(runmode) {
        switch (runmode) {
            case "WEB":
                nge.mode = { kind: runmode, context: {}, canvas: {} };
                break;
            case "TERM":
                var b = require('blessed');
                var p = b.program();
                var s = b.screen({ fastCSR: true });
                nge.mode = { kind: runmode,
                    blessed: b, program: p, tscreen: s };
                break;
            case "COCOS":
                nge.mode = { kind: runmode };
                break;
            default:
                console.log("ERROR:error runmode string...");
        }
    }
    nge.initMode = initMode;
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
        Game.prototype.scheduleUpdate = function (dt) {
            this.stage++;
            this.playUserAction(dt);
            this.playAutoAction(dt);
            this.playAiAction(dt);
            this.render.draw();
        };
        Game.prototype.regKeyAction = function (keyDefine) {
            if (nge.mode.kind === "TERM") {
                var that_1 = this;
                for (var k in keyDefine) {
                    nge.mode.program.key(k, function (ch, key) {
                        that_1.useract.splice(0, 0, keyDefine[key.name]);
                    });
                }
            }
        };
        Game.prototype.loop = function () {
            var _this = this;
            switch (nge.mode.kind) {
                case "TERM":
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
                    console.log("RunMode must be TERM | COCOS | WEB...");
            }
        };
        Game._frameHz = 60;
        Game._tickLengthMs = 1000 / Game._frameHz;
        Game._previousTick = Date.now();
        Game._actualTicks = 0;
        return Game;
    }());
    nge.Game = Game;
    var Model = /** @class */ (function () {
        function Model() {
        }
        return Model;
    }());
    nge.Model = Model;
    var Render = /** @class */ (function () {
        function Render() {
            if (nge.mode.kind == "TERM") {
                var mp_1 = nge.mode.program;
                mp_1.key('q', function (ch, key) {
                    mp_1.clear();
                    mp_1.disableMouse();
                    mp_1.showCursor();
                    mp_1.normalBuffer();
                    process.exit(0);
                });
                nge.mode.program.on('mouse', function (data) {
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
    nge.Render = Render;
})(nge || (nge = {}));
var Snake;
(function (Snake) {
    var Model = /** @class */ (function (_super) {
        __extends(Model, _super);
        function Model() {
            var _this = _super.call(this) || this;
            _this.seed = { x: 0, y: 0 };
            _this.body = [];
            _this.grid = [];
            for (var i = 0; i < Model.snakeh; i++) {
                _this.grid[i] = [];
                for (var j = 0; j < Model.snakew; j++)
                    _this.grid[i][j] = 0;
            }
            _this.dir = 'D';
            _this.makeGrid();
            return _this;
        }
        Model.prototype.makeGrid = function () {
            for (var i = 0; i < Model.snakeh; i++)
                for (var j = 0; j < Model.snakew; j++)
                    this.grid[i][j] = 0;
            for (var i = 0; i < this.body.length; i++)
                this.grid[this.body[i].y][this.body[i].x] = i + 1;
            this.grid[this.seed.y][this.seed.x] = 10000;
        };
        Model.snakew = 50;
        Model.snakeh = 30;
        return Model;
    }(nge.Model));
    Snake.Model = Model;
})(Snake || (Snake = {}));
var Snake;
(function (Snake) {
    var TermRender = /** @class */ (function (_super) {
        __extends(TermRender, _super);
        function TermRender() {
            var _this = _super.call(this) || this;
            var nb = nge.mode;
            _this.gridboxes = [];
            for (var i = 0; i < Snake.Model.snakeh; i++) {
                _this.gridboxes[i] = [];
                for (var j = 0; j < Snake.Model.snakew; j++) {
                    _this.gridboxes[i][j] = nb.blessed.box({
                        width: 1, height: 1, top: i, left: j, tags: true
                    });
                    nb.tscreen.append(_this.gridboxes[i][j]);
                }
            }
            _this.msgbox = nb.blessed.box({
                width: Snake.Model.snakew, height: 1, top: Snake.Model.snakeh + 1,
                left: 0, tags: true
            });
            nb.tscreen.append(_this.msgbox);
            return _this;
        }
        TermRender.prototype.draw = function () {
            var msg = ['SnakeGame1.0,press {green-fg}q{/} quit...',
                'Game over,press {green-fg}r{/} restart...',
                'Game over,press {green-fg}r{/} restart...'];
            var c = ['magenta', 'blue', 'red', 'green', 'yellow', 'cyan'];
            var g = TermRender.game;
            var m = g.model;
            this.msgbox.setContent(msg[g.gameover]);
            for (var i = 0; i < Snake.Model.snakeh; i++) {
                for (var j = 0; j < Snake.Model.snakew; j++) {
                    var gv = m.grid[i][j];
                    var gb = this.gridboxes[i][j];
                    switch (gv) {
                        case 0:
                            if (g.gameover == Snake.GameState.Ok)
                                gb.setContent('{white-bg} {/}');
                            else
                                gb.setContent('{yellow-bg} {/}');
                            break;
                        case 10000:
                            gb.setContent('{white-bg}{red-fg}*{/}');
                            break;
                        default:
                            gb.setContent("{" + c[gv % c.length] + "-bg} {/}");
                    }
                }
            }
            var nb = nge.mode;
            nb.tscreen.render();
        };
        return TermRender;
    }(nge.Render));
    Snake.TermRender = TermRender;
})(Snake || (Snake = {}));
var Snake;
(function (Snake) {
    var GameState;
    (function (GameState) {
        GameState[GameState["Ok"] = 0] = "Ok";
        GameState[GameState["OverSelf"] = 1] = "OverSelf";
        GameState[GameState["OverBorder"] = 2] = "OverBorder";
    })(GameState = Snake.GameState || (Snake.GameState = {}));
    var Game = /** @class */ (function (_super) {
        __extends(Game, _super);
        function Game() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Game.prototype.initGame = function () {
            var m = this.model;
            m.body[0] = { x: Snake.Model.snakew / 2, y: Snake.Model.snakeh / 2 };
            m.body.length = 1;
            m.seed = {
                x: Math.floor(Math.random() * Snake.Model.snakew),
                y: Math.floor(Math.random() * Snake.Model.snakeh)
            };
            m.makeGrid();
            m.dir = 'D';
            this.gameover = GameState.Ok;
        };
        Game.prototype.restartGame = function () {
        };
        Game.prototype.playUserAction = function (dt) {
            for (var i = 0; i < this.useract.length; i++)
                this.doAction(this.useract[i]);
            this.useract = [];
        };
        Game.prototype.playAutoAction = function (dt) {
            var m = this.model;
            if (this.timeout_auto > 400.0) {
                this.doAction(m.dir);
            }
            else {
                this.timeout_auto += dt;
            }
        };
        Game.prototype.playAiAction = function (dt) {
        };
        Game.prototype.doAction = function (act) {
            var m = this.model;
            if (this.gameover != GameState.Ok) {
                if (act == 'R')
                    this.initGame();
                return;
            }
            var dx, dy, cx, cy;
            switch (act) {
                case 'W':
                    if (m.dir == 'S')
                        return;
                    dx = 0, dy = -1;
                    break;
                case 'S':
                    if (m.dir == 'W')
                        return;
                    dx = 0, dy = 1;
                    break;
                case 'A':
                    if (m.dir == 'D')
                        return;
                    dx = -1, dy = 0;
                    break;
                case 'D':
                    if (m.dir == 'A')
                        return;
                    dx = 1, dy = 0;
                    break;
                default:
                    dx = 0, dy = 0;
                    console.log('error act!');
            }
            cx = m.body[0].x + dx;
            cy = m.body[0].y + dy;
            if (cx >= Snake.Model.snakew || cy >= Snake.Model.snakeh || cx < 0 || cy < 0) {
                this.gameover = GameState.OverBorder;
                return;
            }
            //check head meet seed
            if (m.grid[cy][cx] == 10000) {
                var sok = false;
                for (var n = 0; n < 888; n++) {
                    var _nx = Math.floor(Math.random() * Snake.Model.snakew);
                    var _ny = Math.floor(Math.random() * Snake.Model.snakeh);
                    var _np = m.grid[_ny][_nx];
                    if (_np == 10000 || _np == 0) {
                        m.seed = { x: _nx, y: _ny };
                        sok = true;
                        break;
                    }
                }
                if (!sok) {
                    //TODO····
                }
            }
            else {
                if (m.grid[cy][cx] != 0) {
                    this.gameover = 2;
                    return;
                }
                m.body.pop();
            }
            m.body.splice(0, 0, { x: cx, y: cy });
            m.dir = act;
            m.makeGrid();
            this.timeout_auto = 0.0;
        };
        Game.prototype.scheduleUpdate = function (dt) {
            _super.prototype.scheduleUpdate.call(this, dt);
            //console.log("update...", this.stage);
        };
        return Game;
    }(nge.Game));
    Snake.Game = Game;
})(Snake || (Snake = {}));
nge.initMode("TERM");
var m = new Snake.Model();
var r = new Snake.TermRender();
var g = new Snake.Game(m, r);
g.initGame();
g.regKeyAction({ 'up': 'W', 'down': 'S', 'left': 'A', 'right': 'D', 'r': 'R' });
g.loop();
