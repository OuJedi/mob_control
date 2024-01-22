

import gsap from "gsap";
import config from "config";
import tools from "tools";
import * as CANNON from 'cannon-es';
import GameObject from "./gameObject";


export default class SolidObject extends GameObject {

    constructor(mesh, shape, offset = new CANNON.Vec3(0, 0, 0), material, mass = 1) {

        super();

        tools.autobind(this);

        this._rigideBody = false;
        this._isKinematic = true;
        this._isFixedRotation = false;
        this._mass = mass;
        this._castShadow = false;
        this._receiveShadow = false;

        this._shape = shape;
        this._offset = offset;
        this._mesh = mesh;
        this._material = material;

        gsap.delayedCall(1 / config.fps, this.process);

    }

    process() {

        this.rigideBody && (this.collider = {
            mass: this._isKinematic ? 0 : this._mass,
            shape: this._shape,
            offset: this._offset,
            rotation: this._isFixedRotation,
            material: this._material
        });
        this._mesh && this.add(this._mesh);

        this.castShadow = this._castShadow;
        this.receiveShadow = this._receiveShadow;

    }


    set castShadow(val) {
        this._castShadow = val;
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].castShadow = val;
        }
    }

    set receiveShadow(val) {
        this._receiveShadow = val;
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].receiveShadow = val;
        }
    }

    get material() {
        return this._mesh ? this._mesh.material : null;
    }

    set material(val) {
        return this._mesh && (this._mesh.material = val);
    }


    get rigideBody() {
        return this._rigideBody;
    }

    set rigideBody(val) {

        if (this.collider) {

            if (val) {
                config.physic.world.addBody(this.collider);
            } else {
                config.physic.world.removeBody(this.collider);
            }

        }


        this._rigideBody = val;
    }

    set isRendred(val) {
        this._mesh && (this._mesh.visible = val);
    }

    get isRendred() {
        return this._mesh ? this._mesh.visible : null;
    }

    set isKinematic(val) {
        this._isKinematic = val;
        this.mass = val ? 0 : this._mass;
    }

    get isKinematic() {
        return this._isKinematic;
    }

    set isFixedRotation(val) {
        this._isFixedRotation = val;
        if (this.collider) {
            this.collider.fixedRotation = val;
            this.collider.updateMassProperties();
        }
    }

    get isFixedRotation() {
        return this._isFixedRotation;
    }


    set mass(val) {
        this._mass = val;
        if (this.collider) {
            this.collider.mass = val;
            this.collider.updateMassProperties();
        }
    }

    get mass() {
        return this._mass;
    }

    set mesh(val) {
        this._mesh = val;
    }

    get mesh() {
        return this._mesh;
    }


    destroy() {
        tools.clean(this);
        this.collider && config.physic.world.removeBody(this.collider);
    }


}