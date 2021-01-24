namespace Luoxuan {
    export class Game extends tge.Game {
        initGame() {
            let m = <Luoxuan.Model>this.model;
            tge.Emitter.fire("Luoxuan.REDRAW_GRID");
        }

        restartGame() {
        }

        playUserAction(dt: number) {
        }

        playAutoAction(dt: number) {
            let m = <Luoxuan.Model>this.model;
            if(this.timeout_auto>400.0) {
                this.timeout_auto = 0;
                m.walk();
                tge.Emitter.fire("Luoxuan.REDRAW_GRID");
            } else {
                this.timeout_auto+=dt;
            }
        }

        playAiAction(dt: number) {
        }

        doAction(act: any) {
        }

        scheduleUpdate(dt: number) {
            super.scheduleUpdate(dt);
            //console.log("update...", this.stage);
        }
    }
}
