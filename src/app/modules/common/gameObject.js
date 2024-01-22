import { Object3D, Vector3 } from "three";
import tools from "tools";


export default class GameObject extends Object3D {

    constructor() {

        super();

        this._collider = null;

    }


    get collider() {

        return this._collider;

    }

    set collider(data) {

        let interval = setInterval(() => {
            if (this.parent) {
                clearInterval(interval);
                this._collider = tools.addPhysics(this, data.mass, data.shape, data.offset, data.rotation, data.material);
                if (this._collider) {
                    this._collider.allowSleep = true;
                    this._collider.sleepSpeedLimit = 0.5;
                    this._collider.sleepTimeLimit = 2;
                    this._collider.constraints = this.constraints || new Vector3();
                    this._collider.class = this;
                    this.dispatchEvent({ type: "ready" });
                    this._ready && this._ready(this._collider);
                } else {
                    console.warn("CannonJS not initialized");
                }
            }
        }, 60);

    }


    /**
     * Vec3 val;
     */

    set constraints(val) {
        this._constraints = val;
    }

    get constraints() {
        return this._constraints;
    }


}