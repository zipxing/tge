namespace tge {
    export interface TimerData {
        time: number;
        count: number;
        endcall: Function;
        exdata: any;
    }

    export class Timer {
        private static timers: {[key: string]: TimerData} = {};

        static register(name: string, time: number, endcall: Function) {
            Timer.timers[name] = {
                time: 0,
                count: Math.ceil(time*tge.Game._frameHz),
                endcall: endcall,
                exdata: 0
            }
        }

        static setTime(name: string, time: number) {
            let tmo: TimerData = Timer.timers[name];
            if (!tmo) return;
            tmo.count = Math.ceil(time*tge.Game._frameHz);
        }

        static fire(name: string, exdata: any = 0) {
            let tmo: TimerData = Timer.timers[name];
            if (!tmo) return;
            tmo.time = tmo.count;
            tmo.exdata = exdata;
        }

        static cancel(name: string, nocall: boolean = false) {
            let tmo: TimerData = Timer.timers[name];
            if (!tmo) return;
            tmo.time = 0;
            if(!nocall) {
                if(tmo.endcall)
                    tmo.endcall();
            }
        }

        static getExData(name: string) {
            let tmo: TimerData = Timer.timers[name];
            if (!tmo) return;
            return tmo.exdata;
        }

        static getStage(name: string) {
            let tmo: TimerData = Timer.timers[name];
            if (!tmo) 
                return 0;
            return tmo.time;
        }

        static getRStage(name: string) {
            let tmo: TimerData = Timer.timers[name];
            if (!tmo) 
                return 0;
            return tmo.count - tmo.time;
        }

        static getPercent(name: string) {
            let tmo: TimerData = Timer.timers[name];
            if (!tmo) return 0;
            let t = tmo;
            return t.time*1.0/t.count*1.0;
        }

        static update() {
            for(let t in Timer.timers) {
                if(Timer.timers[t].time>0) {
                    Timer.timers[t].time--;
                    if(Timer.timers[t].time==0) {
                        Timer.cancel(t);
                    }
                }
            }
        }
    }
}
