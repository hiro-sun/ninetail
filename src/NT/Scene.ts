/**
 * NineTail
 * @module NT
 */
module NT {
  export class Scene {
    /**
     * 内包するレイヤー
     * @property layers
     * @type {[key:number]:NT.Graphics.Layer}
     * @default undefined
     * @protected
     */
    layers:{[key:number]:NT.Graphics.Layer;}

    /**
     * シーン開始時の処理で一回だけ実行されます。
     * @property begin_process
     * @type {Function}
     * @default undefined
     * @private
     */
    begin_process:Function;

    /**
     * シーンのメイン処理です。
     * @property main_process
     * @type {Function}
     * @default undefined
     * @private
     */
    main_process:Function;
    //終了処理

    /**
     * シーンの終了時(シーン変更時)に呼ばれる終了処理です。
     * @property end_process
     * @type {Function}
     * @default undefined
     */
    end_process: Function;

    /**
     * ゲームステート管理用変数
     * @property state
     */
    state: number = NT.SceneState.Init;

    screen_size: NT.Calc.Vector2;

    /**
     * シーン内の処理単位ごとの関数をセットしておく配列
     * @property {Function[]} process_list
     */
    private process_list: Function[];

    /**
     * ゲームシーン(タイトル、ゲーム本編、ゲームオーバーなど)を表すクラスです。
     *
     * @constructor
     * @class Scene
     * @param {string} scene_name シーンの名称。呼び出すシーンを切り替える際は、この名前を指定します。シーン名は一意な値である必要があります。
     */

    constructor(public scene_name: string, screen_size: NT.Calc.Vector2) {
      this.screen_size = screen_size;
      this.layers = {};
      this.state = NT.SceneState.Begin;

      //シーン内の処理単位（初期化、メイン処理、終了処理）の関数を配列にセット（分岐をなくすため）
      this.process_list = new Array(4);

      this.process_list[NT.SceneState.Begin] = () => {
        //シーン初期化
        console.log("initScene");
        if (this.begin_process != null) this.begin_process.apply(this);
        //一度実行したらステート変数にSceneState.Mainをセット。
        this.state = NT.SceneState.Main;
      }

      this.process_list[NT.SceneState.Main] = () => {
        //シーンメイン処理
        if (this.main_process != null) {
          this.main_process.apply(this);
        }
        this.draw();
      }

      this.process_list[NT.SceneState.End] = () => {
        if (this.end_process != null) this.end_process.apply(this);
        this.destroy();
      }
    }

    /**
     * シーンの基本初期化処理。Scene.executeが呼び出され、stateがSceneStage.Beginの場合に実行されます。
     * @method init
     */
    private init(): void {
      //シーンに追加されたレイヤーを初期化
      console.log("initLayers");
      for (let key in this.layers) {
        console.log("initLayer:" + key);
        //this.layers[key].createCanvas(this.screen_size); //レイヤーのキャンバスを作成
      }
    }

    /**
     * シーン開始時の処理登録
     * @method registerBeginProcess
     * @param {Function} f 実行する処理(関数)
     */
    registerBeginProcess(f: Function): void {
      if (this.begin_process == undefined) this.begin_process = f;
    }

    /**
     * シーン処理登録
     * @method registerMainProcess
     * @param {Function} f 実行する処理(関数)
     */
    registerMainProcess(f:Function):void {
      if(this.main_process == undefined) this.main_process = f;
    }

    /**
     * シーン終了処理登録
     * @method registerEndProcess
     * @param {Function} f 実行する処理(関数)
     */
    registerEndProcess(f:Function):void {
      if(this.end_process == undefined) this.end_process = f;
    }

    /**
     * シーン名を取得
     * @return {string} シーン名
     */
    getName():string {
      return this.scene_name;
    }

    /**
     * レイヤーを追加
     * @method addLayer
     * @param {Layer} layer 追加するレイヤーオブジェクト
     */
    addLayer(layer: NT.Graphics.Layer, viewport:HTMLElement, tag) {
      console.log("addLayer:" + tag + ":" + layer);
      this.layers[tag] = layer;
      this.layers[tag].createCanvas(this.screen_size);
      this.layers[tag].initContext();
      viewport.appendChild(this.layers[tag].getCanvasElement());
    }

    /**
     * レイヤーを取得
     */
    getLayer(tag:number):NT.Graphics.Layer {
      return this.layers[tag];
    }

    /**
     * シーン処理実行
     * @method execute
     */
    execute(): void {
      if (this.state != NT.SceneState.Init) {
        if (this.process_list[this.state]) {
          this.process_list[this.state]();
        }
      }
    }

    /**
     * シーン終了時、シーンの破棄を行うメソッド
     * 自動で呼び出される
     * @method destroy
     */
    private destroy(): void {
      for (let key in this.layers) {
        this.layers[key].destroy();
      }
    }


    /**
     * シーン描画処理(2DLayerのみ)
     * 故意に呼び出す必要なし
     * @method draw
     */
    private draw(): void {
      for (let key in this.layers) {
        if (this.layers[key].getVisible()) this.layers[key].draw(null);
      }
    }
  }
}


