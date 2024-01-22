
import assets from "app/assets";
import config from "config";
import { Color, DoubleSide, Mesh, MeshStandardMaterial, Object3D, PlaneBufferGeometry, PlaneGeometry, SpriteMaterial, Vector2, Vector3 } from "three";
import { DEG2RAD } from "three/src/math/MathUtils";
import tools from "tools";


export default class Particules extends Object3D {


    constructor(options = {}) {
        super();

        this._pause = false;

        //options
        this.loop = options.loop != null ? options.loop : true;
        this.particlesMax = options.particlesMax || 200;
        this.life = options.life || .8;
        this.delay = options.delay || .8;
        this.emitterShape = options.emitterShape || "circle"; //circle  //square
        this.emitterSize = options.emitterSize || new Vector3(.0001, .1, .03);//Vector3
        this.dispersionCoef = options.dispersionCoef || 1.042;//Number
        this.emitterVelocity = options.emitterVelocity || new Vector3(0, .05, 0);//Vector3
        this.gravity = options.gravity || new Vector3(0, -.025, 0);//Vector3
        this.variationSpeed = options.variationSpeed || 0;
        this.variationDistance = options.variationDistance || 0;
        this.rotationSpeed = options.rotationSpeed != null ? options.rotationSpeed : new Vector3(.2, .2, .2);
        this.planePosition = options.planePosition; //Number
        this.colors = options.colors || [0xe20000, 0xff9500, 0xffe300, 0x12cf6b, 0x0065ff, 0xcf125e, 0xcf125e];
        this.particulTexture = options.particulTexture || assets.textures.sparkle;  //Texture
        this.billboard = options.billboard || false; //Bool (SpriteMaterial)
        this.castShadow = options.castShadow != null ? options.castShadow : true; //Bool (SpriteMaterial)
        this.receiveShadow = options.re != null ? options.receiveShadow : true; //Bool (SpriteMaterial)
        this.particuleStartScale = options.particuleStartScale != null ? options.particuleStartScale : 2;
        this.particuleEndScale = options.particuleEndScale != null ? options.particuleEndScale : 2;
        this.friction = options.friction != null ? (options.friction < 0 ? 0 : options.friction > 1 ? 1 : 1 - options.friction) : 1; // 0 < friction < 1
        this.simulationSpace = options.simulationSpace != null ? options.simulationSpace : "local"; //local or world
        //end Options

        this.lifeStep = .01;
        this.delayStep = .01;

        this.particuleWidth = .064;
        this.particuleHeight = .064;


        this._show = false;
        this.visible = false;

        this.meshMaterial = new MeshStandardMaterial();
        this.meshMaterial.color = new Color(0xffffff);
        this.meshMaterial.transparent = true;
        this.meshMaterial.metalness = 0.1;
        this.meshMaterial.roughness = 1;
        this.meshMaterial.map = this.particulTexture;
        this.meshMaterial.side = DoubleSide;
        this.meshMaterial.alphaTest = .7;
        // this.meshMaterial.depthTest = false;
        this.meshMaterial.envMap = assets.textures.envMap;
        this.meshMaterial.envMapIntensity = .6;


        this.mesh = new Mesh(new PlaneBufferGeometry(this.particuleWidth, this.particuleHeight));
        this.mesh.material = this.meshMaterial;

        this.arr = [];

        for (let i = 0; i < this.particlesMax; i++) {

            let pos;
            if (this.emitterShape == "square") {//square
                pos = new Vector3(
                    tools.range(-this.emitterSize.x, this.emitterSize.x),
                    tools.range(-this.emitterSize.y, this.emitterSize.y),
                    tools.range(-this.emitterSize.z, this.emitterSize.z)
                );
            } else { // circle
                let _pos = tools.angle2pos({ x: 0, y: 0 }, tools.range(this.emitterSize.x, this.emitterSize.z), tools.range(0, 360));
                pos = new Vector3(_pos.x, tools.range(-this.emitterSize.y, this.emitterSize.y), _pos.y);
            }

            const scale = this.particuleStartScale;
            const data = {
                color: new Color().setHex(this.colors[parseInt(tools.range(0, this.colors.length - .001))]),
                posX: Math.random() * 1000,
                posZ: Math.random() * 1000,
                initPos: { x: pos.x, y: pos.y, z: pos.z },
                position: { x: pos.x, y: pos.y, z: pos.z },
                __position: { x: pos.x, y: pos.y, z: pos.z },
                currentPosition: null,
                rotation: { x: Math.random() * DEG2RAD * 360, y: Math.random() * DEG2RAD * 360, z: Math.random() * DEG2RAD * 360 },
                initScale: { x: scale, y: scale, z: scale },
                scale: { x: 0, y: 0, z: 0 },
                life: 0,
                delay: tools.range(0, this.delay),
                dispersionCoef: this.dispersionCoef,
                dispersionPos: { x: pos.x, y: pos.y, z: pos.z },
                velocity: { ...this.emitterVelocity },
                friction: this.friction //frictionCoef

            }
            this.arr.push(data);
        }

        this.instances = tools.getInstances(this.mesh, this.arr, this.particlesMax, this.billboard && config.camera);
        this.instances.castShadow = this.castShadow;
        this.instances.receiveShadow = this.receiveShadow;
        this.add(this.instances);


    }

    set show(val) {
        this._show = val;
        if (val) {
            this.visible = true;
        }
    }


    get show() {
        return this._show;
    }



    get material() {
        return this.instances.material;
    }


    set material(val) {
        return this.instances.material = val;
    }


    set pause(val) {
        this._pause = val;
    }


    reset() {

        this.visible = false;

        for (let i = 0; i < this.arr.length; i++) {
            const data = this.arr[i];

            data.position.y = data.initPos.y;
            data.end = false;
        }


    }





    destroy() {

        this.visible = false;
        this.arr = [];
        this.instances.clear();

        tools.clean(this);


    }




    update() {



        for (let i = 0; i < this.arr.length; i++) {
            const data = this.arr[i];



            if (data.delay >= this.delay) {



                // Acceleration, friction, gravity + scale et rotation
                if (!data.end) {

                    data.scale.x = data.initScale.x;
                    data.scale.y = data.initScale.y;
                    data.scale.z = data.initScale.z;

                    data.rotation.x += this.rotationSpeed.x;
                    data.rotation.y += this.rotationSpeed.y;
                    data.rotation.z += this.rotationSpeed.z;




                    data.velocity.x *= data.friction;
                    data.velocity.y *= data.friction;
                    data.velocity.z *= data.friction;


                    data.__position.x += this.gravity.x + data.velocity.x;
                    data.__position.y += this.gravity.y + data.velocity.y + data.velocity.y * Math.random() * 2;
                    data.__position.z += this.gravity.z + data.velocity.z;


                }




                // Move
                if (this.simulationSpace == "world") {

                    //World
                    data.position.x = data.__position.x - this.position.x + data.currentPosition.x;
                    data.position.y = data.__position.y - this.position.y + data.currentPosition.y;
                    data.position.z = data.__position.z - this.position.z + data.currentPosition.z;



                } else {

                    //Local
                    data.position.x = data.__position.x;
                    data.position.y = data.__position.y;
                    data.position.z = data.__position.z;

                }


                // Dispersion
                if (!data.end) {

                    data.dispersionPos.x *= data.dispersionCoef;
                    data.dispersionPos.y *= data.dispersionCoef;
                    data.dispersionPos.z *= data.dispersionCoef;

                    data.posX += this.variationSpeed;
                    data.posZ += this.variationSpeed;

                }

                data.position.x += data.dispersionPos.x + Math.cos(data.posX) * this.variationDistance;
                data.position.y += data.dispersionPos.y;
                data.position.z += data.dispersionPos.z + Math.sin(data.posZ) * this.variationDistance;


                !this._pause && (data.life += this.lifeStep);


            } else {

                if (!this._pause) {
                    data.delay += this.delayStep;
                    data.currentPosition = { ...this.position };
                }

            }






            if (data.life >= this.life) {


                if (this.loop && this._show) {

                    data.life = 0;
                    data.__position = { ...data.initPos };
                    data.currentPosition = { ...this.position };
                    data.velocity = { ...this.emitterVelocity };
                    data.dispersionCoef = this.dispersionCoef;
                    data.dispersionPos = { ...data.initPos };
                    data.friction = this.friction;

                } else {

                    !data.end && !this._show && this.arr.splice(i, 1);

                }

            } else {


                !data.end && !this._show && this.arr.splice(i, 1);

            }


            if (this._show && !this.loop && this.planePosition != null && data.position.y + this.position.y <= this.planePosition && data.position.y) {

                data.scale.x = this.particuleEndScale;
                data.scale.y = this.particuleEndScale;
                data.scale.z = this.particuleEndScale;

                data.rotation.x = 90 * DEG2RAD;
                data.rotation.y = 0;
                data.position.y = this.planePosition - this.position.y + 0.01;
                data.end = true;

            }






        }


        this.instances.update(this.arr);

    }


}