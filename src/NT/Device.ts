/**
 * NineTail
 * @module NT
 */
module NT {
  export class Device {
    private static instance: Device = null;
    env: { [key: string]: any } = {};
    screen: { [key: string]: any } = {};

    /**
     * デバイスの解像度、ピクセル比、現在の画面サイズを基に比率を維持した場合の解像度などのデバイスに依存する各種情報を保持します。
     * このクラスはシングルトンクラスで、プログラムのどこからでも参照が可能です。
     * @class Device
     * @constructor
     */
    constructor() {
      if (!Device.instance) {
        Device.instance = this;
        //デバイスタイプを取得
        
        this.env['user_agent'] = window.navigator.userAgent.toLowerCase();
        if (this.env['user_agent'].indexOf("mobile") != -1) {
          //モバイル
          this.env['device_type'] = 'mobile';
        } else {
          //その他
          this.env['device_type'] = 'other';
        }

        //デバイスピクセル比(1つのドットをどういうピクセル比で描画するか)の取得
        let pixel_ratio:number = window.devicePixelRatio;
        this.screen["pixel_ratio"] = pixel_ratio;

        let client_width: number = document.documentElement.clientWidth;
        let client_height: number = document.documentElement.clientHeight;
        let inner_width: number = window.innerWidth;
        let inner_height: number = window.innerHeight;

        this.screen["client_width"] = client_width;
        this.screen["client_height"] = client_height;
        this.screen["inner_width"] = inner_width;
        this.screen["inner_height"] = inner_height;

      }
    }

    public static getInstance(): Device {
      if (Device.instance === null) Device.instance = new Device();
      return Device.instance;
    }
  }
}