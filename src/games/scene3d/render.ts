namespace Scene3d {
    export class WebGlRender extends tge.Render {
        static obj_file_capsule = 'models/capsule.obj';
        static obj_file_sphere = 'models/sphere.obj';
        static obj_main_texture = 'imgs/wall01_diffuse.jpg';
        static obj_normal_map = 'imgs/wall01_normal.jpg';
        static box_main_texture = 'imgs/box_diffuse.jpg';
        static box_normal_map = 'imgs/box_normal.jpg';
        static plane_main_texture = 'imgs/wall02_diffuse.png';
        static plane_normal_map = 'imgs/wall02_normal.png';
        static brick_main_texture = 'imgs/brickwall_diffuse.jpg';
        static brick_normal_map = 'imgs/brickwall_normal.jpg';
        static proj_texture = 'imgs/t1.png';

        static assets = [
            [WebGlRender.obj_file_capsule, tge3d.AssetType.Text],
            [WebGlRender.obj_file_sphere, tge3d.AssetType.Text],
            [WebGlRender.obj_main_texture, tge3d.AssetType.Image],
            [WebGlRender.obj_normal_map, tge3d.AssetType.Image],
            [WebGlRender.box_main_texture, tge3d.AssetType.Image],
            [WebGlRender.box_normal_map, tge3d.AssetType.Image],
            [WebGlRender.plane_main_texture, tge3d.AssetType.Image],
            [WebGlRender.plane_normal_map, tge3d.AssetType.Image],
            [WebGlRender.brick_main_texture, tge3d.AssetType.Image],
            [WebGlRender.brick_normal_map, tge3d.AssetType.Image],
            [WebGlRender.proj_texture, tge3d.AssetType.Image]
        ];

        _time: number;
        _rotX: number;
        _rotY: number;
        _tempQuat: tge3d.Quaternion;
        _tempVec3: tge3d.Vector3;
        _scene: tge3d.Scene | null = null;
        _mesh1: tge3d.Node | null = null;
        _mesh2: tge3d.Node | null = null;
        _pointLight1: tge3d.Node | null = null;
        _pointLight2: tge3d.Node | null = null;
        _cameraNode: tge3d.Node | null = null;

        isInit: boolean = false;

        constructor() {
            super();
            this._time = 0;
            this._rotX = 0;
            this._rotY = 0;
            this._tempQuat = new tge3d.Quaternion();
            this._tempVec3 = new tge3d.Vector3();

            tge3d.asset_manager.loadAssetList(WebGlRender.assets, ()=>{
                this.isInit = true;
                this.init();
            });
        }

        init() {
            let gl = (<tge.WebRun>tge.env).context;
            let canvas = (<tge.WebRun>tge.env).canvas;

            //refer to mouse.ts...
            let mh = new MouseHandler();
            canvas.onmousedown = (event: any) => {
                mh.mouseDown(event);
            }
            canvas.onmousemove = (event: any) => {
                mh.mouseMove(event);
            }
            canvas.onmouseup = (event: any) => {
                mh.mouseUp(event);
            }

            //tge.Emitter.register("Scene3d.REDRAW", this.redraw, this);
            //this.redraw();
        }

        createGround(){
            let groundMesh = tge3d.Mesh.createPlane(20, 10, 20, 10);
            let matGround = new tge3d.MatNormalMap();
            matGround.mainTexture = tge3d.texture_manager.getTexture(WebGlRender.plane_main_texture);
            matGround.mainTexture.setRepeat();
            matGround.mainTextureST = [3,3,0,0];
            matGround.normalMap = tge3d.texture_manager.getTexture(WebGlRender.plane_normal_map);
            matGround.normalMap.setRepeat();
            matGround.normalMapST = [3,3,0,0];
            matGround.specular = [0.8, 0.8, 0.8];
            let groundNode = this._scene!.root.addMeshNode(groundMesh, matGround);
            groundNode.localPosition.set(0,0,0);
        }

        createWall(){
            let wallMesh = tge3d.Mesh.createPlane(20, 10, 20, 10);
            let matWall = new tge3d.MatNormalMap();
            matWall.mainTexture =  tge3d.texture_manager.getTexture(WebGlRender.brick_main_texture);
            matWall.mainTexture.setRepeat();
            matWall.mainTextureST = [3,3,0,0];
            matWall.normalMap = tge3d.texture_manager.getTexture(WebGlRender.brick_normal_map);
            matWall.normalMap.setRepeat();
            matWall.normalMapST = [3,3,0,0];
            matWall.specular = [0.8, 0.8, 0.8];
            return this._scene!.root.addMeshNode(wallMesh, matWall);
        }

        createWorld() {
            let canvas = (<tge.WebRun>tge.env).canvas;

            // Load meshes
            let ofl = new tge3d.ObjFileLoader();
            let capusleData = tge3d.asset_manager.getAsset(WebGlRender.obj_file_capsule).data;
            let capusleMesh = ofl.load(capusleData, 1.0, true);

            let sphereData = tge3d.asset_manager.getAsset(WebGlRender.obj_file_sphere).data;
            let sphereMesh = ofl.load(sphereData, 1.0, true);

            // Create scene
            this._scene = new tge3d.Scene();

            // Create the ground
            this.createGround();

            // Create walls
            let wall1 = this.createWall();
            wall1.localPosition.set(0, 5, -5);
            wall1.localRotation.setFromEulerAngles(new tge3d.Vector3(90,0,0));

            // Create an empty mesh root node
            let meshRoot = this._scene.root.addEmptyNode();
            //meshRoot.localPosition.set(-1, 1, 1);
            //meshRoot.localScale.set(0.8, 1, 1);
            //meshRoot.localRotation.setFromAxisAngle(new tge3d.Vector3(0, 1, 0), 45);

            // Create mesh node 1
            let material1 = new tge3d.MatNormalMap();
            material1.mainTexture = tge3d.texture_manager.getTexture(WebGlRender.obj_main_texture);
            material1.normalMap = tge3d.texture_manager.getTexture(WebGlRender.obj_normal_map);
            material1.colorTint = [1.0, 1.0, 1.0];
            material1.specular = [0.8, 0.8, 0.8];

            this._mesh1 = meshRoot.addMeshNode(capusleMesh, material1);
            this._mesh1.localPosition.set(1, 1, 0);

            // Create mesh node 2
            let material2 = new tge3d.MatNormalMapW();
            material2.mainTexture = tge3d.texture_manager.getTexture(WebGlRender.box_main_texture);
            material2.normalMap = tge3d.texture_manager.getTexture(WebGlRender.box_normal_map);
            material2.colorTint = [1.0, 1.0, 1.0];
            material2.specular = [0.8, 0.8, 0.8];
            material2.gloss = 10;

            this._mesh2 = meshRoot.addMeshNode(tge3d.Mesh.createCube(), material2);
            this._mesh2.localPosition.set(-1, 1, 0);
            this._mesh2.localScale.set(0.8, 0.8, 0.8);

            // Add a directional light node to scene
            let mainLight = this._scene.root.addDirectionalLight([0.8,0.8,0.8]);
            //this._tempQuat.setFromEulerAngles(this._tempVec3.set(135,-45,0));
            //mainLight.localRotation = this._tempQuat;
            mainLight.lookAt(this._tempVec3.set(-1,-1,-1));

            // Add point light 1
            let lightColor = [0.05,0.05,0.05];
            let pointLight = this._scene.root.addPointLight(lightColor,10);
            pointLight.localPosition.set(-5, 6, 0);
            let lightball = pointLight.addMeshNode(sphereMesh,
                new tge3d.MatSolidColor([0.9,0.9,0.9])); //点光源身上放一个小球以显示他的位置
            lightball.localScale.set(0.2,0.2,0.2);
            this._pointLight1 = pointLight;

            // Add point light 2
            lightColor = [0.05,0.05,0.05];
            pointLight = this._scene.root.addPointLight(lightColor,10);
            pointLight.localPosition.set(5, 6, 0);
            lightball = pointLight.addMeshNode(sphereMesh, 
                new tge3d.MatSolidColor([0.9,0.9,0.9]));
            lightball.localScale.set(0.2,0.2,0.2);
            this._pointLight2 = pointLight;

            // Add a perspective camera
            this._cameraNode = this._scene.root.addPerspectiveCamera(60, canvas.width / canvas.height, 1.0, 1000);
            this._cameraNode.localPosition.set(0, 2, 6);
            this._cameraNode.lookAt(new tge3d.Vector3(0, 1, 0));
            this._cameraNode.camera!.clearColor = [0.34,0.98,1];

            // Add projector
            //this._projector = this._scene.root.addProjector(60, 1.0, 1.0, 1000.0);
            //this._projector.localPosition.set(0, 3, 0);
            //this._projector.lookAt(new tge3d.Vector3(0, 0, 0));
            //this._projector.projector.material.projTexture = tge3d.texture_manager.getTexture(proj_texture);

        }

        draw() {
            let g = WebGlRender.game;
            //this.movex = 3.0 - 6.0*((g.stage / 20 % 100) / 100.0);
            //this.redraw(this.movex);
        }
    }
}
