namespace tge3d {
    export interface SharedTexture {
        texture: tge3d.Texture2D;
        ref: number;
    }

    export class Texture2D {
        _id: number;

        constructor() {
            let gl = (<tge.WebRun>tge.env).context;
            this._id = gl.createTexture();
            if (!this._id) {
                tge.log(tge.LogLevel.ERROR, 'Failed to create the texture object');
            }
        }

        destroy() {
            let gl = (<tge.WebRun>tge.env).context;
            gl.deleteTexture(this._id);
            this._id = 0;
        }

        create(image: any) {
            let gl = (<tge.WebRun>tge.env).context;
            // Bind the texture object to the target
            gl.bindTexture(gl.TEXTURE_2D, this._id);

            // Set the texture parameters
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            // Set the texture image data
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

            gl.bindTexture(gl.TEXTURE_2D, null);
        }

        get id() {
            return this._id;
        }

        bind(unit=0) {
            let gl = (<tge.WebRun>tge.env).context;
            gl.activeTexture(gl.TEXTURE0 + unit);
            gl.bindTexture(gl.TEXTURE_2D, this._id);
        }

        unbind() {
            let gl = (<tge.WebRun>tge.env).context;
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
    }

    export class TextureManager {
        private _textures: {[path:string] : SharedTexture | null};

        constructor() {
            this._textures = {};
        }

        getTexture(texturePath: string) {
            let t = this._textures[texturePath];
            if(t == null) {
                let texture = new Texture2D();
                texture.create(asset_manager.getAsset(texturePath).data);
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
                tge.log(tge.LogLevel.ERROR, "releaseTexture: texture not found: "+texturePath);
            } else {
                t.ref--;
                if(t.ref < 1){
                    t.texture.destroy();
                    this._textures[texturePath] = null;
                    delete this._textures[texturePath];
                }
            }
        }
    }
    export const texture_manager = new TextureManager();
}
