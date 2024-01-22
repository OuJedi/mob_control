

import { Object3D, Vector3, PerspectiveCamera, Scene, AmbientLight, DirectionalLight, WebGLRenderer, EventDispatcher, CameraHelper, REVISION } from 'three';
import { OrbitControls } from 'lib/OrbitControls';
import * as CANNON from 'cannon-es';
import cannonDebugger from 'cannon-es-debugger'

import Stats from 'lib/stats.module';
import { gsap } from 'gsap';
import config from 'config';
import assets from './assets';
import tools from 'tools';
import UI from 'lib/UI';
import LevelOne from './modules/levels/levelOne';
import LevelTwo from './modules/levels/levelTwo';

const FPS = 60;
const DEBUG = false;
const CANNON_DEBUG = false;
const INFOS = false;
const GRAVITY_COEF = 2;

export default class App extends EventDispatcher {

  constructor() {

    super();

    tools.autobind(this);

    this._levelId = 0;
    this.delta = 1;
    this.camera = null;
    this.scene = null;
    this.renderer = null;
    this.stats = null;
    this.light = null;
    this._isDown = false;
    this._orbitControls = null;
    this.focusPoint = null;
    this.targeLight = new Object3D();
    this.fixedTimeStep = null;
    this.stage = null;
    this.appReady = false;

  }






  init() {


    console.log("App::init");

    document.backgroundColor = "#000000"

    document.body.style.margin = 0;
    document.body.style.display = "block";
    document.body.style["background-color"] = "#000";
    document.body.style.color = "#fff";
    document.body.style.overflow = "hidden";

    config.fps = FPS;
    config.garvityCoef = GRAVITY_COEF;

    this.init3D();

    this.init2D();

    this.initEvents();

    this.initPhysics();

    this.onResize();

    assets.addEventListener("onProgress", this.onLoadingProgress);
    assets.addEventListener("ready", this.onReady);

    this.infos();

    this.appReady = true;


  }



  onLoadingProgress(event) {

    let percent = parseInt(event.progress * 100);

    this.loadingProgressCB && this.loadingProgressCB(percent);

  }





  onReady() {

    console.log("App::onReady");

    this.onReadyCB && this.onReadyCB();

  }







  init3D() {

    console.log("App::init3D");
    config.cameraContainer = this.cameraContainer = new Object3D();

    config.camera = this.camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 5000);
    config.cameraTarget = this.focusPoint = new Vector3(0, 0, 0);

    this.camera.rotation.set(-.8, 0.0, 0.0);
    this.cameraContainer.position.set(0, 22, 24);
    this.cameraContainer.add(this.camera);

    config.scene = this.scene = new Scene();
    this.scene.visible = false;
    this.scene.add(this.cameraContainer);


    this.ambientLight = new AmbientLight(0x555555);
    this.ambientLight.intensity = 2;
    this.scene.add(this.ambientLight);



    this.light = new DirectionalLight();
    this.targeLight.position.set(-1, 0, -1);
    this.light.target = this.targeLight;
    this.light.position.set(2, 8, 2);
    this.light.castShadow = true;
    this.light.intensity = 1.3;
    this.light.shadow.camera.top = 20;
    this.light.shadow.camera.bottom = -12;
    this.light.shadow.camera.left = -10;
    this.light.shadow.camera.right = 35;
    this.light.shadow.camera.near = 0.01;
    this.light.shadow.camera.far = 100;
    this.light.shadow.mapSize.width = 1024;
    this.light.shadow.mapSize.height = 1024;
    this.light.shadow.radius = 3;
    this.light.shadow.bias = -0.001;
    config.light = this.light;


    this.cameraContainer.add(this.light);
    this.cameraContainer.add(this.light.target);


    // Needed for assets Equirectangular texture compile 
    config.renderer = this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setClearColor(0x000000);
    this.renderer.shadowMap.enabled = true;
    // this.renderer.outputColorSpace = LinearSRGBColorSpace;
    // this.renderer.physicallyCorrectLights = true;

    document.body.appendChild(this.renderer.domElement);

    console.log("REVISION:", REVISION);


    //DEBUG

    if (DEBUG) {

      this.cameraContainer.position.set(0, 0, 0);
      this.camera.position.set(-0.03, 22.48, 16.88);
      this.camera.rotation.set(-.91, 0.00, 0.00);
      this.camera.lookAt(this.focusPoint);

      this._orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
      this._orbitControls.target = this.focusPoint;
      this._orbitControls.maxPolarAngle = tools.DEG2RAD * 95;
      this._orbitControls.enableDamping = true;
      this._orbitControls.dampingFactor = .2;

    }


    //START ENGINE
    gsap.ticker.add(this.update);
    gsap.ticker.fps(FPS);


  }


  infos() {

    if (INFOS) {

      //light debug
      this.scene.add(new CameraHelper(this.light.shadow.camera));

      this.stats = new Stats();
      document.body.appendChild(this.stats.dom);

      this.nbpolyDiv = document.createElement("div");
      this.nbpolyDiv.style.position = "absolute";
      this.nbpolyDiv.style.bottom = "20px";
      this.nbpolyDiv.style["font-family"] = "arial";
      this.nbpolyDiv.style["text-shadow"] = "0px 1px black, 1px 0px black, 1px 1px black, 0px 0px black";
      document.body.appendChild(this.nbpolyDiv);

      this.drawDiv = document.createElement("div");
      document.body.appendChild(this.drawDiv);
      this.drawDiv.style.position = "absolute";
      this.drawDiv.style.bottom = "5px";
      this.drawDiv.style["font-family"] = "arial";
      this.drawDiv.style["text-shadow"] = "0px 1px black, 1px 0px black, 1px 1px black, 0px 0px black";

    }

  }




  init2D() {
    console.log("App::init2D");

    // threejs 2D layer
    config.ui = new UI(this.camera);

  }





  initEvents() {

    console.log("APP::initEvents");


    if (tools.setupIs().desktop) {
      this.renderer.domElement.addEventListener('mousedown', this.onDown, false);
      this.renderer.domElement.addEventListener('mouseup', this.onUp, false);
      // this.renderer.domElement.addEventListener('mouseleave', this.onUp, false);
      this.renderer.domElement.addEventListener('mousemove', this.onMove, false);
    } else {
      this.renderer.domElement.addEventListener('touchstart', this.onDown, false);
      this.renderer.domElement.addEventListener('touchend', this.onUp, false);
      this.renderer.domElement.addEventListener('touchmove', this.onMove, false);
    }


    window.addEventListener('resize', this.onResize, false);
    window.addEventListener("orientationchange", this.onResize, false);


  }







  setMouse(event) {

    if (event.touches) {
      config.mouse.x = event.touches[0].clientX;
      config.mouse.y = event.touches[0].clientY;

      config.mouse3d.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
      config.mouse3d.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;

    } else {
      config.mouse.x = event.clientX;
      config.mouse.y = event.clientY;

      config.mouse3d.x = (event.clientX / window.innerWidth) * 2 - 1;
      config.mouse3d.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }


  }





  onDown(event) {

    event.preventDefault();
    this.setMouse(event);

    this._isDown = true;
    this.dispatchEvent({ type: "mousedown" });

    this.stage.startGame();

  }









  onUp(event) {
    //event.preventDefault();

    this._isDown = false;
    this.dispatchEvent({ type: "mouseup" });

  }







  onMove(event) {

    this.setMouse(event);
    this._isDown && this.dispatchEvent({ type: "mousemove" });


  }








  initPhysics() {
    console.log("App::initPhysics");

    config.physic.world = new CANNON.World();
    config.physic.world.gravity.set(0, -9.82 * GRAVITY_COEF, 0); // m/s²
    // config.physic.world.allowSleep = true;
    this.fixedTimeStep = 1.0 / FPS; // seconds
    this.maxSubSteps = 10;
    // config.physic.world.solver.iterations = 20;


    config.physicsMaterial = new CANNON.Material();
    config.physicsSuperMobMaterial = new CANNON.Material();


    let physicsContactMaterial = new CANNON.ContactMaterial(config.physicsMaterial, config.physicsMaterial);
    physicsContactMaterial.restitution = 0.0;
    physicsContactMaterial.friction = 0.0;
    config.physic.world.addContactMaterial(physicsContactMaterial);

    let physicsContactSuperMobMaterial = new CANNON.ContactMaterial(config.physicsSuperMobMaterial, config.physicsSuperMobMaterial);
    physicsContactSuperMobMaterial.restitution = 0.0;
    physicsContactSuperMobMaterial.friction = 0.0;
    config.physic.world.addContactMaterial(physicsContactSuperMobMaterial);


    CANNON_DEBUG && cannonDebugger(this.scene, config.physic.world.bodies);


  }






  onResize(size) {


    console.log("APP::onResize");

    let width = size && size.width ? size.width : window.innerWidth;
    let height = size && size.height ? size.height : window.innerHeight;

    if (this.camera) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }

    this.stage && this.stage.resize && this.stage.resize(width, height);

    //Force iOS view resize 
    gsap.delayedCall(.5, () => {
      window.scrollTo(0, 1);
    })


  }




  pause(val) {
    config.pause = val;
  }




  startGame(callback) {

    console.log("App::startGame");

    config.stage = this.stage = new LevelOne();

    gsap.delayedCall(.2, () => {

      // Add content
      config.stage2d && (config.stage2d.visible = true);
      this.stage && this.scene.add(this.stage);
      //

      gsap.delayedCall(.3, () => {
        this.scene.background = assets.textures.skyMap;
        this.scene.visible = true;
        this.onResize();
        callback && callback();
      });


    });


  }










  update(a, b, c, time) {

    this.delta = b / 17;


    //Debug
    this._orbitControls && this._orbitControls.update();
    this.stats && this.stats.update();
    this.nbpolyDiv && (this.nbpolyDiv.innerText = (this.renderer.info.render.triangles - (this.scene.background != null ? 12 : 0)) + " tri");
    this.drawDiv && (this.drawDiv.innerText = (this.renderer.info.render.calls - (this.scene.background != null ? 1 : 0)) + " call");
    //

    this.renderer && this.renderer.render(this.scene, this.camera);

    if (config.pause || !this.appReady) {
      return;
    }

    config.ui && config.ui.update();
    this.stage && this.stage.update(this.delta, (config.ui && config.ui.viewSize));



    // CANNONJS //////////

    if (config.physic.world) {
      let body;

      for (let i = 0; i < config.physic.world.bodies.length; i++) {

        body = config.physic.world.bodies[i];

        if (body.mesh) {

          body.constraints.x == 1 && (body.position.x = body.mesh.position.x);
          if (body.constraints.y == 1) {
            body.position.y = body.mesh.position.y;
            body.velocity.y = 0;
          }

          body.constraints.z == 1 && (body.position.z = body.mesh.position.z);

          body.mesh.position.copy(body.position);
          body.mesh.quaternion.copy(body.quaternion);
        }

      }
      config.physic.world.step(this.fixedTimeStep, b / 1000, this.maxSubSteps);
    }

    // END CANNONJS //////////

  }




  async reset() {


    console.log("reset");

    this.appReady = false;

    config.ui.destroy();

    if (config.physic.world) {
      //Clean Physics
      while (config.physic.world.bodies.length > 0) {
        config.physic.world.removeBody(config.physic.world.bodies[0]);
      }
      console.log("world.bodies:", config.physic.world.bodies);
    }

    this.stage && this.stage.destroy();

    await tools.wait(.2);

    config.gameOver = false;
    this.pause(false);

    // // REBUILD LEVEL FROM SCRATCH
    if (this._levelId == 1) {

      this._levelId = 0;
      config.stage = this.stage = new LevelOne();

    } else {

      this._levelId++;
      config.stage = this.stage = new LevelTwo();

    }

    this.scene.add(this.stage);

    await tools.wait(.2);
    this.appReady = true;




  }


  //API interface

  startLoading() {
    assets.load();
  }


  loadinProgress(callback) {
    this.loadingProgressCB = callback;
  }

  onGameReady(callback) {
    this.onReadyCB = callback;
  }




}

