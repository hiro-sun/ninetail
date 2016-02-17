/**
 * 計算モジュール
 * @module NT.Calc
 */
module NT.Calc {
  
  export class Vector3 {
    /**
     * 3次元ベクトルを作成します。
     * @class Vector3
     * @constructor
     * @param {number} x ベクトルのx値
     * @param {number} y ベクトルのy値
     * @param {number} z ベクトルのz値
     */
    constructor(public x: number, public y: number, public z: number) {
    }
  }
}