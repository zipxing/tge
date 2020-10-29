namespace Simple3d {
    export class WebGlRender extends tge.Render {
        static VSHADER_SOURCE=`
            attribute vec4 a_Position;
            attribute vec4 a_Color;
            attribute float a_Custom;
            uniform mat4 u_mvpMatrix;
            varying vec4 v_Color;
            void main(){
                gl_Position = u_mvpMatrix * a_Position;
                v_Color = a_Color;
            }
        `;

        static FSHADER_SOURCE=`
            #ifdef GL_ES
            precision mediump float;
            #endif
            varying vec4 v_Color;
            void main(){
                gl_FragColor = v_Color;
            }
        `;

        modelMatrix: tge3d.Matrix4; 
        viewProjMatrix: tge3d.Matrix4;
        mvpMatrix: tge3d.Matrix4;
        mesh: tge3d.Mesh;
        shader: tge3d.Shader;

        constructor() {
            super();
            let gl = (<tge.WebRun>tge.env).context;
            let canvas = (<tge.WebRun>tge.env).canvas;

            this.modelMatrix = new tge3d.Matrix4();
            this.viewProjMatrix = new tge3d.Matrix4();
            this.mvpMatrix= new tge3d.Matrix4();
            this.shader = new tge3d.Shader();
            this.mesh = this.createMesh();

            if(!this.shader.create(WebGlRender.VSHADER_SOURCE, WebGlRender.FSHADER_SOURCE)){
                tge.log(tge.LogLevel.ERROR, "Failed to initialize shaders");
                return;
            }

            this.shader.mapAttributeSemantic(tge3d.VertexSemantic.POSITION, 'a_Position');
            this.shader.mapAttributeSemantic(tge3d.VertexSemantic.COLOR, 'a_Color');
            this.shader.use();

            let viewMatrix = new tge3d.Matrix4();
            viewMatrix.setLookAt(.0, .0, 8.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
            this.viewProjMatrix.setPerspective(30.0, canvas.width/canvas.height, 1.0, 100.0);
            this.viewProjMatrix.multiply(viewMatrix);

            gl.clearColor(0, 0, 0, 1);
            gl.clearDepth(1.0);
            gl.enable(gl.DEPTH_TEST);

            let mh = new MouseHandler();
            canvas.onmousedown = (event: any) => {
                console.log("DDDDDDDDDDDDDDDDDDDDDDDDDDD");
                mh.mouseDown(event);
            }
            canvas.onmousemove = (event: any) => {
                mh.mouseMove(event);
            }
            canvas.onmouseup = (event: any) => {
                mh.mouseUp(event);
            }

            tge.Emitter.register("Simple3d.REDRAW", this.redraw, this);
        }

        createMesh(){
            let format = new tge3d.VertexFormat();
            format.addAttrib(tge3d.VertexSemantic.POSITION, 3);
            format.addAttrib(tge3d.VertexSemantic.COLOR, 3);

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
            mesh.setTriangles(triangels);
            mesh.upload();

            return mesh;
        }

        redraw() {
            let gl = (<tge.WebRun>tge.env).context;
            let canvas = (<tge.WebRun>tge.env).canvas;
            let g = WebGlRender.game;
            let m = <Simple3d.Model>g.model;

            //rotate order: x-y-z
            this.modelMatrix.setRotate(m.rot_z, 0, 0, 1); //rot around z-axis
            this.modelMatrix.rotate(m.rot_y, 0.0, 1.0, 0.0); //rot around y-axis
            this.modelMatrix.rotate(m.rot_x, 1.0, 0.0, 0.0); //rot around x-axis

            this.mvpMatrix.set(this.viewProjMatrix);
            this.mvpMatrix.multiply(this.modelMatrix);

            this.shader.setUniform('u_mvpMatrix', this.mvpMatrix.elements);

            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            this.mesh.render(this.shader);
        }

        draw() {
        }
    }
}
