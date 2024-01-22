import assets from "app/assets";
import { Object3D, Sprite } from "three";
import tools from "tools";

export default class GameTimer extends Object3D {

    constructor() {
        super();

        tools.autobind(this);

        this._build();
    }



    _build() {

        this.timerBg = new Sprite();
        this.timerBg.name = "timerBg";
        this.timerBg.material.map = assets.textures.timerBg;
        this.timerBg.material.transparent = true;
        this.timerBg.scaleCoef = this.timerBg.material.map.height / this.timerBg.material.map.width;
        this.timerBg.scale.set(1.4, 1.4 * this.timerBg.scaleCoef);
        this.add(this.timerBg);

        this._timerValue = window.gameTimer;
        this._timeText = tools.getTextShape("20", assets.font3d, 0x000000, .2, 1, { x: .5, y: .5 });
        this._timeText.position.y = -.2;
        this.add(this._timeText);

    }



    start() {

        this._timer = setInterval(() => {
            this._timerValue--;

            if (this._timerValue <= 0) {
                this._timeText.setText("0");
                this.stop();
                this.dispatchEvent({ type: "timeUp" });
            } else {
                this._timeText.setText(this._timerValue + "");
            }


        }, 1000);

    }


    stop() {
        this._timer && clearInterval(this._timer);
    }

    reset() {
        this._timer && clearInterval(this._timer);
        this._timerValue = 0;
        this._timeText.setText(this._timerValue + "");
    }

    set time(val) {
        this._timerValue = val;
        this._timeText.setText(this._timerValue + "");
    }

    get time() {
        return this._timerValue;
    }


}