import { EventDispatcher, Texture } from "three";

export default class TexturesLoader extends EventDispatcher {

    constructor() {
        super();

        this._onImageLoaded = this._onImageLoaded.bind(this);

        this._id = 0;
        this._datas = [];
        this._textures = {};



    }

    _addImage() {

        this._image && (this._image = null);
        this._image = this._getElementNS("img");
        this._image.crossOrigin = "anonymous";
        this._image.onload = this._onImageLoaded;
        this._image.name = this._datas[this._id].name;
        this._image.src = this._datas[this._id].data;

    }


    _onImageLoaded(event) {


        let texture = new Texture(event.target);
        texture.needsUpdate = true;

        this._textures[event.target.name] = texture;

        // console.log(event.target.name, " loaded");

        this._id++;

        if (this._id >= this._datas.length) {

            this.dispatchEvent({ type: "onLoad", textures: this._textures });

        } else {

            this._addImage();
        }


    }


    _getElementNS(name) {

        return document.createElementNS('http://www.w3.org/1999/xhtml', name);

    }


    load(datas) {


        for (const key in datas) {
            this._datas.push({ name: key, data: datas[key] });
        }

        this._addImage();

    }


}