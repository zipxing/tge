namespace tge3d {

    export enum SystemComponents {
        Renderer = 'renderer',
        Mesh = 'mesh',
        Camera = 'camera',
        Light = 'light',
        Projector = 'projector'
    }

   export enum LightType {
        Directional = 0,
        Point = 1
    }

    export enum LightMode {
        None = 0,
        ForwardBase,
        ForwardAdd,
        ShadowCaster
    }

    export class Component {
        node: Node | null = null;
        constructor() {
        }
        setNode(node: Node) {
            this.node = node;
        }
    }
 
    export class Light extends Component {
        type: LightType;
        color: number[];

        constructor(type: LightType) {
            super();
            this.type = type;
            this.color = [1.0, 1.0, 1.0];
        }
    }

    export class Camera extends Component {
        private _fovy: number;
        private _aspect: number;
        private _near: number;
        private _far: number;
        private _projMatrix: Matrix4;
        private _viewMatrix: Matrix4;
        private _viewProjMatrix: Matrix4;

        private _clearColor: number[];
        _renderTexture: RenderTexture | null;
        _tempRenderTexture: RenderTexture | null;
        _postProcessingChain: PostProcessingChain | null;

        constructor(){
            super();

            this._fovy = 75;
            this._aspect = 0.75;
            this._near = 0.1;
            this._far = 100.0;
            this._projMatrix = new Matrix4();
            this._viewMatrix = new Matrix4();
            this._viewProjMatrix = new Matrix4();

            this._clearColor = [0, 0, 0];
            this._renderTexture = null;
            this._tempRenderTexture = null;
            this._postProcessingChain = null;
        }

        set clearColor(v: number[]){
            this._clearColor = v;
        }

        set target(v: RenderTexture) {
            if(!v) return;
            this._renderTexture = v;
            this._onTargetResize(this._renderTexture.width, this._renderTexture.height);
        }

        get target() {
            return this._renderTexture!;
        }

        getViewProjMatrix(){
            return this._viewProjMatrix;
        }

        setPerspective(fovy:number, aspect:number, near:number, far:number){
            this._fovy = fovy;
            this._aspect = aspect;
            this._near = near;
            this._far = far; 
            this._projMatrix.setPerspective(this._fovy, this._aspect, this._near, this._far);
        }

        setOrtho(left:number, right:number, bottom:number, top:number, near:number, far:number){ 
            this._projMatrix.setOrtho(left, right, bottom, top, near, far);
        }

        onScreenResize(width:number, height:number){
            if(this._renderTexture==null){
                this._onTargetResize(width, height);
            } else if(this._renderTexture.isFullScreen){
                this._onTargetResize(width, height);
                this._renderTexture.onScreenResize(width, height);
            }
        }

        _onTargetResize(width:number, height:number){
            this._aspect = width/height;
            this._projMatrix.setPerspective(this._fovy, this._aspect, this._near, this._far);
        }

        _updateViewProjMatrix(){
            this._viewProjMatrix.set(this._projMatrix);
            this._viewProjMatrix.multiply(this._viewMatrix);
        }

        beforeRender(){
            if(this._renderTexture!=null){
                this._renderTexture.bind();
            }

            this._viewMatrix.setInverseOf(this.node!.worldMatrix);

            this._updateViewProjMatrix();//TODO:不需要每次渲染之前都重新计算，当proj矩阵需重新计算（例如screen resize，动态修改fov之后），或camera的world matrix变化了需要重新计算view matrix

            //TODO:每个camera设置自己的clear color，并且在gl层缓存，避免重复设置相同的值
            let gl = (<tge.WebRun>tge.env).context;
            gl.clearColor(this._clearColor[0], this._clearColor[1], this._clearColor[2], 1);
            gl.clearDepth(1.0);
            gl.enable(gl.DEPTH_TEST);

            gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
        }

        afterRender(){
            if(this._renderTexture!=null){
                this._renderTexture.unbind();
            }

            if(this._postProcessingChain){
                this._postProcessingChain.render(this);
            }
        }

        enablePostProcessing(enabled: boolean){
            let canvas = (<tge.WebRun>tge.env).canvas;
            if(enabled){
                this._tempRenderTexture = new RenderTexture(canvas.width, canvas.height, true);
                this.target = new RenderTexture(canvas.width, canvas.height, true);
                this._postProcessingChain = new PostProcessingChain();
            } else {
                if(this._tempRenderTexture){
                    this._tempRenderTexture.destroy();
                    this._tempRenderTexture = null;
                }
                if(this._renderTexture){
                    this._renderTexture.destroy();
                    this._renderTexture = null;
                }
                if(this._postProcessingChain){
                    this._postProcessingChain.destroy();
                    this._postProcessingChain = null;
                }
            }
        }

        addPostProcessing(postEffectLayer: PostEffectLayer){
            if(this._postProcessingChain==null){
                this.enablePostProcessing(true);
            }
            this._postProcessingChain!.add(postEffectLayer);
        }
    }

    export class Projector extends Component{
        private _fovy: number;
        private _aspect: number;
        private _near: number;
        private _far: number;
        private _projMatrix: Matrix4;
        private _viewMatrix: Matrix4;
        private _scaleMatrix: Matrix4;
        private _projectorMatrix: Matrix4;
        private _material: MatProjector;

        constructor(){
            super();
            this._fovy = 75;
            this._aspect = 0.75;
            this._near = 0.1;
            this._far = 100.0;
            this._projMatrix = new Matrix4();
            this._viewMatrix = new Matrix4();
            this._scaleMatrix = new Matrix4();
            this._scaleMatrix.setTranslate(0.5,0.5,0.5).scale(0.5,0.5,0.5);

            this._projectorMatrix = new Matrix4();

            this._material = new MatProjector();
        }

        get material(){
            return this._material;
        }

        set material(v){
            this._material = v;
        }

        getProjectorMatrix(){
            return this._projectorMatrix;
        }

        setPerspective(fovy:number, aspect:number, near:number, far:number){
            this._fovy = fovy;
            this._aspect = aspect;
            this._near = near;
            this._far = far;
            this._projMatrix.setPerspective(this._fovy, this._aspect, this._near, this._far);
        }

        setOrtho(left:number, right:number, bottom:number, top:number, near:number, far:number){
            this._projMatrix.setOrtho(left, right, bottom, top, near, far);
        }

        _updateProjectorMatrix(){
            this._projectorMatrix.set(this._scaleMatrix);
            this._projectorMatrix.multiply(this._projMatrix);
            this._projectorMatrix.multiply(this._viewMatrix);
        }

        updateMatrix(){
            if(!this.node) return;
            this._viewMatrix.setInverseOf(this.node.worldMatrix);
            this._updateProjectorMatrix();
        }
    }

    export class MeshRenderer extends Component{
        mesh: Mesh | null;
        material: Material | null;
        private _mvpMatrix: Matrix4;
        private _objectToWorld: Matrix4;
        private _worldToObject: Matrix4;

        constructor(){
            super();

            this.mesh = null;
            this.material = null;

            this._mvpMatrix = new Matrix4();
            this._objectToWorld = new Matrix4();
            this._worldToObject = new Matrix4();
        }

        setMaterial(material: Material){
            this.material = material;
        }

        setMesh(mesh: Mesh){
            this.mesh = mesh;
        }

        render(scene:Scene, camera:Camera, lights: Light[], projectors: Projector[]){

            if(!this.material) return;
            if(!this.node) return;
            let gl = (<tge.WebRun>tge.env).context;
            let systemUniforms = this.material.systemUniforms;
            let uniformContext: {[key: string]: any} = {};

            for(let sysu of systemUniforms){
                switch(sysu){
                    case SystemUniforms.MvpMatrix:{
                        this._mvpMatrix.set(camera.getViewProjMatrix());
                        this._mvpMatrix.multiply(this.node.worldMatrix);
                        uniformContext[SystemUniforms.MvpMatrix] = this._mvpMatrix.elements;
                        break;
                    }
                    case SystemUniforms.Object2World:{
                        this._objectToWorld.set(this.node.worldMatrix);
                        uniformContext[SystemUniforms.Object2World] = this._objectToWorld.elements;
                        break;
                    }
                    case SystemUniforms.World2Object:{
                        this._worldToObject.setInverseOf(this.node.worldMatrix);//TODO: 此矩阵缓存到node
                        uniformContext[SystemUniforms.World2Object] = this._worldToObject.elements;
                        break;
                    }
                    case SystemUniforms.WorldCameraPos:{
                        let pos = camera.node!.worldPosition;
                        uniformContext[SystemUniforms.WorldCameraPos] = [pos.x, pos.y, pos.z];
                        break;
                    }
                    case SystemUniforms.SceneAmbient:{
                        uniformContext[SystemUniforms.SceneAmbient] = scene.ambientColor;
                        break;
                    }

                }
            }

            //TODO:灯光规则，选出最亮的平行光为主光（传入forwardbase pass)，
            //如果存在forwardadd pass, 则剩下的灯光中选择不大于MaxForwardAddLights的数量的光为逐像素光（传入forwardadd pass)
            //如果不存在forwardadd pass，则剩下的灯光中选择MaxVertexLights数量的光为逐顶点光（传入forwardbase pass)
            let mainLight = null;
            let pixelLights = [];
            for(let light of lights){
                if(mainLight==null && light.type == LightType.Directional){
                    mainLight = light;
                    break;
                }
            }
            for(let light of lights){
                if(light != mainLight){
                    pixelLights.push(light);
                }
            }

            //避免render to texture时渲染使用了该RT的材质，否则会出现错误 Feedback loop formed between Framebuffer and active Texture.
            if(camera.target!=null && camera.target.texture2D == this.material.mainTexture){
                return;
            }

            //逐pass渲染，对于 ForwardAdd pass 会渲染多次叠加效果
            for(let pass of this.material.renderPasses){
                if(pass.lightMode == LightMode.ForwardBase && mainLight!=null){
                    //平行光的方向为Light结点的z轴朝向,但是shader里面用的光的方向是指向光源的，所以这里取反
                    let lightForward = mainLight.node!.forward.negative();
                    uniformContext[SystemUniforms.WorldLightPos] = [lightForward.x, lightForward.y, lightForward.z, 0.0];
                    uniformContext[SystemUniforms.LightColor] = mainLight.color;
                    this.material.renderPass(this.mesh!, uniformContext, pass);

                } else if(pass.lightMode == LightMode.ForwardAdd){
                    let idx = 1;
                    for(let light of pixelLights){
                        if(light.type == LightType.Directional){
                            if(mainLight!.node!.forward) {
                                let lightForward = mainLight!.node!.forward.negative();
                                uniformContext[SystemUniforms.WorldLightPos] = [lightForward.x, lightForward.y, lightForward.z, 0.0];
                            }
                        } else {
                            let pos =  light.node!.worldPosition;
                            uniformContext[SystemUniforms.WorldLightPos] = [pos.x, pos.y, pos.z, 1.0];
                        }

                        uniformContext[SystemUniforms.LightColor] = light.color;

                        //让多个灯光pass混合
                        //状态设置为 blend one one; ztest lequal; zwrite off;
                        //TODO:全局状态管理（下同）
                        if(idx==1){
                            gl.enable(gl.BLEND);
                            gl.blendFunc(gl.ONE, gl.ONE);
                            gl.depthMask(false);
                            gl.depthFunc(gl.LEQUAL);
                        }

                        this.material.renderPass(this.mesh!, uniformContext, pass);
                        idx++;
                    }
                    gl.disable(gl.BLEND);
                    gl.depthMask(true);
                    gl.depthFunc(gl.LESS);

                } else if(pass.lightMode == LightMode.ShadowCaster){

                } else {
                    //非光照pass
                    this.material.renderPass(this.mesh!, uniformContext, pass);
                }
            }

            //使用projector渲染投影材质
            if(projectors != null && projectors.length > 0){
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.ONE, gl.ONE);
                gl.depthMask(false);
                gl.depthFunc(gl.LEQUAL);

                let matTmp = new Matrix4();

                for(let projector of projectors){
                    projector.updateMatrix();
                    let materialProj = projector.material;
                    matTmp.set(projector.getProjectorMatrix());
                    matTmp.multiply(this.node.worldMatrix);
                    materialProj.projMatrix = matTmp.elements;
                    materialProj.renderPass(this.mesh!, uniformContext, materialProj.renderPasses[0]);
                }

                gl.disable(gl.BLEND);
                gl.depthMask(true);
                gl.depthFunc(gl.LESS);
            }

        }

    }


    let _tempVec3 = new Vector3();
    let _tempQuat = new Quaternion();
    let _tempQuat2 = new Quaternion();
    let _tempMat4 = new Matrix4();

    export class Node {
        private _isStatic: boolean;
        private _localPosition: Vector3;
        private _localRotation: Quaternion;
        private _localScale: Vector3;
        private _worldPosition: Vector3;
        private _worldRotation: Quaternion;
        private _worldDirty: boolean;
        _scene: Scene | null;
        localMatrix: Matrix4;
        worldMatrix: Matrix4;
        parent: Node | null;
        children: Node[];
        components: {[key : string] : Component};
        light : Light | null = null;
        camera: Camera | null = null;
        projector: Projector | null = null;

        constructor(){
            this._isStatic = false;
            this._localPosition = new Vector3();
            this._localRotation = new Quaternion();
            this._localScale = new Vector3(1,1,1);

            this._worldPosition = new Vector3();
            this._worldRotation = new Quaternion();

            this.localMatrix = new Matrix4();
            this.worldMatrix = new Matrix4();

            this.parent = null;
            this.children = [];
            this.components = {};
            this._worldDirty = true;
            this._scene = null;
        }

        isStatic(){ 
            return this._isStatic;
        }

        setStatic(s: boolean){
            this._isStatic = s;
        }

        setTransformDirty(){
            this._worldDirty = true;
        }

        //注意：所有 local 的 getter 方法，调用会直接获取相应的local成员，如果直接修改这些成员，需要调用 setTransformDirty() 通知Node更新世界矩阵
        //建议如果要修改local属性，调用 setter方法

        get localPosition(): Vector3 {
            return this._localPosition;
        }

        set localPosition(v: Vector3) {
            this._localPosition.copyFrom(v);
            this.setTransformDirty();
        }

        get localRotation(): Quaternion {
            return this._localRotation;
        }

        set localRotation(v: Quaternion){
            this._localRotation.copyFrom(v);
            this.setTransformDirty();
        }

        get localScale(){
            return this._localScale;
        }

        set localScale(v){
            this._localScale.copyFrom(v);
            this.setTransformDirty();
        }

        //注意：所有的world属性，如果要修改必须调用setter
        //调用getter只能用来获取值，在getter的结果上修改是错误的 （可惜js没有const&)
        get worldPosition(){
            if(this._worldDirty){
                this.updateWorldMatrix();
            }

            return this._worldPosition;
        }

        set worldPosition(v){
            if(this.parent==null){
                this.localPosition = v;
            } else {
                _tempMat4.setInverseOf(this.parent.worldMatrix);//TODO:缓存逆矩阵?
                Matrix4.transformPoint(_tempMat4, v, _tempVec3);
                this.localPosition = _tempVec3.clone();
            }
        }

        get worldRotation(){
            if(this._worldDirty){
                this.updateWorldMatrix();
            }

            return this._worldRotation;
        }

        set worldRotation(v){
            if(this.parent==null){
                this.localRotation = v;
            } else {
                _tempQuat.setInverseOf(this.parent.worldRotation);
                Quaternion.multiply(_tempQuat, v, _tempQuat2);
                this.localRotation = _tempQuat2.clone();
            }
        }

        get forward(){
            if(this._worldDirty){
                this.updateWorldMatrix();
            }
            let worldMat = this.worldMatrix.elements;
            _tempVec3.set(worldMat[8], worldMat[9], worldMat[10]);
            return _tempVec3;
        }

        get up(){
            if(this._worldDirty){
                this.updateWorldMatrix();
            }
            let worldMat = this.worldMatrix.elements;
            _tempVec3.set(worldMat[4], worldMat[5], worldMat[6]);
            return _tempVec3;
        }

        get right(){
            if(this._worldDirty){
                this.updateWorldMatrix();
            }
            let worldMat = this.worldMatrix.elements;
            _tempVec3.set(worldMat[0], worldMat[1], worldMat[2]);
            return _tempVec3;
        }

        removeFromParent(){
            if(this.parent){
                let idx = this.parent.children.indexOf(this);
                if(idx>=0){
                    this.parent.children.splice(idx, 1);
                }
                this.parent = null;
                this._scene.onRemoveNode(this);
                this._scene = null;
            }
        }

        setParent(parent: Node){
            this.removeFromParent();
            if(parent){
                parent.children.push(this);
            }
            this.parent = parent;
            this._scene = parent._scene;
            if(this._scene)
                this._scene.onAddNode(this);
        }

        addChild(node: Node){
            node.setParent(this);
        }

        addEmptyNode(){
            let node = new Node();
            node.setParent(this);
            return node;
        }

        addMeshNode(mesh: Mesh, material: Material){
            let meshRenderer = new MeshRenderer();
            meshRenderer.setMesh(mesh);
            meshRenderer.setMaterial(material);

            let node = new Node();
            node.addComponent(SystemComponents.Renderer, meshRenderer);
            node.setParent(this);
            return node;
        }

        addPerspectiveCamera(fovy: number, aspect: number, near: number, far: number){
            let camera = new Camera();
            camera.setPerspective(fovy, aspect, near, far);

            let node = new Node();
            node.addComponent(SystemComponents.Camera, camera);
            node.setParent(this);
            node.camera = camera;
            return node;
        }

        addProjector(fovy:number, aspect:number, near:number, far:number){
            let projector = new Projector();
            projector.setPerspective(fovy, aspect, near, far);

            let node = new Node();
            node.addComponent(SystemComponents.Projector, projector);

            node.setParent(this);
            node.projector = projector;
            return node;
        }

        addDirectionalLight(color: number[]){
            let light = new Light(LightType.Directional);
            light.color = color;

            let node = new Node();
            node.addComponent(SystemComponents.Light, light);
            node.setParent(this);
            node.light = light;
            return node;
        }

        addPointLight(color: number[], range: any){
            let light = new Light(LightType.Point);
            light.color = color;
            light.range = range;

            let node = new Node();
            node.addComponent(SystemComponents.Light, light);
            node.setParent(this);
            node.light = light;
            return node;
        }

        lookAt(target, up, smoothFactor){
            up = up || tge3d.Vec3Up;
            let worldPos = this.worldPosition;
            if(Math.abs(worldPos.x-target.x)<tge3d.ZeroEpsilon
                && Math.abs(worldPos.y-target.y)<tge3d.ZeroEpsilon
                && Math.abs(worldPos.z-target.z)<tge3d.ZeroEpsilon){
                return;
            }

            if(this.getComponent(SystemComponents.Camera) ||
                this.getComponent(SystemComponents.Projector)){
                _tempQuat.setLookRotation(target, worldPos, up);//因为对于OpenGL的camera来说，LookAt是让局部的-z轴指向target，因此这儿对调一下。
            } else {
                _tempQuat.setLookRotation(worldPos, target, up);
            }

            if(smoothFactor != null){
                this.worldRotation = Quaternion.slerp(this.worldRotation, _tempQuat.clone(), smoothFactor);
            } else {
                this.worldRotation = _tempQuat.clone();
            }


        }

        updateLocalMatrix(){
            this.localMatrix.setTranslate(this._localPosition.x, this._localPosition.y, this._localPosition.z);
            Quaternion.toMatrix4(this._localRotation, _tempMat4);
            this.localMatrix.multiply(_tempMat4);
            this.localMatrix.scale(this._localScale.x, this._localScale.y, this._localScale.z);

            //TODO:此处可优化，避免矩阵乘法，Matrix4增加fromTRS(pos, rot, scale)方法
        }

        updateWorldMatrix(forceUpdate=false){
            if(this._worldDirty || forceUpdate){
                if(!this._isStatic){
                    this.updateLocalMatrix();
                }

                if(this.parent==null){
                    this.worldMatrix.set(this.localMatrix);
                } else {
                    Matrix4.multiply(this.parent.worldMatrix, this.localMatrix, this.worldMatrix);
                }

                //从world matrix中提取出worldPosition
                let worldMat = this.worldMatrix.elements;
                this._worldPosition.set(worldMat[12], worldMat[13], worldMat[14]);

                //计算world rotation （或许可以像three.js的decompose那样从矩阵解出来）
                if(this.parent==null){
                    this._worldRotation.copyFrom(this._localRotation);
                } else {
                    Quaternion.multiply(this.parent._worldRotation, this._localRotation, this._worldRotation);
                }

                this._worldDirty = false;
            }


            this.children.forEach(function(child){
                child.updateWorldMatrix(true);
            });
        }

        addComponent(type: SystemComponents, component: Component){
            this.components[type] = component;
            component.setNode(this);
        }

        getComponent(type: SystemComponents){
            return this.components[type];
        }

        render(scene: Scene, camera: Camera, lights: Light, projectors: Projector){
            let renderer = this.components[SystemComponents.Renderer];
            if(renderer){
                renderer.render(scene, camera, lights, projectors);
            }
        }
    }
    class Scene{
        private _root: Node;
        private _ambientColor: number[];
        cameras: Camera[];
        lights: Light[];
        projectors: Projector[];
        renderNodes: Node[];

        constructor(){
            this._root = new Node();
            this._root._scene = this;
            this.cameras = [];
            this.lights = [];
            this.projectors = [];
            this.renderNodes = [];

            this._ambientColor = [0.1,0.1,0.1];
        }

        set ambientColor(v){
            this._ambientColor = v;
        }

        get ambientColor(){
            return this._ambientColor;
        }

        get root(){
            return this._root;
        }

        onAddNode(node){
            let camera = node.getComponent(SystemComponents.Camera);
            if(camera!=null){
                this.cameras.push(camera);
                return;
            }  

            let light = node.getComponent(SystemComponents.Light);
            if(light!=null){
                this.lights.push(light);
                return;
            }

            let projector = node.getComponent(SystemComponents.Projector);
            if(projector!=null){
                this.projectors.push(projector);
                return;
            }

            this.renderNodes.push(node);
        }

        onRemoveNode(node){
            let camera = node.getComponent(SystemComponents.Camera);
            if(camera!=null){
                node.camera = null;
                let idx = this.cameras.indexOf(camera);
                if(idx>=0){
                    this.cameras.splice(idx, 1);
                }
                return;
            } 

            let projector = node.getComponent(SystemComponents.Projector);
            if(projector!=null){
                node.projector = null;
                let idx = this.projectors.indexOf(projector);
                if(idx>=0){
                    this.projectors.splice(idx, 1);
                }
                return;
            }

            let light = node.getComponent(SystemComponents.Light);
            if(light!=null){
                node.light = null;
                let idx = this.lights.indexOf(light);
                if(idx>=0){
                    this.lights.splice(idx, 1);
                }
                return;
            }

            let idx = this.renderNodes.indexOf(node);
            if(idx>=0){
                this.renderNodes.splice(idx, 1);
            }
        }

        onScreenResize(width: number, height: number){
            for(let camera of this.cameras){
                camera.onScreenResize(width, height);
            }
        }

        update(){
            this.root.updateWorldMatrix();
        }

        render(){
            //TODO: 找出camera, 灯光和可渲染结点，逐camera进行forward rendering
            //1. camera frustum culling
            //2. 逐队列渲染
            //   2-1. 不透明物体队列，按材质实例将node分组，然后排序（从前往后）
            //   2-2, 透明物体队列，按z序从后往前排列

            //TODO: camera需要排序，按指定顺序渲染
            for(let camera of this.cameras){
                camera.beforeRender();

                //TODO：按优先级和范围选择灯光，灯光总数要有限制
                for(let rnode of this.renderNodes){
                    rnode.render(this, camera, this.lights, this.projectors);
                }

                camera.afterRender();
            }


        }

    }
}
