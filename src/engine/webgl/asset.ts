namespace tge3d {
    export interface TextAsset {
        name: string;
        data: string;
    }
    export class TextLoader {
        loadAsset(name: string, oncomplete: Function) {
            let req= new XMLHttpRequest();
            req.onreadystatechange = ()=> {
                if(req.readyState === XMLHttpRequest.DONE && req.status !== 404) {
                    let a = <TextAsset> {
                        name: name,
                        data: req.responseText
                    };
                    if( oncomplete ) {
                        oncomplete(a);
                    }
                }
            };
            req.open('GET', name, true);
            req.send();
        }
    }
    export interface ImageAsset {
        name: string;
        data: any;
    }
    export class ImageLoader {
        loadAsset(name: string, oncomplete: Function) {
            let img = new Image();
            img.onload = ()=> {
                let a = <ImageAsset> {
                    name: name,
                    data: img
                };
                if(oncomplete) {
                    oncomplete(a);
                }
            };
            img.src = name;
        }
    }
    export enum AssetType {
        Text = 'text',
        Image =  'image'
    }
    export class AssetManager {
        _loaders: {[name: string] : any} = {};
        _assets: {[name: string] : any} = {};

        constructor(){
            this._loaders = {};
            this._assets = {};
            this.addLoader(AssetType.Image, new ImageLoader());
            this.addLoader(AssetType.Text, new TextLoader());
        }

        addLoader(asset_type: string, loader: any){
            this._loaders[asset_type] = loader;
        }

        loadAsset(name: string, type: AssetType, oncomp: Function){
            if((Object.keys(this._loaders)).length == 0) {
                this.addLoader(AssetType.Image, new ImageLoader());
                this.addLoader(AssetType.Text, new TextLoader());
            }
            if(this._assets[name]){
                if(oncomp){
                    oncomp(this._assets[name]);
                }
                return;
            }

            let loader = this._loaders[type];
            if(loader){
                loader.loadAsset(name, (asset: any) => {
                    this._assets[name] = asset;
                    if(oncomp){
                        oncomp(asset);
                    }
                });
            } else {
                tge.log(tge.LogLevel.ERROR, "missing loader for asset type "+type);
            }
        }

        getAsset(name: string){
            return this._assets[name];
        }

        //assetList: [[name,type]]
        loadAssetList(asset_list: any, onAllComplete: Function){
            let remainCount = asset_list.length;
            for(let listItem of asset_list){
                let name = listItem[0];
                let type = listItem[1];
                this.loadAsset(name, type, (asset: any) => {
                    if(asset){
                        remainCount--;
                        if(remainCount===0 && onAllComplete){
                            onAllComplete();
                        }
                    } else {
                        tge.log(tge.LogLevel.ERROR, 'fail to load asset '+name);
                    }
                })
            }
        }
    }

    export let assetManager = new AssetManager();
}
