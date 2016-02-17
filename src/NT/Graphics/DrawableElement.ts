/**
 * グラフィックスモジュール
 * @module NT.Graphics
 */
module NT.Graphics {
  export class DrawableElement {
    /**
     * 描画要素リスト
     * @property drawable_elements
     * @type DrawableElement[]
     */
    drawable_elements:{[key:number]:DrawableElement;}
    /**
     * 描画要素の横のサイズ(px)
     * @property width
     * @type number
     */
    width:number;
    /**
     * 描画要素の縦のサイズ(px)
     * @property height
     * @type number
     */
    height:number;
    /**
     * 描画要素の横方向の位置
     * @property x
     * @type number
     */
    x:number;
    /**
     * 描画要素の横方向の位置
     * @property y
     * @type number
     */
    y:number;
    /**
     * 描画要素の表示・非表示フラグ
     * @property is_visible
     * @type boolean
     */
    is_visible:boolean;
    /**
     * 描画要素の表示優先度
     * @property priority_index
     * @type number
     */
    priority_index:number;

    /**
     * 前景色
     * @property foreground_color
     * @type number
     */
    foreground_color:number;

    /**
     * 背景色
     * @property background_color
     * @type number
     */
    background_color:number

    /**
     * 描画要素基底クラス。
     * 各描画要素は必ずこのクラスを継承して作成されます。
     * @constructor
     * @class DrawableElement
     * @param {number} width 描画要素の横のサイズです。省略した場合は0になります。
     * @param {number} height 描画要素の縦のサイズです。省略した場合は0になります。
     */
    constructor(width?:number, height?:number) {
      this.x = 0;
      this.y = 0;
      this.is_visible = true;

      if (width == undefined && height == undefined) {
        this.width = 0;
        this.height = 0;
      } else {
        this.width = width;
        this.height = height;
      }
    }

    /**
     * 描画エレメントを追加します
     * @method addElement
     * @param {NT.DrawableElement} node
     * @param {number} tag
     */
    addElement(node: DrawableElement, tag: number): void {
      if (!this.drawable_elements) this.drawable_elements = {};
      this.drawable_elements[tag] = node;
    }

    /**
     * 追加した描画エレメントを取得します
     * @method getElement
     * @param {number} tag
     * @return {DrawableElement} 
     */
    getElement(tag:number):DrawableElement {
      return this.drawable_elements[tag];
    }


    /**
     * 描画処理
     * @method draw
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx:CanvasRenderingContext2D):void { 
      if (this.background_color != undefined) {
        ctx.fillStyle = NT.Graphics.Color.toCss(this.background_color);
        ctx.fillRect(this.x, this.y, this.width, this.height);
      }
    }

    /**
     * 破棄
     * @method destroy
     */
    destroy():void { }

    /**
     * 可視状態にします
     * @method setVisible
     * @param {boolean} b
     */
    setVisible(b:boolean):void {
      this.is_visible = b;
    }

    /**
     * 可視・不可視状態を取得します
     * @method getVisible
     * @return {boolean} trueの場合は可視、falseの場合は不可視状態
     */
    getVisible():boolean {
      return this.is_visible;
    }

    /**
     * 位置を設定します
     * @method setPosition
     * @param {NT.Point} point
     */
    setPosition(x:number, y:number):void {
      this.x = x;
      this.y = y;
    }

    /**
     * x座標を設定します。
     * @method setPositionX
     * @param {number} x
     */
    setPositionX(x:number):void {
      this.x = x;
    }

    /**
     * y座標を設定します。
     * @method setPositionY
     * @param {number} y
     */
    setPositionY(y:number):void {
      this.y = y;
    }

    /**
     * 位置を取得します
     * @method getPosition
     * @return {NT.Point} 
     */
    getPosition():Point {
      return new Point(this.x, this.y);
    }

    /**
     * x座標を取得します。
     * @method getPositionX
     * @return number x座標
     */
    getPositionX():number {
      return this.x
    }

    /**
     * y座標を取得します。
     * @method getPositionY
     * @return number y座標
     */
    getPositionY():number {
      return this.y;
    }

    /**
     * 表示優先度設定
     * @method setPriority
     * @param {number} priority_index 0-255の値 
     */
    setPriority(priority_index:number):void {
      console.log(priority_index);
      this.priority_index = priority_index;
    }

    /**
     * 表示優先度取得
     * @method getPriority
     * @return {number} 表示優先度の値
     */
    getPriority():number {
      return this.priority_index;
    }

    /**
     * @method setForegroundColor
     * @param {number} foreground_color 前景色
     */
    setForegroundColor(foreground_color:number):void {
      this.foreground_color = foreground_color;
    }

    /**
     * @method getForegroundColor
     * @return {number} 前景色
     */
    getForegroundColor():number {
      return this.foreground_color;
    }

    /**
     * @method setBackgroundColor
     * @param {number} background_color 背景色
     */
    setBackgroundColor(background_color:number):void {
      console.log("call setBackgroundColor:" + background_color);
      this.background_color = background_color;
    }

    /**
     * @method getBackgroundColor
     * @return {number} 背景色
     */
    getBackgroundColor():number {
      return this.background_color;
    }
  }
}
