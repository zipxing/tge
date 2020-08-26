var s = "C256MabcMdeC58MfgM";
s = s.replace(/C(\d+)M/g, "{$1-fg}");
console.log(s);

var a="   sss        ";
var b="              ";
a = a.replace(/ *$/g, '');
b = b.replace(/ *$/g, '');
console.log("a=", a, '.');
console.log("b=", b, '.');


