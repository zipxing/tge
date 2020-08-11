namespace nge {
    export interface TimerData {
        time: number;
        count: number;
        endcall: Function;
        exdata: any;
    }

    export class Timer {
        timers: {[key: string]: TimerData};

        constructor() {
            this.timers = {};
        }

        setup(name: string, time: number, endcall: Function) {
            this.timers[name] = {
                time: 0,
                count: Math.ceil(time*nge.Game._frameHz),
                endcall: endcall,
                exdata: 0
            }
        }

        fire(name: string, exdata: any) {
            this.timers[name].time = this.timers[name].count;
        }

        cancel(name: string) {
            this.timers[name].time = 0;
            if(this.timers[name].endcall)
                this.timers[name].endcall();
        }

        getpercent(name: string) {
            let t = this.timers[name];
            return t.time*1.0/t.count*1.0;
        }

        update() {
            for(let t in this.timers) {
                if(this.timers[t].time>0) {
                    this.timers[t].time--;
                    if(this.timers[t].time==0) {
                        this.cancel(t);
                    }
                }
            }
        }
    }
}
