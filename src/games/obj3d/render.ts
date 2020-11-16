namespace Obj3d {
    export class WebGlRender extends tge.Render {
        static shader_vs = 'shader/light.vs';
        static shader_fs = 'shader/light.fs';
        static image_box = 'image/box.jpg';
        static obj_file  = 'model3d/cube.obj';

        static assets = [
            [WebGlRender.shader_vs, tge3d.AssetType.Text],
            [WebGlRender.shader_fs, tge3d.AssetType.Text],
            [WebGlRender.obj_file, tge3d.AssetType.Text],
            [WebGlRender.image_box, tge3d.AssetType.Image]
        ];

        modelMatrix: tge3d.Matrix4;
        viewMatrix: tge3d.Matrix4;
        viewProjMatrix: tge3d.Matrix4;
        mvpMatrix: tge3d.Matrix4;
        normalMatrix: tge3d.Matrix4;
        mesh: tge3d.Mesh | null;
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
            this.shader = null;
            this.texture = null;

            tge3d.asset_manager.loadAssetList(WebGlRender.assets, ()=>{
                this.isInit = true;
                this.init();
            });
        }

        init() {
            let gl = (<tge.WebRun>tge.env).context;
            let canvas = (<tge.WebRun>tge.env).canvas;


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

            this.texture = tge3d.texture_manager.getTexture(WebGlRender.image_box);
            let obj = tge3d.asset_manager.getAsset(WebGlRender.obj_file).data;
            //this.mesh = this.createMesh();
            this.texture!.bind();
            this.shader!.setUniform('u_sampler', 0);
            let ofl = new tge3d.ObjFileLoader();
            this.mesh = ofl.load(obj, 0.3, false);
            /*let uv_data = [
                //v0-v1-v2-v3 front
                1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
                //v0-v3-v4-v5 right
                0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,
                //v0-v5-v6-v1 top
                1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,
                //v1-v6-v7-v2 left
                1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
                //v7-v4-v3-v2 bottom
                0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
                //v4-v7-v6-v5 back
                0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0
            ];
            this.mesh.setVertexData(tge3d.VertexSemantic.UV0, uv_data);*/


            this.viewMatrix.setLookAt(.0, .0, 3.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
            this.viewProjMatrix.setPerspective(60.0, canvas.width/canvas.height, 1.0, 100.0);
            this.viewProjMatrix.multiply(this.viewMatrix);

            gl.clearColor(0, 0, 0, 1);
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

        redraw() {
            if(!this.isInit) return;
            let gl = (<tge.WebRun>tge.env).context;
            let canvas = (<tge.WebRun>tge.env).canvas;
            let g = WebGlRender.game;
            let m = <Obj3d.Model>g.model;

            this.modelMatrix.setTranslate(0, -1.0, 0);
            this.modelMatrix.multiply(m.matRot);
            this.modelMatrix.scale(1.0, 1.0, 1.0);

            this.normalMatrix.setInverseOf(this.modelMatrix);
            this.normalMatrix.transpose();

            this.mvpMatrix.set(this.viewProjMatrix);
            this.mvpMatrix.multiply(this.modelMatrix);

            this.shader!.setUniform('u_mvpMatrix', this.mvpMatrix.elements);
            this.shader!.setUniform('u_NormalMatrix', this.normalMatrix.elements);
            this.shader!.setUniform('u_LightColor', [1.0,1.0,1.0]);

            let lightDir = [5.0, 3.0, 4.0];
            this.shader!.setUniform('u_LightDir', lightDir);

            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            this.mesh!.render(this.shader);
        }

        draw() {
        }
    }
}
