import * as tge from "../../engine"
import { Model } from "./model"

export class Game extends tge.Game {
    initGame() {
        let m = <Model>this.model;
        this.useract=[];
        tge.Emitter.fire("Scene3d.REDRAW");
    }

    restartGame() {
    }

    playUserAction(dt: number) {
        for(let i=0;i<this.useract.length;i++)
            this.doAction(this.useract[i]);
        this.useract=[];
    }

    playAutoAction(dt: number) {
    }

    playAiAction(dt: number) {
    }

    doAction(act: any) {
        let ag = act.split(":");
        let m = <Model>this.model;
        switch(ag[0]) {
            case "M":
                //tge.Emitter.fire("Scene3d.REDRAW");
                break;
            default:
                break;
        }
    }
}
