namespace tge {
    export enum LogLevel{
        DEBUG = 1,
        INFO,
        WARNING,
        ERROR
    }

    export function bindLogPath(fpath: string) {
        if(tge.env.kind == "WEBTERM" || tge.env.kind == "WEB")
            return;
        let fs=require('fs');
        let util = require('util');
        let logFile = fs.createWriteStream(fpath, {flags:'a'});
        //let logso = process.stdout;
        console.log = function() {
            logFile.write(util.format.apply(null, arguments)+'\n');
            //logso.write(util.format.apply(null, arguments)+'\n');
        }
        console.error = console.log;
    }

    export function log(level: LogLevel, ...arg: any[]) {
        let d = new Date()
        console.log(LogLevel[level], d, ...arg);
    }

    export function debug(...arg: any[]) {
        tge.log(tge.LogLevel.DEBUG, ...arg);
    }

    export function error(...arg: any[]) {
        tge.log(tge.LogLevel.ERROR, ...arg);
    }

    export function info(...arg: any[]) {
        tge.log(tge.LogLevel.INFO, ...arg);
    }

    export function warning(...arg: any[]) {
        tge.log(tge.LogLevel.WARNING, ...arg);
    }
}
