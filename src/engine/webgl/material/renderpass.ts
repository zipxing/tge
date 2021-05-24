import { Shader } from "../core/shader"
import { LightMode } from "../component/meshrender"

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
