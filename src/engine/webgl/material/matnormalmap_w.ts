import * as tge from "../../tge"
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
        attribute vec3 a_Normal;
        attribute vec4 a_Tangent;
        attribute vec2 a_Texcoord;

        uniform mat4 u_mvpMatrix;
        uniform mat4 u_object2World;
        uniform mat4 u_world2Object;
        uniform vec4 u_texMain_ST; // Main texture tiling and offset
        uniform vec4 u_normalMap_ST; // Normal map tiling and offset
        // Tangent to World 3x3 matrix and worldPos
        // 每个vec4的xyz是矩阵的一行，w存放了worldPos
        varying vec4 v_TtoW0;
        varying vec4 v_TtoW1;
        varying vec4 v_TtoW2;
        varying vec4 v_texcoord;
        void main(){
            gl_Position = u_mvpMatrix * a_Position;   
            v_texcoord.xy = a_Texcoord.xy * u_texMain_ST.xy + u_texMain_ST.zw;
            v_texcoord.zw = a_Texcoord.xy * u_normalMap_ST.xy + u_normalMap_ST.zw;
            vec3 worldNormal = normalize(a_Normal * mat3(u_world2Object));
            vec3 worldTangent = normalize(u_object2World*a_Tangent).xyz;
            vec3 worldBinormal = cross(worldNormal, worldTangent) * a_Tangent.w;    
            vec4 worldPos = u_object2World*a_Position;

            //TBN向量按列放入矩阵，构造出 TangentToWorld矩阵,使用三个向量保存矩阵的三行，传入fs
            //同时将worldPos存入三个向量的w中
            v_TtoW0 = vec4(worldTangent.x, worldBinormal.x, worldNormal.x, worldPos.x);
            v_TtoW1 = vec4(worldTangent.y, worldBinormal.y, worldNormal.y, worldPos.y);
            v_TtoW2 = vec4(worldTangent.z, worldBinormal.z, worldNormal.z, worldPos.z);
        }
    `;

let fs = `
        #ifdef GL_ES
        precision mediump float;
        #endif
        uniform vec3 u_LightColor; // Light color
        uniform sampler2D u_texMain;
        uniform sampler2D u_normalMap;
        uniform vec3 u_worldCameraPos; // world space camera position
        uniform vec4 u_worldLightPos;   // World space light direction or position, if w==0 the light is directional
        uniform vec3 u_colorTint;
        #ifdef USE_AMBIENT
        uniform vec3 u_ambient; // scene ambient
        #endif
        uniform vec3 u_specular; // specular
        uniform float u_gloss; //gloss
        varying vec4 v_TtoW0;
        varying vec4 v_TtoW1;
        varying vec4 v_TtoW2;
        varying vec4 v_texcoord;
        void main(){    
            vec3 worldPos = vec3(v_TtoW0.w, v_TtoW1.w, v_TtoW2.w);
            vec3 worldViewDir = normalize(u_worldCameraPos - worldPos.xyz);
            vec3 worldLightDir;
            float atten = 1.0;
            if(u_worldLightPos.w==1.0){ //点光源
                vec3 lightver = u_worldLightPos.xyz - worldPos.xyz;
                float dis = length(lightver);
                worldLightDir = normalize(lightver);
                vec3 a = vec3(0.01);
                atten = 1.0/(a.x + a.y*dis + a.z*dis*dis);
            } else {
                worldLightDir = normalize(u_worldLightPos.xyz);
            }
        #ifdef PACK_NORMAL_MAP
            vec4 packedNormal = texture2D(u_normalMap, v_texcoord.zw);
            vec3 normal;
            normal.xy = packedNormal.xy * 2.0 - 1.0;
            normal.z = sqrt(1.0 - clamp(dot(normal.xy, normal.xy), 0.0, 1.0));
        #else
            vec3 normal = texture2D(u_normalMap, v_texcoord.zw).xyz * 2.0 - 1.0;
        #endif
            //Transform the normal from tangent space to world space
            normal = normalize(vec3(dot(v_TtoW0.xyz, normal), dot(v_TtoW1.xyz, normal), dot(v_TtoW2.xyz, normal)));

            vec3 albedo = texture2D(u_texMain, v_texcoord.xy).rgb;
        #ifdef GAMMA_CORRECTION
            albedo = pow(albedo, vec3(2.2));
        #endif
            albedo = albedo * u_colorTint;

            vec3 diffuse = u_LightColor * albedo * max(0.0, dot(normal, worldLightDir));
        #ifdef LIGHT_MODEL_PHONG
            vec3 reflectDir = normalize(reflect(-worldLightDir, normal));
            vec3 specular = u_LightColor * u_specular * pow(max(0.0, dot(reflectDir,worldViewDir)), u_gloss);
        #else
            vec3 halfDir = normalize(worldLightDir + worldViewDir);
            vec3 specular = u_LightColor * u_specular * pow(max(0.0, dot(normal,halfDir)), u_gloss);
        #endif    
        #ifdef USE_AMBIENT
            vec3 ambient = u_ambient * albedo;
            gl_FragColor = vec4(ambient + (diffuse + specular) * atten, 1.0);
        #else
            gl_FragColor = vec4((diffuse + specular) * atten, 1.0);
        #endif
        #ifdef GAMMA_CORRECTION
            gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(1.0/2.2));
        #endif
        }
    `;

let g_shaderForwardBase:Shader | null = null;
let g_shaderForwardAdd:Shader | null = null;

export class MatNormalMapW extends Material {
    _mainTexture_ST: number[];
    _normalMap: Texture2D;
    _normalMap_ST: number[];
    _specular: number[];
    _gloss: number;
    _colorTint: number[];

    constructor(){
        super();

        if(g_shaderForwardBase==null){
            g_shaderForwardBase = Material.createShader(this.getVS_forwardbase(), this.getFS_forwardbase(), [
                {'semantic':VertexSemantic.POSITION, 'name':'a_Position'},
                {'semantic':VertexSemantic.NORMAL , 'name':'a_Normal'},
                {'semantic':VertexSemantic.TANGENT , 'name':'a_Tangent'},
                {'semantic':VertexSemantic.UV0 , 'name':'a_Texcoord'}
            ]);
        }
        if(g_shaderForwardAdd==null){
            g_shaderForwardAdd = Material.createShader(this.getVS_forwardadd(), this.getFS_forwardadd(), [
                {'semantic':VertexSemantic.POSITION, 'name':'a_Position'},
                {'semantic':VertexSemantic.NORMAL , 'name':'a_Normal'},
                {'semantic':VertexSemantic.TANGENT , 'name':'a_Tangent'},
                {'semantic':VertexSemantic.UV0 , 'name':'a_Texcoord'}
            ]);
        }

        this.addRenderPass(g_shaderForwardBase, LightMode.ForwardBase);
        this.addRenderPass(g_shaderForwardAdd, LightMode.ForwardAdd);

        //default uniforms
        this._mainTexture = textureManager.getDefaultTexture();
        this._mainTexture_ST = [1,1,0,0];
        this._normalMap = textureManager.getDefaultBumpTexture();
        this._normalMap_ST = [1,1,0,0];
        this._specular = [1.0, 1.0, 1.0];
        this._gloss = 20.0;
        this._colorTint = [1.0, 1.0, 1.0];
    }

    getVS_Common(){
        return vs;
    }

    getFS_Common(){
        let sysconf = (<tge.WebRun>tge.env).config;
        let fs_common = "#define LIGHT_MODEL_PHONG\n";
        if(sysconf.gammaCorrection){
            fs_common += "#define GAMMA_CORRECTION\n";
        }
        fs_common += fs;
        return fs_common;
    }

    getVS_forwardbase(){
        return this.getVS_Common();
    }

    getFS_forwardbase(){
        let fs_forwardbase = "#define USE_AMBIENT\n" + this.getFS_Common();
        return fs_forwardbase;
    }

    getVS_forwardadd(){
        return this.getVS_Common();
    }

    getFS_forwardadd(){
        // fs和forwardbase的区别只是fs里面没有加ambient
        return this.getFS_Common();
    }

    //Override
    get systemUniforms(){
        return [SystemUniforms.MvpMatrix,
            SystemUniforms.World2Object,
            SystemUniforms.Object2World,
            SystemUniforms.WorldCameraPos,
            SystemUniforms.SceneAmbient,
            SystemUniforms.LightColor, SystemUniforms.WorldLightPos]; 
    }

    //Override
    setCustomUniformValues(pass: RenderPass) {
        pass.shader!.setUniformSafe('u_specular', this._specular);
        pass.shader!.setUniformSafe('u_gloss', this._gloss);
        pass.shader!.setUniformSafe('u_colorTint', this._colorTint);
        pass.shader!.setUniformSafe('u_texMain_ST', this._mainTexture_ST); 
        pass.shader!.setUniformSafe('u_normalMap_ST', this._normalMap_ST);     
        if(this._mainTexture){
            this._mainTexture.bind(0);
            pass.shader!.setUniformSafe('u_texMain', 0);
        }  
        if(this._normalMap){
            this._normalMap.bind(1);
            pass.shader!.setUniformSafe('u_normalMap', 1);
        }
    }

    set specular(v: number[]){
        this._specular = v;
    }

    set gloss(v: number){
        this._gloss = v;
    }

    set colorTint(v: number[]){
        this._colorTint = v;
    }

    set mainTextureST(v: number[]){
        this._mainTexture_ST = v;
    }

    set normalMap(v: Texture2D){
        this._normalMap = v;
    }

    get normalMap(){
        return this._normalMap;
    }

    set normalMapST(v: number[]){
        this._normalMap_ST = v;
    }
}
