import { Component } from "./component"

export enum LightType {
    Directional = 0,
        Point = 1
}

export class Light extends Component {
    type: LightType;
    color: number[];
    range: any;

    constructor(type: LightType) {
        super();
        this.type = type;
        this.color = [1.0, 1.0, 1.0];
        this.range = null;
    }
}
