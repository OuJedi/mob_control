
import assets from "app/assets";
import tools from "tools";
import { Color, Object3D, Sprite } from "three";
import gsap from "gsap";

const COLOR1 = 0x008efe;
const COLOR2 = 0xf4a900;
const GAUGE_MAX = 1.15;

export default class Gauge extends Object3D {

    constructor() {

        super();

        tools.autobind(this);

        this._valueAccess = true;

        this._build();
        this._initEvents();

    }


    _build() {


        this._gaugeBg = new Sprite();
        this._gaugeBg.scale.x = .3;
        this._gaugeBg.scale.y = GAUGE_MAX;
        this._gaugeBg.position.x = .042;
        this._gaugeBg.position.z = -.3;
        this._gaugeBg.position.y = -.4;
        this._gaugeBg.center.y = 0;
        this._gaugeBg.material.color = new Color(0x000000);
        this.add(this._gaugeBg);

        this._gauge = new Sprite();
        this._gauge.material.transparent = true;
        this._gauge.scale.x = .3;
        this._gauge.scale.y = 0;
        this._gauge.position.x = .042;
        this._gauge.position.z = -.3;
        this._gauge.position.y = -.4;
        this._gauge.center.y = 0;
        this._gauge.material.color = new Color(COLOR1);
        this.add(this._gauge);

        this._cadre = new Sprite();
        this._cadre.material.map = assets.textures.gauge;
        this._cadre.material.transparent = true;
        this._cadre.scaleCoef = assets.textures.gauge.height / assets.textures.gauge.width;
        this._cadre.scale.set(.7, this._cadre.scaleCoef * .7);
        this.add(this._cadre);

        this._thunder = new Sprite();
        this._thunder.material.map = assets.textures.thunder;
        this._thunder.material.transparent = true;
        this._thunder.material.color = new Color(0x000000);
        this._thunder.scaleCoef = this._thunder.material.map.height / this._thunder.material.map.width;
        this._thunder.scale.set(.4, this._thunder.scaleCoef * .4);
        this._thunder.position.x = .042;
        this._thunder.center.y = 1.1;

        this.add(this._thunder);

    }


    set value(val) {

        console.log("value:", val)
        if (val >= 1 && this._valueAccess) {

            this._gauge.material.color = new Color(COLOR2);
            gsap.to(this._gauge.scale, { y: GAUGE_MAX, duration: .2 });
            this.superMobReady = true;
            this._valueAccess = false;

            if (this._feverText && !this._feverText.visible) {
                this._feverTextTween && this._feverTextTween.kill();
                this._feverTextTween = gsap.to(this._feverText.scale, { duration: .6, x: 1.2, y: 1.2, z: 1.2, yoyo: true, repeat: -1, yoyoEase: "none" });
                this._feverText.visible = true;

                this._feverFlare.visible = true;
                this._feverFlareTween && this._feverFlareTween.kill();
                this._feverFlare.scale.set(1, 1);
                this._feverFlareTween = gsap.to(this._feverFlare.scale, {
                    duration: .5, x: 3.5, y: 3.5, onComplete: () => {
                        this._feverFlare.visible = false;
                    }
                });
                this._feverFlare.material.opacity = 1;
                gsap.to(this._feverFlare.material, { duration: 1, opacity: 0 });                
             
            }


        } else {

            if (this._valueAccess) {
                this._gauge.material.color = new Color(COLOR1);
                gsap.to(this._gauge.scale, { y: val * GAUGE_MAX, duration: .2 });
            }

        }

    }

    get value() {
        return this._gauge.scale.y / GAUGE_MAX;
    }

    set superMobReady(val) {

        this._superMobReady = val;

        if (!this._superMobReady) {

            this._gauge.material.color = new Color(COLOR1);
            gsap.to(this._gauge.scale, {
                y: 0, duration: .5, onComplete: () => {
                    this._valueAccess = true;
                }
            });

            this._feverTextTween && this._feverTextTween.kill();
            this._feverText && (this._feverText.visible = false);
            this._feverText && (this._feverText.scale.set(1, 1, 1));

        }
    }

    get superMobReady() {
        return this._superMobReady;
    }

    set feverText(val) {
        this._feverText = val;
    }

    set feverFlare(val) {
        this._feverFlare = val;
    }





    _initEvents() {


    }




    update(delta) {



    }


    destroy() {


    }



}