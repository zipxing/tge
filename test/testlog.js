function mylog(...args) {
    console.log(...args);
}
var m=["111", 1, 2];
m.index=3;
m.input="aaaaaa";

mylog(m, 111, 222, 444);

 let fs=require('fs');
 let util = require('util');
 let logFile = fs.createWriteStream('/tmp/testxxx.log', {flags:'a'});
 let logso = process.stdout;
 console.log = function() {
     logFile.write(util.format.apply(null, arguments)+'\n');
     //logso.write(util.format.apply(null, arguments)+'\n');
 }
 console.error = console.log;

console.log('aa111222333');
