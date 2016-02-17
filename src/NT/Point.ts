/**
 * NineTail
 * @module NT
 */
module NT {
  /**
   * 座標
   */
  export class Point {
    constructor (public x:number, public y:number) {
    }
    getX():number {
      return this.x;
    }

    getY():number {
      return this.y;
    }
  }
}

