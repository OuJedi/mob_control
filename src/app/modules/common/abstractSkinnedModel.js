import { AnimationMixer, Clock } from "three";
import { clone as CloneGltfScene } from "lib/SkeletonUtils";
import tools from "tools";
import SolidObject from "./solidObject";
import config from "config";


export default class AbstractSkinnedModel extends SolidObject {

    constructor(data) {

        super(data.mesh, data.shape, data.offset, data.material, data.mass);

        tools.autobind(this);

        this._superBuild(data);


    }



    _superBuild(data) {

        console.log(data.name);

        this.name = data.name;
        this.duplicated = data.duplicated;

        this.clock = new Clock();

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

        let _scene = CloneGltfScene(data.gltf.scene);
        this.mesh = _scene;
        this.rigideBody = true;
        this.isKinematic = false;
        this.isFixedRotation = true;

        let animations = data.gltf.animations;

        // console.log("animations:",animations)

        if (animations.length > 0) {
            this.mixer = new AnimationMixer(_scene);
            this._clip = this.mixer.clipAction(animations[0]); // all animations           
        }

        this._onSkinnedMeshReady(_scene);

    }

    set onColliderReady(val) {
        this._readyCallBack = val;
    }

    get onColliderReady() {
        return this._readyCallBack;
    }

    get clip() {
        return this._clip;
    }


    superDispose() {

        this._clip.stop();
        this.mixer.uncacheClip(this._clip);
        this.mixer.uncacheAction(this._clip);

        tools.clean(this);

        this.collider && config.physic.world.removeBody(this.collider);

        this.destroyed = true;

        console.log("AbstractSkinnedModel dispose");

    }


    superUpdate(delta) {

        this.mixer.update(this.clock.getDelta());

    }



}