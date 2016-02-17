/**
 * グラフィックスモジュール
 * @module NT.Graphics
 */
module NT.Graphics {
  export class Font {
    family:string = "Arial";
    size:number = 20;
    format:string = "pt";
    style:string = "normal";

    /**
     * フォント管理クラス
     * @class Font
     * @constructor
     */
    constructor(family:string, size:number, format:string, style:string) {
      if (family) this.family = family;
      if (size) this.size = size;
      if (format) this.format = format;
      if (style) this.style = style;
    }

    getCss():string {
      return this.style + " " + this.size + this.format + " " + this.family;
    }
  }

  
}
