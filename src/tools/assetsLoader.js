
import { Howl } from "howler";
import { GLTFLoader } from "lib/GLTFLoader";

class AssetsLoader {

    constructor() {

        this._checkNameAvailability = this._checkNameAvailability.bind(this);

        this.imgs = [];
        this.jsons = [];
        this.audio = [];
        this.glbs = [];
        this.assets = {};
        this.dataSize = 0;
        this.dataLoaded = 0;
        this.loadError = 0;

    }


    addEventListener(eventType, callback) {
        switch (eventType) {
            case "complete":
                this._completeCallback = callback;
                break;

            case "progress":
                this._progressCallback = callback;
                break;

            default:
                break;
        }


    }

    removeEventListener(eventType) {
        switch (eventType) {
            case "complete":
                this._completeCallback = null;
                break;

            case "progress":
                this._progressCallback = null;
                break;

            default:
                break;
        }
    }


    add(data) {

        let ext = data.ext ? data.ext : data.path.split(".").pop();

        switch (ext) {

            case "jpg":
            case "png":
                this.imgs.push(data);
                this.dataSize++;
                break;

            case "json":
                this.jsons.push(data);
                this.dataSize++;
                break;

            case "mp3":
                this.audio.push(data);
                this.dataSize++;
                break;

            case "glb":
                this.glbs.push(data);
                this.dataSize++;
                break;

            default:
                console.warn("AssetsLoader::", "'." + ext + "' type not supported for now");
                break;

        }


    }


    load() {

        this._process();

        this.isAllAssetsLoaded = setInterval(() => {

            const percent = this.dataLoaded / this.dataSize;
            this._progressCallback && this._progressCallback({ type: "progress", percent: percent });

            if (percent >= 1) {
                this.isAllAssetsLoaded && clearInterval(this.isAllAssetsLoaded);
                this._completeCallback && this._completeCallback({ type: "complete", assets: this.assets });
            }

        }, 100);


    }


    reset() {

        this.assets = {};
        this.dataSize = 0;
        this.dataLoaded = 0;
        this.loadError = 0;
        this.imgs = [];
        this.jsons = [];
        this.audio = [];
        this.glbs = [];

    }


    _process() {

        this._loadImgs();
        this._loadJson();
        this._loadAudio();
        this._loadGlb();

    }


    _loadImgs() {

        let img;

        for (let i = 0; i < this.imgs.length; i++) {

            img = new Image();
            img._name = this.imgs[i].name;
            img._path = this.imgs[i].path;
            img._ext = this.imgs[i].ext

            img.addEventListener('load', (e) => {
                this._checkNameAvailability(e.target._name, e.target, e.target._ext);
            }, false);

            img.addEventListener('error', (e) => {
                this.loadError++;
                console.warn("AssetsLoader::", e.target._path, "error loading");
                this._incDataLoaded();
            }, false);

            img.src = this.imgs[i].path;
        }

    }



    _loadAudio() {

        let _audio;
        let audio = this.audio;
        let dataLoaded = this._incDataLoaded;
        let checkNameAvailability = this._checkNameAvailability;

        let allSoundsToLoad = audio.length;
        let soundLoaded = 0;


        for (let i = 0; i < audio.length; i++) {

            _audio = new Howl({
                src: [audio[i].path],
                sprite: audio[i].audioSprite,
                onload: function () {
                    checkNameAvailability(this._name, this, audio[i].ext);

                    soundLoaded++;

                    if (soundLoaded >= allSoundsToLoad) {
                        console.log("sound loaded");
                    }

                },
                onloaderror: function () {
                    this.loadError++;
                    console.warn(this._name, "=> error loading");
                    dataLoaded();
                }
            });
            _audio._name = audio[i].name;
            _audio._ext = audio[i].path.split(".").pop();

        }

    }



    _loadGlb() {

        for (let i = 0; i < this.glbs.length; i++) {

            let gltfObj = new GLTFLoader();
            gltfObj.resourcePath = this.glbs[i].name;
            gltfObj.load(this.glbs[i].path, gltf => {

                this._checkNameAvailability(gltf.parser.options.path, gltf, "glb");

            }, null, (error) => {
                this.loadError++;
                console.warn("AssetsLoader:: glb loading error,", error);
                this._incDataLoaded();
            });

        }

    }




    async _loadJson() {

        for (let i = 0; i < this.jsons.length; i++) {

            try {

                const data = await (await fetch(this.jsons[i].path)).json();

                this._checkNameAvailability(this.jsons[i].name, data, "json");

            } catch (error) {
                this.loadError++;
                console.warn("AssetsLoader::", this.jsons[i].path, error);
                this._incDataLoaded();

            }

        }


    }




    _incDataLoaded = () => {
        this.dataLoaded++;
    }



    _checkNameAvailability(name, data, ext) {

        if (this.assets[name]) {
            console.warn(name, "AssetsLoader::", "already assigned");
        } else {
            this.assets[name] = data;
            this.verbose && console.log("AssetsLoader::", name, "(" + ext + ") loaded");
        }
        this._incDataLoaded();

    }



    set verbose(val) {
        this._verbose = val;
    }

    get verbose() {
        return this._verbose;
    }

    get loadError() {
        return this._loadError;
    }

    set loadError(val) {
        this._loadError = val;
    }




}


export default new AssetsLoader();