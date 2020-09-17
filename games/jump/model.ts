namespace Jump {
    export class Model extends tge.Model {
        static jumpw:number = 80;
        static jumph:number = 25;
        static carw:number = 8;
        static carh:number = 5;
        car_pos:tge.Point = {x:3, y:20};
        jump_speed:number = 5;

        constructor() {
            super();
        }
    }
}
