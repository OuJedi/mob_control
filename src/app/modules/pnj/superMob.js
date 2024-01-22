import { Color, DoubleSide, LoopOnce, MeshStandardMaterial, Sprite } from "three";
import * as CANNON from 'cannon-es';
import assets from "app/assets";
import tools from "tools";
import config from "config";
import gsap from "gsap";
import AbstractSkinnedModel from "../common/abstractSkinnedModel";
import { DEG2RAD, RAD2DEG } from "three/src/math/MathUtils";
import mobFactory from "./mobFactory";

const COLOR = 0xddcc00;
const COLOR_ENEMY = 0xd53efe;
const EMISSIVE = 0xff7300;
const EMISSIVE_ENEMY = 0xff0000;
const BEATEN_COLOR = 0xffffff;
const COLLIDER_SIZE = .3;

export default class SuperMob extends AbstractSkinnedModel {

    constructor(data, type, sizeType, duplicated) {

        super({
            name: type,
            gltf: data,
            mesh: null,
            shape: new CANNON.Sphere(COLLIDER_SIZE),
            offset: null,
            material: config.physicsSuperMobMaterial,
            mass: 2,
            duplicated: duplicated
        });

        tools.autobind(this);

        this._speed = 0;
        this._life = 1;
        this._sizeType = sizeType;
        this._collideAcces = true;
        this._multiplierList = [];

    }


    _initMaterials() {

        this.bodyMaterial = new MeshStandardMaterial({ color: 0xddcc00 });
        this.bodyMaterial.emissive = new Color(0xff7300);
        this.bodyMaterial.emissiveIntensity = 1;
        this.bodyMaterial.metalness = .5;
        this.bodyMaterial.roughness = .6;
        this.bodyMaterial.envMap = assets.textures.envMap;
        this.bodyMaterial.side = DoubleSide;

        this.modelMaterial = new MeshStandardMaterial({ color: 0x000fe7 });
        this.modelMaterial.emissive = new Color(0x6600ff);
        this.modelMaterial.emissiveIntensity = .12;
        this.modelMaterial.metalness = .2;
        this.modelMaterial.roughness = .2;
        this.modelMaterial.envMap = assets.textures.envMap;
        this.modelMaterial.envMapIntensity = 5;
        this.modelMaterial.side = DoubleSide;

        this._currentColor = COLOR;
        this._currentEmissive = EMISSIVE;




    }


    _onSkinnedMeshReady(meshs) {

        this.clip.timeScale = 1.2;

        this._initMaterials();

        this._meshs = meshs;
        this._mobMesh = this._meshs.getObjectByName("Mesh");
        this._mobMesh.material = this.modelMaterial;
        this._mobMesh.castShadow = true;

        this._mobMesh = this._meshs.getObjectByName("Mesh_1");
        this._mobMesh.material = this.bodyMaterial;
        this._mobMesh.castShadow = true;

        this._meshs.position.y = -.4; //pivot

        if (!this.duplicated) {
            this._meshs.position.z = -3;
            gsap.to(this._meshs.position, {
                duration: .3, z: 0, onComplete: () => {
                    this.collider && (this.collider.collisionFilterMask = -1);
                    this._introAnimComplete = true;
                }
            });
        } else {
            this.collider && (this.collider.collisionFilterMask = -1);
            this._introAnimComplete = true;
        }


        this._meshs.scale.set(.2, .2, .2);
        gsap.to(this._meshs.scale, { delay: this.duplicated ? Math.random() * .2 : .1, duration: 1.5, x: 1, y: 1, z: 1, ease: "elastic.out(.7,0.15)" });

        this._particule = new Sprite();
        this._particule.material.map = assets.textures.particules;
        this._particule.material.color = new Color(BEATEN_COLOR);
        this._particule.material.transparent = true;
        this._particule.scaleCoef = this._particule.material.map.height / this._particule.material.map.width;
        this._particule.scale.set(2, 2 * this._particule.scaleCoef);
        this._particule.visible = false;
        this._particule.position.y = -1;
        this._particule.position.z = -1;
        this.add(this._particule);

    }


    _ready() {
        this.collider.addEventListener("collide", this._onCollide);
        this.collider.velocity.z = this.speed;
        !this._introAnimComplete && (this.collider.collisionFilterMask = 100);
    }




    _onCollide(e) {

        if (
            (e.body.class.type == "mob" || e.body.class.type == "enemy")
            && e.body.class.type != this.type
            && !this._isDead
        ) {
            this.beaten();
        }


    }



    set type(val) {
        this._type = val;
        if (val == "enemy") {
            this.bodyMaterial.color = new Color(COLOR_ENEMY);
            this.bodyMaterial.emissive = new Color(EMISSIVE_ENEMY);
            this._currentColor = COLOR_ENEMY;
            this._currentEmissive = EMISSIVE_ENEMY;
        }
    }


    get type() {
        return this._type;
    }



    set speed(val) {
        this._speed = val;
    }

    get speed() {
        return this._speed;
    }

    set life(val) {
        this._life = val;
    }

    get life() {
        return this._life;
    }

    get sizeType() {
        return this._sizeType;
    }

    get isDead() {
        return this._isDead;
    }

    get colliderSize() {
        return COLLIDER_SIZE;
    }

    get multiplierList() {
        return this._multiplierList;
    }


    run() {
        this.clip.reset();
        this.currentAction = "run";
        this.clip.time = Math.random() * .7;
        this.clip.play();
    }

    dead() {

        this._isDead = true;

        if (this.collider) {
            this.collider.velocity.x = 0;
            this.collider.velocity.z = 0;
            gsap.delayedCall(.1, () => {
                config.physic.world.removeBody(this.collider);
            });
        }

        this.clip.reset();
        this.currentAction = "dead";
        this.clip.loop = LoopOnce;
        this.clip.clampWhenFinished = true;
        this.clip.time = .75;
        this.clip.play();

        let interval = setInterval(() => {
            if (!this.clip.isRunning()) {
                clearInterval(interval);
                this._meshs.visible = false;
                this._particule.visible = true;
                this._particule.material.rotation = Math.random() * DEG2RAD * 360;
                gsap.to(this._particule.scale, {
                    duration: .25, x: 0, y: 0, onComplete: () => {
                        // this.destroy();
                        mobFactory.destroyMob(this);
                    }
                });

            }
        }, 60);

    }


    beaten() {

        this.life--;

        tools.animateColor(this.bodyMaterial, this._currentColor, BEATEN_COLOR, .1, 0, "color");
        tools.animateColor(this.bodyMaterial, this._currentEmissive, BEATEN_COLOR, .1, 0, "emissive");

        tools.animateColor(this.bodyMaterial, BEATEN_COLOR, this._currentColor, 1, .1, "color");
        tools.animateColor(this.bodyMaterial, BEATEN_COLOR, this._currentEmissive, 1, .1, "emissive");

        if (this.life <= 0) {
            this.dead(.1);
        }

    }



    goToGoal(pos) {

        this.collider.velocity.x = 0;
        this.collider.velocity.y = 0;
        this.collider.velocity.z = 0;
        this.isKinematic = true;

        let speedBase = 6;
        let speedBaseCoef = .7;

        let angle = (tools.pos2angle({ x: this.collider.position.x, y: this.collider.position.z }, { x: pos.x, y: pos.z })) + 270;
        angle = tools.getShortestAngle(this._meshs.rotation.y * RAD2DEG, angle * DEG2RAD);
        this._meshs.rotation.y = angle.from;
        gsap.to(this._meshs.rotation, { duration: 2, y: -angle.to });
        gsap.to(this.collider.position, { duration: Math.abs(speedBase / this.speed) * speedBase * speedBaseCoef, x: pos.x, z: pos.z });



    }




    update(delta) {

        if (delta > 2) {
            delta = 2;
        }

        this.superUpdate(delta);

        if (this.currentAction == "run" && this.clip.time >= .7) { // loop run
            this.clip.time = 0;
        }


        if (this.collider && !this._isDead) {
            if (this.type == "enemy") {
                if (this.collider.velocity.z < this.speed * delta) {
                    this.collider.velocity.z += .1 * delta;
                } else {
                    this.collider.velocity.z = this.speed * delta;
                }
            } else {
                if (!this.isKinematic) {
                    if (this.collider.velocity.z > this.speed * delta) {
                        this.collider.velocity.z -= .1 * delta;
                    } else {
                        this.collider.velocity.z = this.speed * delta;
                    }
                }
            }
        }

    }

    destroy() {

        this._multiplierList = [];

        this.collider && this.collider.removeEventListener("collide", this._onCollide);

        this.superDispose();

    }


}