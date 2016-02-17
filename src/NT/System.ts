/**
 * NineTail
 * @module NT
 */
module NT {
  /**
   * NT.Sceneの状態種別
   * @property SceneState
   * @type {enum}
   */
  export enum SceneState {
    Init,
    Begin,
    Main,
    End
  };

   /**
   * ゲームの状態種別
   * @property GameState
   * @type {enum}
   */
  export enum GameState {
    Play,
    Pause
  };

  export class System {
    private process: any = null;

    /**
    * @property state ゲームの状態を示す変数
    * @default NT.GameState.Play
    */
    state: number = NT.GameState.Play;

    //現在のシーン名
    current_scene_name: string; 

    //システムに登録されたシーン
    scenes: { [key:string]:Scene; } = { };

    private event_model: NT.Event;

    private viewport: NT.Viewport;
    
    screen_size: NT.Calc.Vector2;

    current_time: number = 0;
    before_time: number = 0;
    fps_counter: number = 0;
    fps_element: HTMLElement;

    /**
     * @class System
     * @constructor
     */
    constructor(init_data:any) {

      this.parseInitData(init_data);

      //現在の実行シーンをnullで初期化
      this.current_scene_name = null;
      //現在のゲーム状態をPlay状態で初期化
      this.state = GameState.Play;

      //FPS計測用変数初期化
      this.before_time = new Date().getTime();
      this.fps_element = document.getElementById("fps");
    }

    private parseInitData(init_data: any): boolean {
      if (init_data["system"] == null) {
        console.error("error: system初期化に失敗しました");
        return false;
      }


      let viewport_data = init_data["system"]["viewport"];
      if (viewport_data != null) {
        this.viewport = new NT.Viewport(viewport_data);
        this.screen_size = new NT.Calc.Vector2(viewport_data["size"]["width"], viewport_data["size"]["height"]);
      }

      let input_data = init_data["system"]["input"];
      if (input_data) {
        //イベントモデルを登録
        if (input_data["touch"] === true) {
          this.initEventModel(new NT.Event(NT.DomUtils.getElementPosition(this.viewport.getViewportElement()), 2), this.viewport.getViewportElement());
        } else {
          console.error("イベントを登録するHTML要素がありません");
        }
      }
    }

    getViewportElement(): HTMLElement {
      return this.viewport.getViewportElement();
    }

    start(): void {
      this.process = (time: number) => {
        this.execute();
        window.requestAnimationFrame(this.process);
      }
      //プロセス開始
      window.requestAnimationFrame(this.process);
    }


    getEventModel(): NT.Event {
      return this.event_model;
    }

    initEventModel(event_model: NT.Event, event_element: HTMLElement) {
      this.event_model = event_model;
      event_element.addEventListener("touchstart", event_model.handleStart.bind(event_model), false);
      event_element.addEventListener("mousedown", event_model.handleStart.bind(event_model), false);
      event_element.addEventListener("touchend", event_model.handleEnd.bind(event_model), false);
      event_element.addEventListener("mouseup", event_model.handleEnd.bind(event_model), false);
      event_element.addEventListener("touchcancel", event_model.handleCancel.bind(event_model), false);
      event_element.addEventListener("touchleave", event_model.handleLeave.bind(event_model), false);
      event_element.addEventListener("touchmove", event_model.handleMove.bind(event_model), false);
      event_element.addEventListener("mousemove", event_model.handleMove.bind(event_model), false);
    }

    /**
     * NT.Sceneを追加する
     * @method addScene
     * @param {NT.Scene} sceneオブジェクト
     */
    addScene(scene: Scene) {
      this.scenes[scene.getName()] = scene;
    }

    /**
     * シーンを削除します
     * @method removeScene
     * @param {string} scene_name 削除対象のシーン名
     * @return {boolean} 削除に成功した場合はtrueを、失敗した場合はfalseを返します
     */
    removeScene(scene_name: string): boolean {
      if (this.scenes[scene_name].state == NT.SceneState.End) {
        //終了状態の時のみ削除可能
        this.scenes[scene_name] = null;
        return true;
      } else {
        console.error("シーンのステータスが終了していないため削除できません(scene_name:" + scene_name + ")");
      }
      return false;
    }

    /**
     * 指定したNT.Sceneに切り替える
     * @method changeScene
     * @param {string} scene_name シーン識別用の名前
     */
    changeScene(scene_name: string): void {
      if (this.current_scene_name != null) {
        //現在実行中のシーンがある場合は、そのシーンのステートを終了状態にして終了処理を実行する。
        this.scenes[this.current_scene_name].state = NT.SceneState.End;
        this.scenes[this.current_scene_name].execute();
      }
      //変更先シーンのステートを開始状態にする
      this.current_scene_name = scene_name;
      this.scenes[this.current_scene_name].state = NT.SceneState.Begin;
    }

    /**
     * シーンを実行します。
     * シーンに定義した処理を継続的に実行する場合、このexecuteメソッドを適切な間隔で呼び出す必要があります。
     * @method execute
     */
    execute(): void {
      if (this.state == NT.GameState.Play) {
        //ゲーム処理実行中の場合はシーンの実行を行う
        if (this.current_scene_name != null) {
          this.scenes[this.current_scene_name].execute();
          this.calcFps();
        } else {
          console.log("please set scene");
        }
      }
    }

    private calcFps(): void {
      this.fps_counter++;
      this.current_time = new Date().getTime();
      let diff = this.current_time - this.before_time;
      if (diff >= 1000) {
        this.fps_element.innerHTML = "FPS:" + this.fps_counter;
        this.before_time = new Date().getTime();
        this.fps_counter = 0;
      }
    }

    /**
     * ゲーム処理を開始します。このメソッドはpauseを解除します。
     * デフォルトではNT.Systemのstartメソッド実行時に処理が自動的に開始されるため、pauseをしていない限り、これを改めて呼び出す必要はありません。
     * @method play
     */
    play(): void {
      this.state = NT.GameState.Play;
    }

    /**
     * ゲーム処理を一時停止状態にします
     * @method pause
     */
    pause(): void {
      this.state = NT.GameState.Pause;
    }
  }
}
