import * as tge from "../../engine"

//art2js <artfile> <namespace> <var_name> <js_name>
let artfile = process.argv[2];
let ns = process.argv[3];
let vn = process.argv[4];
let jn = process.argv[5];
tge.AscIIManager.loadArtFile(artfile, 'AH');
let a = tge.AscIIManager.getArt('AH');
let codes = [];
codes.push("namespace "+ns+" {");
codes.push('    tge.AscIIManager.arts_jsdef["'+vn+'"] = [];');
for(let i=0; i<a.blessed_lines.length; i++)
    codes.push('    tge.AscIIManager.arts_jsdef["'+vn+'"]['+i+'] = "'+Buffer.from(a.blessed_lines[i]).toString('base64')+'";');
codes.push('}');
let f = require('fs');
f.writeFileSync(jn, codes.join('\n'));
