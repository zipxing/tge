import * as tge from "../../engine"
import { Model } from "./model"
import { Game } from "./game"
import { MouseHandler } from "./mouse"

export class WebGlRender extends tge.Render {
    static shader_vs = 'shader/light.vs';
    static shader_fs = 'shader/light.fs';
    static image_boxs = [
        'image/box1.jpg',
        'image/box2.jpg',
        'image/box3.jpg',
        'image/box4.jpg',
        'image/box5.jpg',
        'image/box6.jpg',
        'image/box7.jpg',
        'image/box8.jpg'
    ];
    static obj_file  = 'model3d/cube.obj';

    static assets = [
        [WebGlRender.shader_vs, tge.AssetType.Text],
        [WebGlRender.shader_fs, tge.AssetType.Text],
        [WebGlRender.obj_file, tge.AssetType.Text],
        [WebGlRender.image_boxs[0], tge.AssetType.Image],
        [WebGlRender.image_boxs[1], tge.AssetType.Image],
        [WebGlRender.image_boxs[2], tge.AssetType.Image],
        [WebGlRender.image_boxs[3], tge.AssetType.Image],
        [WebGlRender.image_boxs[4], tge.AssetType.Image],
        [WebGlRender.image_boxs[5], tge.AssetType.Image],
        [WebGlRender.image_boxs[6], tge.AssetType.Image],
        [WebGlRender.image_boxs[7], tge.AssetType.Image]
    ];

    modelMatrix: tge.Matrix4;
    viewMatrix: tge.Matrix4;
    viewProjMatrix: tge.Matrix4;
    mvpMatrix: tge.Matrix4;
    normalMatrix: tge.Matrix4;
    mesh: tge.Mesh | null;
    shader: tge.Shader | null;
    texture: tge.Texture2D | null;
    isInit: boolean = false;

    constructor() {
        super();
        this.modelMatrix = new tge.Matrix4();
        this.viewMatrix = new tge.Matrix4();
        this.viewProjMatrix = new tge.Matrix4();
        this.mvpMatrix= new tge.Matrix4();
        this.normalMatrix= new tge.Matrix4();
        this.mesh = null;
        this.shader = null;
        this.texture = null;

        tge.assetManager.loadAssetList(WebGlRender.assets, ()=>{
            this.isInit = true;
            this.init();
        });
    }

    init() {
        let gl = (<tge.WebRun>tge.env).context;
        let canvas = (<tge.WebRun>tge.env).canvas;

        //init shader...
        this.shader = new tge.Shader();
        let vs = tge.assetManager.getAsset(WebGlRender.shader_vs).data;
        let fs = tge.assetManager.getAsset(WebGlRender.shader_fs).data;
        if(!this.shader.create(vs, fs)){
            tge.error("Failed to initialize shaders");
            return;
        }
        this.shader.mapAttributeSemantic(tge.VertexSemantic.POSITION, 'a_Position');
        this.shader.mapAttributeSemantic(tge.VertexSemantic.NORMAL, 'a_Normal');
        this.shader.mapAttributeSemantic(tge.VertexSemantic.UV0, 'a_TexCoord');
        this.shader.use();

        //init mesh from obj file...
        let obj = tge.assetManager.getAsset(WebGlRender.obj_file).data;
        let ofl = new tge.ObjFileLoader();
        this.mesh = ofl.load(obj, 1.0, false);

        this.shader!.setUniform('u_sampler', 0);

        this.viewMatrix.setLookAt(.0, .0, 42.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
        this.viewProjMatrix.setPerspective(60.0, canvas.width/canvas.height, 1.0, 100.0);
        this.viewProjMatrix.multiply(this.viewMatrix);

        //gl.clearColor(0.1, 0, 0, 1);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);

        let mh = new MouseHandler();
        canvas.onmousedown = (event: any) => {
            mh.mouseDown(event);
        }
        canvas.onmousemove = (event: any) => {
            mh.mouseMove(event);
        }
        canvas.onmouseup = (event: any) => {
            mh.mouseUp(event);
        }

        tge.Emitter.register("Obj3d.REDRAW", this.redraw, this);
        this.redraw();
    }

    drawObj(color:number, tx=0.0, ty=-1.0, tz=0.0, rx=0, ry=0, rz=0,
        sx=1.0, sy=1.0, sz=1.0) {
        let gl = (<tge.WebRun>tge.env).context;
        let canvas = (<tge.WebRun>tge.env).canvas;
        let g = WebGlRender.game;
        let m = <Model>g.model;


        //init texture...
        this.texture = tge.textureManager.getTexture(WebGlRender.image_boxs[color]);
        this.texture!.bind();

        this.modelMatrix.setTranslate(tx, ty, tz);
        this.modelMatrix.rotate(rz, 0.0, 0.0, 1.0); //rot around z-axis
        this.modelMatrix.rotate(ry, 0.0, 1.0, 0.0); //rot around y-axis
        this.modelMatrix.rotate(rx, 1.0, 0.0, 0.0); //rot around x-axis
        //this.modelMatrix.multiply(m.matRot);
        this.modelMatrix.scale(sx, sy, sz);

        this.normalMatrix.setInverseOf(this.modelMatrix);
        this.normalMatrix.transpose();

        this.mvpMatrix.set(this.viewProjMatrix);
        this.mvpMatrix.multiply(this.modelMatrix);

        this.shader!.setUniform('u_mvpMatrix', this.mvpMatrix.elements);
        this.shader!.setUniform('u_NormalMatrix', this.normalMatrix.elements);
        this.shader!.setUniform('u_LightColor', [1.0,1.0,1.0]);

        let lightDir = [5.0, 3.0, 4.0];
        this.shader!.setUniform('u_LightDir', lightDir);

        this.mesh!.render(this.shader);
        this.texture!.unbind();
    }

    redraw() {
        if(!this.isInit) return;
        let gl = (<tge.WebRun>tge.env).context;
        let canvas = (<tge.WebRun>tge.env).canvas;
        let g = WebGlRender.game;
        let m = <Model>g.model;

        //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        for(let i=0; i<20; i++)
            for(let j=0; j<10; j++) {
                let c = j>7?7:j;
                let x = j*2.0 - 15.0;
                let y = i*2.0 - 16;
                let rx = m.rot_x;
                let ry = m.rot_y;
                let rz = m.rot_z;
                //this.drawObj(i>7?7:i, i*2.0-12.0, -1, 0, m.rot_x, m.rot_y, m.rot_z, 1, 1, 1);
                this.drawObj(c, x, y, 0, rx, ry, rz, 1, 1, 1);
            }
    }

    draw() {
    }
}
