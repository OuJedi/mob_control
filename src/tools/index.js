import { Object3D, InstancedMesh, UniformsUtils, ShaderLib, ShaderMaterial, Vector3, MeshBasicMaterial, Color, Mesh, DoubleSide, ShapeBufferGeometry, Vector2, ShapeGeometry } from 'three';
import * as CANNON from 'cannon-es';
import config from 'config';
import gsap from 'gsap/all';


class Tools {
    constructor() {
        console.log("Tools")

        this.parseObject = this.parseObject.bind(this);

        this.DEG2RAD = 0.0174533;
        this.RAD2DEG = 57.2958;

        this.screen2WorldVectorPos = new Vector3();
        this.screen2WorldVectorDir = new Vector3();
        this.screen2WorldVector = new Vector3();

    }

    async load(path, callback) {
        const data = await (await fetch(path)).json();
        callback(data);
    }



    angle2pos(centerPoint, rayon, angle) {
        var posX = centerPoint.x + (rayon * Math.cos((Math.PI) * (angle / 180)));
        var posY = centerPoint.y + (rayon * Math.sin((Math.PI) * (angle / 180)));
        return { x: posX, y: posY };
    }


    pos2angle(centerPoint, position) {
        return Math.atan2(centerPoint.y - position.y, centerPoint.x - position.x) * (180 / Math.PI);
    }


    toPoint(e, point = { x: 0, y: 0 }, offset = { x: 5, y: 5 }) {
        if (!e) {
            return point;
        }
        var source = e.changedTouches ? e.changedTouches[0] : (e.touches ? e.touches[0] : e);
        point.x = source.clientX - offset.x;
        point.y = source.clientY - offset.y + window.pageYOffset;
        return point;
    }

    distance(p0, p1) {
        return Math.sqrt((p1.x - p0.x) * (p1.x - p0.x) + (p1.y - p0.y) * (p1.y - p0.y));
    }



    distance3d(p0, p1) {
        return Math.sqrt((p1.x - p0.x) * (p1.x - p0.x) + (p1.z - p0.z) * (p1.z - p0.z));
    }




    getMovement(posRef, point) {

        var directionX;
        var directionY;

        posRef.x1 = posRef.x2;
        posRef.x2 = point.x;
        directionX = (point.x > posRef.x1) ? 1 : -1;

        posRef.y1 = posRef.y2;
        posRef.y2 = point.y;
        directionY = (point.y > posRef.y1) ? 1 : -1;


        return { x: directionX * this.distance({ x: posRef.x1, y: 0 }, { x: posRef.x2, y: 0 }), y: directionY * this.distance({ x: 0, y: posRef.y1 }, { x: 0, y: posRef.y2 }) };

    }







    /*
    Get Shape 2D size from points array //TODO size with rotation
    */

    getBoundingBox(shape = []) {

        var a = 9999, b = 0, c = 9999, d = 0;
        shape.map(pos => {
            a = Math.min(a, pos.x);
            b = Math.max(b, pos.x);
            c = Math.min(c, pos.y);
            d = Math.max(d, pos.y);
        });

        return { x: a, y: c, w: (b - a), h: (d - c) }
    }





    /*
    Get instances 3D Mesh (ThreeJS)
    */


    getInstances(mesh, arr, count, camera = null) {


        var mat = mesh.material;
        var geo = mesh.geometry;

        var _dummy = new Object3D();
        var _mesh = new InstancedMesh(geo, mat, count);
        _mesh.castShadow = true;

        _mesh.update = (arr, isQuaternion = false) => {
            if (!arr) {
                return
            }

            arr.splice(0, arr.length - count);

            _mesh.count = arr.length;
            _mesh.childrenArr = arr;


            for (let i = 0; i < arr.length; i++) {

                _dummy.position.copy(arr[i].position);

                if (camera) {
                    _dummy.lookAt(camera.position);
                    //edit manualy if needed
                    // _dummy.rotation.y = 0;
                    // _dummy.rotation.z = 0;
                } else {

                    if (isQuaternion) {
                        _dummy.quaternion.copy(arr[i].rotation);
                    } else {
                        _dummy.rotation.x = arr[i].rotation.x;
                        _dummy.rotation.y = arr[i].rotation.y;
                        _dummy.rotation.z = arr[i].rotation.z;
                    }
                }
                _dummy.scale.copy(arr[i].scale);
                _dummy.updateMatrix();
                _mesh.setMatrixAt(i, _dummy.matrix);

                if (arr[i].color) {
                    _mesh.setColorAt(i, arr[i].color);
                    // console.log(arr[i].rotation.x)
                }


            }


            _mesh.instanceMatrix.needsUpdate = true;

        }

        _mesh.clear = () => {
            console.log("instance clear");
            _mesh.count = 0;
        };

        _mesh.update(arr);

        return _mesh;

    }






    getMaxByProperty(arr, property) {

        let pr0 = property.split('.')[0];
        let pr1 = property.split('.')[1];
        let val;
        let max = 0;
        let obj;
        for (let i = arr.length - 1; i >= 0; i--) {
            val = pr1 ? arr[i][pr0][pr1] : arr[i][pr0];

            if (val >= max) {
                max = val;
                obj = arr[i];
            }
        }

        return obj;

    }


    match(regex, userAgent) {
        return (userAgent || '').search(regex) !== -1;
    }


    /**
     * how to use : setupIs().mobile 
     */

    setupIs(req, target = null) {
        const ua = req ? req.headers['user-agent'] : navigator.userAgent;

        // Setup is
        const is = target || {}

        // Browsers
        this.match(/Trident\/|MSIE/, ua) && (is.ie = true);
        this.match('Edge/', ua) && (is.edge = true);
        this.match('Firefox/', ua) && (is.firefox = true);
        this.match('Chrome/', ua) && (is.chrome = true);
        this.match('Safari', ua) && !this.match('Chrome', ua) && (is.safari = true);
        this.match(/(iPhone|iPad|iPod)/, ua) && (is.ios = true);
        this.match('Android', ua) && (is.android = true);

        // Devices
        (this.match(/iPad/i, ua) || (this.match(/Android/i, ua) && !this.match(/Mobile/i, ua))) && (is.tablet = true);
        ((is.ios || is.android) && !is.tablet) && (is.mobile = true);
        (!is.mobile && !is.tablet) && (is.desktop = true);

        // Images
        is.images = [
            (is.chrome || is.firefox) ? 'webm' : null,
            'png',
            'jpg',
        ].filter(item => item !== null);

        return is
    }




    /**
     * remove and clean 3D object
     */

    clean(displayObject) {

        if (!displayObject || displayObject.dontdestroy) {
            return;
        }

        if (displayObject.isMesh || displayObject.type == "Sprite") {
            displayObject.parent && displayObject.parent.remove(displayObject);
            displayObject.geometry.dispose();
            displayObject.material && displayObject.material.dispose();
        } else {
            while (displayObject.children.length > 0) {
                let obj = displayObject.children[0];
                if (obj.isMesh || obj.type == "Sprite") {
                    displayObject.remove(obj);
                    obj.geometry.dispose();
                    obj.material && obj.material.dispose();
                } else if (obj.children && obj.children.length > 0 && !obj.dontDestroy) {
                    this.clean(obj);
                } else {
                    displayObject.remove(obj);
                }
            }
        }

    }




    hitTest(a, b) {
        return this.distance({ x: a.position.x, y: 0 }, { x: b.position.x, y: 0 }) < a.size.x / 2 + b.size.x / 2 &&
            this.distance({ x: 0, y: a.position.z }, { x: 0, y: b.position.z }) < a.size.z / 2 + b.size.z / 2 ? { x: a.position.x < b.position.x ? -1 : a.position.x > b.position.x ? 1 : 0, y: a.position.z < b.position.z ? 1 : a.position.z > b.position.z ? -1 : 0 } : false;
    }



    hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }


    // 3D model loaded
    parseObject(obj) {

        let _mesh;

        if (obj.type == "SkinnedMesh" || obj.type == "Mesh") {

            _mesh = obj;

        } else {
            obj.children.map((object) => {

                if (object.children && object.children.length > 0) {
                    this.parseObject(object);
                } else {
                    if (object.type == "SkinnedMesh" || object.type == "Mesh") {
                        _mesh = object;
                    }
                }

            });

        }

        return _mesh;

    }







    //* DOM VERSION *//
    loadFont(fonts, callback) {

        var strTest = "giItTWQy01234&@=-i?0";

        var _noFont = document.createElement("div");
        document.body.appendChild(_noFont);
        _noFont.innerText = strTest;
        _noFont.style.display = "inline";
        _noFont.style.visibility = "hidden";
        _noFont.style.position = "fixed";

        var _myFont = document.createElement("div");
        document.body.appendChild(_myFont);
        _myFont.innerText = strTest;
        _myFont.style.display = "inline";
        _myFont.style.visibility = "hidden";
        _myFont.style.position = "fixed";


        tryLoad();

        var id = 0;
        function tryLoad() {

            var timer = setInterval(function () {

                _myFont.style.fontFamily = fonts[id];
                if (_noFont.getBoundingClientRect().width !== _myFont.getBoundingClientRect().width) {
                    console.log(fonts[id] + " loaded");
                    if (id >= fonts.length - 1) {
                        clearInterval(timer);
                        document.body.removeChild(_noFont);
                        document.body.removeChild(_myFont);
                        setTimeout(() => {
                            callback();
                        }, 100);
                    } else {
                        id++;
                    }
                }

            }, 100);
        }
    };





    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }



    range(min, max) {

        return min + (max - min) * Math.random();

    }








    //Add body to CannonJS world

    addPhysics(mesh, mass, shape, offset, fixedRotation, material) {

        if (!config.physic.world) {
            return;
        }

        let position = new CANNON.Vec3();
        let quaternion = new CANNON.Quaternion();

        if (mesh) {
            position.copy(mesh.position);
            quaternion.copy(mesh.quaternion);
        }

        let body = new CANNON.Body({
            position: position,
            quaternion: quaternion,
            mass: mass,
            fixedRotation: fixedRotation,
            material: material
        });

        body.addShape(shape, offset);

        body.mesh = mesh;
        mesh && (mesh.body = body);

        config.physic.world.addBody(body);

        return body;


    }




    /**
     get the ShortestAngle between 2 angles 
     from : radian angle
     to : radian angle
    retrun object from -> to
   */


    getShortestAngle(from, to) {

        let angle;
        let staticAngle = (((from * this.RAD2DEG) / 360 % 1) * 360);
        to = (((to * this.RAD2DEG) / 360 % 1) * 360);
        if (staticAngle - to <= 180) {
            if (Math.abs(staticAngle - to) > 180) {
                angle = -(360 - to);
            } else {
                angle = to;
            }
        } else {
            angle = 180 + (to + 180);
        }
        return { to: angle * this.DEG2RAD, from: staticAngle * this.DEG2RAD };

    }






    /**get pixel color
     * from context canvas
     * canvasContext : Context2D
     * x : int
     * y : int
     * return hexadecimal
     */

    getPixel(canvasContext, x, y) {
        var p = canvasContext.getImageData(x, y, 1, 1).data;
        var hex = "#" + ("000000" + this.rgbToHex(p[0], p[1], p[2])).slice(-6);
        return hex;
    }

    rgbToHex(r, g, b) {
        if (r > 255 || g > 255 || b > 255)
            throw "Invalid color component";
        return ((r << 16) | (g << 8) | b).toString(16);
    }









    /**
     * Extend a material
     */

    /**
     * 
     * @param {*} id 
     * @param {THREE.Material} baseMaterial 
     * @param {Object} uniforms 
     * @param {String} vertex {uniformsDefinition String, core String}
     * @param {String} fragment {uniformsDefinition String, core String}
     */

    extendMaterial(id, baseMaterial, uniforms = null, vertex = null, fragment = null) {

        baseMaterial.onBeforeCompile = (shader) => {


            shader.uniforms = { ...shader.uniforms, ...uniforms }

            shader.fragmentShader = fragment.uniformsDefinition + shader.fragmentShader;
            shader.fragmentShader = shader.fragmentShader.replace('#include <dithering_fragment>', '#include <dithering_fragment>\n' + fragment.core);

            shader.vertexShader = vertex.uniformsDefinition + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace('#include <uv_vertex>', '#include <uv_vertex>\n' + vertex.core);

            baseMaterial.userData.shader = shader;

            // console.log("fragment.core:", fragment.core)
            // console.log("shader:", shader.fragmentShader)


        };

        baseMaterial.customProgramCacheKey = function () {
            return id;
        };
    }







    /**
     * 
     * @param {THREE.Object3D} object 
     * @param {Number} step  
     * @param {Vector3} position 
     * @returns {Vector3}
     */

    forward(object, step, position) {

        let anglexz = object.rotation.y * this.RAD2DEG - 90;
        let anglexy = 180 - object.rotation.x * this.RAD2DEG;

        let posxz = this.angle2pos({ x: object.position.x, y: object.position.z }, step, anglexz);
        let posxy = this.angle2pos({ x: object.position.z, y: object.position.y }, step, anglexy);

        if (position) {
            position.set(posxz.x, posxy.y, posxz.y);
            return;
        }

        return new Vector3(posxz.x, posxy.y, posxz.y);

    }








    /**
    * 
    * @param {Array} a 
    */

    clearArray(a) {
        while (a.length > 0) {
            a.pop();
        }
    }






    /**
     * Move Object3D to z=0 and screen point (real screen size),
     * not work with rotated camera
     * @param {Vector2} screenPoint viewport width / height 
     * @param {Camera} camera must be perpendicular to front plane in the scene
     * @param {Vector2} offset
     * @returns 
     */



    world2Screen(screenPoint, camera, offset) {

        let pos = this.screen2WorldVectorPos;
        let dir = this.screen2WorldVectorDir;

        pos.set(
            -1.0 + 2.0 * screenPoint.x / window.innerWidth,
            -1.0 + 2.0 * screenPoint.y / window.innerHeight,
            0.5
        ).unproject(camera);

        // Calculate a unit vector from the camera to the projected position
        dir.copy(pos).sub(camera.position).normalize();

        // Project onto z=0
        let distance = -camera.position.z / dir.z;
        this.screen2WorldVector.copy(camera.position).add(dir.multiplyScalar(distance));
        this.screen2WorldVector.y *= -1;
        this.screen2WorldVector.x += offset.x;
        this.screen2WorldVector.y += offset.y;
        //!\\ fix camera tilt

        return this.screen2WorldVector;

    }


    /**
     * 
     * @param {Number} depth z value, plus la valeur negative est grande, et plus les elements du layer sont petits 
     * @param {Camera} camera 
     * @param {Vector3} result 
     * @returns the size of visible view
     */



    getViewSize(depth, camera, result) {

        // vertical fov in radians
        const vFOV = camera.fov * Math.PI / 180;
        // Math.abs to ensure the result is always positive
        const height = 2 * Math.tan(vFOV / 2) * Math.abs(depth);
        const width = height * camera.aspect;

        if (result) {
            result.set(width, height, depth);
            return;
        }

        return { x: width, y: height, z: depth };

    }




    colorTo(material, colorHexa, time) {
        let color = new Color(colorHexa);
        gsap.to(material.color, {
            duration: time,
            r: color.r,
            g: color.g,
            b: color.b
        });
    }








    getTextShape(text, font, color = 0x000000, fontSize = 1, alpha = 1, pivot) {

        let _text = text != null ? text : "abcdefghijklmnopqrstuvwxyz\nABCDEFGHIJKLMNOPQRSTUVWXYZ\n1234567890\n&@àâäçéêëèîïôöûü\n%?!/+-*=:<>";

        let mesh = new Mesh;
        let xMid = 0;
        let yMid = 0;


        var mat = new MeshBasicMaterial({
            color: color,
            side: DoubleSide,
            transparent: true,
            opacity: alpha

        });
        mat.userData.outlineParameters = {
            visible: false
        };

        mesh.setText = val => {

            let shapes = font.generateShapes(val, fontSize);
            let geometry = new ShapeGeometry(shapes);
            geometry.computeBoundingBox();

            if (pivot) {
                xMid = - pivot.x * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
                yMid = pivot.y * (geometry.boundingBox.max.y - geometry.boundingBox.min.y);
            }
            geometry.translate(xMid, yMid, 0);

            mesh.geometry.dispose();
            mesh.geometry = geometry;
            mesh.material = mat;
            mesh.height = yMid + 2 * fontSize;
            mesh.width = geometry.boundingBox.max.x;

        }

        mesh.setText(_text);

        return mesh;

    }



    getProperties(object) {

        const properties = [];

        do {

            const propertiesB = Object.getOwnPropertyNames(object);

            for (let i = 0, l = propertiesB.length; i < l; i++) {

                const property = propertiesB[i];
                const descriptor = Object.getOwnPropertyDescriptor(object, property);
                if (descriptor['get'] || descriptor['set']) continue;
                properties.push(property);

            }

        } while (object = Object.getPrototypeOf(object));

        return properties;

    }




    autobind(object) {

        const properties = this.getProperties(object);

        for (let i = 0, l = properties.length; i < l; i++) {

            const name = properties[i];
            const property = object[name];

            if (name !== 'constructor' && typeof property === 'function')
                object[name] = object[name].bind(object);

        }

        return object;

    }




    animateColor(mat, colorFrom, colorTo, time = 1, delay = 0, prop = "color") {

        let from = new Color(new Color(colorFrom).getHex());
        let to = new Color(new Color(colorTo).getHex());

        gsap.to(from, {
            delay: delay,
            duration: time,
            r: to.r,
            g: to.g,
            b: to.b,
            onUpdate: () => {
                mat[prop] = from;
            }
        });
    }




    //use : await tools.wait(1.2);
    async wait(delay = 1) {

        await new Promise(resolve => {
            gsap.delayedCall(delay, resolve);
        });

    }




    spliceByElement(element, arr) {

        console.log("nameId:", element.nameId, " spliceed");

        for (let i = 0; i < arr.length; i++) {
            if (element === arr[i]) {
                arr.splice(i, 1);
                break;
            }
        }

        console.log("spliceByElement:", arr)

    }






    shake(target, delay, loop, decal, x, y, z, rotate) {

        let initX = target.position.x;
        let initY = target.position.y;
        let initZ = target.position.z;

        for (let i = 1; i < loop + 1; i++) {

            setTimeout(i => {
                x && (target.position.x += (i % 2 > 0 ? -decal : decal) * Math.random());
                y && (target.position.y += (i % 2 > 0 ? -decal : decal) * Math.random());
                z && (target.position.z += (i % 2 > 0 ? -decal : decal) * Math.random());
                if (i == loop) {
                    target.position.x = initX;
                    target.position.y = initY;
                    target.position.z = initZ;
                }

                if (rotate) {
                    let initRotation = new Vector3(target.rotation.x, target.rotation.y, target.rotation.z);
                    let angle = (i % 2 > 0 ? -5 : 5) * Math.random() * this.DEG2RAD;
                    gsap.to(target.rotation, { duration: .3, z: angle });
                    gsap.to(target.rotation, { duration: .2, delay: .3, z: initRotation.z });
                }

            }, delay * i, i);

        }

    }





}

export default new Tools();