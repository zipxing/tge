var tge3d;
(function (tge3d) {
    //VertexFormat, VertexBuffer, IndexBuffer
    var VertexSemantic;
    (function (VertexSemantic) {
        VertexSemantic["POSITION"] = "position";
        VertexSemantic["NORMAL"] = "normal";
        VertexSemantic["TANGENT"] = "tangent";
        VertexSemantic["COLOR"] = "color";
        VertexSemantic["UV0"] = "uv0";
        VertexSemantic["UV1"] = "uv1";
        VertexSemantic["UV2"] = "uv2";
        VertexSemantic["UV3"] = "uv3";
    })(VertexSemantic = tge3d.VertexSemantic || (tge3d.VertexSemantic = {}));
    var VertexAttribInfo = /** @class */ (function () {
        function VertexAttribInfo(attrsem, attrsize) {
            this.semantic = attrsem;
            this.size = attrsize;
            this.offset = 0;
            this.data = null;
        }
        return VertexAttribInfo;
    }());
    tge3d.VertexAttribInfo = VertexAttribInfo;
    var VertexFormat = /** @class */ (function () {
        function VertexFormat() {
            this.attribs = [];
            this.attr_size = {};
            this._vertex_size = 0;
        }
        VertexFormat.prototype.addAttrib = function (attribSemantic, size) {
            this.attribs.push(attribSemantic);
            this.attr_size[attribSemantic] = size;
        };
        VertexFormat.prototype.getVertexSize = function () {
            if (this._vertex_size === 0) {
                for (var i = 0; i < this.attribs.length; ++i) {
                    var semantic = this.attribs[i];
                    var ats = this.attr_size[semantic];
                    if (ats !== undefined)
                        this._vertex_size += ats;
                }
            }
            return this._vertex_size;
        };
        return VertexFormat;
    }());
    tge3d.VertexFormat = VertexFormat;
    var VertexBuffer = /** @class */ (function () {
        function VertexBuffer(vf) {
            var gl = tge.env.context;
            this._vertex_count = 0;
            this._vertex_stride = 0; // vertex data size in byte
            this._vertex_format = vf;
            this._attribs_info = {};
            this._bufferData = null;
            var attribNum = this._vertex_format.attribs.length;
            for (var i = 0; i < attribNum; ++i) {
                var semantic = this._vertex_format.attribs[i];
                var size = this._vertex_format.attr_size[semantic];
                if (size == null) {
                    console.error('VertexBuffer: bad semantic');
                }
                else {
                    var info = new VertexAttribInfo(semantic, size);
                    this._attribs_info[semantic] = info;
                }
            }
            this._vbo = gl.createBuffer();
        }
        VertexBuffer.prototype.setData = function (semantic, data) {
            var ai = this._attribs_info[semantic];
            if (ai !== undefined)
                ai.data = data;
        };
        Object.defineProperty(VertexBuffer.prototype, "vbo", {
            get: function () {
                return this._vbo;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(VertexBuffer.prototype, "vertex_count", {
            get: function () {
                return this._vertex_count;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(VertexBuffer.prototype, "vertexStride", {
            get: function () {
                return this._vertex_stride;
            },
            enumerable: false,
            configurable: true
        });
        VertexBuffer.prototype.destroy = function () {
            var gl = tge.env.context;
            gl.deleteBuffer(this._vbo);
            this._vbo = 0;
        };
        //combine vertex attribute datas to a data array
        VertexBuffer.prototype._compile = function () {
            var positionInfo = this._attribs_info[VertexSemantic.POSITION];
            if (positionInfo == null) {
                console.error('VertexBuffer: no attrib position');
                return;
            }
            if (positionInfo.data == null || positionInfo.data.length === 0) {
                console.error('VertexBuffer: position data is empty');
                return;
            }
            this._vertex_count = positionInfo.data.length / positionInfo.size;
            this._vertex_stride = this._vertex_format.getVertexSize() * VertexBuffer.BYTES_PER_ELEMENT;
            this._bufferData = [];
            for (var i = 0; i < this._vertex_count; ++i) {
                for (var _i = 0, _a = this._vertex_format.attribs; _i < _a.length; _i++) {
                    var semantic = _a[_i];
                    var info = this._attribs_info[semantic];
                    if (info == null || info.data == null) {
                        console.error('VertexBuffer: bad semantic ' + semantic);
                        continue;
                    }
                    for (var k = 0; k < info.size; ++k) {
                        var value = info.data[i * info.size + k];
                        if (value === undefined) {
                            console.error('VertexBuffer: missing value for ' + semantic);
                        }
                        this._bufferData.push(value);
                    }
                }
            }
            //compute offset for attrib info, and free info.data
            var offset = 0;
            for (var _b = 0, _c = this._vertex_format.attribs; _b < _c.length; _b++) {
                var semantic = _c[_b];
                var info = this._attribs_info[semantic];
                if (info !== undefined) {
                    info.offset = offset;
                    info.data = null;
                    offset += info.size * VertexBuffer.BYTES_PER_ELEMENT;
                }
            }
        };
        //upload data to webGL, add free buffer data
        VertexBuffer.prototype.upload = function () {
            this._compile();
            var buffer = new Float32Array(this._bufferData);
            var gl = tge.env.context;
            gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
            gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            this._bufferData = null;
        };
        VertexBuffer.prototype.bindAttrib = function (shader) {
            var gl = tge.env.context;
            for (var _i = 0, _a = this._vertex_format.attribs; _i < _a.length; _i++) {
                var semantic = _a[_i];
                var info = this._attribs_info[semantic];
                if (info == undefined)
                    continue;
                var location_1 = shader.getAttributeLocation(semantic);
                if (location_1 >= 0) {
                    gl.vertexAttribPointer(location_1, info.size, gl.FLOAT, //type
                    false, //normalized,
                    this._vertex_stride, info.offset);
                    gl.enableVertexAttribArray(location_1);
                }
            }
        };
        VertexBuffer.prototype.unbindAttrib = function (shader) {
            var gl = tge.env.context;
            for (var _i = 0, _a = this._vertex_format.attribs; _i < _a.length; _i++) {
                var semantic = _a[_i];
                var location_2 = shader.getAttributeLocation(semantic);
                if (location_2 >= 0) {
                    gl.disableVertexAttribArray(location_2);
                }
            }
        };
        VertexBuffer.BYTES_PER_ELEMENT = 4;
        return VertexBuffer;
    }());
    var IndexBuffer = /** @class */ (function () {
        function IndexBuffer() {
            var gl = tge.env.context;
            this._indexCount = 0;
            this._mode = gl.TRIANGLES;
            this._type = gl.UNSIGNED_SHORT;
            this._vbo = gl.createBuffer();
            this._bufferData = null;
        }
        IndexBuffer.prototype.setData = function (data) {
            this._bufferData = data;
        };
        Object.defineProperty(IndexBuffer.prototype, "vbo", {
            get: function () {
                return this._vbo;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(IndexBuffer.prototype, "indexCount", {
            get: function () {
                return this._indexCount;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(IndexBuffer.prototype, "mode", {
            get: function () {
                return this._mode;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(IndexBuffer.prototype, "type", {
            get: function () {
                return this._type;
            },
            enumerable: false,
            configurable: true
        });
        IndexBuffer.prototype.destroy = function () {
            var gl = tge.env.context;
            gl.deleteBuffer(this._vbo);
            this._vbo = 0;
        };
        IndexBuffer.prototype.upload = function () {
            var gl = tge.env.context;
            if (this._bufferData == null) {
                console.error("buffer data is null.");
                return;
            }
            var useByte = this._bufferData.length <= 256;
            var buffer = useByte ? new Uint8Array(this._bufferData) : new Uint16Array(this._bufferData);
            this._type = useByte ? gl.UNSIGNED_BYTE : gl.UNSIGNED_SHORT;
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._vbo);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, buffer, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
            this._indexCount = buffer.length;
            this._bufferData = null;
        };
        return IndexBuffer;
    }());
    tge3d.IndexBuffer = IndexBuffer;
})(tge3d || (tge3d = {}));
