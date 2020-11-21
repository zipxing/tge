namespace Tetris {
    enum BlockType {
        BLANK = 0,
        FULLROW,
        NORMAL
    }
    export class WebGlRender extends tge.Render {
        static shader_vs = 'shader/light.vs';
        static shader_fs = 'shader/light.fs';
        static obj_file  = 'model3d/cube.obj';
        static title_img = 'image/tetris.jpg';
        static image_boxs: string[] = [];

        static assets = [
            [WebGlRender.shader_vs, tge3d.AssetType.Text],
            [WebGlRender.shader_fs, tge3d.AssetType.Text],
            [WebGlRender.obj_file, tge3d.AssetType.Text],
            [WebGlRender.title_img, tge3d.AssetType.Image]
        ];

        modelMatrix: tge3d.Matrix4;
        viewMatrix: tge3d.Matrix4;
        viewProjMatrix: tge3d.Matrix4;
        mvpMatrix: tge3d.Matrix4;
        normalMatrix: tge3d.Matrix4;
        mesh: tge3d.Mesh | null;
        mesh2d_0: tge3d.Mesh | null;
        shader: tge3d.Shader | null;
        texture: tge3d.Texture2D | null;
        isInit: boolean = false;

        constructor() {
            super();
            this.modelMatrix = new tge3d.Matrix4();
            this.viewMatrix = new tge3d.Matrix4();
            this.viewProjMatrix = new tge3d.Matrix4();
            this.mvpMatrix= new tge3d.Matrix4();
            this.normalMatrix= new tge3d.Matrix4();
            this.mesh = null;
            this.mesh2d_0 = null;
            this.shader = null;
            this.texture = null;

            for(let i=0; i<8; i++) {
                WebGlRender.image_boxs.push(`image/box${i+1}.jpg`);
                WebGlRender.assets.push([WebGlRender.image_boxs[i], tge3d.AssetType.Image]);
            }

            tge3d.asset_manager.loadAssetList(WebGlRender.assets, ()=>{
                this.isInit = true;
                this.init();
            });
        }

        init() {
            let gl = (<tge.WebRun>tge.env).context;
            let canvas = (<tge.WebRun>tge.env).canvas;

            //init shader...
            this.shader = new tge3d.Shader();
            let vs = tge3d.asset_manager.getAsset(WebGlRender.shader_vs).data;
            let fs = tge3d.asset_manager.getAsset(WebGlRender.shader_fs).data;
            if(!this.shader.create(vs, fs)){
                tge.error("Failed to initialize shaders");
                return;
            }
            this.shader.mapAttributeSemantic(tge3d.VertexSemantic.POSITION, 'a_Position');
            this.shader.mapAttributeSemantic(tge3d.VertexSemantic.NORMAL, 'a_Normal');
            this.shader.mapAttributeSemantic(tge3d.VertexSemantic.UV0, 'a_TexCoord');
            this.shader.use();

            //init mesh from obj file...
            let obj = tge3d.asset_manager.getAsset(WebGlRender.obj_file).data;
            let ofl = new tge3d.ObjFileLoader();
            this.mesh = ofl.load(obj, 1.0, false);

            let format = new tge3d.VertexFormat();
            format.addAttrib(tge3d.VertexSemantic.POSITION, 3);
            format.addAttrib(tge3d.VertexSemantic.COLOR, 3);
            format.addAttrib(tge3d.VertexSemantic.UV0, 2);
            this.mesh2d_0 = new tge3d.Mesh(format);
            let position_data = [1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0, -1.0, 1.0,  1.0, -1.0, 1.0];
            let color_data = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0];
            let uv_data = [1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0];
            let triangels = [ 0,1,2, 0,2,3 ];
            this.mesh2d_0.setVertexData(tge3d.VertexSemantic.POSITION, position_data);
            this.mesh2d_0.setVertexData(tge3d.VertexSemantic.COLOR, color_data);
            this.mesh2d_0.setVertexData(tge3d.VertexSemantic.UV0, uv_data);
            this.mesh2d_0.setTriangles(triangels);
            this.mesh2d_0.upload();

            this.shader!.setUniform('u_sampler', 0);

            this.viewMatrix.setLookAt(.0, .0, 60.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
            this.viewProjMatrix.setPerspective(40.0, canvas.width/canvas.height, 1.0, 100.0);
            this.viewProjMatrix.multiply(this.viewMatrix);

            gl.clearColor(0, 0, 0, 1);
            gl.clearDepth(1.0);
            gl.enable(gl.DEPTH_TEST);

            tge.Emitter.register("Tetris.REDRAW_MSG", this.redrawMsg, this);
            tge.Emitter.register("Tetris.REDRAW_NEXT", this.redrawNext, this);
            tge.Emitter.register("Tetris.REDRAW_HOLD", this.redrawHold, this);

            this.drawLogo();
            this.drawBack();
        }

        draw() {
            if(this.testNeedDrawGrid()) {
                this.drawTitle();
                this.redrawGrid();
            }
            this.drawCombo();
            this.drawAttack();
        }

        drawTitle() {
            let g = TermRender.game;
            let m = <Tetris.Model>g.model;
            if(!this.isInit) return;
            this.drawObj(2, 10, 10, 0, 3, 13, 0, 10.0, 10.0, 1.0, 1);
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
            let x = row*2.0 - 20 + idx*22;
            let y = (Tetris.ZONG - col)*2.0 - 16;

            switch(type) {
                case BlockType.BLANK: //空白
                    break;
                case BlockType.FULLROW: //满行闪烁
                    this.drawObj(color%7, x, y, 0, 
                        3-fullrow_stage*5, 13-fullrow_stage*5, 0, 1, 1, 1);
                    break;
                case BlockType.NORMAL://正常方块
                    //被攻击出来的是11
                    if(color==11) 
                        color=0;
                    this.drawObj(color%7, x, y, 0, 3, 13, 0, 1, 1, 1);
                default: 
                    ;
            }
        }

        testNeedDrawGrid() {
            let g = TermRender.game;
            let m = <Tetris.Model>g.model;
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
            let m = <Tetris.Model>g.model;
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
                for(let i=0;i<ZONG;i++) {
                    for(let j=0;j<HENG;j++) {
                        let gv = gr.core.grid[i*GRIDW + j+2];
                        let hidden_fullrow = false;
                        if(frs[idx]!=undefined && frs[idx]!=0) {
                            if(fr[idx].indexOf(i)!=-1 && (Math.floor(frs[idx]/3)%1==0))
                                hidden_fullrow = true;
                        }
                        if(gv==0) {
                            this.drawBlk(idx, BlockType.BLANK, i, j, 0);
                        } else {
                            if(hidden_fullrow) 
                                this.drawBlk(idx, BlockType.FULLROW, i, j, gv%100, frs[idx]);
                            else
                                this.drawBlk(idx, BlockType.NORMAL, i, j, gv%100, frs[idx]);
                        }
                    }
                }
            }
            return true;
        }

        drawCombo() {
            let g = TermRender.game;
            let m = <Tetris.Model>g.model;
        }

        drawAttack() {
            let g = TermRender.game;
            let m = <Tetris.Model>g.model;
        }

        drawObj(color:number, tx=0.0, ty=-1.0, tz=0.0, rx=0, ry=0, rz=0,
            sx=1.0, sy=1.0, sz=1.0, obj:number = 0) {
            let gl = (<tge.WebRun>tge.env).context;
            let canvas = (<tge.WebRun>tge.env).canvas;
            let g = WebGlRender.game;
            let m = <Tetris.Model>g.model;

            //init texture...
            if(obj==0) 
                this.texture = tge3d.texture_manager.getTexture(WebGlRender.image_boxs[color]);
            else
                this.texture = tge3d.texture_manager.getTexture(WebGlRender.title_img);
            this.texture!.bind();

            this.modelMatrix.setTranslate(tx, ty, tz);
            this.modelMatrix.rotate(rz, 0.0, 0.0, 1.0); //rot around z-axis
            this.modelMatrix.rotate(ry, 0.0, 1.0, 0.0); //rot around y-axis
            this.modelMatrix.rotate(rx, 1.0, 0.0, 0.0); //rot around x-axis
            this.modelMatrix.scale(sx, sy, sz);

            this.normalMatrix.setInverseOf(this.modelMatrix);
            this.normalMatrix.transpose();

            this.mvpMatrix.set(this.viewProjMatrix);
            this.mvpMatrix.multiply(this.modelMatrix);

            this.shader!.setUniform('u_mvpMatrix', this.mvpMatrix.elements);
            this.shader!.setUniform('u_NormalMatrix', this.normalMatrix.elements);
            this.shader!.setUniform('u_LightColor', [1.0,1.0,1.0]);

            let lightDir = [1.0, 3.0, 4.0];
            this.shader!.setUniform('u_LightDir', lightDir);

            if(obj==0)
                this.mesh!.render(this.shader);
            else
                this.mesh2d_0!.render(this.shader);

            this.texture!.unbind();
        }

        draw2DRect() {
        }
    }
}
