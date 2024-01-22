import { DoubleSide, MeshStandardMaterial } from "three";
import assets from "app/assets";
import tools from "tools";
import AbstractModel from "../common/abstractModel";

const COLOR = 0xcf9845;

export default class CannonCart extends AbstractModel {

    constructor(data) {

        super({
            name: "CannonCart",
            gltf: data,
            mesh: null,
            shape: null,
            offset: null,
            material: null
        });

        tools.autobind(this);

    }


    _initMaterials() {

        this.baseMaterial = new MeshStandardMaterial({ color: COLOR });
        this.baseMaterial.metalness = .3;
        this.baseMaterial.roughness = 0;
        this.baseMaterial.envMap = assets.textures.envMap;
        this.baseMaterial.envMapIntensity = 1;
        this.baseMaterial.side = DoubleSide;

    }


    _onSkinnedMeshReady(meshs) {

        // console.log("meshs:", meshs);

        this._initMaterials();

        this.rigideBody = false;
        this.isKinematic = true;

        if (meshs) {


            let mesh;

            mesh = meshs.getObjectByName("Mesh006");
            mesh.material = this.baseMaterial;
            mesh.castShadow = true;

            mesh = meshs.getObjectByName("Mesh006_1");
            mesh.material = this.baseMaterial;
            mesh.castShadow = true;

            mesh = meshs.getObjectByName("Mesh006_2");
            mesh.material = this.baseMaterial;
            mesh.castShadow = true;

            mesh = meshs.getObjectByName("Mesh007_1");
            mesh.material = this.baseMaterial;
            mesh.castShadow = true;

            mesh = meshs.getObjectByName("Mesh008_1");
            mesh.material = this.baseMaterial;
            mesh.castShadow = true;

            mesh = meshs.getObjectByName("Mesh009_1");
            mesh.material = this.baseMaterial;
            mesh.castShadow = true;

            mesh = meshs.getObjectByName("Mesh010_1");
            mesh.material = this.baseMaterial;
            mesh.castShadow = true;


        }

    }




    update(delta) {

        this.superUpdate(delta);


    }

    destroy() {

        this.superDispose();

    }



}