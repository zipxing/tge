namespace tge3d {
    export class Mesh {
        private _vertex_buffer: VertexBuffer;
        private _index_buffer: IndexBuffer | null;
        private _wireframe: boolean;

        constructor(vertexFormat: VertexFormat, wireframe: boolean = false) {
            this._vertex_buffer = new VertexBuffer(vertexFormat);
            this._index_buffer = null;
            this._wireframe = wireframe;
        }

        setVertexData(semantic: VertexSemantic, data: any){
            this._vertex_buffer.setData(semantic, data);
        }

        setTriangles(data: any){
            if(this._index_buffer==null){
                this._index_buffer = new IndexBuffer(this._wireframe);
            }
            this._index_buffer.setData(data);
        }

        destroy(){
            this._vertex_buffer.destroy();
        }

        upload(){
            tge.debug("-=GLFLOW=-", "glBindBuffer(ARRAY_BUFFER)&glBufferData upload vertex data...");
            this._vertex_buffer.upload();
            if(this._index_buffer){
                tge.debug("-=GLFLOW=-", "glBindBuffer(ELEMENT_ARRAY_BUFFER)&glBufferData upload index data...");
                this._index_buffer.upload();
            }
        }

        render(shader: any){
            let gl = (<tge.WebRun>tge.env).context;
            tge.debug("-=GLFLOW=-", "mesh render glBindBuffer(ARRAY_BUFFER)vertex data...");
            gl.bindBuffer(gl.ARRAY_BUFFER, this._vertex_buffer.vbo);

            this._vertex_buffer.bindAttrib(shader);

            if(this._index_buffer){
                tge.debug("-=GLFLOW=-", "mesh render glBindBuffer(ELEMENT_ARRAY_BUFFER)index data...");
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._index_buffer.vbo);
                tge.debug("-=GLFLOW=-", "mesh render glDrawElements index data...");
                gl.drawElements(this._index_buffer.mode, this._index_buffer.indexCount, this._index_buffer.type, 0);
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
            } else {
                gl.drawArrays(gl.TRIANGLES, 0, this._vertex_buffer.vertex_count);
            }

            this._vertex_buffer.unbindAttrib(shader);

            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }

        static createScreenQuard(wireframe: boolean) {
            let position_data = [-1.0, 1.0, -1.0, -1.0, 1.0, -1.0,
                -1.0, 1.0,  1.0, -1.0, 1.0,  1.0];
            let uv_data = [0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
                0.0, 1.0, 1.0, 0.0, 1.0, 1.0];

            let format = new VertexFormat();
            format.addAttrib(VertexSemantic.POSITION, 2);
            format.addAttrib(VertexSemantic.UV0, 2);

            let mesh = new Mesh(format, wireframe);
            mesh.setVertexData(VertexSemantic.POSITION, position_data);
            mesh.setVertexData(VertexSemantic.UV0, uv_data);
            mesh.upload();

            return mesh;
        }

        static createCube() {
            let format = new VertexFormat();
            format.addAttrib(VertexSemantic.POSITION, 3);
            format.addAttrib(VertexSemantic.NORMAL, 3);
            format.addAttrib(VertexSemantic.TANGENT, 4);
            format.addAttrib(VertexSemantic.UV0, 2);
            let mesh = new Mesh(format);

            //6个面（12个三角形），24个顶点
            //     v6----- v     ^ Y
            //    /|      /|     |
            //   v1------v0|     |
            //   | |     | |     / -------> X
            //   | |v7---|-|    /
            //   |/      |/    v
            //   v2------v3   Z
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
            let normal_data = [
                //v0-v1-v2-v3 front
                0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
                //v0-v3-v4-v5 right
                1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
                //v0-v5-v6-v1 top
                0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
                //v1-v6-v7-v2 left
                -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
                //v7-v4-v3-v2 bottom
                0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
                //v4-v7-v6-v5 back
                0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0
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
            ];

            let tangent_data: any[] = [];
            GeomertyHelper.calcMeshTangents(triangels, position_data, uv_data, tangent_data);
            mesh.setVertexData(VertexSemantic.POSITION, position_data);
            mesh.setVertexData(VertexSemantic.NORMAL, normal_data);
            mesh.setVertexData(VertexSemantic.TANGENT, tangent_data);
            mesh.setVertexData(VertexSemantic.UV0, uv_data);
            mesh.setTriangles(triangels);
            mesh.upload();

            return mesh;
        }
    }
}
