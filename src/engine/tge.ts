/*
 * tge
 *
 * A Typescript Game Engine
 * Copyright (c) 2020, zhouxin.
 * <zipxing@hotmail.com>
 *
 */
import * as log from "./log"
import * as timer from "./timer"
import * as util from "./util"

//WebGL render environment
export interface WebRun {
    kind: "WEB";
    context: any;
    canvas: any;
    ability: any;
    config: any;
}

//Terminal render(powered by blessed)
export interface TermRun {
    kind: "TERM";
    blessed: any;
    program: any;
    tscreen: any;
}

type RunEnv = WebRun | TermRun;
export var env:RunEnv;

//Init environment...
export function initEnvironment(runenv: string,
    canvasid: string = '',
    canvas_w: number = 1024.0,
    canvas_h: number = 768.0,
    webgl_config: any = null) {

    switch(runenv) {
        case "WEB":
            let cv: any;
            let w: number = canvas_w;
            let h: number = canvas_h;
            if(canvasid!='') {
                cv = document.getElementById(canvasid);
                if(cv === undefined) {
                    log.error("Can't find a canvas named:"+canvasid);
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
                let ab = util.glCheck(ct);
                let conf:any = {};
                if(webgl_config == null)
                    conf.gammaCorrection = true;
                else
                    conf = webgl_config;
                env = <WebRun>{
                    kind: runenv,
                    context: wglct,
                    canvas: cv,
                    ability: ab,
                    config: conf
                };
            } else {
                log.error("WebGL init fail...");
            }
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
            log.error("ERROR:error runenv string...");
    }
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
        timer.Timer.update();
        this.playUserAction(dt);
        this.playAutoAction(dt);
        this.playAiAction(dt);
        this.render.draw();
    }

    regKeyAction(keyDefine: { [key: string]: any }) {
        if(env.kind == "TERM") {
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
                if(key==' ') key='space';
                if(key in keyDefine) {
                    log.info(keyDefine[key]);
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
                log.error("RunEnv must be TERM | WEBTERM | WEB...");
        }
    }
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

    addBox(w:number, h:number, t:number, l:number, bla?:any) {
        let nb = (<TermRun>env);
        let bo;
        bo =  {
            width: w,
            height: h,
            top: t,
            left: l,
            border: null,
            label: null,
            align: null,
            tags: true
        };

        if(bla) {
            bo.border = bla.border;
            bo.label = bla.label;
            bo.align  = bla.align;
        } 

        let box = nb.blessed.box(bo);
        nb.tscreen.append(box);
        return box;
    }
}
