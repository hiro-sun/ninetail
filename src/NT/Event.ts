/**
 * NineTail
 * @module NT
 */
module NT {
  export class Event {
    private touch_max:number = 2;
    /**
     * 現在タッチしている場所
     * @property {[number,number][]} positions
     */
    private positions: [number, number][];

    /**
     * タッチを開始した座標
     * @property {[number,number][]} begin_positions
     */
    private begin_positions: [number, number][];

    move_counter: number = 0;
    worker: Worker;

    private tmp_position: [number, number];

     
    /**
     * イベントが登録された要素の位置(top, left)を保持
     * @property {[number,number]} position_offset
     */
    private position_offset: [number, number];

    constructor(offset: [number, number], touch_max: number) {
      console.log("EVENT OFFSET = " + offset);
      //this.worker = new Worker("/js/EventWorker.js");
      this.position_offset = offset;
      this.touch_max = touch_max;
      this.positions = new Array(this.touch_max);
      this.begin_positions = new Array(this.touch_max);
      this.tmp_position = [0, 0];
    }

    getPositions(): [number, number][]{
      return this.positions;
    }

    getBeginPositions(): [number, number][]{
      return this.begin_positions;
    }

   /**
     * すでにタッチされていないタッチ情報の開始座標、ドラッグ距離を初期化
     */
    private resetTouchesPosition(): void{
      for (let i: number = 0; i < this.touch_max; ++i) {
        if (this.positions[i] == null) {
          this.begin_positions[i] = undefined;
        }
      }
    }

    /**
     * タッチした座標を取得
     * @method getTouchPosition
     */
    private updateTouchesPosition(event:any, mode?:number):void {
      let pos = this.position_offset;
      if (event.touches) {
        //タッチイベントの場合の処理
        let touches = event.touches;
        if (touches.length && touches.length > 0) {
          for (let i = 0; i < this.touch_max; ++i) {
            this.positions[i] = undefined;
          }
          for (let i = 0; i < touches.length; ++i) {
            let x = ((touches[i].pageX - pos[0]) | 0);
            let y = ((touches[i].pageY - pos[1]) | 0);
            //座標が0より小さい場合は領域外のため0とする
            x = (x >= 0) ? x : 0;
            y = (y >= 0) ? y : 0;
            this.positions[touches[i].identifier] = [x, y];

            if (mode == 0 && this.begin_positions[i] == null) {
              this.begin_positions[i] = this.positions[i];
            } 
          }
        } else {
          //タッチイベントが1つもなかった場合
          for (let i = 0; i < this.touch_max; ++i) {
            this.positions[i] = undefined;
          }
        }
      } else {
        //タッチイベントではなくマウスイベントの場合
        let x = ((event.pageX - pos[0]) | 0);
        let y = ((event.pageY - pos[1]) | 0);
        //座標が0より小さい場合は領域外のため0とする
        x = (x >= 0) ? x : 0;
        y = (y >= 0) ? y : 0;
        this.positions[0] = [x, y];
      }
      
    }

    handleStart(event: any): void {
      console.log("touchStart");
      event.preventDefault();
      this.updateTouchesPosition(event, 0);
      
    }

    handleMove(event: any): void {
      event.preventDefault();
      this.updateTouchesPosition(event);
      
    }

    handleEnd(event: any): void {
      event.preventDefault();

      this.updateTouchesPosition(event);
      this.resetTouchesPosition();
      //複数の指でタッチしていた場合は指が残っている場合もあるので座標をアップデート
    }

    handleCancel(event: any): void {
      //console.log("touchCancel");
    }
    handleLeave(event: any): void {
      //console.log("touchLeave");
    }
  }
} 