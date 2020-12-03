namespace tge3d {

    export class PostEffectLayer {
        private _material: Material;
        constructor(material: Material){
            this._material = material;
        }

        //override
        render(chain: any, srcRT: any, dstRT: any){
        }
    }
}
