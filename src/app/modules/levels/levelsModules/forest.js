import { DoubleSide, MeshStandardMaterial } from "three";
import assets from "app/assets";
import tools from "tools";
import AbstractModel from "app/modules/common/abstractModel";

export default class Forest extends AbstractModel {

    constructor() {

        super({
            name: "Forest",
            gltf: assets.models.tree,
            mesh: null,
            shape: null,
            offset: null,
            material: null
        });

        tools.autobind(this);

    }


    _initMaterials() {

        this.modelMaterial = new MeshStandardMaterial({ color: 0xffffff });
        this.modelMaterial.map = assets.textures.treeMap;
        this.modelMaterial.metalness = .1;
        this.modelMaterial.roughness = .2;
        this.modelMaterial.envMap = assets.textures.envMap;
        this.modelMaterial.envMapIntensity = .6;
        this.modelMaterial.side = DoubleSide;

    }


    _onSkinnedMeshReady(meshs, raw) {

        console.log("forest meshs:", meshs);

        this._initMaterials();

        this.rigideBody = false;
        this.isKinematic = true;

        if (meshs) {
            this._mobMesh = meshs.getObjectByName("tree1");
            this._mobMesh.material = this.modelMaterial;
            this._mobMesh.castShadow = true;
            this._mobMesh.scale.set(.4, .4, .15);
        }

    }




    update(delta) {

        this.superUpdate(delta);

    }

    destroy() {

        this.superDispose();

    }



}