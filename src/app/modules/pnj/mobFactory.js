import { EventDispatcher, Vector3 } from "three";
import Mob from "./mob";
import assets from "app/assets";
import SuperMob from "./superMob";
import tools from "tools";
import config from "config";

class MobFactory extends EventDispatcher {

    constructor() {
        super();

        this._mobs = [];
        this._nameId = 0;

    }


    getMob(type, sizeType, duplicated) {

        let mob = new Mob(assets.models.mob, type, sizeType, duplicated);
        mob.constraints = new Vector3(0, 1, 0);
        mob.type = type;
        mob.nameId = this._nameId++;
        mob.run();
        this._mobs.push(mob);

        return mob;

    }

    getSuperMob(type, sizeType, duplicated) {

        let mob = new SuperMob(assets.models.superMob, type, sizeType, duplicated);
        mob.constraints = new Vector3(0, 1, 0);
        mob.type = type;
        mob.nameId = this._nameId++;
        mob.run();
        this._mobs.push(mob);

        return mob;

    }

    destroyMob(mob) {
        tools.spliceByElement(mob, this._mobs);
        mob.destroy();
    }


    get mobs() {
        return this._mobs;
    }


    set warningLine(val) {
        this._warningLine = val;
    }


    set deadLine(val) {
        this._deadLine = val;
    }

    get deadLine() {
        return this._deadLine;
    }

    /**
     * where do all the monsters go
     */
    set target(val) {
        this._target = val;
    }

    get target() {
        return this._target;
    }

    /**
     * line from which mobs gose to target
     */
    set targetLine(val) {
        this._targetLine = val;
    }

    get targetLine() {
        return this._targetLine;
    }


    update(delta) {

        if (config.gameOver) {
            return;
        }

        for (let i = 0; i < this._mobs.length; i++) {
            this._mobs[i].update(delta);

            if (this._mobs[i].collider) {

                if (this.deadLine && this._mobs[i].type == "enemy" && this._mobs[i].collider.position.z > this.deadLine.position.z) {
                    !config.gameOver && this.dispatchEvent({ type: "gameOver", mob: this._mobs[i] });
                    config.gameOver = true;
                }

                if (this.deadLine && this._mobs[i].type == "enemy" && this._mobs[i].collider.position.z > this.deadLine.position.z - 4) {
                    !config.gameOver && this.dispatchEvent({ type: "danger" });
                }

                if (this._mobs[i].position.y < -5 || this._mobs[i].position.z < -25 || (this.deadLine && this._mobs[i].position.z > this.deadLine.position.z + 1)) {
                    this.destroyMob(this._mobs[i]);
                }

                if (this._mobs[i] && this._mobs[i].position.z < this.targetLine && this._mobs[i].type == "mob") {
                    !this._mobs[i].isKinematic && this._mobs[i].goToGoal(this.target);
                }

            }
        }

    }



    destroy() {

        for (let i = 0; i < this._mobs.length; i++) {
            this.destroyMob(this._mobs[i]);
        }

        this._mobs = [];

    }



}


export default new MobFactory();