namespace tge3d {

    //VertexFormat, VertexBuffer, IndexBuffer

    export enum VertexSemantic {
        POSITION = 'position',
        NORMAL = 'normal',
        TANGENT = 'tangent',
        COLOR = 'color',
        UV0 = 'uv0',
        UV1 = 'uv1',
        UV2 = 'uv2',
        UV3 = 'uv3'
    }

    export interface VertexAttribInfo {
        semantic: VertexSemantic;
        size: number;
        offset: number;
        data: any;
    }

    export class VertexFormat {
        attribs: VertexSemantic[];
        attr_size: {[key in VertexSemantic]?: number};
        private _vertex_size: number;

        constructor() {
            this.attribs = [];
            this.attr_size = {};
            this._vertex_size = 0;
        }

        addAttrib(attribSemantic: VertexSemantic, size: number) {
            this.attribs.push(attribSemantic);
            this.attr_size[attribSemantic] = size;
        }

        getVertexSize() {
            if(this._vertex_size === 0) {
                for(let i=0; i<this.attribs.length; ++i) {
                    let semantic = this.attribs[i];
                    let ats = this.attr_size[semantic];
                    if(ats !== undefined) this._vertex_size += ats;
                }
            }
            return this._vertex_size;
        }
    }

    export class VertexBuffer{
        private _vertex_count: number;
        private _vertex_stride: number;
        private _vertex_format: VertexFormat;
        private _attribs_info: {[key in VertexSemantic]?: VertexAttribInfo};
        private _bufferData: any;
        private _vbo: any;
        static BYTES_PER_ELEMENT:number = 4;

        constructor(vf: VertexFormat){
            let gl = (<tge.WebRun>tge.env).context;
            this._vertex_count = 0;
            this._vertex_stride = 0; // vertex data size in byte
            this._vertex_format = vf;
            this._attribs_info = {};
            this._bufferData = null;

            let attribNum = this._vertex_format.attribs.length;
            for(let i=0; i<attribNum; ++i){
                let semantic = this._vertex_format.attribs[i];
                let size = this._vertex_format.attr_size[semantic];
                if(size==null){
                    tge.log(tge.LogLevel.ERROR, 'VertexBuffer: bad semantic');
                } else {
                    let info = <VertexAttribInfo> {
                        semantic: semantic,
                        size: size,
                        offset: 0,
                        data: null
                    }
                    this._attribs_info[semantic] = info;
                }
            }

            this._vbo = gl.createBuffer();
        }

        setData(semantic:VertexSemantic, data:any){
            let ai = this._attribs_info[semantic];
            if(ai !== undefined) ai.data = data;
        }

        get vbo(){
            return this._vbo;
        }

        get vertex_count(){
            return this._vertex_count;
        }

        get vertexStride(){
            return this._vertex_stride;
        }

        destroy(){
            let gl = (<tge.WebRun>tge.env).context;
            gl.deleteBuffer(this._vbo);
            this._vbo = 0;
        }

        //combine vertex attribute datas to a data array
        private _compile(){
            let positionInfo = this._attribs_info[VertexSemantic.POSITION];
            if(positionInfo == null){
                tge.log(tge.LogLevel.ERROR, 'VertexBuffer: no attrib position');
                return;
            }
            if(positionInfo.data == null || positionInfo.data.length===0){
                tge.log(tge.LogLevel.ERROR, 'VertexBuffer: position data is empty');
                return;
            }

            this._vertex_count = positionInfo.data.length / positionInfo.size;
            this._vertex_stride = this._vertex_format.getVertexSize() * VertexBuffer.BYTES_PER_ELEMENT;

            this._bufferData = [];
            for(let i=0; i<this._vertex_count; ++i){
                for(let semantic of this._vertex_format.attribs){
                    let info = this._attribs_info[semantic];
                    if(info==null || info.data==null){
                        tge.log(tge.LogLevel.ERROR, 'VertexBuffer: bad semantic '+semantic);
                        continue;
                    }
                    for(let k=0; k<info.size; ++k){
                        let value = info.data[ i * info.size + k ];
                        if(value===undefined){
                            tge.log(tge.LogLevel.ERROR, 'VertexBuffer: missing value for '+semantic);
                        }
                        this._bufferData.push(value);
                    }
                }
            }

            //compute offset for attrib info, and free info.data
            let offset = 0;
            for(let semantic of this._vertex_format.attribs){
                let info = this._attribs_info[semantic];
                if(info !== undefined) {
                    info.offset = offset;
                    info.data = null;
                    offset += info.size * VertexBuffer.BYTES_PER_ELEMENT;
                }
            }
        }

        //upload data to webGL, add free buffer data
        upload(){
            this._compile();

            let buffer = new Float32Array(this._bufferData);
            let gl = (<tge.WebRun>tge.env).context;

            gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
            gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);

            this._bufferData = null;
        }

        bindAttrib(shader: any){
            let gl = (<tge.WebRun>tge.env).context;
            for(let semantic of this._vertex_format.attribs){
                let info = this._attribs_info[semantic];
                if(info == undefined) continue;
                let location = shader.getAttributeLocation(semantic);
                if(location>=0){
                    gl.vertexAttribPointer(location,
                        info.size,
                        gl.FLOAT, //type
                        false, //normalized,
                        this._vertex_stride,
                        info.offset);
                    gl.enableVertexAttribArray(location);
                }
            }
        }

        unbindAttrib(shader: any){
            let gl = (<tge.WebRun>tge.env).context;
            for(let semantic of this._vertex_format.attribs){
                let location = shader.getAttributeLocation(semantic);
                if(location>=0){
                    gl.disableVertexAttribArray(location);
                }
            }
        }
    }

    export class IndexBuffer{
        private _indexCount: number;
        private _mode: number;
        private _type: number;
        private _vbo: any;
        private _bufferData: any;

        constructor(){
            let gl = (<tge.WebRun>tge.env).context;
            this._indexCount = 0;
            this._mode = gl.TRIANGLES;
            this._type = gl.UNSIGNED_SHORT;
            this._vbo = gl.createBuffer();
            this._bufferData = null;
        }

        setData(data: any){
            this._bufferData = data;
        }

        get vbo(){
            return this._vbo;
        }

        get indexCount(){
            return this._indexCount;
        }

        get mode(){
            return this._mode;
        }

        get type(){
            return this._type;
        }

        destroy(){
            let gl = (<tge.WebRun>tge.env).context;
            gl.deleteBuffer(this._vbo);
            this._vbo = 0;
        }

        upload(){
            let gl = (<tge.WebRun>tge.env).context;
            if(this._bufferData==null){
                tge.log(tge.LogLevel.ERROR, "buffer data is null.");
                return;
            }
            let useByte = this._bufferData.length<=256;
            let buffer = useByte ? new Uint8Array(this._bufferData) : new Uint16Array(this._bufferData);
            this._type = useByte ? gl.UNSIGNED_BYTE : gl.UNSIGNED_SHORT;

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._vbo);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, buffer, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

            this._indexCount = buffer.length;
            this._bufferData = null;
        }
    }
}
