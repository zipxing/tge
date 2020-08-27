var s = "wwwCF256mCB3mabcC0mdeCF58mCB10mfgC0maaaaa";
var r = /\x1b\[38;5;(\d+)m\x1b\[48;5;(\d+)m(.*?)\x1b\[0m/;
/*var t = s.replace(/C(\d+)M/g, "{$1-fg}");
console.log(t, s);
var n = s.search(/C\d+M/g);
console.log(n);
var m = s.match(/C\d+M/);
console.log(m);*/
console.log(r.global);
r.global = true;
console.log(r.global);
var aaa = s.match(r);
console.log(aaa);

while(true) {
    var m = s.match(/CF(\d+)mCB(\d+)m(.*?)C0m/);
    if(m==null) break;
    console.log(m);
    var shead = s.substring(0, m.index);
    s = s.substring(m.index+m[0].length);
}
console.log(s);


var a="   sss        ";
var b="              ";
a = a.replace(/ *$/g, '');
b = b.replace(/ *$/g, '');
console.log("a=", a, '.');
console.log("b=", b, '.');


