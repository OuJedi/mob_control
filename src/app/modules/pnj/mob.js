import { Color, DoubleSide, MeshStandardMaterial, Sprite } from "three";
import * as CANNON from 'cannon-es';
import assets from "app/assets";
import tools from "tools";
import config from "config";
import gsap from "gsap";
import AbstractSkinnedModel from "../common/abstractSkinnedModel";
import { DEG2RAD, RAD2DEG } from "three/src/math/MathUtils";
import mobFactory from "./mobFactory";

const COLOR = 0x00aaff;
const EMISSIVE = 0x0016ff;
const COLOR_ENEMY = 0xff5f6f;
const EMISSIVE_ENEMY = 0x330000;
const BEATEN_COLOR = 0xffffff;
const COLLIDER_SIZE = .3;

export default class Mob extends AbstractSkinnedModel {

    constructor(data, type, sizeType, duplicated) {

        super({
            name: type,
            gltf: data,
            mesh: null,
            shape: new CANNON.Sphere(COLLIDER_SIZE),
            offset: null,
            material: config.physicsMaterial,
            duplicated: duplicated
        });

        tools.autobind(this);

        this._speed = 0;
        this._life = 1;
        this._sizeType = sizeType;
        this._multiplierList = [];

    }


    _initMaterials() {

        this.modelMaterial = new MeshStandardMaterial({ color: COLOR });
        this.modelMaterial.emissive = new Color(EMISSIVE);
        this.modelMaterial.emissiveIntensity = 2;
        this.modelMaterial.metalness = .2;
        this.modelMaterial.roughness = .2;
        this.modelMaterial.envMap = assets.textures.envMap;
        this.modelMaterial.envMapIntensity = 1;
        this.modelMaterial.side = DoubleSide;

        this._currentColor = COLOR;
        this._currentEmissive = EMISSIVE;

    }


    _onSkinnedMeshReady(meshs) {

        this._initMaterials();
        this._meshs = meshs;
        this._mobMesh = this._meshs.getObjectByName("3D_MobNormie");
        this._mobMesh.material = this.modelMaterial;
        this._mobMesh.castShadow = true;

        //pivot
        this._meshs.position.y = -.35;

        if (!this.duplicated) {
            this._meshs.position.z = -2.5;
            gsap.to(this._meshs.position, { duration: .25, z: 0 });
        }

        if (this.name != "enemy") {
            this._meshs.scale.set(.2, .2, .2);
            gsap.to(this._meshs.scale, { delay: this.duplicated ? Math.random() * .2 : .1, duration: 2, x: 1, y: 1, z: 1, ease: "elastic.out(.9,0.13)" });
        }

        this._particule = new Sprite();
        this._particule.material.map = assets.textures.particules;
        this._particule.material.color = new Color(BEATEN_COLOR);
        this._particule.material.transparent = true;
        this._particule.scaleCoef = this._particule.material.map.height / this._particule.material.map.width;
        this._particule.scale.set(2, 2 * this._particule.scaleCoef);
        this._particule.visible = false;
        this._particule.position.y = 1.2;
        this._particule.position.z = 0;
        this.add(this._particule);

    }


    _ready() {
        this.collider.addEventListener("collide", this._onCollide);
        this.collider.velocity.z = this.speed;
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
            this.modelMaterial.color = new Color(COLOR_ENEMY);
            this.modelMaterial.emissive = new Color(EMISSIVE_ENEMY);
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
        this.currectAction = "run";
        this.clip.startAt(Math.random() * .45);
        this.clip.play();
    }



    dead(delay = 0) {

        this._isDead = true;
        this.collider.velocity.x = 0;
        this.collider.velocity.z = 0;

        gsap.to(this._particule.scale, {
            delay: delay,
            duration: .25,
            x: 0,
            y: 0,
            onComplete: () => {
                mobFactory.destroyMob(this);
            },
            onStart: () => {
                this._meshs.visible = false;
                this._particule.material.rotation = Math.random() * DEG2RAD * 360;
                this._particule.visible = true;
                this._mobMesh.castShadow = false;
                config.physic.world.removeBody(this.collider);
            }
        });
    }

    beaten() {

        this.life--;

        tools.animateColor(this.modelMaterial, this._currentColor, BEATEN_COLOR, .5, 0, "color");
        tools.animateColor(this.modelMaterial, this._currentEmissive, BEATEN_COLOR, .5, 0, "emissive");

        tools.animateColor(this.modelMaterial, BEATEN_COLOR, this._currentColor, 1, .5, "color");
        tools.animateColor(this.modelMaterial, BEATEN_COLOR, this._currentEmissive, 1, .5, "emissive");

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



    hit() {
        this.clip.reset();
        this.currectAction = "hit";
        this.clip.startAt(.45 + Math.random() * .98);
        this.clip.play();
    }



    update(delta) {

        if (delta > 2) {
            delta = 2;
        }

        this.superUpdate(delta);

        //!\\ we can do better with a .glb whose animations are better presented
        if (this.currectAction == "run" && this.clip.time >= .45) { // loop run
            this.clip.time = 0;
        }

        //!\\ we can do better with a .glb whose animations are better presented
        if (this.currectAction == "hit" && this.clip.time < .45 || this.clip.time > .98) { // loop hit
            this.clip.time = .46;
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