import * as tge from "../../engine/index"
import * as constant from "./constant"
import * as block from "./block"
import { Model } from "./model"
import { ElsGrid } from "./grid"
import { TermRender } from "./render"

enum BlockType {
    BLANK = 0,
        FULLROW,
        NORMAL
}

export class WebGlRender extends tge.Render {
    static obj_file_cube  = 'model3d/cube.obj';
    static obj_file_capsule = 'model3d/capsule.obj';
    static obj_file_sphere = 'model3d/sphere.obj';
    static obj_main_texture = 'image/wall01_diffuse.jpg';
    static obj_normal_map = 'image/wall01_normal.jpg';
    static box_main_texture = 'image/box_diffuse.jpg';
    static box_normal_map = 'image/box_normal.jpg';
    static plane_main_texture = 'image/wall02_diffuse.png';
    static plane_normal_map = 'image/wall02_normal.png';
    static brick_main_texture = 'image/brickwall_diffuse.jpg';
    static brick_normal_map = 'image/brickwall_normal.jpg';
    static proj_texture = 'image/t2.png';
    static image_boxs: string[] = [];

    static assets = [
        [WebGlRender.obj_file_capsule, tge.AssetType.Text],
        [WebGlRender.obj_file_sphere, tge.AssetType.Text],
        [WebGlRender.obj_file_cube, tge.AssetType.Text],
        [WebGlRender.obj_main_texture, tge.AssetType.Image],
        [WebGlRender.obj_normal_map, tge.AssetType.Image],
        [WebGlRender.box_main_texture, tge.AssetType.Image],
        [WebGlRender.box_normal_map, tge.AssetType.Image],
        [WebGlRender.plane_main_texture, tge.AssetType.Image],
        [WebGlRender.plane_normal_map, tge.AssetType.Image],
        [WebGlRender.brick_main_texture, tge.AssetType.Image],
        [WebGlRender.brick_normal_map, tge.AssetType.Image],
        [WebGlRender.proj_texture, tge.AssetType.Image]
    ];

    _time: number;
    _rotX: number;
    _rotY: number;
    _tempQuat: tge.Quaternion;
    _tempVec3: tge.Vector3;
    _scene: tge.Scene | null = null;
    _mesh1: tge.Node | null = null;
    _mesh2: tge.Node[] | null = null;
    _pointLight1: tge.Node | null = null;
    _pointLight2: tge.Node | null = null;
    _cameraNode: tge.Node | null = null;
    _projector: tge.Node | null = null;
    mats: tge.Material[];
    isInit: boolean = false;

    constructor() {
        super();
        this._time = 0;
        this._rotX = 0;
        this._rotY = 0;
        this._tempQuat = new tge.Quaternion();
        this._tempVec3 = new tge.Vector3();
        this.mats = [];

        for(let i=0; i<8; i++) {
            WebGlRender.image_boxs.push(`image/box${i+1}.jpg`);
            WebGlRender.assets.push([WebGlRender.image_boxs[i], tge.AssetType.Image]);
        }

        tge.assetManager.loadAssetList(WebGlRender.assets, ()=>{
            this.isInit = true;
            this.init();
        });
    }

    init() {
        let gl = (<tge.WebRun>tge.env).context;
        let canvas = (<tge.WebRun>tge.env).canvas;

        this.createWorld();

        tge.Emitter.register("Tetris.REDRAW_MSG", this.redrawMsg, this);
        tge.Emitter.register("Tetris.REDRAW_NEXT", this.redrawNext, this);
        tge.Emitter.register("Tetris.REDRAW_HOLD", this.redrawHold, this);

        this.drawLogo();
        this.drawBack();
    }

    createGround(){
        let groundMesh = tge.Mesh.createPlane(20, 10, 20, 10);
        let matGround = new tge.MatNormalMap();
        matGround.mainTexture = tge.textureManager.getTexture(WebGlRender.plane_main_texture);
        matGround.mainTexture.setRepeat();
        matGround.mainTextureST = [3,3,0,0];
        matGround.normalMap = tge.textureManager.getTexture(WebGlRender.plane_normal_map);
        matGround.normalMap.setRepeat();
        matGround.normalMapST = [3,3,0,0];
        matGround.specular = [0.8, 0.8, 0.8];
        let groundNode = this._scene!.root.addMeshNode(groundMesh, matGround);
        groundNode.localPosition.set(0,0,0);
    }

    createWall(){
        let wallMesh = tge.Mesh.createPlane(20, 10, 20, 10);
        let matWall = new tge.MatNormalMap();
        matWall.mainTexture =  tge.textureManager.getTexture(WebGlRender.brick_main_texture);
        matWall.mainTexture.setRepeat();
        matWall.mainTextureST = [3,3,0,0];
        matWall.normalMap = tge.textureManager.getTexture(WebGlRender.brick_normal_map);
        matWall.normalMap.setRepeat();
        matWall.normalMapST = [3,3,0,0];
        matWall.specular = [0.8, 0.8, 0.8];
        return this._scene!.root.addMeshNode(wallMesh, matWall);
    }

    createWorld() {
        let canvas = (<tge.WebRun>tge.env).canvas;

        // Load meshes
        let ofl = new tge.ObjFileLoader();
        let capusleData = tge.assetManager.getAsset(WebGlRender.obj_file_capsule).data;
        let capusleMesh = ofl.load(capusleData, 1.0, true);

        let sphereData = tge.assetManager.getAsset(WebGlRender.obj_file_sphere).data;
        let sphereMesh = ofl.load(sphereData, 1.0, true);

        let cubeData = tge.assetManager.getAsset(WebGlRender.obj_file_cube).data;
        let cubeMesh = ofl.load(cubeData, 1.0, true);

        // Create scene
        this._scene = new tge.Scene();

        // Create the ground
        this.createGround();

        // Create walls
        let wall1 = this.createWall();
        wall1.localPosition.set(0, 5, -5);
        wall1.localRotation.setFromEulerAngles(new tge.Vector3(90,0,0));

        // Create an empty mesh root node
        let meshRoot = this._scene.root.addEmptyNode();
        //meshRoot.localPosition.set(-1, 1, 1);
        //meshRoot.localScale.set(0.8, 1, 1);
        //meshRoot.localRotation.setFromAxisAngle(new tge.Vector3(0, 1, 0), 45);

        // Create mesh node 1
        let material1 = new tge.MatNormalMap();
        material1.mainTexture = tge.textureManager.getTexture(WebGlRender.obj_main_texture);
        material1.normalMap = tge.textureManager.getTexture(WebGlRender.obj_normal_map);
        material1.colorTint = [1.0, 1.0, 1.0];
        material1.specular = [0.8, 0.8, 0.8];

        this._mesh1 = meshRoot.addMeshNode(capusleMesh, material1);
        this._mesh1.localPosition.set(-4.0, 1, 0);
        this._mesh1.localScale.set(0.4, 0.4, 0.4);

        // Create mesh node 2

        this._mesh2 = [];
        for(let i=0; i<8; i++) {
            let material2 = new tge.MatNormalMapW();
            material2.mainTexture = tge.textureManager.getTexture(WebGlRender.image_boxs[i]);
            material2.colorTint = [1.0, 1.0, 1.0];
            material2.specular = [0.8, 0.8, 0.8];
            material2.gloss = 10;
            this.mats[i] = material2;
        }
        let zz = constant.ZONG, hh = constant.HENG;
        //let zz = 10, hh = 10;
        for(let n=0; n<2; n++) {
            for(let i=0; i<zz; i++) {
                for(let j=0; j<hh; j++) {
                    let _idx = n*zz*hh+i*hh+j;
                    this._mesh2[_idx] = meshRoot.addMeshNode(cubeMesh, this.mats[2]);
                    let _m = this._mesh2[_idx];
                    _m.localPosition.set(-1-j*0.2+n*2.5, 0.1+i*0.2, 0);
                    _m.localScale.set(0.1, 0.1, 0.1);
                }
            }
        }

        // Add a directional light node to scene
        let mainLight = this._scene.root.addDirectionalLight([0.8,0.8,0.8]);
        mainLight.lookAt(this._tempVec3.set(-1,-1,-1));

        // Add point light 1
        let lightColor = [0.05,0.05,0.05];
        let pointLight = this._scene.root.addPointLight(lightColor,10);
        pointLight.localPosition.set(-5, 6, 0);
        let lightball = pointLight.addMeshNode(sphereMesh,
            new tge.MatSolidColor([0.9,0.9,0.9])); //点光源身上放一个小球以显示他的位置
        lightball.localScale.set(0.2,0.2,0.2);
        this._pointLight1 = pointLight;

        // Add point light 2
        lightColor = [0.05,0.05,0.05];
        pointLight = this._scene.root.addPointLight(lightColor,10);
        pointLight.localPosition.set(5, 6, 0);
        lightball = pointLight.addMeshNode(sphereMesh, 
            new tge.MatSolidColor([0.9,0.9,0.9]));
        lightball.localScale.set(0.2,0.2,0.2);
        this._pointLight2 = pointLight;

        // Add a perspective camera
        this._cameraNode = this._scene.root.addPerspectiveCamera(60, canvas.width / canvas.height, 1.0, 1000);
        this._cameraNode.localPosition.set(0, 2, 6);
        this._cameraNode.lookAt(new tge.Vector3(0, 1, 0));
        this._cameraNode.camera!.clearColor = [0.34,0.98,1];

        // Add projector
        this._projector = this._scene.root.addProjector(60, 1.0, 1.0, 1000.0);
        this._projector.localPosition.set(0, 3, 0);
        this._projector.lookAt(new tge.Vector3(0, 0, 0));
        this._projector.projector!.material.projTexture = tge.textureManager.getTexture(WebGlRender.proj_texture);

    }

    draw() {
        if(!this.isInit) return;
        let g = WebGlRender.game;
        if(!this._scene) return;
        this._time += 20.0;
        this._scene.update();

        //灯光做圆周运动
        /*
            let stage:number = parseInt(''+this._time/1500);
            let renderer = <tge.MeshRenderer>this._mesh2![0]!.components[tge.SystemComponents.Renderer];
            let lp = 1.0;
            if(stage%2==0) lp = 1.0;
            else lp = 100.0;
            this._mesh2![0]!.localPosition.set(lp, lp, 0);
            renderer.setMaterial(this.mats[stage%5]);
         */

        let cosv = Math.cos(this._time/1500);
        let sinv = Math.sin(this._time/1500);
        let radius = 5;

        this._pointLight1!.localPosition.x = radius*cosv*cosv;
        this._pointLight1!.localPosition.z = radius*sinv*cosv;
        this._pointLight1!.localPosition.y = 0.5 + radius*(0.5+0.5*sinv)*0.5;
        this._pointLight1!.setTransformDirty();

        this._pointLight2!.localPosition.x = -radius*cosv*cosv;
        this._pointLight2!.localPosition.z = -radius*sinv*cosv;
        this._pointLight2!.localPosition.y = 0.5 + radius*(0.5+0.5*sinv)*0.5;
        this._pointLight2!.setTransformDirty();

        if(this.testNeedDrawGrid()) {
            this.drawTitle();
            this.redrawGrid();
        }
        this.drawCombo();
        this.drawAttack();

        //move projector
        this._projector!.localPosition.x = radius*cosv;
        //this._projector.localPosition.z = radius*sinv;
        //this._projector.localRotation.setFromEulerAngles(new mini3d.Vector3(60*sinv,0,0));
        this._projector!.setTransformDirty();
        this._scene.render();
    }

    drawTitle() {
        //let g = TermRender.game;
        //let m = <Model>g.model;
        //if(!this.isInit) return;
        //this.drawObj(2, 10, 10, 0, 3, 13, 0, 10.0, 10.0, 1.0, 1);
    }

    drawLogo() {
    }

    drawBack() {
    }

    redrawMsg() {
    }

    redrawNext() {
    }

    redrawHold() {
    }

    drawBlk(idx:number, type:BlockType, col:number, row:number, color: number, fullrow_stage: number = 0) {
        let mm = this._mesh2![idx*constant.HENG*constant.ZONG+row*constant.HENG+col];
        let rr = <tge.MeshRenderer>mm.components[tge.SystemComponents.Renderer];
        row = constant.ZONG-row;
        col = constant.HENG-col;

        switch(type) {
            case BlockType.BLANK: //空白
                mm.localPosition.set(100.0, 100.0, 0);
                break;
            case BlockType.FULLROW: //满行闪烁
                mm.localPosition.set(-1-col*0.2+idx*2.5, 0.1+row*0.2, 0);
                rr.setMaterial(this.mats[color%7]);
                mm.localRotation.setFromEulerAngles(new tge.Vector3(3-fullrow_stage*5, 13-fullrow_stage*5, 0));
                //this.drawObj(color%7, x, y, 0,
                //    3-fullrow_stage*5, 13-fullrow_stage*5, 0, 1, 1, 1);
                break;
            case BlockType.NORMAL://正常方块
                //被攻击出来的是11
                mm.localPosition.set(-1-col*0.2+idx*2.5, 0.1+row*0.2, 0);
                if(color==11) 
                    color=0;
                mm.localPosition.set(-1-col*0.2+idx*2.5, 0.1+row*0.2, 0);
                rr.setMaterial(this.mats[color%7]);
                //this.drawObj(color%7, x, y, 0, 3, 13, 0, 1, 1, 1);
            default:
                ;
        }
    }

    testNeedDrawGrid() {
        let g = TermRender.game;
        let m = <Model>g.model;
        if(!this.isInit) return;
        let gl = (<tge.WebRun>tge.env).context;
        let canvas = (<tge.WebRun>tge.env).canvas;

        let nd = [
            m.grids[0].need_draw,
            m.grids[1].need_draw
        ];
        let frs = [
            tge.Timer.getStage("0clear-row"),
            tge.Timer.getStage("1clear-row")
        ]
        if(!nd[0] && !nd[1] && frs[0]==0 && frs[1]==0) {
            //tge.info("NEED_DRAW skip...");
            return false;
        }
        return true;
    }

    redrawGrid() {
        let g = TermRender.game;
        let m = <Model>g.model;
        if(!this.isInit) return;
        let gl = (<tge.WebRun>tge.env).context;
        let canvas = (<tge.WebRun>tge.env).canvas;

        //webgl中，浏览器会在页面合成时，自动执行清除操作
        //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        let frs = [
            tge.Timer.getStage("0clear-row"),
            tge.Timer.getStage("1clear-row")
        ]
        let fr = [
            tge.Timer.getExData("0clear-row"),
            tge.Timer.getExData("1clear-row")
        ];

        for(let idx=0; idx<=1; idx++) {
            let gr = m.grids[idx];
            if(frs[idx]==0) {
                if(gr.need_draw) {
                    gr.need_draw = false;
                }
            }
            for(let i=0;i<constant.ZONG;i++) {
                for(let j=0;j<constant.HENG;j++) {
                    let gv = gr.core.grid[i*constant.GRIDW + j+2];
                    let hidden_fullrow = false;
                    if(frs[idx]!=undefined && frs[idx]!=0) {
                        if(fr[idx].indexOf(i)!=-1 && (Math.floor(frs[idx]/3)%1==0))
                            hidden_fullrow = true;
                    }
                    if(gv==0) {
                        this.drawBlk(idx, BlockType.BLANK, j, i, 0);
                    } else {
                        if(hidden_fullrow) 
                            this.drawBlk(idx, BlockType.FULLROW, j, i, gv%100, frs[idx]);
                        else
                            this.drawBlk(idx, BlockType.NORMAL, j, i, gv%100, frs[idx]);
                    }
                }
            }
        }
        return true;
    }

    drawCombo() {
        let g = TermRender.game;
        let m = <Model>g.model;
    }

    drawAttack() {
        let g = TermRender.game;
        let m = <Model>g.model;
    }

    drawObj(color:number, tx=0.0, ty=-1.0, tz=0.0, rx=0, ry=0, rz=0,
        sx=1.0, sy=1.0, sz=1.0, obj:number = 0) {
    }

    draw2DRect() {
    }
}
