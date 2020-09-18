namespace Jump {
    export class Model extends tge.Model {
        static gamew:number = 80;
        static gameh:number = 25;
        static carw:number = 8;
        static carh:number = 5;
        static carg:number = 0.2;
        car_pos:tge.Point = {x:3, y:20};
        jump_speed:number = 3;

        constructor() {
            super();
        }
    }
}
