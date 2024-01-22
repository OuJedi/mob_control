import { Vector3, Object3D, MeshStandardMaterial, Sprite, Mesh, BoxGeometry, Color, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace } from 'three';

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
import Obstacle from './levelsModules/obstacle';
import Forest from './levelsModules/forest';
import GameTimer from '../shared/gameTimer';
import EndScreen from './endScreen';



export default class LevelTwo extends Object3D {

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
        this.groundMaterial.color = new Color(0xffffff);
        this.groundMaterial.map = assets.textures.terre;
        this.groundMaterial.map.colorSpace = SRGBColorSpace;
        this.groundMaterial.metalness = 0;
        this.groundMaterial.roughness = 0;
        this.groundMaterial.envMap = assets.textures.envMap;
        this.groundMaterial.envMapIntensity = .7;

        this.circleMaterial = new MeshBasicMaterial();
        this.circleMaterial.color = new Color(0xf8a7a5);
        this.circleMaterial.transparent = true;

        this.waterMaterial = new MeshBasicMaterial();
        this.waterMaterial.color = new Color(0x38c9ff);
        this.waterMaterial.map = assets.textures.water;

        this.lineMaterial = new MeshBasicMaterial();
        this.lineMaterial.map = assets.textures.line;
        this.lineMaterial.color = new Color(0xffffff);
        this.lineMaterial.transparent = true;

        this.dangerMaterial = new MeshBasicMaterial();
        this.dangerMaterial.map = assets.textures.danger;
        this.dangerMaterial.color = new Color(0xffffff);
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


        let cubeSize = new Vector3(50, 1, 100);
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
        this.ground.scale.set(.8, .7, 1)
        this.add(this.ground);



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


        this._turnstile = new Turnstile(new Vector3(4, 1, .5), new Vector3(-3, 0, -7), false);
        this._turnstile.speed = .4;
        this.add(this._turnstile);

        this._turnstile2 = new Turnstile(new Vector3(6, 1, .5), new Vector3(2.1, 0, -7), false);
        this._turnstile2.speed = -.4;
        this.add(this._turnstile2);


        let multiplierSize = new Vector3(3, 1.5, .2);
        this._multiplier = new Multiplier(multiplierSize);
        this._multiplier.position.z = 6;
        this._multiplier.position.y = multiplierSize.y / 2 - .5;
        this._multiplier.value = 2;
        this._multiplier.addEventListener("duplicate", this._onDuplicate);
        this.add(this._multiplier);

        let multiplierSize2 = new Vector3(3, 1.5, .2);
        this._multiplier2 = new Multiplier(multiplierSize2);
        this._multiplier2.position.z = -12;
        this._multiplier2.position.x = 0;
        this._multiplier2.position.y = multiplierSize.y / 2 - .5;
        this._multiplier2.value = 3;
        this._multiplier2.addEventListener("duplicate", this._onDuplicate);
        this.add(this._multiplier2);


        let pos = new Vector3(3.7, 0, 0);
        this._obstacle = new Obstacle();
        this._obstacle.position.copy(pos);
        this._obstacle.setCollidersPos(pos, true);
        this.add(this._obstacle);

        pos = new Vector3(3.7, 0, -12);
        this._obstacle = new Obstacle();
        this._obstacle.position.copy(pos);
        this._obstacle.setCollidersPos(pos, true);
        this.add(this._obstacle);

        pos = new Vector3(-3.7, 0, -3);
        this._obstacle = new Obstacle();
        this._obstacle.position.copy(pos);
        this._obstacle.setCollidersPos(pos, false);
        this.add(this._obstacle);

        pos = new Vector3(-3.5, 0, 0);
        this._obstacle = new Obstacle();
        this._obstacle.position.copy(pos);
        this._obstacle.setCollidersPos(pos, true);
        this.add(this._obstacle);

        pos = new Vector3(-3.7, 0, 3);
        this._obstacle = new Obstacle();
        this._obstacle.position.copy(pos);
        this._obstacle.setCollidersPos(pos, false);
        this.add(this._obstacle);


        let treeArr = [
            new Vector3(4, -1, 7),
            new Vector3(-6, -1, 8),
            new Vector3(-7, -1, 0),
            new Vector3(6, -1, 3),
            new Vector3(5, -1, -3),
            new Vector3(6, -1, -6),
            new Vector3(5, -1, -10),
            new Vector3(7, -1, -16),
            new Vector3(-6, -1, -3),
            new Vector3(-8, -1, -10),
            new Vector3(-6, -1, -17)
        ];
        let tree;

        for (let i = 0; i < treeArr.length; i++) {
            tree = new Forest();
            tree.position.copy(treeArr[i]);
            tree.rotation.y = Math.random() * DEG2RAD * 360;
            this.add(tree);
        }


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

        this.startText = tools.getTextShape("Swipe to Shoot", assets.font3d, 0xffffff, .8, 1, { x: .5, y: .5 });
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

        console.log("cannonShoot ", event.superMob);

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
        this._tower.position.x = 0;
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

        this._timer.stop();

        this._screen.win = true;
        this._screen.visible = true;

        config.gameOver = true;

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
            this.logo.visible = true;

        }


        this._timer = new GameTimer();
        this._timer.addEventListener("timeUp", this.gameOver);
        this._timer.time = 20;
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
        this._turnstile2.destroy();

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

        this._multiplier2.collider && (this._multiplier2.collider.position.x = -(Math.cos(this._multiplierPos) * 2) - 1);

        this._turnstile.update(delta);
        this._turnstile2.update(delta);

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