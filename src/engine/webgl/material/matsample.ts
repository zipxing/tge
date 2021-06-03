import { Mesh } from "../core/mesh"
import { Shader } from "../core/shader"
import { Texture2D } from "../core/texture"
import { RenderPass } from "./renderpass"
import { LightMode } from "../component/meshrender"
import { Material, SystemUniforms } from "../material/material"
import { VertexSemantic } from "../core/vertex"
import { textureManager } from "../core/texture"

let vs = `
        attribute vec4 a_Position;
        attribute vec4 a_Color;
        attribute vec2 a_TexCoord;
        uniform mat4 u_mvpMatrix;
        varying vec4 v_Color;
        varying vec2 v_TexCoord;
        void main(){
            gl_Position = u_mvpMatrix * a_Position;
            v_Color = a_Color;
            v_TexCoord = a_TexCoord;
        }
    `;

let fs = `
		#ifdef GL_ES
		precision mediump float;
		#endif
		uniform sampler2D u_sampler;
		varying vec4 v_Color;
		varying vec2 v_TexCoord;
		void main() {
		    vec4 tex = texture2D(u_sampler, v_TexCoord);
		    gl_FragColor = tex * v_Color;
		}
    `;

let g_shader:Shader | null = null;

export class MatSample extends Material {

    constructor(){
        super();

        if(g_shader==null){
            g_shader = Material.createShader(vs, fs, [
                {'semantic':VertexSemantic.POSITION, 'name':'a_Position'},
                {'semantic':VertexSemantic.UV0 , 'name':'a_TexCoord'}
            ]);
        }

        this.addRenderPass(g_shader, LightMode.None);

        //default uniforms
        this._mainTexture = null;
    }

    //Override
    get systemUniforms(){
        return [SystemUniforms.MvpMatrix];
    }

    //Override
    setCustomUniformValues(pass: RenderPass){
        if(this._mainTexture){
            this._mainTexture.bind();
            pass.shader!.setUniformSafe('u_texMain', 0);
        }
    }
}
