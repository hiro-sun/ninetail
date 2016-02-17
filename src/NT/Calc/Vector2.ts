/**
 * 計算モジュール
 * @module NT.Calc
 */
module NT.Calc {

  export class Vector2 {
    x: number;
    y: number;

   /**
    * 2次元ベクトルを作成します
    * @class Vector2
    * @constructor
    * @param {number} x ベクトルのX値
    * @param {number} y ベクトルのy値
    */
    constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
    }
  }
}