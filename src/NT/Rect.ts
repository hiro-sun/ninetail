/**
 * NineTail
 * @module NT
 */
module NT {
  
  export class Rect {
    /**
     * 矩形
     * @class Rect
     * @constructor
     */
    constructor(public x:number, public y:number, public width:number, public height:number) {
    }

    containsPoint (point:Point):boolean {
      if (point.getX() >= this.x && 
         point.getX() <= this.x + this.width && 
         point.getY() >= this.y && 
         point.getY() <= this.y + this.height) {
        return true;
      } else {
        return false;
      }
    }
  }
}
