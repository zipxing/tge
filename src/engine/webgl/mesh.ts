namespace tge3d {
    export class Mesh {
        private _vertex_buffer: VertexBuffer;
        private _index_buffer: IndexBuffer | null;

        constructor(vertexFormat: VertexFormat) {
            this._vertex_buffer = new VertexBuffer(vertexFormat);
            this._index_buffer = null;
        }

        setVertexData(semantic: VertexSemantic, data: any){
            this._vertex_buffer.setData(semantic, data);
        }

        setTriangles(data: any){
            if(this._index_buffer==null){
                this._index_buffer = new IndexBuffer();
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
    }
}
