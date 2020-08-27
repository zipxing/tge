namespace tge {
    export enum LogLevel{
        DEBUG = 1,
        INFO,
        WARNING,
        ERROR
    }

    export function bindLogPath(fpath: string) {
        let fs = require('fs');
        let access = fs.createWriteStream(fpath, { flags: 'a' })
      , error = fs.createWriteStream(fpath, { flags: 'a' });
        // redirect stdout / stderr
        //process.stdout.pipe(access);
        //process.stderr.pipe(error);
    }

    export function log(level: LogLevel, ...arg: any[]) {
        console.log(LogLevel[level], ...arg);
    }
}
