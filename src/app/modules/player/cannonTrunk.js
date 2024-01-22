import { DoubleSide, LoopOnce, MeshStandardMaterial } from "three";
import assets from "app/assets";
import tools from "tools";
import gsap from "gsap";
import AbstractSkinnedModel from "../common/abstractSkinnedModel";


export default class CannonTrunk extends AbstractSkinnedModel {

    constructor(data) {

        super({
            name: "CannonTrunk",
            gltf: data,
            mesh: null,
            shape: null,
            offset: null,
            material: null
        });

        tools.autobind(this);

    }


    _initMaterials() {

        this.modelMaterial = new MeshStandardMaterial({ color: 0x000fe7 });
        this.modelMaterial.metalness = .7;
        this.modelMaterial.roughness = .1;
        this.modelMaterial.envMap = assets.textures.envMap;
        this.modelMaterial.envMapIntensity = 10;
        this.modelMaterial.side = DoubleSide;
    }


    _onSkinnedMeshReady(meshs) {

        // console.log("trunk meshs:", meshs);

        this._initMaterials();

        this.rigideBody = false;
        this.isKinematic = true;

        if (meshs) {
            this._mobMesh = meshs.getObjectByName("Cannon");
            this._mobMesh.material = this.modelMaterial;
            this._mobMesh.castShadow = true;
        }

    }




    shoot() {

        // console.log("shoot");

        let scale = .9;

        this.clip.reset();
        this.clip.loop = LoopOnce;
        this.clip.clampWhenFinished = true;
        this.clip.timeScale = 5 / scale;
        this.clip.play();

        gsap.to(this.scale, { duration: .1 * scale, z: .5, x: 1.3 });
        gsap.to(this.position, { duration: .1 * scale, z: -.5 });
        gsap.to(this.scale, { duration: .1 * scale, delay: .1, z: 1.6, x: 1 });
        gsap.to(this.position, { duration: .1 * scale, delay: .1, z: .1 });
        gsap.to(this.scale, { duration: .1 * scale, delay: .2 * scale, z: 1, x: 1 });
        gsap.to(this.position, { duration: .1 * scale, delay: .2 * scale, z: -.1 });


    }




    update(delta) {

        this.superUpdate(delta);
        
    }

    destroy() {

        this.superDispose();

    }



}