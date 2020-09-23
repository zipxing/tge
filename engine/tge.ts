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
    export function initEnvironment(runenv:string) {
        switch(runenv) {
            case "WEB":
                env = <WebRun>{
                    kind:runenv, 
                    context:{}, 
                    canvas:{}
                };
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
                let st = bt.screen({smartCSR:true});
                env = <TermRun>{
                    kind:runenv,
                    blessed:bt,
                    program:pt,
                    tscreen:st
                };
                break;
            default:
                console.log("ERROR:error runenv string...");
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
        gameover: number;
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
            this.gameover = 0;
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
        }

        loop() {
            switch(env.kind) {
                case "TERM":
                case "WEBTERM":
                    let now = Date.now();
                    Game._actualTicks++;
                    if (Game._previousTick + Game._tickLengthMs <= now) {
                        let delta = now - Game._previousTick;
                        Game._previousTick = now;
                        this.scheduleUpdate(delta);
                        Game._actualTicks = 0;
                    }
                    if (Date.now() - Game._previousTick < Game._tickLengthMs - 16) {
                        setTimeout(()=>{ this.loop(); });
                    } else {
                        setImmediate(()=>{ this.loop(); });
                    }
                    break;
                default:
                    console.log("RunEnv must be TERM | COCOS | WEB...");
            }
        }
    }

    export interface Point {
        x: number;
        y: number;
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
