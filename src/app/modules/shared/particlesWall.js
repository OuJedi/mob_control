import assets from "app/assets";
import { BoxGeometry, DoubleSide, DynamicDrawUsage, InstancedMesh, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, PlaneGeometry } from "three";
import { DEG2RAD } from "three/src/math/MathUtils";

export default class ParticlesWall extends Object3D {

    constructor(size, particleNbr = 20, particleSize = 1, particleSpeed = 1, color = 0xffffff, texture) {

        super();

        this._size = size;
        this._particleMaxSize = particleSize;
        this._particleNbr = particleNbr;
        this._particleSpeed = particleSpeed;
        this._color = color;
        this._texture = texture;


        this._pivot = new Object3D();
        this._pivot.position.y = size.z / 2;
        this.add(this._pivot);


        this._initMaterials();
        this._build();
        this._initParticles();


    }



    _build() {


        this._cadreM = new Mesh(new BoxGeometry(this._size.x, this._size.z, this._size.z), this._cadreMat);
        this._cadreM.castShadow = true;
        this._pivot.add(this._cadreM);

        this._cadreMB = new Mesh(new BoxGeometry(this._size.x - .02, this._size.z + .01, this._size.z), this._cadreBackMat);
        this._cadreMB.position.z = -.01;
        this._cadreMB.castShadow = true;
        this._pivot.add(this._cadreMB);

        this._cadreL = new Mesh(new BoxGeometry(this._size.z, this._size.y, this._size.z), this._cadreMat);
        this._cadreL.position.x = -this._size.x / 2 + this._size.z / 2;
        this._cadreL.position.y = this._size.y / 2;
        this._cadreL.castShadow = true;
        this._pivot.add(this._cadreL);

        this._cadreR = new Mesh(new BoxGeometry(this._size.z, this._size.y, this._size.z), this._cadreMat);
        this._cadreR.position.x = this._size.x / 2 - this._size.z / 2;
        this._cadreR.position.y = this._size.y / 2;
        this._cadreR.castShadow = true;
        this._pivot.add(this._cadreR);

        this._gradientMesh = new Mesh(new PlaneGeometry(this._size.x, this._size.y), this._gradientMat);
        this._gradientMesh.position.y = this._size.y / 2 - this._size.z / 2;
        this._pivot.add(this._gradientMesh);

        this._particle = new Mesh(new PlaneGeometry(1, 1), this._particuleMat);


    }


    _initParticles() {

        this._arr = [];

        for (let i = 0; i < this._particleNbr; i++) {
            let scale = Math.random() * this._particleMaxSize;
            this._arr.push({
                position: { x: -this._size.x / 2 + .1 + this._size.x * Math.random() - .1, y: Math.random() * this._size.y, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: scale, y: scale, z: scale }
            });
        }

        this._particle.geometry.computeVertexNormals();

        this._dummy = new Object3D();

        this._paricules = new InstancedMesh(this._particle.geometry, this._particuleMat, this._arr.length);
        this._paricules.instanceMatrix.setUsage(DynamicDrawUsage);
        this._paricules.position.z = .05;
        this._pivot.add(this._paricules);

        this._decaly = 0;

    }


    _initMaterials() {

        this._cadreMat = new MeshStandardMaterial({
            color: 0x000000,
            metalness: .2,
            roughness: .5,
            envMap: assets.textures.envMap
        });

        this._cadreBackMat = new MeshStandardMaterial({
            color: 0xffffff,
            metalness: .2,
            roughness: .5,
            envMap: assets.textures.envMap
        });

        this._gradientMat = new MeshStandardMaterial({
            color: 0x00aaff,
            map: assets.textures.gradientWall,
            metalness: 0,
            roughness: 1,
            transparent: true,
            envMap: assets.textures.envMap
        });

        this._particuleMat = new MeshBasicMaterial({
            color: this._color,
            map: this._texture,
            transparent: true,
            alphaTest: .1,
            side: DoubleSide
        });

    }


    set onlyParticles(val) {

        this._gradientMesh.visible = !val;
        this._cadreL.visible = !val;
        this._cadreR.visible = !val;
        this._cadreM.visible = !val;
        this._cadreMB.visible = !val;

    }

    update(delta) {

        this._decaly += this._particleSpeed;
        let _id = 0;

        for (var i = 0; i < this._arr.length; i++) {
            let posy = this._arr[i].position.y + this._decaly;
            if (posy > this._size.y - .2) {
                this._arr[i].position.y -= this._size.y - .1;
            }
            this._dummy.position.set(this._arr[i].position.x, posy, this._arr[i].position.z);
            this._dummy.rotation.set(this._arr[i].rotation.x * DEG2RAD, this._arr[i].rotation.y * DEG2RAD, this._arr[i].rotation.z * DEG2RAD);
            this._arr[i].scale && this._dummy.scale.set(this._arr[i].scale.x, this._arr[i].scale.y, this._arr[i].scale.z);
            this._dummy.updateMatrix();
            this._paricules.setMatrixAt(_id, this._dummy.matrix);
            _id++;

        }

        this._paricules.instanceMatrix.needsUpdate = true;

    }


    destroy() {

        this._paricules.count = 0;

        this._cadreMat.dispose();
        this._cadreBackMat.dispose();
        this._gradientMat.dispose();
        this._particuleMat.dispose();

        this._arr = [];

    }


}