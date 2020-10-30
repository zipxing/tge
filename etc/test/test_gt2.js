let g = 0.1;
let v0 = 3;
let v = v0;
let y = 0;
for(let t=0; t<60; t++) {
    y = v0*t - 0.5*g*t*t;
    v = v0 - g*t;
    console.log(t, Math.floor(y/10.0));
}
