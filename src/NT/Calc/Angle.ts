/**
 * 計算モジュール
 * @module NT.Calc
 */
module NT.Calc {

  export class Angle {
    /**
     * 円周率
     * @property PI
     * @type number
     * @static
     */
    public static PI: number = 3.1415;
    private static instance: Angle = null;

    
    /**
     * 角度計算用のシングルトンクラス
     * @class Angle
     * @constructor
     */
    constructor() {
      if (!Angle.instance) Angle.instance = this;
    }

    public static getInstance(): Angle {
      if (Angle.instance === null) Angle.instance = new Angle();
      return Angle.instance;
    }

    /**
    * 角度からラジアン角に変換します。
    * @method degToRad
    * @param {number} degree 角度
    * @return {number} 変換後のラジアン角
    */
    degToRad(degree: number): number {
      return degree * Angle.PI / 180;
    }

    /**
    * ラジアン角から角度に変換します。
    * @method radToDeg
    * @param {number} radian ラジアン角
    * @return {number} 変換後の角度
    */
    radToDeg(radian: number): number {
      return radian * 180 / Angle.PI;
    }
  }
}