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
        static _loaders: {[name: string] : any} = {};
        static _assets: {[name: string] : any} = {};
        constructor(){
            AssetManager._loaders = {};
            AssetManager._assets = {};

            AssetManager.addLoader(AssetType.Image, new ImageLoader());
            AssetManager.addLoader(AssetType.Text, new TextLoader());
        }

        static addLoader(asset_type: string, loader: any){
            AssetManager._loaders[asset_type] = loader;
        }

        static loadAsset(name: string, type: AssetType, oncomp: Function){
            if(AssetManager._assets[name]){
                if(oncomp){
                    oncomp(AssetManager._assets[name]);
                }
                return;
            }

            let loader = AssetManager._loaders[type];
            if(loader){
                loader.loadAsset(name, (asset: any) => {
                    AssetManager._assets[name] = asset;
                    if(oncomp){
                        oncomp(asset);
                    }
                });
            } else {
                console.error("missing loader for asset type "+type);
            }
        }

        static getAsset(name: string){
            return AssetManager._assets[name];
        }

        //assetList: [[name,type]]
        static loadAssetList(asset_list: any, onAllComplete: Function){
            let remainCount = asset_list.length;
            for(let listItem of asset_list){
                let name = listItem[0];
                let type = listItem[1];
                AssetManager.loadAsset(name, type, (asset: any) => {
                    if(asset){
                        remainCount--;
                        if(remainCount===0 && onAllComplete){
                            onAllComplete();
                        }
                    } else {
                        console.error('fail to load asset '+name);
                    }
                })
            }
        }
    }
}
