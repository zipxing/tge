namespace tge3d {

    export class MathUtils{
        constructor(){
        }

        static degToRad(degree:number){
            return degree * 0.017453293;
        }

        static radToDeg(rad:number){
            return rad * 57.29577951;
        }

        static clamp(f:number, min:number, max:number){
            if(f<min) f = min;
            else if(f>max) f = max;
            return f;
        }
    }
}

