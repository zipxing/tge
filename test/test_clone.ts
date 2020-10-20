interface Test {
    a: number;
    b: number[];
}

let v1:Test = {a:0, b:[1,2,3]};
let v2:Test = JSON.parse(JSON.stringify(v1));
console.log(v2);
