function aaa(): readonly string[] {
    let l = ['111', '222'];
    l[0] = 'aaa';
    return l;
}
let ll = aaa();
ll[1] = '2';
console.log(ll);
