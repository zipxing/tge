namespace tge {
    //Typescript game engine run environment...
    export interface WebRun {
        kind: "WEB";
        context: any;
        canvas: any;
    }

    export interface TermRun {
        kind: "TERM";
        blessed: any;
        program: any;
        tscreen: any;
    }

    export interface WebTermRun {
        kind: "WEBTERM";
        blessed: any;
        program: any;
        tscreen: any;
    }

    type RunEnv = WebRun | TermRun | WebTermRun;
    export var env:RunEnv;

    //Init environment...
    export function initEnvironment(runenv: string,
        canvasid: string = '',
        canvas_w: number = 1024.0,
        canvas_h: number = 768.0) {

        switch(runenv) {
            case "WEB":
                let cv: any;
                let w: number = canvas_w;
                let h: number = canvas_h;
                if(canvasid!='') {
                    cv = document.getElementById(canvasid);
                    if(cv === undefined) {
                        tge.error("Can't find a canvas named:"+canvasid);
                        return;
                    }
                    w = Math.floor(cv.clientWidth * window.devicePixelRatio);
                    h = Math.floor(cv.clientHeight * window.devicePixelRatio);
                } else {
                    cv = document.createElement("canvas");
                    document.body.appendChild(cv);
                }
                cv.width  = w;
                cv.height = h;

                let names = [
                    "webgl",
                    "experimental-webgl",
                    "webkit-3d",
                    "moz-webgl"
                ];
                let ct = null;
                for(let i=0; i<names.length; i++){
                    try {
                        ct = cv.getContext(names[i]);
                    } catch(e) {
                    }
                    if(ct) break;
                }
                if(ct) {
                    let wglct:WebGLRenderingContext = <WebGLRenderingContext> ct;
                    wglct.pixelStorei(wglct.UNPACK_FLIP_Y_WEBGL, 1); //Flip the image's y axis
                    wglct.viewport(0, 0, cv.width, cv.height);
                    env = <WebRun>{
                        kind:runenv,
                        context: wglct,
                        canvas: cv
                    };
                } else {
                    tge.error("WebGL init fail...");
                }
                break;

            case "WEBTERM":
                let b = require('blessed');
                let tjs = require('term.js');
                const Terminal = tjs.Terminal;
                const term = new Terminal({
                    cols: 80,
                    rows: 24,
                    useStyle: true,
                    screenKeys: true,
                });
                term.open(document.body);
                term.columns = term.cols;
                term.isTTY = true;
                term.resize(100,36);
                let opts = { input: term, output: term, tput: false };

                let p = b.program(opts);
                //smartCSR or fastCSR...
                let s = b.screen({focusable: true, sendFocus: true, smartCSR: true, ...opts});
                //let s = b.screen({fastCSR: true});
                env = <WebTermRun>{
                        kind:runenv,
                        blessed:b, 
                        program:p, 
                        tscreen:s
                };
                break;

            case "TERM":
                let bt = require('blessed');
                let pt = bt.program();
                let st = bt.screen({smartCSR:true, fullUnicode:true});
                env = <TermRun>{
                    kind:runenv,
                    blessed:bt,
                    program:pt,
                    tscreen:st
                };
                break;

            default:
                tge.error("ERROR:error runenv string...");
        }
    }

    export function clone(obj: any) {
        return JSON.parse(JSON.stringify(obj));
    }

    //采用Microsoft的LCG,c代码和javascript代码生成随机序列可以方便的对上
    var randomNext:number=0;
    export function srand(seed:number) {
        randomNext = seed>>>0;
    }
    export function rand() {
        randomNext = (randomNext*214013 + 2531011)&0x7FFFFFFF;
        return ((randomNext>>16)&0x7FFF);
    }

    export abstract class Game {
        useract: any[];
        gamestate: number;
        stage: number;
        render: Render;
        model: Model;
        timeout_auto: number;
        timeout_ai: number;

        static _frameHz: number = 36;
        private static _tickLengthMs: number = 1000 / Game._frameHz;
        private static _previousTick: number = Date.now();
        private static _actualTicks: number = 0;

        constructor(m: Model, r: Render) {
            this.render = r;
            Render.game = this;
            this.model = m;
            this.useract = [];
            this.gamestate = 0;
            this.stage = 0;
            this.timeout_auto = 0;
            this.timeout_ai = 0;
        }

        abstract initGame(): any;
        abstract restartGame(): any;

        abstract playUserAction(dt: number): any;
        abstract playAutoAction(dt: number): any;
        abstract playAiAction(dt: number): any;
        abstract doAction(act: any, ...arg: any[]): any;

        scheduleUpdate(dt: number) {
            this.stage++;
            Timer.update();
            this.playUserAction(dt);
            this.playAutoAction(dt);
            this.playAiAction(dt);
            this.render.draw();
        }

        regKeyAction(keyDefine: { [key: string]: any }) {
            if(env.kind == "TERM" || env.kind == "WEBTERM") {
                for (let k in keyDefine) {
                    env.program.key(k, (ch: any, key: any) => {
                        if(key.name in keyDefine)
                            this.useract.splice(0,0,keyDefine[key.name]);
                    });
                }
            }
            if(env.kind == "WEB") {
                window.onkeypress = (event: any) => {
                    let key = event.key;
                    if(key in keyDefine) {
                        tge.debug(keyDefine[key]);
                        this.useract.splice(0,0,keyDefine[key]);
                    }
                }
            }
        }

        //@see: https://github.com/timetocode/node-game-loop
        loop() {
            let now = Date.now();
            Game._actualTicks++;
            if (Game._previousTick + Game._tickLengthMs <= now) {
                let delta = now - Game._previousTick;
                Game._previousTick = now;
                this.scheduleUpdate(delta);
                Game._actualTicks = 0;
            }
            switch(env.kind) {
                case "TERM":
                case "WEBTERM":
                    if (Date.now() - Game._previousTick < Game._tickLengthMs - 16) {
                        setTimeout(() => {
                            this.loop();
                        });
                    } else {
                        setImmediate(() => {
                            this.loop();
                        });
                    }
                    break;
                case "WEB":
                    window.requestAnimationFrame(()=>{
                        this.loop();
                    });
                    break;
                default:
                    tge.error("RunEnv must be TERM | COCOS | WEB...");
            }
        }
    }

    export interface Point {
        x: number;
        y: number;
    }

    export interface Rect {
        x: number;
        y: number;
        width: number;
        height: number;
    }

    export function pointInRect(rect:tge.Rect, point:tge.Point) {
        return (point.x >= rect.x && point.x <= rect.x + rect.width &&
            point.y >= rect.y && point.y <= rect.y + rect.height);
    }

    export abstract class Model {
        constructor() {
        }
    }

    export abstract class Render {
        static game: Game;
        constructor() {
            if(env.kind=="TERM" || env.kind=="WEBTERM") {
                let mp = env.program;
                mp.key('q', function(ch:any, key:any) {
                    mp.clear();
                    mp.disableMouse();
                    mp.showCursor();
                    mp.normalBuffer();
                    process.exit(0);
                });
                env.program.on('mouse', function(data:any) {
                    if (data.action === 'mousemove') {
                    }
                });
                mp.alternateBuffer();
                mp.enableMouse();
                mp.hideCursor();
                mp.clear();
            }
        }
        abstract draw(): any;
    }
}
