/**
 * グラフィックスモジュール
 * @module NT.Graphics
 */
module NT.Graphics {
  export class LayerBitmap extends Layer {
    update_flag:boolean;

    /**
     * プリミティブ描画用レイヤー
     * ライン描画等の命令を持つ
     * @constructor
     * @class LayerBitmap
     * @extends Layer
     * @param {number} width レイヤーの幅
     * @param {number} height レイヤーの高さ
     * @param {NT.Color} color レイヤーの背景色。省略した場合は透過
     */
    constructor(id: string, width: number, height: number, color?: number) {
      super(id, width, height, color);
    }

    /**
     * 線分の描画を行います
     * @method drawLine
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     */
    drawLine(x1:number, y1:number, x2:number, y2:number) {
      this.update_flag = true;

      //２点間の距離
      let dx:number = 0;      
      let dy:number = 0;

      dx =  (x2 > x1) ? x2 - x1 : x1 - x2;
      dy =  (y2 > y1) ? y2 - y1 : y1 - y2;

      //２点の方向
      let sx:number = 0;
      let sy:number = 0;

      sx = (x2 > x1) ? 1 : -1;
      sy = (y2 > y1) ? 1 : -1;

      if (dx > dy) {
        let e = -dx;
        for (let i:number = 0; i<= dx; i++) {
          //描画
          this.drawPixel(x1, y1);
          x1 += sx;
          e += 2 * dy;
          if (e >= 0) {
            y1 += sy;
            e -= 2 * dx;
          }
        }
      } else {
        let e = -dy;
        for (let i:number=0; i<=dy; i++) {
          //描画
          this.drawPixel(x1, y1);
          y1 += sy;
          e += 2 * dx;
          if (e >= 0) {
            x1 += sx;
            e -= 2 * dy;
          }
        }
      }
    }


    /**
     * 点を描画します
     * @method drawPixel
     * @param {number} x x座標
     * @param {number} y y座標
     */
    drawPixel(x:number, y:number) {
      if (this.image_data) {
        let width = this.image_data.width;
        let height = this.image_data.height;
        let index = ((width * y) + x) * 4;
        // let data:number[] = this.image_data.data;
        let data = this.image_data.data;
        data[index] = this.foreground_color >> 24 & 0xFF; //color.getR();
        data[index+1] = this.foreground_color >> 16 & 0xFF; //color.getG();
        data[index+2] = this.foreground_color >> 8 & 0xFF; //color.getB();
        data[index+3] = this.foreground_color; //color.getAlpha();
      }
    }

    drawRect(x:number, y:number, width:number, height:number):void {
    }

    fillRect(x:number, y:number, width:number, height:number):void {
    }

    drawCircle(x:number, y:number, r:number) {
    }

    drawPolyline(points_x:number[], points_y:number[], points_num:number) {
    }

    /**
     * 描画処理
     * @method draw
     */
    draw(ctx:CanvasRenderingContext2D):void {
      if (this.image_data && this.update_flag) {
        this.ctx.putImageData(this.image_data,0,0);
        this.update_flag = false;
      }
      this.image_data = this.ctx.getImageData(0, 0, this.width, this.height);
    }
  }
}
