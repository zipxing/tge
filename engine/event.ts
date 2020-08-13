namespace tge {
    export class Emitter {
        private static listeners:{[eventname: string]: any} = {};

        static register(name: string, callback: Function, context: any) {
            let observers: Observer[] = Emitter.listeners[name];
            if (!observers) {
                Emitter.listeners[name] = [];
            }
            Emitter.listeners[name].push(new Observer(callback, context));
        }

        static remove(name: string, callback: Function, context: any) {
            let observers: Observer[] = Emitter.listeners[name];
            if (!observers) return;
            let length = observers.length;
            for (let i = 0; i < length; i++) {
                let observer = observers[i];
                if (observer.compar(context)) {
                    observers.splice(i, 1);
                    break;
                }
            }
            if (observers.length == 0) {
                delete Emitter.listeners[name];
            }
        }

        static fire(name: string, ...args: any[]) {
            let observers: Observer[] = Emitter.listeners[name];
            if (!observers) return;
            let length = observers.length;
            for (let i = 0; i < length; i++) {
                let observer = observers[i];
                observer.notify(name, ...args);
            }
        }
    }

    class Observer {
        private callback: Function;
        private context: any;

        constructor(callback: Function, context: any) {
            this.callback = callback;
            this.context = context;
        }

        notify(...args: any[]): void {
            this.callback.call(this.context, ...args);
        }

        compar(context: any): boolean {
            return context == this.context;
        }
    }
}
