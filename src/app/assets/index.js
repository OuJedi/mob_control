
import { RepeatWrapping, Vector2, EventDispatcher, PMREMGenerator, Texture, SRGBColorSpace } from 'three';
import config from "config";
import tools from "tools";
import assetsLoader from "tools/assetsLoader";
import assetsRaw from './assetsRaw';
import { FontLoader } from 'lib/FontLoader';


class Assets extends EventDispatcher {
    constructor() {

        super();

        tools.autobind(this);

        this.textures = {};
        this.json = {};
        this.models = {};


        //Images
        assetsLoader.add({ name: "env_map", path: assetsRaw.envMap, ext: "jpg" });
        assetsLoader.add({ name: "env_map2", path: assetsRaw.envMap2, ext: "jpg" });
        assetsLoader.add({ name: "sky_map", path: assetsRaw.skyMap, ext: "jpg" });
        assetsLoader.add({ name: "confetti", path: assetsRaw.confetti, ext: "png" });
        assetsLoader.add({ name: "confetti2", path: assetsRaw.confetti2, ext: "png" });
        assetsLoader.add({ name: "sparkle", path: assetsRaw.sparkle, ext: "png" });
        assetsLoader.add({ name: "rocket", path: assetsRaw.rocket, ext: "png" });
        assetsLoader.add({ name: "logo", path: assetsRaw.logo, ext: "png" });
        assetsLoader.add({ name: "particule", path: assetsRaw.particule, ext: "png" });
        assetsLoader.add({ name: "particules", path: assetsRaw.particules, ext: "png" });
        assetsLoader.add({ name: "circle", path: assetsRaw.circle, ext: "png" });
        assetsLoader.add({ name: "water", path: assetsRaw.water, ext: "jpg" });
        assetsLoader.add({ name: "voronoi", path: assetsRaw.voronoi, ext: "jpg" });
        assetsLoader.add({ name: "line", path: assetsRaw.line, ext: "png" });
        assetsLoader.add({ name: "gauge", path: assetsRaw.gauge, ext: "png" });
        assetsLoader.add({ name: "thunder", path: assetsRaw.thunder, ext: "png" });
        assetsLoader.add({ name: "hand", path: assetsRaw.hand, ext: "png" });
        assetsLoader.add({ name: "danger", path: assetsRaw.danger, ext: "png" });
        assetsLoader.add({ name: "flare", path: assetsRaw.flare, ext: "png" });
        assetsLoader.add({ name: "cloud", path: assetsRaw.cloud, ext: "png" });
        assetsLoader.add({ name: "gradientWall", path: assetsRaw.gradientWall, ext: "png" });
        assetsLoader.add({ name: "terre", path: assetsRaw.terre, ext: "png" });
        assetsLoader.add({ name: "treeMap", path: assetsRaw.treeMap, ext: "png" });
        assetsLoader.add({ name: "timerIco", path: assetsRaw.timer_ico, ext: "png" });
        assetsLoader.add({ name: "timerBg", path: assetsRaw.timer_bg, ext: "png" });
        assetsLoader.add({ name: "bandeau", path: assetsRaw.bandeau, ext: "png" });
        assetsLoader.add({ name: "lose", path: assetsRaw.lose, ext: "png" });
        assetsLoader.add({ name: "win", path: assetsRaw.win, ext: "png" });

        //Sounds
        assetsLoader.add({
            name: "fx",
            path: assetsRaw.fx,
            ext: "mp3",
            audioSprite: {
                lose: [0, 1111.4058956916099],
                shot: [3000, 200.00000000000017],
                shotenemy: [5000, 1060.5668934240366],
                win: [8000, 3730.272108843538],
            }
        });

        //Models
        assetsLoader.add({ name: "mob", path: assetsRaw.mob, ext: "glb" });
        assetsLoader.add({ name: "superMob", path: assetsRaw.superMob, ext: "glb" });
        assetsLoader.add({ name: "cannonCart", path: assetsRaw.cannonCart, ext: "glb" });
        assetsLoader.add({ name: "cannonTrunk", path: assetsRaw.cannonTrunk, ext: "glb" });
        assetsLoader.add({ name: "tower", path: assetsRaw.tower, ext: "glb" });
        assetsLoader.add({ name: "obstacle", path: assetsRaw.obstacle, ext: "glb" });
        assetsLoader.add({ name: "tree", path: assetsRaw.tree, ext: "glb" });

        //Events
        assetsLoader.addEventListener("complete", this.onLoad);
        assetsLoader.addEventListener("progress", this.onProgress);


    }




    onProgress(e) {
        let percent = e.percent >= 1 ? .99 : e.percent;
        this.dispatchEvent({ type: "onProgress", progress: percent });
    }


    onLoad(e) {

        console.log("assets loaded");

        if (config.renderer) {
            let pmremGenerator = new PMREMGenerator(config.renderer);
            pmremGenerator.compileEquirectangularShader();


            this.textures.envMap = new Texture(e.assets.env_map);
            this.textures.envMap.needsUpdate = true;
            this.textures.envMap = pmremGenerator.fromEquirectangular(this.textures.envMap).texture;

            this.textures.envMap2 = new Texture(e.assets.env_map2);
            this.textures.envMap2.needsUpdate = true;
            this.textures.envMap2 = pmremGenerator.fromEquirectangular(this.textures.envMap2).texture;

            this.textures.skyMap = new Texture(e.assets.sky_map);
            this.textures.skyMap.needsUpdate = true;
            this.textures.skyMap = pmremGenerator.fromEquirectangular(this.textures.skyMap).texture;

        }

        this.textures.confetti = new Texture(e.assets.confetti);
        this.textures.confetti.needsUpdate = true;
        this.textures.confetti.anisotropy = 12;

        this.textures.confetti2 = new Texture(e.assets.confetti2);
        this.textures.confetti2.needsUpdate = true;
        this.textures.confetti2.anisotropy = 12;

        this.textures.sparkle = new Texture(e.assets.sparkle);
        this.textures.sparkle.needsUpdate = true;
        this.textures.sparkle.anisotropy = 12;

        this.fx = e.assets.fx;

        this.models.mob = e.assets.mob;
        this.models.superMob = e.assets.superMob;
        this.models.cannonCart = e.assets.cannonCart;
        this.models.cannonTrunk = e.assets.cannonTrunk;
        this.models.tower = e.assets.tower;
        this.models.obstacle = e.assets.obstacle;
        this.models.tree = e.assets.tree;


        this.textures.rocket3d = new Texture(e.assets.rocket);
        this.textures.rocket3d.needsUpdate = true;
        this.textures.rocket3d.width = e.assets.rocket.width;
        this.textures.rocket3d.height = e.assets.rocket.height;

        this.textures.logo = new Texture(e.assets.logo);
        this.textures.logo.needsUpdate = true;
        this.textures.logo.width = e.assets.logo.width;
        this.textures.logo.height = e.assets.logo.height;

        this.textures.particule = new Texture(e.assets.particule);
        this.textures.particule.needsUpdate = true;
        this.textures.particule.width = e.assets.particule.width;
        this.textures.particule.height = e.assets.particule.height;

        this.textures.particules = new Texture(e.assets.particules);
        this.textures.particules.needsUpdate = true;
        this.textures.particules.width = e.assets.particules.width;
        this.textures.particules.height = e.assets.particules.height;

        this.textures.circle = new Texture(e.assets.circle);
        this.textures.circle.needsUpdate = true;

        this.textures.water = new Texture(e.assets.water);
        this.textures.water.needsUpdate = true;
        this.textures.water.wrapS = this.textures.water.wrapT = RepeatWrapping;
        this.textures.water.repeat = new Vector2(6, 6);
        this.textures.water.anisotropy = 12;

        this.textures.voronoi = new Texture(e.assets.voronoi);
        this.textures.voronoi.needsUpdate = true;

        this.textures.line = new Texture(e.assets.line);
        this.textures.line.needsUpdate = true;

        this.textures.gauge = new Texture(e.assets.gauge);
        this.textures.gauge.needsUpdate = true;
        this.textures.gauge.width = e.assets.gauge.width;
        this.textures.gauge.height = e.assets.gauge.height;

        this.textures.thunder = new Texture(e.assets.thunder);
        this.textures.thunder.needsUpdate = true;
        this.textures.thunder.width = e.assets.thunder.width;
        this.textures.thunder.height = e.assets.thunder.height;

        this.textures.hand = new Texture(e.assets.hand);
        this.textures.hand.needsUpdate = true;
        this.textures.hand.width = e.assets.hand.width;
        this.textures.hand.height = e.assets.hand.height;

        this.textures.danger = new Texture(e.assets.danger);
        this.textures.danger.needsUpdate = true;
        this.textures.danger.wrapS = this.textures.danger.wrapT = RepeatWrapping;

        this.textures.flare = new Texture(e.assets.flare);
        this.textures.flare.needsUpdate = true;

        this.textures.cloud = new Texture(e.assets.cloud);
        this.textures.cloud.needsUpdate = true;

        this.textures.gradientWall = new Texture(e.assets.gradientWall);
        this.textures.gradientWall.needsUpdate = true;
        this.textures.gradientWall.width = e.assets.gradientWall.width;
        this.textures.gradientWall.height = e.assets.gradientWall.height;

        this.textures.terre = new Texture(e.assets.terre);
        this.textures.terre.needsUpdate = true;

        this.textures.treeMap = new Texture(e.assets.treeMap);
        this.textures.treeMap.needsUpdate = true;

        this.textures.timerBg = new Texture(e.assets.timerBg);
        this.textures.timerBg.needsUpdate = true;
        this.textures.timerBg.width = e.assets.timerBg.width;
        this.textures.timerBg.height = e.assets.timerBg.height;

        this.textures.bandeau = new Texture(e.assets.bandeau);
        this.textures.bandeau.needsUpdate = true;
        this.textures.bandeau.width = e.assets.bandeau.width;
        this.textures.bandeau.height = e.assets.bandeau.height;


        this.textures.win = new Texture(e.assets.win);
        this.textures.win.needsUpdate = true;
        this.textures.win.width = e.assets.win.width;
        this.textures.win.height = e.assets.win.height;

        this.textures.lose = new Texture(e.assets.lose);
        this.textures.lose.needsUpdate = true;
        this.textures.lose.width = e.assets.lose.width;
        this.textures.lose.height = e.assets.lose.height;


        for (const key in this.textures) {
            if (Object.hasOwnProperty.call(this.textures, key)) {
                this.textures[key].colorSpace = SRGBColorSpace;
            }
        }


        this.dispatchEvent({ type: "ready", progress: 1 });

    }



    // Start loading all assets
    load() {

        //Load Facedatas for 3D font
        this.fontLoader = new FontLoader();
        this.fontLoader.load(assetsRaw.font3d, font => {
            this.font3d = font;
            console.log("Fonts3d loaded");
            assetsLoader.verbose = true;
            assetsLoader.load();
        });

    }





}

export default new Assets();