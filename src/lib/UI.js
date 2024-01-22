import { EventDispatcher, Object3D } from "three";
import tools from "tools";



export default class UI extends EventDispatcher {

    /**
             * 
             * @param {Number} depth z value, plus la valeur negative est grande, et plus les elements du layer sont petits 
             * @param {Camera} mainCamera 
    */

    constructor(mainCamera, depth = -10) {
        super();

        this._parseObj = this._parseObj.bind(this);

        this._container = new Object3D();
        this._container.renderOrder = 999;
        this._depth = depth;
        this._mainCamera = mainCamera;
        this._mainCamera.add(this._container);

    }

    _parseObj(displayObject) {

        if (displayObject.isMesh || displayObject.type === "Sprite") {
            displayObject.material.transparent = true;
            displayObject.material.depthTest = false;
            displayObject.renderOrder = 999;
        } else {

            for (let i = 0; i < displayObject.children.length; i++) {
                const obj = displayObject.children[i];
                if (obj.isMesh || obj.type === "Sprite") {
                    obj.material.transparent = true;
                    obj.material.depthTest = false;
                    obj.renderOrder = 999;

                } else if (obj.children && obj.children.length > 0) {
                    this._parseObj(obj);
                }
            }

        }

    }


    _getViewSize() {

        // vertical fov in radians
        const vFOV = this._mainCamera.fov * Math.PI / 180;
        // Math.abs to ensure the result is always positive
        const height = 2 * Math.tan(vFOV / 2) * Math.abs(this._depth);
        const width = height * this._mainCamera.aspect;

        return { x: width, y: height, z: this._depth };

    }

    add(obj) {

        this._parseObj(obj);
        this._container.add(obj);

    }

    set z(val) {
        this._container.position.z = val;
    }

    get viewSize() {
        return this._getViewSize();
    }

    set visible(val) {
        this._container.visible = val;
    }

    get visible() {
        return this._container.visible;
    }

    update() {
        this.z = this.viewSize.z;

    }

    destroy() {

        tools.clean(this._container);

    }

}