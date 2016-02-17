/**
 * グラフィックスモジュール
 * @module NT.Graphics
 */
module NT.Graphics {
  export class Color {

    static toCss(color: number): string {
      let r = color >> 24 & 0xFF;
      let g = color >> 16 & 0xFF;
      let b = color >> 8 & 0xFF;
      let a = color & 0xFF;
      return "rgba(" + r + "," + g + "," + b + "," + a + ")";
    }

    /**
     * カラー操作クラス
     * @class Color
     * @constructor
     * @param {number} r 赤成分(0-255)
     * @param {number} g
     * @param {number} b 
     * @param {number} a アルファ
     */
    constructor(public r:number, public g:number, public b:number, public a:number) {
      if (!a) {
        this.a = 0xFF;
      }
    }

    getR():number {
      return this.r;
    } 

    getG():number {
      return this.g;
    }

    getB():number {
      return this.b;
    }

    getAlpha():number {
      return this.a;
    }

    getFloatR():number {
      return this.r / 255;
    }

    getFloatG():number {
      return this.g / 255;
    }

    getFloatB():number {
      return this.b / 255;
    }

    getFloatAlpha():number {
      return this.a / 255;
    }

    getCss():string {
      return "rgb(" + this.r + "," + this.g + "," + this.b + ")";
    }
  }
}
