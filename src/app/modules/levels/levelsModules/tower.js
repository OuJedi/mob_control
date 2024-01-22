import { Color, DoubleSide, MeshStandardMaterial, Sprite } from "three";
import assets from "app/assets";
import tools from "tools";
import AbstractModel from "app/modules/common/abstractModel";
import gsap from "gsap";
import * as CANNON from 'cannon-es';

const COLOR1 = 0xea3333;
const COLOR2 = 0x680303;
const COLOR3 = 0x5C7C97;

export default class Tower extends AbstractModel {

    constructor(data) {

        super({
            name: "Tower",
            gltf: data,
            mesh: null,
            shape: new CANNON.Box(new CANNON.Vec3(1.5, 1.5, 1.5)),
            offset: null,
            material: null
        });

        tools.autobind(this);

        this._step = 1;
        this._flow = 1;

    }


    _initMaterials() {

        this.baseMaterial = new MeshStandardMaterial({ color: COLOR1 });
        this.baseMaterial.metalness = .2;
        this.baseMaterial.roughness = .1;
        this.baseMaterial.envMap = assets.textures.envMap;
        this.baseMaterial.envMapIntensity = 1;
        this.baseMaterial.side = DoubleSide;

        this.middleMaterial = new MeshStandardMaterial({ color: COLOR2 });
        this.middleMaterial.metalness = .2;
        this.middleMaterial.roughness = .1;
        this.middleMaterial.envMap = assets.textures.envMap;
        this.middleMaterial.envMapIntensity = 1.2;
        this.middleMaterial.side = DoubleSide;

        this.stickMaterial = new MeshStandardMaterial({ color: COLOR3 });
        this.stickMaterial.metalness = .2;
        this.stickMaterial.roughness = .1;
        this.stickMaterial.envMap = assets.textures.envMap;
        this.stickMaterial.envMapIntensity = 1.2;
        this.stickMaterial.side = DoubleSide;

    }


    _onSkinnedMeshReady(meshs) {

        console.log("meshs:", meshs);

        this._initMaterials();

        if (meshs) {

            this._meshs = meshs;

            let mesh;

            mesh = meshs.getObjectByName("Cube");
            mesh.material = this.baseMaterial;
            mesh.receiveShadow = true;
            mesh.castShadow = true;

            mesh = meshs.getObjectByName("Cube001");
            mesh.material = this.baseMaterial;
            mesh.receiveShadow = true;
            mesh.castShadow = true;

            mesh = meshs.getObjectByName("Cube002");
            mesh.material = this.middleMaterial;
            mesh.receiveShadow = true;
            mesh.castShadow = true;

            mesh = meshs.getObjectByName("Cube003");
            mesh.material = this.middleMaterial;
            mesh.receiveShadow = true;
            mesh.castShadow = true;

            mesh = meshs.getObjectByName("Cube005_1");
            mesh.material = this.baseMaterial;
            mesh.receiveShadow = true;
            mesh.castShadow = true;

            mesh = meshs.getObjectByName("Cube005_2");
            mesh.material = this.middleMaterial;
            mesh.receiveShadow = true;
            mesh.castShadow = true;

            mesh = meshs.getObjectByName("Cube005");
            mesh.material = this.baseMaterial;
            mesh.receiveShadow = true;
            mesh.castShadow = true;

            mesh = meshs.getObjectByName("Cube006");
            mesh.material = this.baseMaterial;
            mesh.receiveShadow = true;
            mesh.castShadow = true;

            mesh = meshs.getObjectByName("Cylinder");
            mesh.material = this.stickMaterial;
            mesh.receiveShadow = true;
            mesh.castShadow = true;

            mesh = meshs.getObjectByName("flag");
            mesh.material = this.baseMaterial;
            mesh.receiveShadow = true;
            mesh.castShadow = true;

            this._lifeText = tools.getTextShape("00", assets.font3d, 0xffffff, .4, 1, { x: .5, y: .5 });
            this._lifeText.position.y = 1.5;
            this._lifeText.position.z = 1.35;
            this.add(this._lifeText);

            meshs.scale.set(2, 2, 2);
            meshs.position.y = -.5;

        }


        this._flare = new Sprite();
        this._flare.material.map = assets.textures.flare;
        this._flare.material.transparent = true;
        this._flare.material.color = new Color(0xfbd744);
        this._flare.material.alphaTest = .01;
        this._flare.visible = false;
        this._flare.position.y = 2;
        this._flare.position.z = 2.1;
        this.add(this._flare);


        this._cloud = new Sprite();
        this._cloud.material.map = assets.textures.cloud;
        this._cloud.material.transparent = true;
        this._cloud.material.color = new Color(0xffffff);
        this._cloud.visible = false;
        this._cloud.position.y = 2;
        this._cloud.position.z = 2.1;
        this._cloud.scale.set(3, 3);
        this.add(this._cloud);

    }



    _ready() {
        this.collider.addEventListener("collide", this._onCollide);
        this.isKinematic = true;
        this.collider.isTrigger = true;
    }




    _onCollide(e) {

        if (this.life <= 0) {
            return;
        }

        if (e.body.class.type == "mob" && !e.body.class.isDead) {
            e.body.class.dead();
            this.life -= e.body.class.sizeType == "normal" ? 1 : 3;
            if (this.life > 0) {
                tools.shake(this, 60, 5, .2, true, false, true, true);
            } else {
                this.stop();
                this.life = 0;
                this.dispatchEvent({ type: "destroyed" });
                this._meshs.visible = false;
                this._lifeText.visible = false;
                this._showFlare();
            }
        }

    }


    _showFlare() {

        this._flare.visible = true;
        this._flareTween && this._flareTween.kill();
        this._flare.scale.set(8, 8);
        this._flareTween = gsap.to(this._flare.scale, {
            duration: 1, x: 10, y: 10, onComplete: () => {
                this._flare.visible = false;
            }
        });
        this._flare.material.opacity = 1;
        gsap.to(this._flare.material, { duration: 1, opacity: 0 });

        //

        this._cloud.visible = true;
        this._cloudTween && this._cloudTween.kill();
        this._cloud.scale.set(1, 1);
        this._cloudTween = gsap.to(this._cloud.scale, {
            delay: .1,
            duration: 1.5,
            x: 8,
            y: 8,
            ease: "power4.out"
        });
        this._cloud.material.opacity = 1;
        gsap.to(this._cloud.material, {
            delay: .2,
            duration: 1,
            opacity: 0,
            onComplete: () => {
                this._cloud.visible = false;
            }
        });

    }



    _generate() {

        for (let i = 0; i < this.flow; i++) {
            gsap.delayedCall(.09 * i, () => {
                let levelEnemyCoef = this.life <= 15 ? 10 : 5;
                this.dispatchEvent({ type: "generate", flow: this.flow, enemyType: (Math.random() * 100 > levelEnemyCoef ? "normal" : "super") });
            });

        }

    }


    set step(val) {
        this._step = val;
    }

    get step() {
        return this._step;
    }

    set flow(val) {
        this._flow = val;
    }

    get flow() {
        return this._flow;
    }

    set life(val) {
        this._life = val;
        this._lifeText.setText(this._life + "");
    }

    get life() {
        return this._life;
    }



    start() {

        gsap.delayedCall(this.step * .25, this._generate);
        this._timer = setInterval(this._generate, this.step * 1000 * this._delta);

    }



    stop() {

        this._timer && clearInterval(this._timer);

    }



    update(delta) {

        this._delta = delta;
        this.superUpdate(delta);

    }

    destroy() {

        this.collider && this.collider.removeEventListener("collide", this._onCollide);
        this.superDispose();

    }



}