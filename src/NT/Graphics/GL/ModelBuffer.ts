/**
 * 3Dグラフィックスモジュール  
 * @module NT.Graphics.GL
 */
module NT.Graphics.GL {
  export class ModelBuffer {
    buffers: { [key: string]: WebGLBuffer } = {};

    /**
     * @property {WebGLTexture} texture
     */
    texture: WebGLTexture;

    /**
     * @property {Image} texture_image;
     */
    texture_image: HTMLImageElement;

    /**
     * @property {HTMLVideoElement} video_element
     */
    video_element: HTMLVideoElement;

    /**
     * メッシュ、テクスチャ情報を持つ描画物オブジェクト。描画処理を持つ。
     * @class ModelBuffer
     * @constructor
     * @param {WebGLRenderingContext} gl WebGLのレンダリングコンテキスト
     * @param {NT.Mesh} mesh 描画するメッシュ情報
     * @param {[key:string]:number} attrib_location シェーダーの属性位置
     * @param {[key:string]:WebGLUniformLocation} uni_location シェーダーのuniformの位置
     */
    constructor(gl: WebGLRenderingContext, public mesh: NT.Mesh, public attrib_location: { [key: string]: number }, public uni_location: { [key: string]: WebGLUniformLocation }) {

      //インデックス
      let indices = mesh.indices;
      //頂点座標
      let vertices = mesh.vertex["VERTEX"];
      //法線座標
      let normals = mesh.vertex["NORMAL"];

      //テクスチャ座標
      let texture_coords: number[] = undefined;
      if (this.isValidArray(mesh.vertex["TEXCOORD"])) {
        //テクスチャが存在する場合
        texture_coords = mesh.vertex["TEXCOORD"];
        switch (this.getTextureFileType(mesh.texture_filename)) {
          case "image":
            this.createTexture(gl, mesh.texture_filename);
            break;
          case "video":
            this.video_element = <HTMLVideoElement>document.getElementById(mesh.texture_filename);
            console.log(this.video_element);
            this.createVideoTexture(gl, this.video_element);
            break;
          default:
            console.error("テクスチャ座標データが存在していますが、適切なテクスチャ用のイメージ、ビデオデータの指定がありません");
        }
      }

      let colors: number[];
      if (this.isValidArray(mesh.vertex["COLOR"])) {
        colors = mesh.vertex["COLOR"];
      } else {
        //色情報がメッシュに含まれていない場合は白を指定
        colors = new Array(vertices.length / 3 * 4) //頂点座標配列の要素数から３を割り頂点数を取得し、１頂点分の色情報として４をかけた値がカラー情報の配列要素数となる
        for (let i: number = 0; i < colors.length; i += 4) {
          colors[i] = 1.0; colors[i + 1] = 1.0; colors[i + 2] = 1.0; colors[i + 3] = 1.0;
        }
      }

      

      //頂点バッファの作成
      this.buffers["vbo"] = this.createVBO(gl, vertices);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers["vbo"]);
      //頂点属性を有効にする
      gl.enableVertexAttribArray(attrib_location["aVertexPosition"]);
      //頂点属性を登録する
      gl.vertexAttribPointer(attrib_location["aVertexPosition"], mesh.stride["VERTEX"], gl.FLOAT, false, 0, 0);

      
      //カラーバッファを作成
      this.buffers["cvbo"] = this.createVBO(gl, colors);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers["cvbo"]);
      gl.enableVertexAttribArray(attrib_location["aVertexColor"]);
      gl.vertexAttribPointer(attrib_location["aVertexColor"], mesh.stride["COLOR"], gl.FLOAT, false, 0, 0);

      //インデックスバッファを作成
      this.buffers["ibo"] = this.createIBO(gl, indices);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers["ibo"]);

      //テクスチャ座標処理
      if (texture_coords) {
        if (texture_coords.length > 0) {
          console.log("テクスチャ座標バッファ作成");
          this.buffers["tvbo"] = this.createVBO(gl, texture_coords);
          gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers["tvbo"]);
          gl.enableVertexAttribArray(attrib_location["aVertexTexture"]);
          gl.vertexAttribPointer(attrib_location["aVertexTexture"], mesh.stride["TEXCOORD"], gl.FLOAT, false, 0, 0);
        }
      }
    }

    /**
     * 与えられた値が配列のインスタンスで要素数が1以上であるかどうかを判定
     */
    private isValidArray(arr: any[]): boolean {
      if (arr instanceof Array && arr.length > 0) {
        return true;
      }
      return false;
    }


    private getTextureFileType(name: string):string {
      let reg = /(.*)(?:\.([^.]+$))/;
      let file_type = name.match(reg)[2];
      if (file_type == "png") {
        console.log("pngをテクスチャとして利用します:" + name);
        return "image";
      } else if (file_type == "video") {
        console.log("webmをテクスチャとして利用します:" + name);
        return "video";
      }

      return null;
    }

    /**
     * 頂点バッファ作成
     */
    private createVBO(gl:WebGLRenderingContext, data: number[]): WebGLBuffer {
      let vbo = gl.createBuffer();
      //vboオブジェクトを配列バッファとしてバインド
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      //バッファデータをvboオブジェクトにセット
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
      //バインドできるバッファは同時に１つだけのため、nullをセットしてバインドを解除
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      return vbo;
    }

    /**
     * インデックスバッファ作成
     */
    private createIBO(gl:WebGLRenderingContext, data: number[]): WebGLBuffer {
      let ibo = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      return ibo;
    }

    getBufferObject(key: string): WebGLBuffer {
      return this.buffers[key];
    }


    /**
     * 描画
     * @method draw
     * @param {WebGLRenderingContext} gl 
     */
    draw(gl: WebGLRenderingContext, uni_locations: { [key: string]: WebGLUniformLocation }): void {
      //頂点バッファの処理
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers["vbo"]);
      gl.vertexAttribPointer(this.attrib_location["aVertexPosition"], this.mesh.stride["VERTEX"], gl.FLOAT, false, 0, 0);

      //カラーバッファの処理
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers["cvbo"]);
      gl.vertexAttribPointer(this.attrib_location["aVertexColor"], this.mesh.stride["COLOR"], gl.FLOAT, false, 0, 0);

      //テクスチャバッファの処理
      if (this.buffers["tvbo"]) {
        gl.uniform1i(uni_locations['useTexture'], 1);
        //テクスチャバッファオブジェクトをバインド
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers["tvbo"]);
        //頂点属性にデータ(テクスチャサイズ、型等)を登録
        gl.vertexAttribPointer(this.attrib_location["aVertexTexture"], this.mesh.stride["TEXCOORD"], gl.FLOAT, false, 0, 0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        //ビデオエレメントがテクスチャのソースの場合は更新
        if (this.video_element) this.updateVideoTexture(gl);

      } else {

        //テクスチャ未使用の場合にはuniform変数に0を指定
        gl.uniform1i(uni_locations['useTexture'], 0);
      }

      //インデックスバッファの処理
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers["ibo"]);
      gl.drawElements(gl.TRIANGLES, this.mesh.indices.length, gl.UNSIGNED_SHORT, 0);

      if (this.buffers["tvbo"]) {
        gl.bindTexture(gl.TEXTURE_2D, null);
      } else {
        //テクスチャ未使用の場合にはuniform変数が0になっているはずなので1に戻す
        gl.uniform1i(uni_locations['useTexture'], 1);
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    }

    /**
     * 指定した画像をロードしテクスチャを作成します
     */
    createTexture(gl: WebGLRenderingContext, filename: string) {
      this.texture_image = new Image();
      let tex: WebGLTexture;
      this.texture_image.onload = () => {
        // テクスチャオブジェクトの生成
        tex = gl.createTexture();

        // テクスチャをバインドする
        gl.bindTexture(gl.TEXTURE_2D, tex);

        // テクスチャへイメージを適用
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.texture_image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

        // ミップマップを生成
        gl.generateMipmap(gl.TEXTURE_2D);

        // テクスチャのバインドを無効化
        gl.bindTexture(gl.TEXTURE_2D, null);

        //アロー関数内のthisはクラスのインスタンスを指す
        this.texture = tex;
      };
      this.texture_image.src = filename;
    }

    createVideoTexture(gl: WebGLRenderingContext, video_element: HTMLVideoElement) {
        // テクスチャオブジェクトの生成
      this.texture = gl.createTexture();

        // テクスチャをバインドする
      gl.bindTexture(gl.TEXTURE_2D, this.texture);

      // テクスチャへイメージを適用
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video_element);

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);

      // ミップマップを生成
      gl.generateMipmap(gl.TEXTURE_2D);

      // テクスチャのバインドを無効化
      gl.bindTexture(gl.TEXTURE_2D, null);
    }

    updateTexture(gl: WebGLRenderingContext): void {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.texture_image);
      gl.generateMipmap(gl.TEXTURE_2D);
    }

    updateVideoTexture(gl: WebGLRenderingContext): void {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.video_element);
      gl.generateMipmap(gl.TEXTURE_2D);
    }
  }
} 