/*
 * tge
 *
 * A Typescript Game Engine
 * Copyright (c) 2020, zhouxin.
 * <zipxing@hotmail.com>
 *
 */
export function clone(obj: any) {
    return JSON.parse(JSON.stringify(obj));
}

//采用Microsoft的LCG,c代码和javascript代码生成随机序列可以方便的对上
var randomNext:number=0;

export function srand(seed:number) {
    randomNext = seed>>>0;
}

export function rand() {
    randomNext = (randomNext*214013 + 2531011)&0x7FFFFFFF;
    return ((randomNext>>16)&0x7FFF);
}

export interface Point {
    x: number;
    y: number;
}

export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export function pointInRect(rect:Rect, point:Point) {
    return (point.x >= rect.x && point.x <= rect.x + rect.width &&
        point.y >= rect.y && point.y <= rect.y + rect.height);
}
