namespace tge3d {

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
                this._scene!.onRemoveNode(this);
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

        lookAt(target:Vector3, up:Vector3, smoothFactor:number){
            up = up || tge3d.Vec3Up;
            let worldPos = this.worldPosition;
            if(Math.abs(worldPos.x-target.x)<tge3d.ZeroEpsilon
                && Math.abs(worldPos.y-target.y)<tge3d.ZeroEpsilon
                && Math.abs(worldPos.z-target.z)<tge3d.ZeroEpsilon){
                return;
            }

            if(this.getComponent(SystemComponents.Camera) ||
                this.getComponent(SystemComponents.Projector)){
                //因为对于OpenGL的camera来说，LookAt是让局部的-z轴指向target，因此这儿对调一下。
                _tempQuat.setLookRotation(target, worldPos, up);
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

        render(scene: Scene, camera: Camera, lights: Light[], projectors: Projector[]){
            let renderer = <MeshRenderer>this.components[SystemComponents.Renderer];
            if(renderer){
                renderer.render(scene, camera, lights, projectors);
            }
        }
    }
}
