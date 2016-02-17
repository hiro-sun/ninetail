/**
 * https://www.khronos.org/registry/webgl/specs/latest/1.0/#5.6 
 *
 */
interface WebGLProgram extends WebGLObject {
  vertexPositionAttribute: number;
  vertexColorAttribute: number;
  pMatrixUniform: WebGLUniformLocation;
  mvMatrixUniform: WebGLUniformLocation;
}

/**
 * 3Dグラフィックスモジュール  
 * @module NT.Graphics.GL
 */
module NT.Graphics.GL {
  /**
   * WebGLレンダリング可能なLayer
   * @constructor
   * @class Layer3D
   * @extends Layer
   * @param {number} width レイヤーの幅
   * @param {number} height レイヤーの高さ
   * @param {number} background_color レイヤーの背景色。省略した場合は透過
   */
  export class Layer extends NT.Graphics.Layer {
    _gl: WebGLRenderingContext;
    _program: WebGLProgram;

    _attrib_locations: { [key: string]: number; };
    _uni_locations: { [key: string]: WebGLUniformLocation; };

    initContext(): void {
      this._gl = <WebGLRenderingContext>(this.canvas.getContext("webgl") || this.canvas.getContext("experimental-webgl"));
      console.log("initContext:" + this._gl);

      //WebGLの各描画設定の初期化
      //Todo:変更用のメソッドを作るかな。それともglを取って直接指定する感じで良いかな。
      let gl = this._gl;
      //カラーバッファ初期化時の色設定
      gl.clearColor(0.0, 0.0, 0.0, 0.0);

      //深度テストを有効化
      gl.enable(gl.DEPTH_TEST);

      //深度バッファとピクセル値の深度値との比較関数定義
      //LEQUALは、ピクセル値の深度値が深度バッファの深度値以下の場合に描画
      gl.depthFunc(gl.LEQUAL);

      //深度バッファ初期化時の深度値を設定
      gl.clearDepth(1.0);

      //ブレンディングを有効化
      gl.enable(gl.BLEND);
      //ブレンド方法を定義
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      //陰面消去を有効化
      gl.enable(gl.CULL_FACE);

      //反時計回りを表面に指定(デフォルト)
      gl.frontFace(gl.CCW);

      //背面を消去するよう指定
      gl.cullFace(gl.BACK);

      //テクスチャ0番を有効化(デフォルトで有効)
      gl.activeTexture(gl.TEXTURE0);
    }

    /**
     * WebGLのレンダリングコンテキストを取得
     */
    get gl(): WebGLRenderingContext {
      return this._gl;
    }

    /**
     * WebGLProgramを取得
     */
    get program(): WebGLProgram {
      return this._program;
    }

    /**
     * WebGLProgramをセット
     */
    set program(program: WebGLProgram) {
      this._program = program;
    }


    /**
     * シェーダーのAttribute変数の位置を取得
     */
    getAttribLocations(): { [key: string]: number } {
      return this._attrib_locations;
    }

    /**
     * シェーダーのUniform変数の位置を取得
     * @return { [key:string]:WebGLUniforomLocation } 
     */
    getUniLocations(): { [key: string]: WebGLUniformLocation } {
      return this._uni_locations;
    }


    /**
     * 表示優先度を設定
     * @override
     */
    setPriority(priority_index: number): void {
      super.setPriority(priority_index);
      this.canvas.style.zIndex = priority_index + '';
    }


    /**
     * シェーダーを記述しているscript要素のidを渡し、シェーダーの初期化を行います。
     * 属性変数の位置、uniform変数の位置を設定します。
     * @method initShaders
     * @param {string} vertex_shader_id
     * @param {string} fragment_shader_id
     * @return {boolean} 失敗した場合はfalse
     */
    initShaders(vertex_shader_id: string, fragment_shader_id: string): boolean {
      this.program = this.loadProgram(this.getShaderFromId(vertex_shader_id), this.getShaderFromId(fragment_shader_id));
      console.log(this.program);
      if (!this.program) return false;
      this.gl.useProgram(this.program);


      //属性位置
      this._attrib_locations = {
        "aVertexPosition": this._gl.getAttribLocation(this._program, 'aVertexPosition'),
        "aVertexColor": this._gl.getAttribLocation(this._program, 'aVertexColor'),
        "aVertexTexture": this._gl.getAttribLocation(this._program, 'aVertexTexture'),
      };

      //uniform位置
      this._uni_locations = {
        "mvpMatrix": this._gl.getUniformLocation(this._program, 'mvpMatrix'),
        "useTexture": this._gl.getUniformLocation(this._program, 'useTexture'), //テクスチャ使用フラグ
        "vertexAlpha": this._gl.getUniformLocation(this._program, 'vertexAlpha'),
        "texture0": this._gl.getUniformLocation(this._program, 'texture0'),
        //texture1 : this._gl.getUniformLocation(this._program, 'texture1'),
      };

      return true;
    }
    
    /**
     * 指定したidの要素(script要素)からシェーダーを取得し、WebGLShaderを作成して返します。
     * script要素のtypeが"x-shader/x-fragment"の場合、フラグメントシェーダーとして処理を行います。
     * typeが"x-shader/x-vertex"の場合、頂点シェーダーとして処理を行います。
     * @method getShaderFromId
     * @param {string} id 
     * @return WebGLShader
     */
    getShaderFromId(id: string): WebGLShader {
      let shader: WebGLShader = null;
      let shader_script = document.getElementById(id);
      if (!shader_script) {
        console.log("error:not found shader id");
        return null;
      }

      let str = "";
      let k = shader_script.firstChild;
      while (k) {
        if (k.nodeType == 3) {
          str += k.textContent;
        }
        k = k.nextSibling;
      }

      if (shader_script.getAttribute("type") == "x-shader/x-fragment") {
        shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
      } else if (shader_script.getAttribute("type") == "x-shader/x-vertex") {
        shader = this.gl.createShader(this.gl.VERTEX_SHADER);
      } else {
        console.log("error: type is not valid");
        return null;
      }

      this.gl.shaderSource(shader, str);
      this.gl.compileShader(shader);

      if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        console.log("SHADER COMPILE STATUS");
        console.log(this.gl.getShaderInfoLog(shader));
        return null;
      } else {
        console.log(id + "COMPILE SUCCESS");
      }
      return shader;
    }

    /**
     * シェーダーオブジェクト（WebGLShader)からWebGLProgramを作成し返します
     * @param {WebGLShader} vertex_shader
     * @param {WebGLShader} fragment_shader
     * @return WebGLProgram
     */
    loadProgram(vertex_shader: WebGLShader, fragment_shader: WebGLShader): WebGLProgram {
      if (!vertex_shader || !fragment_shader) {
        console.log("shader not found");
        return null;
      }

      //WebGLProgramオブジェクト作成
      let program = this.gl.createProgram();

      //頂点シェーダーをアタッチ
      this.gl.attachShader(program, vertex_shader);
      //フラグメントシェーダーをアタッチ
      this.gl.attachShader(program, fragment_shader);

      //シェーダーをシェーダープログラムへリンク
      this.gl.linkProgram(program);

      //リンクの状態を取得し、エラーの場合はエラー内容を出力
      let linked = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
      if (!linked) {
        let last_error = this.gl.getProgramInfoLog(program);
        console.log("Error in program linking:" + last_error);
        this.gl.deleteProgram(program);
        return null
      } else {
        console.log("program linking success");
      }
      return program;
    }

    

    


    /**
     * Meshデータを渡しモデルを作成
     */
    createObjectFromMesh(mesh: NT.Mesh): NT.Graphics.GL.ModelBuffer {
      return new ModelBuffer(this._gl, mesh, this.getAttribLocations(), this.getUniLocations());
    }


    /**
     * 単純な四角形のポリゴン（スプライト）作成
     * @param {NT.Rect} dst_rect 与えたサイズのスプライトを作成
     */
    createSprite(filename: string, dst_rect: NT.Rect, src_rect?: NT.Rect, texture_rect?: NT.Rect): NT.Graphics.GL.ModelBuffer {
      return this.createSpriteFromMesh(this.createMeshSprite(filename, dst_rect, src_rect, texture_rect));
    }

    private createMeshSprite(filename: string, dst_rect: NT.Rect, src_rect?:NT.Rect, texture_rect?:NT.Rect): NT.Mesh {
      let mesh = new Mesh();
      mesh.stride["VERTEX"] = 3;
      mesh.stride["COLOR"] = 4;
      mesh.stride["NORMAL"] = 3;
      mesh.stride["TEXCOORD"] = 2;

      let vertices = [
        -dst_rect.width / 2, dst_rect.height / 2, 0.0, //左上
        dst_rect.width / 2, dst_rect.height / 2, 0.0, //右上
        -dst_rect.width / 2, -dst_rect.height / 2, 0.0, //左下
        dst_rect.width / 2, -dst_rect.height / 2, 0.0 //右上
      ];
      mesh.vertex["VERTEX"] = vertices;

      let colors = [
        1.0, 1.0, 1.0, 0.5,
        1.0, 0.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
      ];
      mesh.vertex["COLOR"] = colors;

      if (filename != null) {
        let tex_width = 256;
        let tex_height = 256;

        if (texture_rect != null) {
          tex_width = texture_rect.width;
          tex_height = texture_rect.height;
        }

        if (src_rect == null) src_rect = dst_rect;

        let texture_coords = [
          src_rect.x / tex_width, src_rect.y / tex_height,
          (src_rect.width) / tex_width, src_rect.y / tex_height,
          src_rect.x / tex_width, (src_rect.height) / tex_height,
          (src_rect.width) / tex_width, (src_rect.height) / tex_height
        ];
        mesh.texture_filename = filename;
        mesh.vertex["TEXCOORD"] = texture_coords;
      }

      let indices = [
        0, 2, 1, //左上、右上、左下の頂点を使用した三角形
        3, 1, 2 //右下、左下、右上の頂点を使用した三角形
      ];
      mesh.indices = indices;

      return mesh;
    }


    private createSpriteFromMesh(mesh: NT.Mesh): NT.Graphics.GL.ModelBuffer {
      return new ModelBuffer(this._gl, mesh, this.getAttribLocations(), this.getUniLocations());
    }

    /**
     * ModelBufferを引数に取り、3次元モデルを描画する
     * @method drawModelBuffer
     * @param {NT.Graphics.GL.ModelBuffer} buffer
     */
    drawModelBuffer(buffer: NT.Graphics.GL.ModelBuffer): void {
      buffer.draw(this._gl, this.getUniLocations());
    }
  }
}
