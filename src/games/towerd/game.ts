import * as tge from "../../engine"
import { Model } from "./model"

export enum GameState {
    Normal = 0,
}

export class Game extends tge.Game {
    initGame() {
        let m = <Model>this.model;
        this.gamestate=GameState.Normal;
        this.useract=[];
        m.searchRoad();
        tge.Emitter.fire("Tower.REDRAW_GRID");
    }

    restartGame() {
    }

    playUserAction(dt: number) {
        for(let i=0;i<this.useract.length;i++)
            this.doAction(this.useract[i]);
        this.useract=[];
    }

    playAutoAction(dt: number) {
        let m = <Model>this.model;
        if(this.timeout_auto>400.0) {
            //this.doAction(m.dir);
        } else {
            this.timeout_auto+=dt;
        }
    }

    playAiAction(dt: number) {
    }

    doAction(act: any) {
        let ag = act.split(":");
        let i=0, j=0;
        if(ag.length==3) {
            i = parseInt(ag[1]);
            j = parseInt(ag[2]);
        }
        let m = <Model>this.model;
        switch(ag[0]) {
            case "M":
                m.grid[i][j] = 1;
                m.searchRoad();
                break;
            default:
                break;
        }
        tge.Emitter.fire("Tower.REDRAW_GRID");
        this.timeout_auto=0.0;
    }

    scheduleUpdate(dt: number) {
        super.scheduleUpdate(dt);
        //console.log("update...", this.stage);
    }
}
