import * as tge from "../../tge"
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
uniform mat4 u_mvpMatrix;
void main(){
    gl_Position = u_mvpMatrix * a_Position;
}
`;

let fs = `
#ifdef GL_ES
precision mediump float;
#endif
uniform vec3 u_Color;
void main(){
    gl_FragColor = vec4(u_Color, 1.0);
#ifdef GAMMA_CORRECTION
    gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(1.0/2.2));
#endif
}
`;

let g_shader:Shader | null = null;

export class MatSolidColor extends Material{
    color : number[] | null;
    constructor(color:number[] | null = null){
        super();

        if(g_shader==null){
            g_shader = Material.createShader(vs, this.getFS(), [
                {'semantic':VertexSemantic.POSITION, 'name':'a_Position'}
            ]);
        }

        this.addRenderPass(g_shader);

        //default uniforms
        if(color){
            this.color = color;
        } else {
            this.color = [1.0, 1.0, 1.0];
        }
    }

    getFS(){
        let sysconf = (<tge.WebRun>tge.env).config;
        let fs_common = "";
        if(sysconf.gammaCorrection){
            fs_common += "#define GAMMA_CORRECTION\n";
        }
        fs_common += fs;
        return fs_common;
    }

    //Override
    get systemUniforms(){
        return [SystemUniforms.MvpMatrix];
    }

    //Override
    setCustomUniformValues(pass: RenderPass){
        pass.shader!.setUniform('u_Color', this.color);
    }

    setColor(color: number[]){
        this.color = color;
    }
}
