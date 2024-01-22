import AbstractModel from "app/modules/common/abstractModel";
import { Vector3 } from "three";
import * as CANNON from 'cannon-es';
import tools from "tools";
import assets from "app/assets";
import ParticlesWall from "app/modules/shared/particlesWall";

export default class Multiplier extends AbstractModel {

    constructor(size) {

        super({
            name: "Multiplier",
            gltf: null,
            mesh: null,
            shape: new CANNON.Box(new CANNON.Vec3(size.x * .5, size.y * .5, size.z * .5)),
            offset: null,
            material: null
        });

        tools.autobind(this);
        this._size = size;
        this._value = 2;


        this._build();


    }



    _build() {

        this._initMaterials();

        let size = new Vector3(this._size.x, this._size.y, this._size.z);
        this._wall = new ParticlesWall(size, 15, .2, .05, 0xffffff, assets.textures.particule);
        this._wall.position.y = -this._size.y / 2;
        this.add(this._wall);

        this._valueText = tools.getTextShape("X" + this._value, assets.font3d, 0xffffff, .45, 1, { x: .5, y: 0 });
        this._valueText.position.y = -.3;
        this._valueText.position.z = .1;
        this._valueText.scale.y = 1.5;
        this.add(this._valueText);

    }


    _initMaterials() {

    }


    _onSkinnedMeshReady(meshs) {

    }



    _ready() {
        this.collider.addEventListener("collide", this._onCollide);
        this.isKinematic = true;
        this.collider.isTrigger = true;
    }




    _onCollide(e) {

        if (e.body.class.type == "mob") {

            for (let i = 0; i < e.body.class.multiplierList.length; i++) {
                if (e.body.class.multiplierList[i] == this) {
                    return;
                }
            }

            e.body.class.multiplierList.push(this);
            this.dispatchEvent({ type: "duplicate", origine: e.body.class, val: this.value });

        }

    }



    set value(val) {
        this._value = val;
        this._valueText.setText("X" + this._value);
    }

    get value() {
        return this._value;
    }


    update(delta) {

        this.superUpdate(delta);
        this._wall.update(delta);

    }

    destroy() {

        this.collider && this.collider.removeEventListener("collide", this._onCollide);
        this._wall.destroy();

        this.superDispose();

        console.log("multiplier destroy");

    }

}