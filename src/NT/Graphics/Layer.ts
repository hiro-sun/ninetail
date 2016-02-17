/**
 * グラフィックスモジュール
 * @module NT.Graphics
 */
module NT.Graphics {

  export class Layer extends DrawableElement{
    id: string;
    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    image_data: ImageData;

    /**
     * NT.LayerはCanvasを内包する描画領域で、NT.Sceneに追加して使用します。
     * NT.Sceneは1つ以上のNT.Layerを持つことができ、NT.Layerは重ねて複数用いることができます。
     *
     * @constructor
     * @class Layer
     * @extends DrawableElement
     * @param {number} width レイヤーの幅
     * @param {number} height レイヤーの高さ
     * @param {number} background_color レイヤーの背景色。省略した場合は透過
     */
    constructor(id: string, width?: number, height?: number, background_color?: number) {
      if (width != undefined && height != undefined) {
        super(width, height);
      }
      this.id = id;
      if (background_color != undefined) this.setBackgroundColor(background_color);
    }

    /**
     * Canvasを生成し初期化します。このメソッドはScene初期化時にSceneから呼ばれます。
     * CanvasのサイズがNT.Layer生成時に指定されていない場合は、NT.Coreに与えられたサイズで初期化されます。
     * @method createCanvas
     */
    public createCanvas(screen_size:NT.Calc.Vector2): void {
      let canvas:HTMLCanvasElement = document.createElement("canvas");
      //キャンバスは親要素のdivコンテナに合わせる
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.position = "absolute";
      canvas.style.top = "0";
      canvas.style.left = "0";

      if (this.getBackgroundColor()) {
        console.log("BG COLOR = " + this.getBackgroundColor());
        canvas.style.backgroundColor = NT.Graphics.Color.toCss(this.getBackgroundColor());
      }
      this.width = screen_size.x;
      this.height = screen_size.y;
      canvas.setAttribute('width', this.width.toString(10));
      canvas.setAttribute('height', this.height.toString(10));
      this.canvas = canvas;
    }

    initContext(): void {
      this.ctx = this.canvas.getContext("2d");
    }

    getCanvasElement(): HTMLCanvasElement {
      return this.canvas;
    }

    /**
     * Canvasの描画内容をクリアします
     * @method clearCanvas
     */
    clearCanvas():void {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
    

    /**
     * 描画処理
     * @method draw
     */
    draw(ctx: CanvasRenderingContext2D): void {
      if (this.ctx) {
        this.clearCanvas();
        for (let key in this.drawable_elements) {
          if (this.drawable_elements[key].getVisible()) {
            this.drawable_elements[key].draw(this.ctx);
          }
        }
      }
    }

    /**
     * Canvasに追加されたエレメントがある場合にはそれを削除した上で、Canvasを削除する
     */
    destroy(): void {
      let viewport = document.getElementById("viewport");
      for (let i:number = 0; i< this.canvas.childNodes.length; i++) {
        this.canvas.removeChild(this.canvas.childNodes[i]);
      }
      viewport.removeChild(this.canvas);
    }

    /**
     * 表示優先度を設定
     * @override
     */
    setPriority(priority_index:number):void {
      super.setPriority(priority_index);
      this.canvas.style.zIndex = priority_index + '';
    }
  }
}
