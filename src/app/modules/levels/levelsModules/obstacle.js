import { DoubleSide, MeshStandardMaterial, Vector3 } from "three";
import * as CANNON from 'cannon-es';
import assets from "app/assets";
import tools from "tools";
import config from "config";
import AbstractModel from "app/modules/common/abstractModel";
import SolidObject from "app/modules/common/solidObject";
import { DEG2RAD } from "three/src/math/MathUtils";


export default class Obstacle extends AbstractModel {

    constructor() {

        super({
            name: "Obstacle",
            gltf: assets.models.obstacle,
            mesh: null,
            shape: null,
            offset: null,
            material: null
        });

        tools.autobind(this);

    }


    _initMaterials() {

        this.modelMaterial = new MeshStandardMaterial({ color: 0x555555 });
        this.modelMaterial.metalness = .5;
        this.modelMaterial.roughness = .3;
        this.modelMaterial.envMap = assets.textures.envMap;
        this.modelMaterial.envMapIntensity = 2;
        this.modelMaterial.side = DoubleSide;
    }


    _onSkinnedMeshReady(meshs) {

        console.log("obstacle meshs:", meshs);

        this._initMaterials();

        this.rigideBody = false;
        this.isKinematic = true;

        if (meshs) {
            this._mobMesh = meshs.getObjectByName("Separator_Triangle");
            this._mobMesh.material = this.modelMaterial;
            this._mobMesh.castShadow = true;
            this._mobMesh.scale.set(1.5, 2, 1.5);
            this._mobMesh.position.y = -.5
        }

        this._size0 = new Vector3(.2, 1, 2.5);
        this._box0 = new SolidObject(
            null,
            new CANNON.Box(new CANNON.Vec3(this._size0.x * .5, this._size0.y * .5, this._size0.z * .5)),
            null,
            config.physicsMaterial
        );
        this._box0.rigideBody = true;
        this.add(this._box0);

        this._size1 = new Vector3(.2, 1, 1.9);
        this._box1 = new SolidObject(
            null,
            new CANNON.Box(new CANNON.Vec3(this._size1.x * .5, this._size1.y * .5, this._size1.z * .5)),
            null,
            config.physicsMaterial
        );
        this._box1.rigideBody = true;
        this.add(this._box1);

        this._size2 = new Vector3(.2, 1, 1.8);
        this._box2 = new SolidObject(
            null,
            new CANNON.Box(new CANNON.Vec3(this._size2.x * .5, this._size2.y * .5, this._size2.z * .5)),
            null,
            config.physicsMaterial
        );
        this._box2.rigideBody = true;
        this.add(this._box2);


        this._sphere0 = new SolidObject(
            null,
            new CANNON.Sphere(.3),
            null,
            config.physicsMaterial
        );
        this._sphere0.rigideBody = true;
        this.add(this._sphere0);

        this._sphere1 = new SolidObject(
            null,
            new CANNON.Sphere(.3),
            null,
            config.physicsMaterial
        );
        this._sphere1.rigideBody = true;
        this.add(this._sphere1);

        this._sphere2 = new SolidObject(
            null,
            new CANNON.Sphere(.3),
            null,
            config.physicsMaterial
        );
        this._sphere2.rigideBody = true;
        this.add(this._sphere2);

    }



    setCollidersPos(val, switchDirection) {

        if (switchDirection) {

            this._mobMesh.rotation.y = -DEG2RAD * 90;
            this._box0.position.z = val.z;
            this._box0.position.x = val.x + 1.5;
            this._sphere0.position.x = val.x + .3;
            this._sphere0.position.z = val.z;

            this._box1.position.z = val.z - .5;
            this._box1.position.x = val.x + .8;
            this._box1.rotation.y = DEG2RAD * -50;
            this._sphere1.position.x = val.x + 1.5;
            this._sphere1.position.z = val.z + 1.2;

            this._box2.position.z = val.z + .5;
            this._box2.position.x = val.x + .8;
            this._box2.rotation.y = DEG2RAD * 50;
            this._sphere2.position.x = val.x + 1.5;
            this._sphere2.position.z = val.z - 1.2;

        } else {

            this._mobMesh.rotation.y = DEG2RAD * 90;

            this._box0.position.z = val.z;
            this._box0.position.x = val.x - 1.5;
            this._sphere0.position.x = val.x - .3;
            this._sphere0.position.z = val.z;

            this._box1.position.z = val.z + .5;
            this._box1.position.x = val.x - .8;
            this._box1.rotation.y = DEG2RAD * -50;
            this._sphere1.position.x = val.x - 1.5;
            this._sphere1.position.z = val.z + 1.2;

            this._box2.position.z = val.z - .5;
            this._box2.position.x = val.x - .8;
            this._box2.rotation.y = DEG2RAD * 50;
            this._sphere2.position.x = val.x - 1.5;
            this._sphere2.position.z = val.z - 1.2;
        }

    }


    update(delta) {

        this.superUpdate(delta);

    }

    destroy() {

        this.superDispose();

    }


}