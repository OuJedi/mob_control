import { Vector2 } from "three";

class Config {
    constructor() {
        // this.assets = process.env.PUBLIC_URL + "/assets";
        this.assets = "assets";
        this.app = null;
        this.fps = 60;
        this.scene = null;
        this.renderer = null;
        this.camera = null;
        this.light = null;
        this.mouse3d = null;
        this.cameraContainer = null;
        this.firstLaunch = true;
        this.firstStart = true;
        this.physic = {};
        this.mouse = new Vector2(-1, -1);
        this.mouse3d = new Vector2(0, 0);
    }
}

export default new Config();