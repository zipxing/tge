import * as tge from "../../engine"

export interface TPoint {
    p: tge.Point;
    g: number;
    h: number;
    f: number;
    _parent: TPoint | null;
}

export class Model extends tge.Model {
    static towerw:number = 50;
    static towerh:number = 18;
    start: tge.Point;
    end: tge.Point;
    grid: number[][];
    result: tge.Point[];

    constructor() {
        super();
        this.result = [];
        this.start = {x:0, y:0};
        this.end = {x:Model.towerw - 1, y: Model.towerh -1};
        this.grid = [];
        for(let i=0;i<Model.towerh;i++) {
            this.grid[i]=[];
            for(let j=0;j<Model.towerw;j++)
                this.grid[i][j]=0;
        }
    }

    searchRoad() {
        let openList: TPoint[] = [];
        let closeList: TPoint[] = [];
        let result_index = 0;   //结果数组在开启列表中的序号

        openList.push({
            p:{ x:this.start.x, y:this.start.y},
            g:0,
            h:0,
            f:0,
            _parent:null});//把当前点加入到开启列表中，并且G是0

        do{
            let currentPoint = openList.pop();
            if(!currentPoint) break;
            closeList.push(currentPoint);
            let surroundPoint = this.surroundPoint(currentPoint);
            for(let i in surroundPoint) {
                let item = surroundPoint[i];                //获得周围的八个点
                if (
                    item.p.x>=0 &&                            //判断是否在地图上
                    item.p.y>=0 &&
                    item.p.x<Model.towerw &&
                    item.p.y<Model.towerh &&
                    this.grid[item.p.x][item.p.y] != 1 &&         //判断是否是障碍物
                    this.existList(item, closeList) == -1 &&      //判断是否在关闭列表中
                    this.grid[item.p.x][currentPoint.p.y]!=1 &&   //判断之间是否有障碍物，如果有障碍物是过不去的
                    this.grid[currentPoint.p.x][item.p.y]!=1) {
                    //g 到父节点的位置
                    //如果是上下左右位置的则g等于10，斜对角的就是14
                    let g = currentPoint.g + 
                        ((currentPoint.p.x - item.p.x) * (currentPoint.p.y - item.p.y) == 0 ? 10 : 14);
                    let index:number = this.existList(item, openList);
                    if (index == -1) {       //如果不在开启列表中
                        //计算H，通过水平和垂直距离进行确定
                        item.h = Math.abs(this.end.x - item.p.x) * 10 + Math.abs(this.end.y - item.p.y) * 10;
                        item.g = g;
                        item.f = item.h + item.g;
                        item._parent = currentPoint;
                        openList.push(item);
                    }
                    else {                                  //存在在开启列表中，比较目前的g值和之前的g的大小
                        //如果当前点的g更小
                        if (g < openList[index].g) {
                            openList[index]._parent = currentPoint;
                            openList[index].g = g;
                            openList[index].f=g+openList[index].h;
                        }
                    }
                }
            }
            //如果开启列表空了，没有通路，结果为空
            if(openList.length==0) {
                break;
            }
            openList.sort(this.sortF);//这一步是为了循环回去的时候，找出 F 值最小的, 将它从 "开启列表" 中移掉
        }while((result_index=this.existList({
            p:{x:this.end.x,y:this.end.y},g:0,h:0,f:0,_parent:null
        },openList)) != -1);

        //判断结果列表是否为空
        if(result_index == -1) {
            this.result=[];
        } else {
            let currentObj=openList[result_index];
            do{
                //把路劲节点添加到result当中
                this.result.unshift({
                    x:currentObj.p.x,
                    y:currentObj.p.y
                });
                if(!currentObj._parent) break;
                currentObj=currentObj._parent;
            }while (currentObj.p.x!=this.start.x || currentObj.p.y!=this.start.y);

        }
    }

    //用F值对数组排序
    sortF(a:TPoint, b:TPoint){
        return b.f - a.f;
    }

    //获取周围八个点的值
    surroundPoint(curPoint:TPoint) : TPoint[] {
        let x=curPoint.p.x, y=curPoint.p.y;
        return [
            {p:{x:x-1,y:y-1},g:0,h:0,f:0,_parent:null},
            {p:{x:x,y:y-1},g:0,h:0,f:0,_parent:null},
            {p:{x:x+1,y:y-1},g:0,h:0,f:0,_parent:null},
            {p:{x:x+1,y:y},g:0,h:0,f:0,_parent:null},
            {p:{x:x+1,y:y+1},g:0,h:0,f:0,_parent:null},
            {p:{x:x,y:y+1},g:0,h:0,f:0,_parent:null},
            {p:{x:x-1,y:y+1},g:0,h:0,f:0,_parent:null},
            {p:{x:x-1,y:y},g:0,h:0,f:0,_parent:null}
        ]
    }

    //判断点是否存在在列表中，是的话返回的是序列号
    existList(point:TPoint, list:TPoint[]) : number {
        for(let i in list) {
            if(point.p.x==list[i].p.x && point.p.y==list[i].p.y) {
                return parseInt(i);
            }
        }
        return -1;
    }
}
