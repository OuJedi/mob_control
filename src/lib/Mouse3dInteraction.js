import config from "config";
import { EventDispatcher, Raycaster } from "three";
import tools from "tools";

export default class Mouse3dInteraction extends EventDispatcher {


    constructor() {
        super();

        this._access = true;


        this._checkInteration = this._checkInteration.bind(this);
        this._onDown = this._onDown.bind(this);
        this._onUp = this._onUp.bind(this);
        this.update = this.update.bind(this);

        this._raycaster = new Raycaster();
        this._isDown = false;
        this._targets = [];

        this._oldDragX = 0;
        this._dragX = 0;
        this._oldDragY = 0;
        this._dragY = 0;

        config.app.addEventListener("mousedown", this._onDown);
        config.app.addEventListener("mouseup", this._onUp);


    }


    _onDown() {

        if (!this._access) {
            return;
        }

        this._isDown = true;
        this._oldDragX = config.mouse3d.x;
        this._oldDragY = config.mouse3d.y;

        for (let i = 0; i < this._targets.length; i++) {
            this._checkInteration(this._targets[i], "onDown");
        }

        // console.log("_onDown")
    }


    _onUp() {

        if (!this._access) {
            return;
        }

        for (let i = 0; i < this._targets.length; i++) {
            this._checkInteration(this._targets[i], "onUp");
        }

        if (this._pressedObject && !this._selectedObject) {
            this.dispatchEvent({ type: "outSide", currentTarget: this._pressedObject, texturePoint: this.texturePoint, point: this.point });
        }

        this._selectedObject = null;
        this._pressedObject = null;

        this._isDown = false;

    }


    _checkInteration(target, event) {

        this._raycaster.setFromCamera(config.mouse3d, config.camera);

        const intersects = this._raycaster.intersectObject(target, true);

        if (intersects.length > 0) {

            const res = intersects.filter(function (res) {
                return res && res.object;
            })[0];

            if (res && res.object) {

                this.texturePoint = { x: (intersects[0].uv.x), y: (intersects[0].uv.y) };
                this.point = intersects[0].point;

                this.dispatchEvent({ type: event, currentTarget: res.object, texturePoint: this.texturePoint, point: this.point });
                if (event == "onDown") {
                    this._pressedObject = res.object;
                } else if (event == "onUp") {
                    this._selectedObject = res.object;
                }
            }

        }

    }


    /**
     * Add objects target, (Push the UI layer first)
     * @param {Object3D} target 
     */

    addTarget(target) {

        this._targets.push(target);

    }





    drag(speed = 1, left = -9999, right = 9999, depth = -9999, front = 9999) {

        if (!this._access) {
            return;
        }

        this._dragX += (-this._oldDragX + config.mouse3d.x) * speed;
        this._dragX = this._dragX < left ? left : this._dragX > right ? right : this._dragX;
        this._directionX = (config.mouse3d.x > this._oldDragX) ? 1 : (config.mouse3d.x < this._oldDragX) ? -1 : 0;
        this._oldDragX = config.mouse3d.x;

        this._dragY += (-this._oldDragY + config.mouse3d.y) * speed;
        this._dragY = this._dragY < depth ? depth : this._dragY > front ? front : this._dragY;
        this._directionY = (config.mouse3d.y > this._oldDragY) ? 1 : (config.mouse3d.y < this._oldDragY) ? -1 : 0;
        this._oldDragY = config.mouse3d.y;

        return { x: this._dragX, y: -this._dragY, direction: { x: this._directionX, y: -this._directionY } };

    }


    getPointFromRay(target, from, dir, length) {

        //debug
        // const hex = 0xff0000;
        // const arrowHelper = new ArrowHelper(dir, from, length, hex);
        // target.parent.add(arrowHelper);

        const raycaster = new Raycaster(from, dir, -length, length);
        const intersects = raycaster.intersectObject(target, true);
        if (intersects.length > 0) {

            const res = intersects.filter(function (res) {
                return res && res.object;
            })[0];

            return { point: intersects[0].uv, point3d: intersects[0].point, object: res.object };
        }
        return;
    }



    set lock(val) {
        this._access = !val;
    }

    get lock() {
        return this._access;
    }

    release() {
        this._isDown = false;
    }



    destroy() {

        config.app.removeEventListener("mousedown", this._onDown);
        config.app.removeEventListener("mouseup", this._onUp);

        tools.clearArray(this._targets);

        this.selectedObject = null;
        this._isDown = false;

    }



    update() {

        // if (this._isDown && this._access) {
        //     for (let i = 0; i < this._targets.length; i++) {
        //         this._checkInteration(this._targets[i]);
        //     }
        // }



    }



}