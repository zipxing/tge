import fs = require("fs")
fs.readFile('ascii-utf8.txt', "utf8", (err, dat)=>{
    let ss = dat.split('\n');
    let ms = [];
    for(let s in ss) {
        let ts = ss[s].split(' ');
        if(ts.length>2) {
            ms[ms.length]=ts[2];
        }
    }
    ms[0]=' ';
    for(let i=0;i<ms.length;i++) {
        process.stdout.write(ms[i]);
        if(i%80==0 && i!=0) 
            process.stdout.write('\n');
    }
})
