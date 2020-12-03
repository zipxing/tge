namespace tge {
    //Typescript game engine run environment...
    export interface WebRun {
        kind: "WEB";
        context: any;
        canvas: any;
        ability: any;
        config: any;
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
                    let ab = glCheck(ct);
                    let conf:any = {};
                    if(webgl_config == null)
                        conf.gammaCorrection = true;
                    else
                        conf = webgl_config;
                    env = <WebRun>{
                        kind:runenv,
                        context: wglct,
                        canvas: cv,
                        ability: ab,
                        config: conf
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

    export function glCheck(gl: any) {
        let glAbility: any = {};
        glAbility.MAX_TEXTURE_SIZE = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        glAbility.MAX_VIEWPORT_DIMS = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
        glAbility.MAX_CUBE_MAP_TEXTURE_SIZE = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
        glAbility.MAX_RENDERBUFFER_SIZE = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
        //Shaders
        glAbility.MAX_VERTEX_ATTRIBS = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
        glAbility.MAX_VERTEX_UNIFORM_VECTORS = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
        glAbility.MAX_VARYING_VECTORS = gl.getParameter(gl.MAX_VARYING_VECTORS);
        glAbility.MAX_COMBINED_TEXTURE_IMAGE_UNITS = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
        glAbility.MAX_VERTEX_TEXTURE_IMAGE_UNITS = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
        glAbility.MAX_TEXTURE_IMAGE_UNITS = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
        glAbility.MAX_FRAGMENT_UNIFORM_VECTORS = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);

        //WebGL 2
        if(glAbility.WebGL2){
            glAbility.MAX_3D_TEXTURE_SIZE = gl.getParameter(gl.MAX_3D_TEXTURE_SIZE);
            glAbility.MAX_ELEMENTS_VERTICES = gl.getParameter(gl.MAX_ELEMENTS_VERTICES);
            glAbility.MAX_ELEMENTS_INDICES = gl.getParameter(gl.MAX_ELEMENTS_INDICES);
            glAbility.MAX_TEXTURE_LOD_BIAS = gl.getParameter(gl.MAX_TEXTURE_LOD_BIAS);
            glAbility.MAX_FRAGMENT_UNIFORM_COMPONENTS = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_COMPONENTS);
            glAbility.MAX_VERTEX_UNIFORM_COMPONENTS = gl.getParameter(gl.MAX_VERTEX_UNIFORM_COMPONENTS);
            glAbility.MAX_ARRAY_TEXTURE_LAYERS = gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS);
            glAbility.MIN_PROGRAM_TEXEL_OFFSET = gl.getParameter(gl.MIN_PROGRAM_TEXEL_OFFSET);
            glAbility.MAX_PROGRAM_TEXEL_OFFSET = gl.getParameter(gl.MAX_PROGRAM_TEXEL_OFFSET);
            glAbility.MAX_VARYING_COMPONENTS = gl.getParameter(gl.MAX_VARYING_COMPONENTS);
            glAbility.MAX_VERTEX_OUTPUT_COMPONENTS = gl.getParameter(gl.MAX_VERTEX_OUTPUT_COMPONENTS);
            glAbility.MAX_FRAGMENT_INPUT_COMPONENTS = gl.getParameter(gl.MAX_FRAGMENT_INPUT_COMPONENTS);
            glAbility.MAX_SERVER_WAIT_TIMEOUT = gl.getParameter(gl.MAX_SERVER_WAIT_TIMEOUT);
            glAbility.MAX_ELEMENT_INDEX = gl.getParameter(gl.MAX_ELEMENT_INDEX);

            //draw buffers
            glAbility.MAX_DRAW_BUFFERS = gl.getParameter(gl.MAX_DRAW_BUFFERS);
            glAbility.MAX_COLOR_ATTACHMENTS = gl.getParameter(gl.MAX_COLOR_ATTACHMENTS);

            //Samplers
            glAbility.MAX_SAMPLES = gl.getParameter(gl.MAX_SAMPLES);

            //Transform feedback
            glAbility.MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS = gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS);
            glAbility.MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS = gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS);
            glAbility.MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS = gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS);

            //Uniforms
            glAbility.MAX_VERTEX_UNIFORM_BLOCKS = gl.getParameter(gl.MAX_VERTEX_UNIFORM_BLOCKS);
            glAbility.MAX_FRAGMENT_UNIFORM_BLOCKS = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_BLOCKS);
            glAbility.MAX_COMBINED_UNIFORM_BLOCKS = gl.getParameter(gl.MAX_COMBINED_UNIFORM_BLOCKS);
            glAbility.MAX_UNIFORM_BUFFER_BINDINGS = gl.getParameter(gl.MAX_UNIFORM_BUFFER_BINDINGS);
            glAbility.MAX_UNIFORM_BLOCK_SIZE = gl.getParameter(gl.MAX_UNIFORM_BLOCK_SIZE);
            glAbility.MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS = gl.getParameter(gl.MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS);
            glAbility.MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS = gl.getParameter(gl.MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS);
        }

        for(let key in glAbility){
            tge.info('===>',key, glAbility[key]);
        }
        return glAbility;
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
                    if(key==' ') key='space';
                    if(key in keyDefine) {
                        tge.info(keyDefine[key]);
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
                case "WEB":
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
                /*case "WEB":
                    window.requestAnimationFrame(()=>{
                        this.loop();
                    });
                    break;*/
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
