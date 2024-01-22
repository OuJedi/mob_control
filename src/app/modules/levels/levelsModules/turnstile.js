import SolidObject from "app/modules/common/solidObject";
import { BoxGeometry, Color, CylinderGeometry, Mesh, MeshStandardMaterial, Object3D } from "three";
import * as CANNON from 'cannon-es';
import config from "config";
import { DEG2RAD } from "three/src/math/MathUtils";
import assets from "app/assets";
import tools from "tools";

export default class Turnstile extends Object3D {

    constructor(size, position, cross) {
        super();

        tools.autobind(this);

        this._size = size;
        this._position = position;
        this._angle = 0;
        this._speed = .5;
        this._speedVal = 0;
        this._cross = cross;

        this._build();

    }


    _build() {

        this._initMaterials();

        this._center = new Mesh(new CylinderGeometry(this._size.z / 2, this._size.z / 2, this._size.y + .01, 12));
        this._center.material = this._centerMaterial;
        this._center.position.copy(this._position);
        this.add(this._center);

        this._box = new SolidObject(
            new Mesh(new BoxGeometry(this._size.x, this._size.y, this._size.z)),
            new CANNON.Box(new CANNON.Vec3(this._size.x * .5, this._size.y * .5, this._size.z * .5)),
            null,
            config.physicsMaterial
        );
        this._box.rigideBody = true;
        this._box.castShadow = true;
        this._box.receiveShadow = true;
        this._box.material = this._cubeMaterial;
        this._box.position.copy(this._position);
        this.add(this._box);

        if (this._cross) {
            this._box2 = new SolidObject(
                new Mesh(new BoxGeometry(this._size.x, this._size.y, this._size.z)),
                new CANNON.Box(new CANNON.Vec3(this._size.x * .5, this._size.y * .5, this._size.z * .5)),
                null,
                config.physicsMaterial
            );
            this._box2.rigideBody = true;
            this._box2.castShadow = true;
            this._box2.receiveShadow = true;
            this._box2.material = this._cubeMaterial;
            this._box2.rotation.y = DEG2RAD * 90;
            this._box2.position.copy(this._position);
            this.add(this._box2);
        }

    }



    _initMaterials() {

        this._centerMaterial = new MeshStandardMaterial();
        this._centerMaterial.color = new Color(0x888888);
        this._centerMaterial.metalness = 0;
        this._centerMaterial.roughness = 0;
        this._centerMaterial.envMap = assets.textures.envMap;
        this._centerMaterial.envMapIntensity = .7;

        this._cubeMaterial = new MeshStandardMaterial();
        this._cubeMaterial.color = new Color(0x111111);
        this._cubeMaterial.metalness = .3;
        this._cubeMaterial.roughness = .2;
        this._cubeMaterial.envMap = assets.textures.envMap;
        this._cubeMaterial.envMapIntensity = 2;

    }


    set speed(val) {
        this._speed = val;
    }

    get speed() {
        return this._speed;
    }

    set yoyo(val) {
        this._yoyo = val;
    }

    get yoyo() {
        return this._yoyo;
    }

    set cross(val) {
        this._cross = val;
        !this._cross && this._box2 && this._box2.destroy();
    }

    get cross() {
        return this._cross;
    }


    update(delta) {

        if (this._yoyo) {
            this._speedVal += .01 * delta;
            this._speed = (Math.cos(this._speedVal));
        }

        this._angle += DEG2RAD * this._speed * delta;
        this._box.collider && (this._box.collider.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), this._angle));
        this._box2 && this._box2.collider && (this._box2.collider.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), this._angle + DEG2RAD * 90));

    }

    destroy() {

        this._box && this._box.destroy()
        this._box2 && this._box2.destroy()

    }

}