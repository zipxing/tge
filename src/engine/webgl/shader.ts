namespace tge3d {
    export interface UniformInfo {
        name: string;
        location: any;
        type: any;
        size: number;
        isArray: boolean;
    }

    export class Shader {
        program: any;
        private _semantic2attr : {[key: string]: string};
        private _attributes : {[key: string] : number};
        private _uniforms : {[key: string] : any};

        constructor() {
            this.program = null;
            this._semantic2attr = {}; // {[semantic:string]:string}
            this._attributes = {}; // {[name:string]:number}
            this._uniforms = {};  // {[name:string]:WebGLUniformLocation}
        }

        mapAttributeSemantic(semantic: string, attr_name: string) {
            this._semantic2attr[semantic] = attr_name;
        }

        create(vshader: string, fshader: string) {
            let gl = (<tge.WebRun>tge.env).context;
            let vertexShader = this.loadShader(gl.VERTEX_SHADER, vshader);
            let fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fshader);
            if (!vertexShader || !fragmentShader) {
                return false;
            }

            // Create a program object
            tge.debug("-=GLFLOW=-", "glCreateProgram");
            this.program = gl.createProgram();
            if (!this.program) {
                return false;
            }

            // Attach the shader objects
            gl.attachShader(this.program, vertexShader);
            gl.attachShader(this.program, fragmentShader);
            tge.debug("-=GLFLOW=-", "glAttachShader attach program and shader...");

            // Link the program object
            gl.linkProgram(this.program);
            tge.debug("-=GLFLOW=-", "glLinkProgram...");

            // Check the result of linking
            let linked = gl.getProgramParameter(this.program, gl.LINK_STATUS);
            tge.debug("-=GLFLOW=-", "glGetProgramParameter...check linking result");
            if (!linked) {
                let error = gl.getProgramInfoLog(this.program);
                tge.error('Failed to link program: ' + error);
                gl.deleteProgram(this.program);
                gl.deleteShader(fragmentShader);
                gl.deleteShader(vertexShader);
                this.program = null;
                return false;
            }

            this.findoutAttributes();
            this.findoutUniforms();

            return true;
        }

        hasUniform(name: string){
            return this._uniforms[name]!=null;
        }

        destroy(){
            let gl = (<tge.WebRun>tge.env).context;
            gl.deleteProgram(this.program);
            this.program = null;
        }

        loadShader(type: any, source: string) {
            let gl = (<tge.WebRun>tge.env).context;
            let shader = gl.createShader(type);
            tge.debug("-=GLFLOW=-", "glCreateShader&glShaderSource&glCompileShader&getShaderParameter...", source);
            if (shader == null) {
                tge.error('unable to create shader');
                return null;
            }

            // Set the shader program
            gl.shaderSource(shader, source);

            // Compile the shader
            gl.compileShader(shader);

            // Check the result of compilation
            let compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
            if (!compiled) {
                let error = gl.getShaderInfoLog(shader);
                tge.error('Failed to compile shader: ' + error);
                gl.deleteShader(shader);
                return null;
            }

            return shader;
        }

        findoutAttributes() {
            let gl = (<tge.WebRun>tge.env).context;
            let attributeCount = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES);
            tge.debug("-=GLFLOW=-", "glGetProgramParameter&getActiveAttrib&getAttribLocation...", "findoutAttributes");
            for(let i=0; i<attributeCount; ++i) {
                let info = gl.getActiveAttrib(this.program, i);
                if(!info) {
                    break;
                }
                this._attributes[info.name] = gl.getAttribLocation(this.program, info.name);
            }

            tge.info('attributes',this._attributes);
        }

        findoutUniforms() {
            let gl = (<tge.WebRun>tge.env).context;
            let uniformCount = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
            tge.debug("-=GLFLOW=-", "glGetProgramParameter&getActiveUniform&getAttribUniform...", "findoutUniform");
            for(let i=0; i<uniformCount; ++i) {
                let info = gl.getActiveUniform(this.program, i);
                if(!info) {
                    break;
                }

                let location = gl.getUniformLocation(this.program, info.name);
                let isArray = info.size > 1 && info.name.substr(-3) === '[0]';
                let uniformInfo = <UniformInfo> {
                    name: info.name,
                    location: location,
                    type: info.type,
                    size: info.size,
                    isArray: isArray
                };
                this._uniforms[info.name] = uniformInfo;
            }

            tge.info('uniforms',this._uniforms);
        }

        setAttributesMap(attributesMap: any){
            for(let attr of attributesMap){
                let semantic = attr['semantic'];
                let name = attr['name'];
                this.mapAttributeSemantic(semantic, name);
            }
        }

        setUniformSafe(name: string, value: any){
            if(this.hasUniform(name)){
                this.setUniform(name, value);
            }
        }

        setUniform(name: string, value: any) {
            let gl = (<tge.WebRun>tge.env).context;
            let info = this._uniforms[name];
            if(!info) {
                tge.error('can not find uniform named '+name);
                return;
            }
            switch(info.type) {
                case gl.INT:{
                    if(info.isArray){
                        gl.uniform1iv(info.location, value);
                    } else {
                        gl.uniform1i(info.location, value);
                    }
                    break;
                }
                case gl.FLOAT:{
                    if(info.isArray){
                        gl.uniform1fv(info.location, value);
                    } else {
                        gl.uniform1f(info.location, value);
                    }
                    break;
                }
                case gl.FLOAT_VEC2:{
                    gl.uniform2fv(info.location, value);
                    break;
                }
                case gl.FLOAT_VEC3:{
                    gl.uniform3fv(info.location, value);
                    break;
                }
                case gl.FLOAT_VEC4:{
                    gl.uniform4fv(info.location, value);
                    break;
                }
                case gl.FLOAT_MAT3:{
                    gl.uniformMatrix3fv(info.location, false, value);
                    break;
                }
                case gl.FLOAT_MAT4:{
                    gl.uniformMatrix4fv(info.location, false, value);
                    break;
                }
                case gl.SAMPLER_2D:{
                    gl.uniform1i(info.location, value);
                    break;
                }
                default:{
                    tge.error('uniform type not support', info.type)
                    break;
                }
            }
        }

        getAttributeLocation(semantic: string) {
            let name = this._semantic2attr[semantic];
            if(name) {
                let location = this._attributes[name];
                return location;
            } else {
                //tge.error('Shader: can not find attribute for semantic '+semantic);
                return -1;
            }
        }

        use() {
            if(this.program) {
                let gl = (<tge.WebRun>tge.env).context;
                tge.debug("-=GLFLOW=-", "glUseProgram shader");
                gl.useProgram(this.program);
            }
        }
    }
}
