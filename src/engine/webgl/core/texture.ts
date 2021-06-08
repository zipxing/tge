import * as tge from "../../tge"
import * as log from "../../log"
import { assetManager } from "./asset"

export interface SharedTexture {
    texture: Texture2D;
    ref: number;
}

export class Texture2D {
    _id: number;
    _width: number;
    _height: number;

    constructor() {
        let gl = (<tge.WebRun>tge.env).context;
        this._id = gl.createTexture();
        this._width = 2;
        this._height = 2;
        if (!this._id) {
            log.error('Failed to create the texture object');
        }
    }

    destroy() {
        let gl = (<tge.WebRun>tge.env).context;
        gl.deleteTexture(this._id);
        this._id = 0;
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    get texelSize() {
        return [1.0/this._width, 1.0/this._height];
    }

    create(image: any, withAlpha=false) {
        let gl = (<tge.WebRun>tge.env).context;
        this._width = image.width;
        this._height = image.height;

        // Bind the texture object to the target
        gl.bindTexture(gl.TEXTURE_2D, this._id);

        // Set the texture parameters
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        this.setClamp();

        const level = 0;
        let internalFormat = withAlpha? gl.RGBA : gl.RGB;
        let srcFormat = withAlpha ? gl.RGBA : gl.RGB;

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // Set the texture image data
        const srcType = gl.UNSIGNED_BYTE;
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);

        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    createEmpty(width: number, height: number, withAlpha=false){
        let gl = (<tge.WebRun>tge.env).context;
        const level = 0;
        const internalFormat = withAlpha ? gl.RGBA : gl.RGB;
        const border = 0;
        const srcFormat = withAlpha ? gl.RGBA : gl.RGB;
        const srcType = gl.UNSIGNED_BYTE;
        this._width = width;
        this._height = height;

        gl.bindTexture(gl.TEXTURE_2D, this._id);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, 
            width, height, border, srcFormat, srcType, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.bindTexture(gl.TEXTURE_2D, null);

        this.setClamp();
    }

    createDefault(){
        let gl = (<tge.WebRun>tge.env).context;
        const level = 0;
        const internalFormat = gl.RGBA;
        let n = 8;
        const width = n;
        const height = n;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        let colors = [];
        for(let i=0; i<n; ++i){
            for(let j=0; j<n; ++j){
                (i+j)%2==0 ? colors.push(255,255,255,255) : colors.push(0,0,0,255); //RGBA
            }
        }
        const pixelData = new Uint8Array(colors);

        this._width = width;
        this._height = height;

        gl.bindTexture(gl.TEXTURE_2D, this._id);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, 
            width, height, border, srcFormat, srcType, pixelData);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    createDefaultBump(){
        let gl = (<tge.WebRun>tge.env).context;
        const level = 0;
        const internalFormat = gl.RGB;
        let n = 4;
        const width = n;
        const height = n;
        const border = 0;
        const srcFormat = gl.RGB;
        const srcType = gl.UNSIGNED_BYTE;
        let colors = [];
        for(let i=0; i<n; ++i){
            for(let j=0; j<n; ++j){
                colors.push(128,128,255); //RGB
            }
        }
        const pixelData = new Uint8Array(colors);

        this._width = width;
        this._height = height;

        gl.bindTexture(gl.TEXTURE_2D, this._id);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, 
            width, height, border, srcFormat, srcType, pixelData);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    get id(){
        return this._id;
    }

    bind(unit=0){
        let gl = (<tge.WebRun>tge.env).context;
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, this._id);
    }

    unbind(){
        let gl = (<tge.WebRun>tge.env).context;
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    setRepeat(){
        let gl = (<tge.WebRun>tge.env).context;
        gl.bindTexture(gl.TEXTURE_2D, this._id);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    }

    setClamp(){
        let gl = (<tge.WebRun>tge.env).context;
        gl.bindTexture(gl.TEXTURE_2D, this._id);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
}

export class TextureManager {
    private _textures: {[path:string] : SharedTexture | null};
    private _defaultTexture: Texture2D | null = null;
    private _defaultBumpTexture: Texture2D | null = null;

    constructor() {
        this._textures = {};
    }

    getTexture(texturePath: string) {
        let t = this._textures[texturePath];
        if(t == null) {
            let texture = new Texture2D();
            texture.create(assetManager.getAsset(texturePath).data);
            t = <SharedTexture> {
                texture: texture,
                ref: 1
            };
            this._textures[texturePath] = t;
        } else {
            t.ref++;
        }

        return t.texture;
    }

    releaseTexture(texturePath: string) {
        let t = this._textures[texturePath];
        if(t == null){
            log.error("releaseTexture: texture not found: "+texturePath);
        } else {
            t.ref--;
            if(t.ref < 1){
                t.texture.destroy();
                this._textures[texturePath] = null;
                delete this._textures[texturePath];
            }
        }
    }

    getDefaultTexture(){
        if(this._defaultTexture==null){
            this._defaultTexture = new Texture2D();
            this._defaultTexture.createDefault();
        }
        return this._defaultTexture;
    }

    getDefaultBumpTexture(){
        if(this._defaultBumpTexture==null){
            this._defaultBumpTexture = new Texture2D();
            this._defaultBumpTexture.createDefaultBump();
        }
        return this._defaultBumpTexture;
    }
}

export const textureManager = new TextureManager();

export class RenderTexture{
    private _width: number;
    private _height: number;
    private _fullScreen: boolean;
    private _fbo: any;
    private _texture2D: Texture2D | null;
    private _depthBuffer: any;

    constructor(width: number, height: number, fullScreen=false){
        this._width = width;
        this._height = height;
        this.clampTextureSize();
        this._fullScreen = fullScreen;
        this._fbo = null;
        this._texture2D = null;
        this._depthBuffer = null;
        this._init();
    }

    clampTextureSize(){
        let glAbility = (<tge.WebRun>tge.env).ability;
        while(this._width>glAbility.MAX_TEXTURE_SIZE || 
            this._height>glAbility.MAX_TEXTURE_SIZE) {
            this._width /= 2;
            this._height /= 2;
        }
    }

    get width(){
        return this._width;
    }

    get height(){
        return this._height;
    }

    get isFullScreen(){
        return this._fullScreen;
    }

    get texture2D(){
        return this._texture2D;
    }

    onScreenResize(width: number, height: number){
        if(this._fullScreen){
            this.destroy();
            this._width = width;
            this._height = height;
            this.clampTextureSize();
            this._init();
        }
    }

    destroy(){
        let gl = (<tge.WebRun>tge.env).context;
        if(this._fbo){
            gl.deleteFramebuffer(this._fbo);
            this._fbo = null;
        } 
        if(this._texture2D){
            this._texture2D.destroy();
            this._texture2D = null;
        } 
        if(this._depthBuffer){
            gl.deleteRenderbuffer(this._depthBuffer);  
            this._depthBuffer = null;
        } 
    }

    _init(){
        let gl = (<tge.WebRun>tge.env).context;
        // Create FBO
        this._fbo = gl.createFramebuffer();
        if(!this._fbo){
            console.error('Failed to create frame buffer object');
            this.destroy();
            return;
        }

        // Create a texture object and set its size and parameters
        this._texture2D = new Texture2D();
        if(!this._texture2D.id){
            console.error('Failed to create texture object');
            this.destroy();
            return;
        }
        this._texture2D.createEmpty(this._width, this._height);

        // Create a renderbuffer object and set its size and parameters
        this._depthBuffer = gl.createRenderbuffer();
        if(!this._depthBuffer){
            console.error('Failed to create renderbuffer object');
            this.destroy();
            return;
        }

        gl.bindRenderbuffer(gl.RENDERBUFFER, this._depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 
            this._width, this._height);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        // Attach the texture and the renderbuffer object to the FBO
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D, this._texture2D.id, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, 
            gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this._depthBuffer);

        // Check if FBO is configured correctly
        let e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if(gl.FRAMEBUFFER_COMPLETE !== e){
            console.error('Frame buffer object is incomplete: '+ e.toString());
            this.destroy();
            return;
        }

        // Unbind the buffer object
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    bind(){
        let gl = (<tge.WebRun>tge.env).context;
        if(!this._fbo || !this._texture2D || !this._depthBuffer){
            return;
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._fbo);
        gl.viewport(0, 0, this._width, this._height);
    }

    unbind(){
        let gl = (<tge.WebRun>tge.env).context;
        let canvas = (<tge.WebRun>tge.env).canvas;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
}
