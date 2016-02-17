/**
 * 3Dグラフィックスモジュール
 * @module NT.Graphics.GL
 */
module NT.Graphics.GL {
  /**
   * 行列操作用ユーティリティクラス
   * @constructor
   * @class ViewMatrix
   */
  export class ViewMatrix {

    /**
     * カメラの位置、姿勢、注視する座標の設定を行います。
     * 注視する座標と位置が同じ場合は処理を行いません。
     * OpenGLではカメラの位置は原点、Zの負の方向を注視し、Y軸の正方向を上とする姿勢が初期値となります。
     * @method lookAt 
     * @param {Float32Array} eye 注視する座標
     * @param {Float32Array} center カメラ位置
     * @param {Float32Array} up カメラ姿勢
     * @param {NT.Calc.Matrix} dest_matrix モデル行列
     */
    static lookAt(eye:Float32Array, center:Float32Array, up:Float32Array, dest_matrix:NT.Calc.Matrix):void {
      let eye_x = eye[0];
      let eye_y = eye[1];
      let eye_z = eye[2];
      let up_x = up[0];
      let up_y = up[1];
      let up_z = up[2];
      let center_x = center[0];
      let center_y = center[1];
      let center_z = center[2];

      //注視する座標とカメラ位置が同じ場合
      if (eye_x == center_x && eye_y == center_y && eye_z == center_z) return;

      let x0:number, x1:number, x2:number; 
      let y0:number, y1:number, y2:number;
      let z0:number, z1:number, z2:number; 
      let l:number;

      z0 = eye_x - center[0];
      z1 = eye_y - center[1];
      z2 = eye_z - center[2];

      l = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);

      z0 *= l;
      z1 *= l;
      z2 *= l;

      x0 = up_y * z2 - up_z * z1;
      x1 = up_z * z0 - up_x * z2;
      x2 = up_x * z1 - up_y * z0;

      l = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);

      if (!l) {
        x0 = 0; x1 = 0; x2 = 0;
      } else {
        l = 1 / l;
        x0 *= l; x1 *= l; x2 *= l;
      }

      y0 = z1 * x2 - z2 * x1;
      y1 = z2 * x0 - z0 * x2;
      y2 = z0 * x1 - z1 * x0;

      l = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
      if (!l) {
        y0 = 0; y1 = 0; y2 = 0;
      } else {
        l = 1 / l;
        y0 *= l; y1 *= l; y2 *= l;
      }

      let dest = dest_matrix.data;
      
      dest[0] = x0; dest[1] = y0; dest[2]  = z0; dest[3]  = 0;
      dest[4] = x1; dest[5] = y1; dest[6]  = z1; dest[7]  = 0;
      dest[8] = x2; dest[9] = y2; dest[10] = z2; dest[11] = 0;
      dest[12] = -(x0 * eye_x + x1 * eye_y + x2 * eye_z);
      dest[13] = -(y0 * eye_x + y1 * eye_y + y2 * eye_z);
      dest[14] = -(z0 * eye_x + z1 * eye_y + z2 * eye_z);
      dest[15] = 1;

      dest_matrix.data = dest;
    }

    /**
     * 投影行列に対して指定したクリップ領域を元に正射影の変換を行います。
     * @method ortho
     * @param {number} left 画面左の垂直座標
     * @param {number} right 画面右の垂直座標
     * @param {number} bottom 画面下の水平座標
     * @param {number} top 画面上の水平座標
     * @param {number} near 視界からもっとも近いクリップ座標
     * @param {number} far 視界からもっとも遠いクリップ座標
     * @param {NT.Calc.Matrix} dest_matrix 演算対象の投影行列
     */
    static ortho(left:number, right:number, bottom:number, top:number, near:number, far:number, dest_matrix:NT.Calc.Matrix) : void {
      let dest = dest_matrix.data;

      let rl = (right - left);
      let tb = (top - bottom);
      let fn = (far - near);
      dest[0] = 2 / rl;
      dest[1] = 0;
      dest[2] = 0;
      dest[3] = 0;
      dest[4] = 0;
      dest[5] = 2 / tb;
      dest[6] = 0;
      dest[7] = 0;
      dest[8] = 0;
      dest[9] = 0;
      dest[10] = -2 / fn;
      dest[11] = 0;
      dest[12] = -(left + right) / rl;
      dest[13] = -(top + bottom) / tb;
      dest[14] = -(far + near) / fn;
      dest[15] = 1;
      dest_matrix.data = dest;
    }

    /**
     * 視野角を元に透視法射影を行います
     * @method perspective
     * @param {number} fovy 視野角
     * @param {number} aspect 視界のアスペクト比
     * @param {number} near 視界からもっとも近いクリップ座標
     * @param {number} far 視界からもっとも遠いクリップ座標
     * @param {NT.Calc.Matrix} dest_matrix 演算対象の投影行列
     */
    static perspective(fovy:number, aspect:number, near:number, far:number, dest_matrix:NT.Calc.Matrix) : void{
      let t = near * Math.tan(fovy * Math.PI / 360);
      let r = t * aspect;
      let a = r * 2, b = t * 2, c = far - near;
      let dest = dest_matrix.data;
      dest[0] = near * 2 / a;
      dest[1] = 0;
      dest[2] = 0;
      dest[3] = 0;
      dest[4] = 0;
      dest[5] = near * 2 / b;
      dest[6] = 0;
      dest[7] = 0;
      dest[8] = 0;
      dest[9] = 0;
      dest[10] = -(far + near) / c;
      dest[11] = -1;
      dest[12] = 0;
      dest[13] = 0;
      dest[14] = -(far * near * 2) / c;
      dest[15] = 0;

      dest_matrix.data = dest;
    }
  }
}

