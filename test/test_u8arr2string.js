let str="abc░▒▓中";
var arr = [];
for (let i=0,j=str.length; i<j; ++i) {
    let c = str.charCodeAt(i);
    console.log(c);
    arr.push(str.charCodeAt(i));
}

var tmp= new Uint8Array(arr);

for(let i=0; i<tmp.length; i++)
    console.log(tmp[i]);
