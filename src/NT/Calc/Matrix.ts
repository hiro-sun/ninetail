/**
 * 計算モジュール
 * @module NT.Calc
 */
module NT.Calc {
  export class Matrix {
    data: Float32Array;

    /**
     * 行列クラス
     * @class Matrix
     * @constructor
     * @param {Float32Array} data 省略可能。初期化する場合は32ビット浮動小数点配列を渡します。省略した場合は16の長さの0で初期化された配列を指定したものとみなします。
     */
    constructor(data?: Float32Array) {
      if (!data) {
        this.data = new Float32Array(16);
      } else {
        this.data = data;
      }
    }

    /**
     * 行列をコピーし新しいインスタンスを返します
     * @method copy
     * @return NT.Calc.Matrix
     */
    copy(): NT.Calc.Matrix {
      return new NT.Calc.Matrix(this.data);
    }

    /**
     * 単位行列でデータを初期化します。初期化したデータは戻り値として取得できます
     * @method identity
     * @return NT.Calc.Matrix
     */
    identity(): NT.Calc.Matrix {
      for (let i: number = 0; i < this.data.length; i++) {
        this.data[i] = (i % 5 == 0) ? 1 : 0;
      }
      return this;
    }

    /**
     * 行列の積を行いその結果を返します。このMatrixオブジェクトの値自体は書き換えず、新しいインスタンスが生成されます。
     * @method x
     * @param {NT.Calc.Matrix} mat 掛ける行列
     * @return {NT.Calc.Matrix} 積の結果
     */
    x(mat: NT.Calc.Matrix): NT.Calc.Matrix {
      return this.multiply(mat);
    }

    /**
     * 平行移動行列を計算します。
     * @method translate
     * @param {NT.Calc.Vector3} vec
     * @return {NT.Calc.Matrix} 平行移動行列
     */
    translate(vec: NT.Calc.Vector3): NT.Calc.Matrix {
      let dest = new Float32Array(16);
      let mat = this.data;
      dest[0] = mat[0]; dest[1] = mat[1]; dest[2] = mat[2]; dest[3] = mat[3];
      dest[4] = mat[4]; dest[5] = mat[5]; dest[6] = mat[6]; dest[7] = mat[7];
      dest[8] = mat[8]; dest[9] = mat[9]; dest[10] = mat[10]; dest[11] = mat[11];
      dest[12] = mat[0] * vec.x + mat[4] * vec.y + mat[8] * vec.z + mat[12];
      dest[13] = mat[1] * vec.x + mat[5] * vec.y + mat[9] * vec.z + mat[13];
      dest[14] = mat[2] * vec.x + mat[6] * vec.y + mat[10] * vec.z + mat[14];
      dest[15] = mat[3] * vec.x + mat[7] * vec.y + mat[11] * vec.z + mat[15];

      this.data = dest;
      return this;
    }

    /**
     * 拡大縮小行列を計算します。
     * @method scale
     * @param {NT.Calc.Vector3} vec
     * @return {NT.Calc.Matrix} 拡大縮小行列
     */
    scale(vec: NT.Calc.Vector3): NT.Calc.Matrix {
      let dest = new Float32Array(16);
      let mat = this.data;
      dest[0] = mat[0] * vec.x;
      dest[1] = mat[1] * vec.x;
      dest[2] = mat[2] * vec.x;
      dest[3] = mat[3] * vec.x;
      dest[4] = mat[4] * vec.y;
      dest[5] = mat[5] * vec.y;
      dest[6] = mat[6] * vec.y;
      dest[7] = mat[7] * vec.y;
      dest[8] = mat[8] * vec.z;
      dest[9] = mat[9] * vec.z;
      dest[10] = mat[10] * vec.z;
      dest[11] = mat[11] * vec.z;
      dest[12] = mat[12];
      dest[13] = mat[13];
      dest[14] = mat[14];
      dest[15] = mat[15];
      this.data = dest;
      return this;
    }


    /**
     * 回転行列を計算します。
     * @method rotate
     * @param {number} rad ラジアン角
     * @return {NT.Calc.Matrix} 回転行列
     */
    rotate(rad: number, axis: NT.Calc.Vector3): NT.Calc.Matrix{
      let dest = new Float32Array(16);
      let mat = this.data;
      let sq = Math.sqrt(axis.x * axis.x + axis.y * axis.y + axis.z * axis.z);
      if (!sq) return null;

      let a = axis.x;
      let b = axis.y;
      let c = axis.z;

      if (sq != 1) {
        sq = 1 / sq; 
        a *= sq; 
        b *= sq; 
        c *= sq;
      }

      let d = Math.sin(rad), e = Math.cos(rad), f = 1 - e,
          g = mat[0],  h = mat[1], i = mat[2],  j = mat[3],
          k = mat[4],  l = mat[5], m = mat[6],  n = mat[7],
          o = mat[8],  p = mat[9], q = mat[10], r = mat[11],
          s = a * a * f + e,
          t = b * a * f + c * d,
          u = c * a * f - b * d,
          v = a * b * f - c * d,
          w = b * b * f + e,
          x = c * b * f + a * d,
          y = a * c * f + b * d,
          z = b * c * f - a * d,
          A = c * c * f + e;
      if(rad){
        if(mat != dest){
          dest[12] = mat[12]; dest[13] = mat[13];
          dest[14] = mat[14]; dest[15] = mat[15];
        }
      } else {
        dest = mat;
      }
      dest[0] = g * s + k * t + o * u;
      dest[1] = h * s + l * t + p * u;
      dest[2] = i * s + m * t + q * u;
      dest[3] = j * s + n * t + r * u;
      dest[4] = g * v + k * w + o * x;
      dest[5] = h * v + l * w + p * x;
      dest[6] = i * v + m * w + q * x;
      dest[7] = j * v + n * w + r * x;
      dest[8] = g * y + k * z + o * A;
      dest[9] = h * y + l * z + p * A;
      dest[10] = i * y + m * z + q * A;
      dest[11] = j * y + n * z + r * A;
      this.data = dest;
      return this;
    }


    /**
     * 行列の積を行いその結果を新しい行列として返します。
     * @method multiply
     * @param {NT.Calc.Matrix} mat 掛ける行列
     * @return {NT.Calc.Matrix} 積の結果
     */
    multiply2(mat: NT.Calc.Matrix): NT.Calc.Matrix {
      let dest = new Float32Array(16);
      let m1 = this.data;
      let m2 = mat.data;
      let a = m1[0],  b = m1[1],  c = m1[2],  d = m1[3],
          e = m1[4],  f = m1[5],  g = m1[6],  h = m1[7],
          i = m1[8],  j = m1[9],  k = m1[10], l = m1[11],
          m = m1[12], n = m1[13], o = m1[14], p = m1[15],
          A = m2[0],  B = m2[1],  C = m2[2],  D = m2[3],
          E = m2[4],  F = m2[5],  G = m2[6],  H = m2[7],
          I = m2[8],  J = m2[9],  K = m2[10], L = m2[11],
          M = m2[12], N = m2[13], O = m2[14], P = m2[15];
      dest[0] = A * a + B * e + C * i + D * m;
      dest[1] = A * b + B * f + C * j + D * n;
      dest[2] = A * c + B * g + C * k + D * o;
      dest[3] = A * d + B * h + C * l + D * p;
      dest[4] = E * a + F * e + G * i + H * m;
      dest[5] = E * b + F * f + G * j + H * n;
      dest[6] = E * c + F * g + G * k + H * o;
      dest[7] = E * d + F * h + G * l + H * p;
      dest[8] = I * a + J * e + K * i + L * m;
      dest[9] = I * b + J * f + K * j + L * n;
      dest[10] = I * c + J * g + K * k + L * o;
      dest[11] = I * d + J * h + K * l + L * p;
      dest[12] = M * a + N * e + O * i + P * m;
      dest[13] = M * b + N * f + O * j + P * n;
      dest[14] = M * c + N * g + O * k + P * o;
      dest[15] = M * d + N * h + O * l + P * p;

      return new NT.Calc.Matrix(dest);
    }

    multiply(mat: NT.Calc.Matrix): NT.Calc.Matrix {
      let dest = new Float32Array(16);
      let m1 = this.data;
      let m2 = mat.data;

      let tmp,i,j,k;
      for (i = 0; i < 4; ++i) {
        for (j = 0; j < 4; ++j) {
          tmp = 0;
          for (k = 0; k < 4; ++k) {
            tmp += m1[k * 4 + i] * m2[j * 4 + k];
            dest[j * 4 + i] = tmp;
          }
        }
      }
      return new NT.Calc.Matrix(dest);
    }


    /**
     * 逆行列を作成
     * @method inverse
     */
    inverse(mat: NT.Calc.Matrix): NT.Calc.Matrix {
      let dest = new Float32Array(16);
      return new NT.Calc.Matrix(dest);
    }

    /**
     * 転値行列を作成
     * @method transpose
     */

    transpose(mat: NT.Calc.Matrix): NT.Calc.Matrix {
      let dest = new Float32Array(16);
      return new NT.Calc.Matrix(dest);
    }
  }
}