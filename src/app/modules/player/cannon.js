import { Color, Object3D, Sprite } from "three";
import assets from "app/assets";
import tools from "tools";
import config from "config";
import gsap from "gsap";
import CannonCart from "./cannonCart";
import CannonTrunk from "./cannonTrunk";
import { DEG2RAD } from "three/src/math/MathUtils";
import Gauge from "./gauge";

const LIMIT_LEFT = -4.3;
const LIMIT_RIGHT = 4.3;
const SPEED_COEF = 1.7;  //min .5  max 2 

export default class Cannon extends Object3D {

    constructor() {

        super();

        tools.autobind(this);

        this._constrolSpeed = tools.setupIs().desktop ? .02 : .03;
        this._shootAcccess = true;
        this._step = 400;
        this._feverStep = .1;

        this._build();
        this._initEvents();

    }


    _build() {

        this._fever = new Object3D();
        this.feverText = tools.getTextShape("Release!", assets.font3d, 0xfbd700, .5, 1, { x: .5, y: .5 });
        this.feverText.scale.x = -1;
        this.feverText.rotation.x = DEG2RAD * 45;
        this.feverText.position.y = 2;
        this.feverText.position.z = .5;
        this._fever.add(this.feverText);

        this.feverOutlineText = tools.getTextShape("Release!", assets.font3d, 0x000000, .5, 1, { x: .5, y: .5 });
        this.feverOutlineText.scale.x = -1;
        this.feverOutlineText.rotation.x = DEG2RAD * 45;
        this.feverOutlineText.position.y = 1.94;
        this.feverOutlineText.position.z = .48;
        this._fever.add(this.feverOutlineText);
        this._fever.visible = false;
        this.add(this._fever);


        this._flare = new Sprite();
        this._flare.material.map = assets.textures.flare;
        this._flare.material.transparent = true;
        this._flare.material.color = new Color(0xfbd744);
        this._flare.material.alphaTest = .01;
        this._flare.visible = false;
        this._flare.position.y = 1.3;
        this._flare.position.z = -.3;
        this._flare.scale.set(1, 1);
        this.add(this._flare);

        this._cloud = new Sprite();
        this._cloud.material.map = assets.textures.cloud;
        this._cloud.material.transparent = true;
        this._cloud.material.color = new Color(0xffffff);
        this._cloud.visible = false;
        this._cloud.position.y = 1.5;
        this._cloud.position.z = .5;
        this._cloud.scale.set(1, 1);
        this.add(this._cloud);


        this._cart = new CannonCart(assets.models.cannonCart);
        this.add(this._cart);

        this._trunk = new CannonTrunk(assets.models.cannonTrunk);
        this._trunk.rotation.y = DEG2RAD * 180;
        this._trunk.position.y = .68;
        this._trunk.position.z = -.1;
        this.add(this._trunk);

        this._gauge = new Gauge();
        this._gauge.position.set(1, .5, .6);
        this._gauge.feverText = this._fever;
        this._gauge.feverFlare = this._flare;
        this.add(this._gauge);



    }


    _initEvents() {

        config.app.addEventListener("mousedown", this._onDown);
        config.app.addEventListener("mouseup", this._onUp);

    }

    _shoot(superMob) {

        if (config.pause) {
            return;
        }


        if (superMob) {

            this._cloud.material.rotation = Math.random() * DEG2RAD * 360;
            this._cloud.visible = true;
            this._cloudTween && this._cloudTween.kill();
            this._cloud.scale.set(1, 1);
            this._cloudTween = gsap.to(this._cloud.scale, {
                duration: 1.5,
                x: 4,
                y: 4,
                ease: "power4.out"
            });
            this._cloud.material.opacity = 1;
            gsap.to(this._cloud.material, {
                duration: 1,
                opacity: 0,
                onComplete: () => {
                    this._cloud.visible = false;
                }
            });

        }


        this.dispatchEvent({ type: "shoot", superMob: superMob });
        this._trunk.shoot();
        this._gauge.value += this.feverStep;

    }


    _onDown(event) {

        this._oldx = config.mouse.x;

        !this._isDown && this._shootAcccess && this._shoot();
        this._isDown = true;
        this._shootAcccess = false;

        this._accessTimer && this._accessTimer.kill();
        this._accessTimer = gsap.delayedCall(.4, () => {
            this._shootAcccess = true;
        });

        this._shootInterval && clearInterval(this._shootInterval);
        this._shootInterval = setInterval(() => {
            this._shoot();
        }, this.step);



    }

    _onUp() {
        this._isDown = false;
        this._shootInterval && clearInterval(this._shootInterval);

        if (this._gauge.superMobReady) {
            this._gauge.superMobReady = false;
            this._shoot(true);
        }

    }


    _control() {

        let __x = this.position.x;
        let __movePos;
        let __posx;

        if (config.mouse.x > this._oldx + .1) {
            //"right"
            __movePos = (this._oldx - config.mouse.x) * this._constrolSpeed * SPEED_COEF;
            __posx = __x - __movePos < LIMIT_RIGHT ? __x - __movePos : LIMIT_RIGHT;
            this.position.x = __posx;

        } else if (config.mouse.x < this._oldx - .1) {
            //"left"
            __movePos = -(this._oldx - config.mouse.x) * this._constrolSpeed * SPEED_COEF;
            __posx = __x + __movePos > LIMIT_LEFT ? __x + __movePos : LIMIT_LEFT;
            this.position.x = __posx;
        }

        this._oldx = config.mouse.x;
    }

    /**
    * delay time in sec
    * default value 0.4
    */

    set step(val) {
        this._step = val * 1000;
    }

    get step() {
        return this._step;
    }

    /**
     * step  inc 0 to 1 
     * default value 0.1
     */
    set feverStep(val) {
        this._feverStep = val;
    }

    get feverStep() {
        return this._feverStep;
    }


    update(delta) {

        // console.log("cannon update")

        this._trunk.update(delta);
        this._cart.update(delta);
        this._gauge.update(delta);
        this._isDown && this._control();

    }


    destroy() {

        config.app.removeEventListener("mousedown", this._onDown);
        config.app.removeEventListener("mouseup", this._onUp);

        this._trunk.destroy();
        this._cart.destroy();
        this._gauge.destroy();

    }



}