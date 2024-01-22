import { EventDispatcher, Vector2 } from "three";
import Config from "config";
import gsap from "gsap/all";

export default class VirtualJoystick extends EventDispatcher {
    constructor(opts = {}) {

        super();

        this.onDown = this.onDown.bind(this);
        this.onUp = this.onUp.bind(this);
        this.update = this.update.bind(this);
        this.initEvent = this.initEvent.bind(this);

        this._base = null;
        this._stick = null;
        this._radius = opts.radius || 30;
        this._deltaX = null;
        this._deltaY = null;

        this.circle = null;
        this.joystick = null;

        this.build();

        this.initEvent();

    }





    build() {

        this.circle = document.createElement("div");
        this.circle.style.position = "absolute";
        this.circle.style["background-color"] = "rgba(255, 255, 255,0)";
        this.circle.style.border = "3px solid white";
        this.circle.style.height = "60px";
        this.circle.style["border-radius"] = "50%";
        this.circle.style.width = "60px";
        this.circle.style["border-radius"] = "50%";
        this.circle.style.opacity = "0.5";
        this.circle.style.display = "none";
        this.circle.style["pointer-events"] = "none";
        this.circle.style.top = "0px";
        document.body.appendChild(this.circle);


        this.joystick = document.createElement("div");
        this.joystick.style.position = "absolute";
        this.joystick.style["background-color"] = "rgb(255, 255, 255)";
        this.joystick.style.height = "30px";
        this.joystick.style["border-radius"] = "50%";
        this.joystick.style.width = "30px";
        this.joystick.style["border-radius"] = "50%";
        this.joystick.style.opacity = "0.5";
        this.joystick.style.display = "none";
        this.joystick.style["pointer-events"] = "none";
        this.joystick.style.top = "0px";
        document.body.appendChild(this.joystick);


    }


    initEvent() {
        Config.app.addEventListener("mousedown", this.onDown);
        Config.app.addEventListener("mouseup", this.onUp);
    }


    onDown() {
        this._isDown = true;
        this._base = new Vector2(Config.global.mouse.x, -Config.global.mouse.y);

        this.circle.style.display = "block";
        this.joystick.style.display = "block";
        gsap.to(this.circle, { duration: 0, x: this._base.x - 33, y: this._base.y - 33 });
        gsap.to(this.joystick, { duration: 0, x: this._base.x - 15, y: this._base.y - 15 });

    }

    onUp() {
        this._isDown = false;

        this.circle.style.display = "none";
        this.joystick.style.display = "none";
    }


    update() {

        if (this._isDown) {

            this._deltaX = Config.global.mouse.x - this._base.x;
            this._deltaX = this._deltaX > this._radius ? this._radius : this._deltaX < -this._radius ? -this._radius : this._deltaX;
            this._deltaY = -(Config.global.mouse.y + this._base.y);
            this._deltaY = this._deltaY > this._radius ? this._radius : this._deltaY < -this._radius ? -this._radius : this._deltaY;

            let distance = Math.sqrt(this._deltaX * this._deltaX + this._deltaY * this._deltaY);
            if (distance > this._radius) {
                this._stick = new Vector2((this._deltaX / distance) * this._radius + this._base.x, (this._deltaY / distance) * this._radius + this._base.y);
            } else {
                this._stick = new Vector2(this._base.x + this._deltaX, this._base.y + this._deltaY)

            }

            gsap.to(this.joystick, { duration: 0.1, x: this._stick.x - 15, y: this._stick.y - 15 });

        }

    }




    get deltaX() {
        return this._deltaX;
    }

    get deltaY() {
        return this._deltaY;
    }

    get stick() {
        return this._stick;
    }

    get base() {
        return this._base;
    }



    destroy() {

        Config.app.removeEventListener("mousedown", this.onDown);
        Config.app.removeEventListener("mouseup", this.onUp);

        this.joystick.parentNode && document.body.removeChild(this.joystick);
        this.circle.parentNode && document.body.removeChild(this.circle);

        console.log("virtualJoystick::dispose");

    }


}