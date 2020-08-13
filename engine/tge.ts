namespace tge {
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

    export interface CocosRun {
        kind: "COCOS";
    }

    type RunEnv = WebRun | TermRun | CocosRun;
    export var env:RunEnv;

    export function initMode(runenv:string) {
        switch(runenv) {
            case "WEB":
                env = <WebRun>{kind:runenv, context:{}, canvas:{}};
                break;
            case "TERM":
                let b = require('blessed');
                let p = b.program();
                let s = b.screen({fastCSR: true});
                env = <TermRun>{kind:runenv, 
                    blessed:b, program:p, tscreen:s};
                break;
            case "COCOS":
                env = <CocosRun>{kind:runenv};
                break;
            default:
                console.log("ERROR:error runenv string...");
        }
    }

    export abstract class Game {
        useract: any[];
        gameover: number;
        stage: number;
        render: Render;
        model: Model;
        timeout_auto: number;
        timeout_ai: number;

        static _frameHz: number = 60;
        static _tickLengthMs: number = 1000 / Game._frameHz;
        static _previousTick: number = Date.now();
        static _actualTicks: number = 0;

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
        abstract doAction(act: any): any;

        scheduleUpdate(dt: number) {
            this.stage++;
            Timer.update();
            this.playUserAction(dt);
            this.playAutoAction(dt);
            this.playAiAction(dt);
            this.render.draw();
        }

        regKeyAction(keyDefine: { [key: string]: any }) {
            if(env.kind === "TERM") {
                let that = this;
                for (let k in keyDefine) {
                    env.program.key(k, function(ch: any, key: any) {
                        that.useract.splice(0,0,keyDefine[key.name]);
                    });
                }
            }
        }

        loop() {
            switch(env.kind) {
                case "TERM":
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
            if(env.kind=="TERM") {
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
