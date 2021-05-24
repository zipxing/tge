import { env } from "./tge"

export enum LogLevel{
    DEBUG = 1,
    INFO,
    WARNING,
    ERROR
}

export let LOG_LEVEL = LogLevel.DEBUG;

export function bindLogPath(fpath: string, loglevel: LogLevel = LogLevel.DEBUG) {

    LOG_LEVEL = loglevel;

    if(env.kind == "WEB")
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
    if(LOG_LEVEL<=LogLevel.DEBUG)
        log(LogLevel.DEBUG, ...arg);
}

export function error(...arg: any[]) {
    if(LOG_LEVEL<=LogLevel.ERROR)
        log(LogLevel.ERROR, ...arg);
}

export function info(...arg: any[]) {
    if(LOG_LEVEL<=LogLevel.INFO)
        log(LogLevel.INFO, ...arg);
}

export function warning(...arg: any[]) {
    if(LOG_LEVEL<=LogLevel.WARNING)
        log(LogLevel.WARNING, ...arg);
}
