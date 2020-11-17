namespace Simple3d {
    export class WebGlRender extends tge.Render {
        static shader_vs = 'shader/tex.vs';
        static shader_fs = 'shader/tex.fs';
        static image_box = 'image/box.jpg';

        static assets = [
            [WebGlRender.shader_vs, tge3d.AssetType.Text],
            [WebGlRender.shader_fs, tge3d.AssetType.Text],
            [WebGlRender.image_box, tge3d.AssetType.Image]
        ];

        modelMatrix: tge3d.Matrix4;
        viewMatrix: tge3d.Matrix4;
        viewProjMatrix: tge3d.Matrix4;
        mvpMatrix: tge3d.Matrix4;
        mesh: tge3d.Mesh | null;
        shader: tge3d.Shader | null;
        texture: tge3d.Texture2D | null;
        isInit: boolean = false;
        movex: number = 0;

        constructor() {
            super();
            this.modelMatrix = new tge3d.Matrix4();
            this.viewMatrix = new tge3d.Matrix4();
            this.viewProjMatrix = new tge3d.Matrix4();
            this.mvpMatrix= new tge3d.Matrix4();
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

            //init shader...
            this.shader = new tge3d.Shader();
            let vs = tge3d.asset_manager.getAsset(WebGlRender.shader_vs).data;
            let fs = tge3d.asset_manager.getAsset(WebGlRender.shader_fs).data;
            if(!this.shader.create(vs, fs)) {
                tge.error("Failed to initialize shaders");
                return;
            }
            this.shader.mapAttributeSemantic(tge3d.VertexSemantic.POSITION, 'a_Position');
            this.shader.mapAttributeSemantic(tge3d.VertexSemantic.COLOR, 'a_Color');
            this.shader.mapAttributeSemantic(tge3d.VertexSemantic.UV0, 'a_TexCoord');
            this.shader.use();

            //init texture...
            this.texture = tge3d.texture_manager.getTexture(WebGlRender.image_box);

            //create cube mesh...
            this.mesh = this.createMesh();

            //init matrix...
            this.viewMatrix.setLookAt(.0, .0, 10.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
            tge.debug("-=GLFLOW=-", "viewMatrix.setLookAt in render constructor");
            this.viewProjMatrix.setPerspective(60.0, canvas.width/canvas.height, 1.0, 100.0);
            this.viewProjMatrix.multiply(this.viewMatrix);


            gl.clearColor(0, 0, 0, 1);
            gl.clearDepth(1.0);
            gl.enable(gl.DEPTH_TEST);
            //gl.depthFunc(gl.LEQUAL);

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

            tge.Emitter.register("Simple3d.REDRAW", this.redraw, this);
            this.redraw();
        }

        createMesh(){
            let format = new tge3d.VertexFormat();
            format.addAttrib(tge3d.VertexSemantic.POSITION, 3);
            format.addAttrib(tge3d.VertexSemantic.COLOR, 3);
            format.addAttrib(tge3d.VertexSemantic.UV0, 2);

            // cube
            //       ^ Y
            //       |
            //       |
            //       / -------> X
            //      /
            //     v
            //    Z
            //
            //    v6----- v5
            //   /|      /|
            //  v1------v0|
            //  | |     | |
            //  | |v7---|-|v4
            //  |/      |/
            //  v2------v3

            let mesh = new tge3d.Mesh(format);
            //6个面（12个三角形），24个顶点
            let position_data = [
                //v0-v1-v2-v3 front (0,1,2,3)
                1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0, -1.0, 1.0,  1.0, -1.0, 1.0,
                //v0-v3-v4-v5 right (4,5,6,7)
                1.0, 1.0, 1.0,  1.0, -1.0, 1.0,  1.0, -1.0, -1.0,  1.0, 1.0, -1.0,
                //v0-v5-v6-v1 top (8,9,10,11)
                1.0, 1.0, 1.0,  1.0, 1.0, -1.0,  -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,
                //v1-v6-v7-v2 left (12,13,14,15)
                -1.0, 1.0, 1.0,  -1.0, 1.0, -1.0,  -1.0, -1.0, -1.0,  -1.0, -1.0, 1.0,
                //v7-v4-v3-v2 bottom (16,17,18,19)
                -1.0, -1.0, -1.0,  1.0, -1.0, -1.0,  1.0, -1.0, 1.0,  -1.0, -1.0, 1.0,
                //v4-v7-v6-v5 back (20,21,22,23)
                1.0, -1.0, -1.0,  -1.0, -1.0, -1.0,  -1.0, 1.0, -1.0,  1.0, 1.0, -1.0
            ];
            let color_data = [
                //v0-v1-v2-v3 front (blue)
                0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
                //v0-v3-v4-v5 right (green)
                0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
                //v0-v5-v6-v1 top (red)
                1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
                //v1-v6-v7-v2 left (yellow)
                1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0,
                //v7-v4-v3-v2 bottom (white)
                1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
                //v4-v7-v6-v5 back
                0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0
            ];
            let uv_data = [
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

            let triangels = [
                0,1,2, 0,2,3,       //front
                4,5,6, 4,6,7,       //right
                8,9,10, 8,10,11,    //top
                12,13,14, 12,14,15, //left
                16,17,18, 16,18,19, //bottom
                20,21,22, 20,22,23  //back
            ]

            mesh.setVertexData(tge3d.VertexSemantic.POSITION, position_data);
            mesh.setVertexData(tge3d.VertexSemantic.COLOR, color_data);
            mesh.setVertexData(tge3d.VertexSemantic.UV0, uv_data);
            mesh.setTriangles(triangels);
            mesh.upload();

            tge.debug("-=GLFLOW=-", "glTextureBind");
            this.texture!.bind();
            tge.debug("-=GLFLOW=-", "shader setUniform u_sampler");
            this.shader!.setUniform('u_sampler', 0);

            return mesh;
        }

        drawCube(mx: number, z: number = 0) {
            let gl = (<tge.WebRun>tge.env).context;
            let canvas = (<tge.WebRun>tge.env).canvas;
            let g = WebGlRender.game;
            let m = <Simple3d.Model>g.model;

            //rotate order: x-y-z
            this.modelMatrix.setRotate(m.rot_z, 0, 0, 1); //rot around z-axis
            this.modelMatrix.rotate(m.rot_y, 0.0, 1.0, 0.0); //rot around y-axis
            this.modelMatrix.rotate(m.rot_x, 1.0, 0.0, 0.0); //rot around x-axis
            if(mx<5.0)
                this.modelMatrix.translate(mx+z, z, z);

            this.mvpMatrix.set(this.viewProjMatrix);
            this.mvpMatrix.multiply(this.modelMatrix);
            tge.debug("-=GLFLOW=-", "shader setUniform mvpMatrix");
            this.shader!.setUniform('u_mvpMatrix', this.mvpMatrix.elements);

            this.mesh!.render(this.shader);
        }

        redraw(mx: number = 100.0) {
            if(!this.isInit) return;
            let gl = (<tge.WebRun>tge.env).context;
            let canvas = (<tge.WebRun>tge.env).canvas;
            let g = WebGlRender.game;
            let m = <Simple3d.Model>g.model;

            //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            let adj = 0.2;
            this.drawCube(mx, 0);
            this.drawCube(mx*2, adj);
            //this.texture!.unbind();
        }

        draw() {
            let g = WebGlRender.game;
            this.movex = 3.0 - 6.0*((g.stage/8 % 100) / 100.0);
            this.redraw(this.movex);
        }
    }
}
