/**
 * グラフィックスモジュール
 * @module NT.Graphics
 */
module NT.Graphics {
  export class Sprite extends DrawableElement {
    /**
     * 描画するビットマップデータ
     * @property bitmap
     * @type NT.Graphics.Bitmap
     */
    bitmap:Bitmap;
    /**
     * ビットマップデータの一部を描画する際はsource_rectに矩形情報がセットされます。
     * @property source_rect
     * @type NT.Rect
     */
    source_rect:Rect;

    text:string;
    text_color:Color;
    font:Font;

    /**
     * スプライト
     * @constructor
     * @class Sprite
     * @param {NT.Graphics.Bitmap} bitmap
     * @param {NT.Rect} source_rect 与えたビットマップのどこを使うか
     * @param {number} width
     * @param {number} height
     * @param {number} background_color
     */
    constructor (bitmap:Bitmap, source_rect:Rect, width?:number, height?:number, background_color?:number) {
      super(width, height);
      super.setBackgroundColor(background_color);

      if (bitmap) {
        this.bitmap = bitmap;
        if (source_rect) this.source_rect = source_rect;
      }
    }

    /**
     * スプライトの座標とサイズを矩形オブジェクトで取得します
     * @method getRect
     * @return NT.Rect
     */
    getRect():Rect {
      return new Rect(this.x, this.y, this.width, this.height);
    }

    setText(text:string, font:Font, color:Color):void {
      this.text = text;
      this.font = font;
      this.text_color = color;
    }

    setSize(width:number, height:number):void {
      this.width = width;
      this.height = height;
    }

    draw(ctx:CanvasRenderingContext2D):void {
      super.draw(ctx);
      
      //テキスト描画
      if (this.text != undefined) {
        ctx.fillStyle = this.text_color.getCss();
        ctx.font = this.font.getCss();
        ctx.fillText(this.text, this.x , this.y + 20);
      }

      //画像がセットされ、ロード済みの場合は描画
      if (this.bitmap != undefined) {
        if (this.bitmap.isLoaded()) {
          ctx.drawImage(this.bitmap.getImage(), 
                        (0.5 + this.source_rect.x) | 0,
                        (0.5 + this.source_rect.y) | 0,
                        (0.5 + this.source_rect.width) | 0,
                        (0.5 + this.source_rect.height) | 0,
                        (0.5 + this.x) | 0,
                        (0.5 + this.y) | 0,
                        (0.5 + this.width) | 0,
                        (0.5 + this.height) | 0);
        }
      }
    }
  }
}
