/**
 * @module NT
 */
module NT {
  export class Viewport {
    private viewport: HTMLElement = null;
    /**
     * ビューポートクラス
     * @class ViewPort
     * @constructor
     */
    constructor(init_data: any) {
      //Canvasのコンテナ用divを作成。このdiv要素のサイズ一杯にCanvasが表示される
      let screen_size = this.calcScreenSize(init_data["size"]["width"], init_data["size"]["height"]);
      let vp = document.getElementById(init_data["id"]);
      vp.style.width = screen_size.x + "px";
      vp.style.height = screen_size.y + "px";
      this.viewport = vp;
    }

    getViewportElement(): HTMLElement {
      return this.viewport;
    }

    /**
     * ゲームスクリーンの解像度を設定 
     * @method calcScreenSize
     * @param {NT.Rect} screen_size ゲーム実行時の内部解像度を指定します。X,Yの情報は使用されません。
     * @return {NT.Calc.Vector2} ゲームをレンダリングする実際の解像度を返します
     */
    private calcScreenSize(width: number, height: number): NT.Calc.Vector2 {
      let inner_width = NT.Device.getInstance().screen["inner_width"];
      let inner_height = NT.Device.getInstance().screen["inner_height"];
      let screen_size: NT.Calc.Vector2 = new NT.Calc.Vector2(0, 0);

      if (width > height) {
        //幅が広い場合には幅に縦の拡大率をかけて縦横比を維持する
        //(実画面高さ/論理画面高さ) -> 縦の拡大率(縮小率)
        screen_size.x = width * (inner_height / height);
        screen_size.y = inner_height;
      } else if (width < height) {
        //高さが広い場合には高さに幅の拡大率をかけて縦横比を維持する
        //(実画面幅/論理画面幅) -> 幅の拡大率(縮小率)
        screen_size.x = inner_width;
        screen_size.y = height * (inner_width / width);
      }
      return screen_size;
    }

  }
} 