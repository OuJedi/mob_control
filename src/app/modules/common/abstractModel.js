import { clone as CloneGltfScene } from "lib/SkeletonUtils";
import tools from "tools";
import SolidObject from "./solidObject";
import config from "config";


export default class AbstractModel extends SolidObject {

    constructor(data) {

        super(data.mesh, data.shape, data.offset, data.material);

        tools.autobind(this);

        this._superBuild(data);


    }



    _superBuild(data) {

        // console.log(data.name);

        this._initEvents();

        this._parseGltfData(data);


    }


    _initEvents() {

        this.addEventListener("ready", this._onReady);

    }


    _onReady() {

        this.onColliderReady && this.onColliderReady({ currentTarget: this });

    }


    _parseGltfData(data) {

        let _scene = data.gltf ? CloneGltfScene(data.gltf.scene) : null;
        _scene && (this.mesh = _scene);
        this.rigideBody = true;
        this.isKinematic = false;
        this.isFixedRotation = true;

        this._onSkinnedMeshReady(_scene, data.gltf);

    }

    set onColliderReady(val) {
        this._readyCallBack = val;
    }

    get onColliderReady() {
        return this._readyCallBack;
    }



    superDispose() {

        tools.clean(this);

        this.collider && config.physic.world.removeBody(this.collider);

        this.destroyed = true;

        console.log("AbstractModel dispose");

    }


    superUpdate(delta) {

    }



}