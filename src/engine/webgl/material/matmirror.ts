import { Mesh } from "../core/mesh"
import { Shader } from "../core/shader"
import { Texture2D } from "../core/texture"
import { RenderPass } from "./renderpass"
import { LightMode } from "../component/meshrender"
import { Material, SystemUniforms } from "../material/material"
import { VertexSemantic } from "../core/vertex"
import { texture_manager } from "../core/texture"

let vs = `
        attribute vec4 a_Position;
        attribute vec2 a_Texcoord;
        uniform mat4 u_mvpMatrix;
        varying vec2 v_texcoord;
        void main(){
            gl_Position = u_mvpMatrix * a_Position;
            v_texcoord = a_Texcoord.xy;
            v_texcoord.x = 1.0 - v_texcoord.x;
            v_texcoord.y = 1.0 - v_texcoord.y;
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

let g_shader:Shader | null = null;

class MatMirror extends Material {

    constructor(){
        super();

        if(g_shader==null){
            g_shader = Material.createShader(vs, fs, [
                {'semantic':VertexSemantic.POSITION, 'name':'a_Position'},
                {'semantic':VertexSemantic.UV0 , 'name':'a_Texcoord'}
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
