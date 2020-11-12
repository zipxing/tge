namespace tge {
    export enum LogLevel{
        DEBUG = 1,
        INFO,
        WARNING,
        ERROR
    }

    export let LOG_LEVEL = LogLevel.DEBUG;

    export function bindLogPath(fpath: string, loglevel: LogLevel = LogLevel.DEBUG) {

        tge.LOG_LEVEL = loglevel;

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
        if(tge.LOG_LEVEL<=tge.LogLevel.DEBUG)
            tge.log(tge.LogLevel.DEBUG, ...arg);
    }

    export function error(...arg: any[]) {
        if(tge.LOG_LEVEL<=tge.LogLevel.ERROR)
            tge.log(tge.LogLevel.ERROR, ...arg);
    }

    export function info(...arg: any[]) {
        if(tge.LOG_LEVEL<=tge.LogLevel.INFO)
            tge.log(tge.LogLevel.INFO, ...arg);
    }

    export function warning(...arg: any[]) {
        if(tge.LOG_LEVEL<=tge.LogLevel.WARNING)
            tge.log(tge.LogLevel.WARNING, ...arg);
    }
}
