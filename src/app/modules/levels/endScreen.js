import assets from "app/assets";
import gsap from "gsap";
import { Color, Object3D, Sprite } from "three";
import tools from "tools";

export default class EndScreen extends Object3D {


    constructor() {

        super();

        tools.autobind(this);

        this._build();

    }


    _build() {


        this._bg = new Sprite();
        this._bg.material.map = assets.textures.gradientWall;
        this._bg.material.color = new Color(0xffffff);
        this._bg.material.transparent = true;
        this._bg.scaleCoef = this._bg.material.map.height / this._bg.material.map.width;
        this._bg.scale.set(10, 10 * this._bg.scaleCoef);
        this.add(this._bg);

        this._bandeau = new Sprite();
        this._bandeau.name = "Bandeau";
        this._bandeau.material.map = assets.textures.bandeau;
        this._bandeau.material.transparent = true;
        this._bandeau.scaleCoef = this._bandeau.material.map.height / this._bandeau.material.map.width;
        this._bandeau.scale.set(4, 4 * this._bandeau.scaleCoef);
        this.add(this._bandeau);


        this._win = new Sprite();
        this._win.name = "win";
        this._win.material.map = assets.textures.win;
        this._win.material.transparent = true;
        this._win.scaleCoef = this._win.material.map.height / this._win.material.map.width;
        this._win.scale.set(1, 1 * this._win.scaleCoef);
        this._win.position.y = .9;
        this.add(this._win);

        this._lose = new Sprite();
        this._lose.name = "lose";
        this._lose.material.map = assets.textures.lose;
        this._lose.material.transparent = true;
        this._lose.scaleCoef = this._lose.material.map.height / this._lose.material.map.width;
        this._lose.scale.set(1, 1 * this._lose.scaleCoef);
        this._lose.position.y = .9;
        this.add(this._lose);

        this._text = tools.getTextShape("", assets.font3d, 0xffffff, .2, 1, { x: .5, y: .5 });
        this._text.position.y = -.25;
        this._text.position.z = .1;
        this.add(this._text);

    }



    set win(val) {

        if (val) {
            this._bandeau.material.color = new Color(0xa0da01);
            this._bg.material.color = new Color(0xa0da01);
            this._win.visible = true;
            this._lose.visible = false;
            this._win.scale.set(3, 3 * this._win.scaleCoef);
            gsap.to(this._win.scale, { delay: 1, duration: .5, x: 1, y: 1 * this._win.scaleCoef, ease: "back.out(2)" });
            this._text.setText("BATTLE\n    SUCCEEDS!");

        } else {
            this._bandeau.material.color = new Color(0xe31d5a);
            this._bg.material.color = new Color(0xe31d5a);
            this._win.visible = false;
            this._lose.visible = true;
            this._lose.scale.set(3, 3 * this._lose.scaleCoef);
            gsap.to(this._lose.scale, { delay: 1, duration: .5, x: 1, y: 1 * this._lose.scaleCoef, ease: "back.out(2)" });
            this._text.setText("BATTLE\n    LOST");
        }

        this._bandeau.scale.set(1, 1 * this._lose.scaleCoef);
        gsap.to(this._bandeau.scale, { delay: 1, duration: .5, x: 4, y: 4 * this._bandeau.scaleCoef });

        this._text.scale.set(0, 0);
        gsap.to(this._text.scale, { delay: 1.2, duration: .5, x: 1, y: 1 });


    }


}