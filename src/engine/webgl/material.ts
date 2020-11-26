namespace tge3d {
    export enum SystemUniforms  {
        MvpMatrix = 'u_mvpMatrix',
            Object2World = 'u_object2World',
            World2Object = 'u_world2Object',   //normal matrix请使用World2Object，然后在shader里面矩阵放右边即可: vec3 worldNormal = normalize(a_Normal * mat3(u_world2Object));
            WorldCameraPos = 'u_worldCameraPos',
            WorldLightPos = 'u_worldLightPos',
            LightColor = 'u_LightColor',
            SceneAmbient = 'u_ambient'
    }

    export class RenderPass {
        index: number;
        private _shader: Shader | null;
        private _lightMode: LightMode;

        constructor(lightMode: LightMode){
            this.index = 0;
            this._shader = null;
            this._lightMode = lightMode;
        }

        set shader(v: Shader | null) {
            this._shader = v;
        }

        get shader() : Shader | null {
            return this._shader;
        }

        get lightMode(){
            return this._lightMode;
        }

        destroy(){
            if(this._shader){
                this._shader.destroy();
                this._shader = null;
            }
        }
    }

    let vs_errorReplace = `
        attribute vec4 a_Position;
        uniform mat4 u_mvpMatrix;
        void main(){
            gl_Position = u_mvpMatrix * a_Position;
        }
    `;

    let fs_errorReplace = `
        #ifdef GL_ES
        precision mediump float;
        #endif
        void main(){
            gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
        }
    `;

    export class Material {
        renderPasses: RenderPass[];
        _mainTexture: Texture2D;
        texelSize: any;

        constructor() {
            this.renderPasses = [];
            this._mainTexture = texture_manager.getDefaultTexture();
        }

        addRenderPass(shader: Shader, lightMode=LightMode.None){
            let pass = new RenderPass(lightMode);
            pass.shader = shader;
            pass.index = this.renderPasses.length;
            this.renderPasses.push(pass);
            return pass;
        }

        destroy(){
            for(let pass of this.renderPasses){
                pass.destroy();
            }
            this.renderPasses = [];
        }

        get mainTexture() {
            return this._mainTexture;
        }

        set mainTexture(m: Texture2D) {
            this._mainTexture = m;
        }

        //Override
        get systemUniforms(){
            return [SystemUniforms.MvpMatrix];
        }

        //自动设置system uniforms (根据systemUniforms的返回值)
        setSysUniformValues(pass: RenderPass, context: any){
            if(!pass.shader) return;
            let systemUniforms: SystemUniforms[] = this.systemUniforms;
            for(let su of systemUniforms) {
                let sysu = su as string;
                if(pass.shader.hasUniform(sysu)){ //pass不一定使用材质所有的uniform，所以要判断一下
                    pass.shader.setUniform(sysu, context[sysu]);
                }
            }
        }

        //Override
        //材质子类中手动设置uniform，需要重载
        setCustomUniformValues(pass: RenderPass){
        }

        //Override
        //渲染pass后的清理工作
        afterRender(pass: RenderPass){
        }

        renderPass(mesh: Mesh, context: any, pass: RenderPass){
            if(!pass.shader) return;
            pass.shader.use();
            this.setSysUniformValues(pass, context);
            this.setCustomUniformValues(pass);
            mesh.render(pass.shader);
            this.afterRender(pass);
        }

        static createShader(vs: string, fs: string, attributesMap: any){
            let shader = new Shader();
            if (!shader.create(vs, fs)) {
                console.log("Failed to initialize shaders");
                //Set to a default error replace shader
                shader.create(vs_errorReplace, fs_errorReplace);
            }
            shader.setAttributesMap(attributesMap);
            return shader;
        }
    }

    let vs = `
        attribute vec4 a_Position;
        uniform mat4 u_mvpMatrix;
        uniform mat4 u_projectorMatrix;
        varying vec4 v_projTexCoord;
        void main(){
            gl_Position = u_mvpMatrix * a_Position;
            v_projTexCoord = u_projectorMatrix * a_Position;
        }
    `;

    let fs = `
        #ifdef GL_ES
        precision mediump float;
        #endif
        uniform sampler2D u_texProj;
        varying vec4 v_projTexCoord;
        void main(){
            vec4 projTexColor = vec4(0.0);
            if(v_projTexCoord.z > 0.0){
                projTexColor = texture2DProj(u_texProj, v_projTexCoord);
            }
            gl_FragColor = projTexColor * 0.5;
        }
    `;

    let g_shader: Shader | null = null;

    export class MatProjector extends Material{
        private _projMatrix: Float32Array | null;
        private _projTexture: Texture2D;

        constructor(){
            super();
            if(g_shader==null){
                g_shader = Material.createShader(vs, this.getFS(), [
                    {'semantic':VertexSemantic.POSITION, 'name':'a_Position'}
                ]);
            }
            this.addRenderPass(g_shader);
            //default uniforms
            this._projMatrix = null;
            this._projTexture = tge3d.texture_manager.getDefaultTexture();
        }

        getFS(){
            let fs_common = "";
            // if(sysConfig.gammaCorrection){
            //     fs_common += "#define GAMMA_CORRECTION\n";
            // }
            fs_common += fs;
            return fs_common;
        }

        //Override
        get systemUniforms(){
            return [SystemUniforms.MvpMatrix];
        }

        //Override
        setCustomUniformValues(pass: RenderPass){
            if(!pass.shader) return;
            pass.shader.setUniformSafe('u_projectorMatrix', this._projMatrix);
            if(this._projTexture){
                this._projTexture.bind();
                pass.shader.setUniformSafe('u_texProj', 0);
            }
        }

        set projTexture(v){
            this._projTexture = v;
            this._projTexture.setClamp();
        }

        get projTexture(){
            return this._projTexture;
        }

        set projMatrix(v: Float32Array){
            this._projMatrix = v;
        }
    }
}
