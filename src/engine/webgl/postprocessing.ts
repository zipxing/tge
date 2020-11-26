namespace tge3d {
    let vs = `
        attribute vec2 a_Position;
        attribute vec2 a_Texcoord;
        varying vec2 v_texcoord;
        void main(){
            gl_Position = vec4(a_Position, 0.0, 1.0);
            v_texcoord = a_Texcoord;
        }
    `;
    let fs = `
        #ifdef GL_ES
        precision mediump float;
        #endif
        uniform sampler2D u_texMain;
        varying vec2 v_texcoord;
        void main(){
            gl_FragColor = texture2D(u_texMain, v_texcoord);
        }
    `;

    export class MatPP_Base extends Material{
        private _shader: Shader;

        constructor(fshader: string = fs, vshader: string = vs){
            super();

            //TODO:使用shader manager管理返回对应一对vs/fs唯一的shader
            this._shader = Material.createShader(vshader, fshader, [
                {'semantic':VertexSemantic.POSITION, 'name':'a_Position'},
                {'semantic':VertexSemantic.UV0 , 'name':'a_Texcoord'}
            ]);

            this.addRenderPass(this._shader, LightMode.None);
        }

        //Override
        get systemUniforms(){
            return [];
        }

        //Override
        setCustomUniformValues(pass: RenderPass){
            if(this._mainTexture){
                this._mainTexture.bind();
                pass.shader!.setUniformSafe('u_texMain', 0);
            }
        }

        set mainTexture(v: Texture2D){
            this._mainTexture = v;
        }

        get mainTexture(){
            return this._mainTexture!;
        }
    }

    export class PostProcessingChain {
        private _quardMesh: Mesh | null;
        private _matPPBase: MatPP_Base;
        private _postEffectLayers: any[];
        private _tempRTPools: {[key:string]: any};

        constructor(){
            this._quardMesh = Mesh.createScreenQuard(false);
            this._matPPBase = new MatPP_Base();
            this._postEffectLayers = [];
            this._tempRTPools = {};
        }

        destroy(){
            if(this._quardMesh){
                this._quardMesh.destroy();
                this._quardMesh = null;
            }
            this.freeTempRTs();
            this._matPPBase.destroy();
        }

        add(layer: any){
            this._postEffectLayers.push(layer);
        }

        getTempRT(width: number, height: number){
            let key = width+"_"+height;
            if(this._tempRTPools[key]==null){
                this._tempRTPools[key] = [];
            }
            let last = this._tempRTPools[key].length - 1;
            if(last < 0){
                return new RenderTexture(width, height, true);
            } else {
                let rt = this._tempRTPools[key][last];
                this._tempRTPools[key].length = last;
                return rt;
            }
        }

        releaseTempRT(rt: RenderTexture){
            let key = rt.width+"_"+rt.height;
            if(this._tempRTPools[key]==null){
                this._tempRTPools[key] = [];
            }
            if(this._tempRTPools[key].indexOf(rt) === -1){
                this._tempRTPools[key].push(rt);
            }
        }

        freeTempRTs(){
            for(let key in this._tempRTPools){
                if(this._tempRTPools.hasOwnProperty(key)){
                    let pool = this._tempRTPools[key];
                    for(let i=0; i<pool.length; ++i){
                        pool[i].destroy();
                    }
                }
            }
            this._tempRTPools = {};
        }

        blit(srcRT: RenderTexture, dstRT: RenderTexture, material: Material | null =null, passId=0){
            if(dstRT){
                dstRT.bind();
            }
            material = material || this._matPPBase;
            material.mainTexture = srcRT.texture2D!;
            if(material.texelSize){
                material.texelSize = srcRT.texture2D!.texelSize;
            }
            material.renderPass(this._quardMesh!, null, material.renderPasses[passId]);
            if(dstRT){
                dstRT.unbind();
            }
        }

        render(camera: Camera){
            let gl = (<tge.WebRun>tge.env).context;
            gl.depthFunc(gl.ALWAYS);
            gl.depthMask(false);

            let layerCnt = this._postEffectLayers.length;
            let srcTexture = camera._renderTexture;
            let dstTexture = layerCnt > 1 ? camera._tempRenderTexture : null;

            for(let i=0; i<layerCnt; i++){
                if(i==layerCnt-1){
                    dstTexture = null;
                }
                let layer = this._postEffectLayers[i];
                layer.render(this, srcTexture, dstTexture);
                let tmp = srcTexture;
                srcTexture = dstTexture;
                dstTexture = tmp;
            }

            gl.depthFunc(gl.LEQUAL);
            gl.depthMask(true);
        }
    }
}
