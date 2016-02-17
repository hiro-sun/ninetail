/**
 * グラフィックスモジュール
 * @module NT.Graphics
 */
module NT.Graphics {
  /**
   * Bitmapクラス
   */
  export class Bitmap {
    private image:HTMLImageElement;
    private canvas: HTMLCanvasElement;
    private is_loaded:boolean = false;

    constructor(file:string) {
      this.image = new Image();
      this.image.src = file + "?" + new Date().getTime();
      this.image.onload = () => {
        this.is_loaded = true;
      }
      this.canvas = document.createElement("canvas");
      let ctx = this.canvas.getContext("2d");
      ctx.drawImage(this.image, 0, 0);
    }

    getImageData(x?:number, y?:number, width?:number, height?:number): ImageData {
      let ctx = this.canvas.getContext("2d");
      if (x != undefined || y != undefined || width != undefined || height != undefined) {
        return ctx.getImageData(x, y, width, height);
      }
      return ctx.getImageData(0, 0, this.image.width, this.image.height);
    }

    getImage():HTMLImageElement {
      return this.image;
    }

    isLoaded():boolean {
      return this.is_loaded;
    }
  }
}
