namespace Tetris {
    export class ElsStat {
        combo_total: number;
        combo_max: number;
        combo_current: number;
        level: number;
        score: number;
        clear_lines: number;
        isko: boolean;

        constructor() {
            this.combo_total = 0;
            this.combo_max = 0;
            this.combo_current = 0;
            this.level = 0;
            this.score = 0;
            this.clear_lines = 0;
            this.isko = false;
        }

        addScore(s:number) {
            this.score += s;
            for(var i=0; i<Tetris.UPGRADE_STANTARD.length; i++) {
                if(this.score<=Tetris.UPGRADE_STANTARD[i+1] &&
                    this.score>=Tetris.UPGRADE_STANTARD[i]) {
                    this.level = i;
                    break;
                }
            }
        }
    }
}
