import { Vector3, Object3D, MeshStandardMaterial, Sprite, Mesh, BoxGeometry, Color, CylinderGeometry, MeshBasicMaterial, PlaneGeometry, RingGeometry } from 'three';

import { gsap } from 'gsap';
import config from 'config';
import * as CANNON from 'cannon-es';
import tools from 'tools';
import assets from 'app/assets';
import Mouse3dInteraction from 'lib/Mouse3dInteraction';
import SolidObject from '../common/solidObject';
import { DEG2RAD } from 'three/src/math/MathUtils';
import Cannon from '../player/cannon';
import MobFactory from '../pnj/mobFactory';
import Tower from './levelsModules/tower';
import Multiplier from './levelsModules/multiplier';
import Turnstile from './levelsModules/turnstile';
import GameTimer from '../shared/gameTimer';
import EndScreen from './endScreen';


export default class LevelOne extends Object3D {

    constructor() {

        super();

        tools.autobind(this);

        this.firstLaunch = true;
        this.waterMaterialVal = 0;
        this.logoVal = 3;
        this._multiplierPos = 0;

        this._initMaterial();
        this._build();
        this._initPnj();
        this._initCannonZone();
        this._initUi();
        this._initEvents();

        console.log("* Stage *");

    }



    _initMaterial() {

        this.cubeMaterial = new MeshStandardMaterial();
        this.cubeMaterial.color = new Color(0xff0000);
        this.cubeMaterial.metalness = 0;
        this.cubeMaterial.roughness = 0;
        this.cubeMaterial.envMap = assets.textures.envMap;
        this.cubeMaterial.envMapIntensity = .7;

        this.groundMaterial = new MeshStandardMaterial();
        this.groundMaterial.color = new Color(0xcccccc);
        this.groundMaterial.metalness = 0;
        this.groundMaterial.roughness = 0;
        this.groundMaterial.envMap = assets.textures.envMap;
        this.groundMaterial.envMapIntensity = 1;

        this.circleMaterial = new MeshBasicMaterial();
        this.circleMaterial.color = new Color(0xf8a7a5);
        this.circleMaterial.transparent = true;

        this.waterMaterial = new MeshBasicMaterial();
        this.waterMaterial.color = new Color(0x38c9ff);
        this.waterMaterial.map = assets.textures.water;

        this.lineMaterial = new MeshBasicMaterial();
        this.lineMaterial.map = assets.textures.line;
        this.lineMaterial.color = new Color(0xbbbbbb);
        this.lineMaterial.transparent = true;

        this.dangerMaterial = new MeshBasicMaterial();
        this.dangerMaterial.map = assets.textures.danger;
        this.dangerMaterial.color = new Color(0xbbbbbb);
        this.dangerMaterial.transparent = true;
        this.dangerMaterial.opacity = 0;

        this.handMaterial = new MeshBasicMaterial();
        this.handMaterial.map = assets.textures.hand;
        this.handMaterial.transparent = true;

    }




    _initEvents() {

        this.mouse3dInteraction = new Mouse3dInteraction();
        this.mouse3dInteraction.addEventListener("onDown", this._onMouse3dDown);
        this.mouse3dInteraction.addEventListener("onUp", this._onMouse3dUp);
        this.mouse3dInteraction.addEventListener("outSide", this._onMouse3dUp);
        this.mouse3dInteraction.addTarget(config.camera); //for trigger mouse event of 2D UI elements
        this.mouse3dInteraction.addTarget(this); //trigger mouse event of all element of this container

    }



    _build() {

        //set light 

        config.light.shadow.radius = 2;

        //build level

        this.water = new Mesh(new PlaneGeometry(60, 60), this.waterMaterial);
        this.water.rotation.x = DEG2RAD * -90;
        this.water.position.z = -13;
        this.water.position.y = -1.4;
        this.add(this.water);

        let cubeSize = new Vector3(12, 1, 34);
        this.ground = new SolidObject(
            new Mesh(new BoxGeometry(cubeSize.x, cubeSize.y, cubeSize.z)),
            new CANNON.Box(new CANNON.Vec3(cubeSize.x * .5, cubeSize.y * .5, cubeSize.z * .5)),
            null,
            config.physicsMaterial
        );
        this.ground.position.y = -1;
        this.ground.receiveShadow = true;
        this.ground.material = this.groundMaterial;
        this.ground.rigideBody = true;
        this.add(this.ground);

        this.cylinderGround = new SolidObject(
            new Mesh(new CylinderGeometry(9, 9, 1, 30, 1)),
            new CANNON.Box(new CANNON.Vec3(9, .5, 7)),
            null,
            config.physicsMaterial
        );
        this.cylinderGround.position.y = -1;
        this.cylinderGround.position.z = -20;
        this.cylinderGround.receiveShadow = true;
        this.cylinderGround.material = this.groundMaterial;
        this.cylinderGround.rigideBody = true;
        this.add(this.cylinderGround);

        const circle = new Mesh(new RingGeometry(7.5, 7.8, 32, 1, 0, 7), this.circleMaterial);
        circle.rotation.x = DEG2RAD * -90;
        circle.position.z = -20;
        circle.position.y = -.49;
        this.add(circle);

        cubeSize = new Vector3(1, 4, 50);
        this.leftCube = new SolidObject(
            new Mesh(new BoxGeometry(cubeSize.x, cubeSize.y, cubeSize.z)),
            new CANNON.Box(new CANNON.Vec3(cubeSize.x * .5, cubeSize.y * .5, cubeSize.z * .5)),
            null,
            config.physicsMaterial
        );
        this.leftCube.rigideBody = true;
        this.leftCube.material = this.cubeMaterial;
        this.leftCube.isRendred = false;
        this.leftCube.position.set(-5.5, 0, 2);
        this.add(this.leftCube);

        this.rightCube = new SolidObject(
            new Mesh(new BoxGeometry(cubeSize.x, cubeSize.y, cubeSize.z)),
            new CANNON.Box(new CANNON.Vec3(cubeSize.x * .5, cubeSize.y * .5, cubeSize.z * .5)),
            null,
            config.physicsMaterial
        );
        this.rightCube.rigideBody = true;
        this.rightCube.material = this.cubeMaterial;
        this.rightCube.isRendred = false;
        this.rightCube.position.set(5.5, 0, 2);
        this.add(this.rightCube);

        this._turnstile = new Turnstile(new Vector3(6, 1, 1), new Vector3(0, 0, 0), true);
        this._turnstile.speed = -.4;
        this._turnstile.yoyo = true;

        this.add(this._turnstile);

        let multiplierSize = new Vector3(3, 1.5, .2);
        this._multiplier = new Multiplier(multiplierSize);
        this._multiplier.position.z = 6;
        this._multiplier.position.y = multiplierSize.y / 2 - .5;
        this._multiplier.value = 2;
        this._multiplier.addEventListener("duplicate", this._onDuplicate);
        this.add(this._multiplier);

        let multiplierSize2 = new Vector3(5, 1.5, .2);
        this._multiplier2 = new Multiplier(multiplierSize2);
        this._multiplier2.position.z = -7;
        this._multiplier2.position.x = 2.5;
        this._multiplier2.position.y = multiplierSize.y / 2 - .5;
        this._multiplier2.value = 3;
        this._multiplier2.addEventListener("duplicate", this._onDuplicate);
        this.add(this._multiplier2);

    }


    _initCannonZone() {

        const line = new Mesh(new PlaneGeometry(10, 10), this.lineMaterial);
        line.rotation.x = DEG2RAD * -90;
        line.position.z = 10.95;
        line.position.y = -.49;
        this.add(line);

        this._danger = new Mesh(new PlaneGeometry(10, 10), this.dangerMaterial);
        this._danger.rotation.x = DEG2RAD * -90;
        this._danger.position.z = 12.5;
        this._danger.position.y = -.47;
        this._danger.visible = false;
        this.add(this._danger);

        this.startText = tools.getTextShape("Swipe to Shoot", assets.font3d, 0xaaaaaa, .8, 1, { x: .5, y: .5 });
        this.startText.rotation.x = DEG2RAD * -90;
        this.startText.position.z = 14;
        this.add(this.startText);

        this.hand = new Mesh(new PlaneGeometry(3, 3), this.handMaterial);
        this.hand.rotation.x = DEG2RAD * -45;
        this.hand.position.z = 13.2;
        this.hand.position.y = 2;
        this.add(this.hand);
        this._handPos = 0;


        // build cannon
        this.cannon = new Cannon();
        this.cannon.rotation.y = -Math.PI;
        this.cannon.position.z = 11.5;
        this.cannon.position.y = -.5;
        this.cannon.scale.set(1.6, 1.6, 1.6);
        this.cannon.step = window.cannonStep;
        this.cannon.feverStep = window.cannonFeverStep;
        this.cannon.addEventListener("shoot", this._onCannonShoot);
        this.add(this.cannon);

        MobFactory.addEventListener("danger", this.showDanger);
        MobFactory.addEventListener("gameOver", this.gameOver);
        MobFactory.deadLine = line;
        MobFactory.target = this._tower.position;
        MobFactory.targetLine = -10;

    }




    _initEndScreen() {

        this._screen = new EndScreen();
        this._screen.visible = false;
        config.ui.add(this._screen);

    }



    _onCannonShoot(event) {

        console.log("cannonShoot");

        let mob;
        if (event.superMob) {

            mob = MobFactory.getSuperMob("mob", "super");
            mob.position.z = this.cannon.position.z - 3;
            mob.position.x = this.cannon.position.x;
            mob.position.y = .2;
            mob.life = 3;
            mob.rotation.y = Math.PI;
            mob.speed = -window.superMobSpeed;
            this.add(mob);

        } else {

            mob = MobFactory.getMob("mob", "normal");
            mob.position.z = this.cannon.position.z - 2;
            mob.position.x = this.cannon.position.x;
            mob.position.y = -.2;
            mob.rotation.y = Math.PI;
            mob.speed = -window.mobSpeed;
            this.add(mob);

        }

        assets.fx.play("shot");

    }




    _initPnj() {

        this._tower = new Tower(assets.models.tower);
        this._tower.position.x = -3;
        this._tower.position.z = -20;
        this._tower.step = window.towerStep;
        this._tower.flow = window.towerFlow;
        this._tower.life = window.towerLife;
        this._tower.addEventListener("generate", this._onTowerAction);
        this._tower.addEventListener("destroyed", this._onTowerDestroyed);
        this.add(this._tower);

    }




    _onTowerAction(event) {

        //Ennemy
        let mob;

        if (event.enemyType == "normal") {
            mob = MobFactory.getMob("enemy");
            mob.speed = 4;
            mob.position.y = -.2;
        } else {
            mob = MobFactory.getSuperMob("enemy");
            mob.position.y = .2;
            mob.life = 3;
            mob.speed = 4;
        }

        mob.position.z = this._tower.position.z + 2;
        mob.position.x = this._tower.position.x + tools.range(-.5, .5);
        this.add(mob);

        assets.fx.play("shotenemy");

    }



    _onTowerDestroyed() {

        console.log("YOU WIN");

        assets.fx.play("win");

        config.gameOver = true;

        this._screen.win = true;
        this._screen.visible = true;

        config.app.pause(true);

        this._timer.stop();

        //NEXT SCREEN
        gsap.delayedCall(3, () => { config.app.reset(); });


    }



    _onDuplicate(event) {
        console.log("_onDuplicate:", event.origine.sizeType);

        event.origine.collider.position.z -= event.origine.sizeType == "super" ? 2 : 1;
        event.origine.collider.position.x += event.origine.colliderSize;

        for (let i = 1; i < event.val; i++) {

            let mob;
            if (event.origine.sizeType == "super") {

                mob = MobFactory.getSuperMob("mob", "super", true);
                mob.multiplierList.push(event.target);
                mob.position.copy(event.origine.collider.position);
                // mob.position.z -= mob.colliderSize;
                mob.position.x -= mob.colliderSize * 2 * i;
                mob.life = event.origine.life;
                mob.rotation.y = Math.PI;
                mob.speed = event.origine.speed;
                this.add(mob);


            } else {

                mob = MobFactory.getMob("mob", "normal", true);
                mob.multiplierList.push(event.target);
                mob.position.copy(event.origine.collider.position);
                mob.position.z -= mob.colliderSize + Math.random();
                mob.position.x -= mob.colliderSize * 2 * i;
                mob.rotation.y = Math.PI;
                mob.speed = event.origine.speed;
                this.add(mob);

            }
        }

    }


    _initUi() {

        if (config.ui && config.firstStart) {

            config.firstStart = false;
            this.logo = new Sprite();
            this.logo.name = "logo";
            this.logo.material.map = assets.textures.logo;
            this.logo.material.transparent = true;
            this.logo.scaleCoef = this.logo.material.map.height / this.logo.material.map.width;
            this.logo.scale.set(3, 3 * this.logo.scaleCoef);
            config.ui.add(this.logo);
            config.ui.visible = false;

        }


        this._timer = new GameTimer();
        this._timer.addEventListener("timeUp", this.gameOver);
        this._timer.time = window.gameTimer;
        config.ui.add(this._timer);

        this._timer.visible = false;

        this._initEndScreen();

    }



    _onMouse3dDown(event) {
        event.currentTarget.name == "logo" && console.log(event);
    }


    _onMouse3dUp(event) {

        event.currentTarget.name == "logo" && console.log(event);
    }



    showDanger() {

        console.log("showDanger");

        if (this._danger.visible) {
            return;
        }

        this._danger.visible = true;
        this.dangerMaterial.opacity = 0;
        gsap.to(this.dangerMaterial, { duration: .3, opacity: 1 });

        this._dangerTimer && this._dangerTimer.kill();
        this._dangerTimer = gsap.delayedCall(1, this.hideDanger);

    }

    hideDanger() {

        console.log("hideDanger");

        if (!this._danger.visible) {
            return;
        }

        gsap.to(this.dangerMaterial, {
            duration: 1, opacity: 0, onComplete: () => {
                this._danger.visible = false;
            }
        });

    }


    gameOver(event) {

        tools.shake(this, 40, 11, .5, true, true, true);

        console.log("YOU LOSE");

        assets.fx.play("lose");

        this._screen.win = false;
        this._screen.visible = true;

        config.app.pause(true);

        this._timer.stop();


        //NEXT SCREEN
        gsap.delayedCall(3, () => { config.app.reset(); });

    }




    startScreen(delta) {

        // console.log("startScreen");

        this._handPos += .04 * delta;
        this.hand.position.x = (Math.cos(this._handPos) * 3);


    }



    startGame() {

        if (this.firstLaunch) {
            // Launch the game
            console.log("startGame")

            this.firstLaunch = false;
            this.startText.visible = false;
            this._handPos = 0;
            this.hand.visible = false;
            this.logo && (this.logo.visible = false);
            this._timer && (this._timer.visible = true);
            this._timer && this._timer.start();
            this._tower.start();
        }


    }



    resize(w, h) {

    }




    destroy() {

        // config.app.removeEventListener("mousedown", this._mousedown);
        // config.app.removeEventListener("mouseup", this._mouseup);
        this.mouse3dInteraction.removeEventListener("onMouseInteraction", this._onMouse3dDown);
        this.mouse3dInteraction.destroy();

        this.cannon.removeEventListener("shoot", this._onCannonShoot);
        this.cannon.destroy();

        MobFactory.removeEventListener("danger", this.showDanger);
        MobFactory.removeEventListener("gameOver", this.gameOver);
        MobFactory.destroy();

        this._tower.removeEventListener("generate", this._onTowerAction);
        this._tower.destroy();

        this._multiplier.removeEventListener("duplicate", this._onDuplicate);
        this._multiplier.destroy();

        this._multiplier2.removeEventListener("duplicate", this._onDuplicate);
        this._multiplier2.destroy();

        this._timer.removeEventListener("timeUp", this.gameOver);

        this._turnstile.destroy();

        this._dangerTimer && this._dangerTimer.kill();
        this.hideDanger();

        tools.clean(this);

    }


    update(delta, viewSize) {

        this._delta = delta;

        if (this.firstLaunch) {
            this.startScreen(delta);
        }

        MobFactory.update(delta);

        this.cannon.update(delta);
        this._multiplier.update(delta);
        this._multiplier2.update(delta);

        this._multiplierPos += .02 * delta;
        this._multiplier.collider && (this._multiplier.collider.position.x = (Math.cos(this._multiplierPos) * 4));

        this._turnstile.update(delta);
        this._tower.update(delta);


        if (this.logo) {
            this.logo.position.x = 0;
            this.logo.position.y = (viewSize.y) * .3;
            this.logoVal += .03 * delta;
            let scale = Math.cos(this.logoVal) * .15;
            this.logo.scale.set(3.5 + scale, (3.5 + scale) * this.logo.scaleCoef);

            config.ui.visible = true;
        }

        if (this._timer) {
            this._timer.position.x = viewSize.x / 2 - .4;
            this._timer.position.y = viewSize.y / 2 - .5;
        }

        if (this._screen) {
            // this._screen.position.x = viewSize.x / 2;
            // this._screen.position.y = viewSize.y / 2;
        }

        if (this.text3d) {
            this.text3d.position.y = (viewSize.y) * .5 - .5;
        }

        this.mouse3dInteraction && this.mouse3dInteraction.update();

        if (this.waterMaterial) {
            this.waterMaterial.map.offset.y += .002;
            this.waterMaterialVal += .01;
            this.waterMaterial.map.offset.x = Math.cos(this.waterMaterialVal) * .2;
        }

        if (this.dangerMaterial) {
            this.dangerMaterial.map.offset.x += .002;
        }

    }


}