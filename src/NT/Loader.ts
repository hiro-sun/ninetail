
/**
 * NineTail
 * @module NT
 */
module NT {
  export class Loader {
    private xhr: XMLHttpRequest;
    private filename: string;
    /**
     * 読み込み完了時の処理
     * @method onComplete
     * @return void
     */
    onComplete: (response:any) => void;

    /**
     * @constructor
     * @param filename daeファイル
     */
    constructor(filename: string) {
      this.filename = filename;
      this.xhr = new XMLHttpRequest();
      this.xhr.open("GET", filename, true);
    }

    setResponseType(mode: string): void {
      this.xhr.responseType = mode;
    }

    /**
     * ファイルの読み込み開始
     * @method start
     * @return void
     */
    start():void {
      this.xhr.onreadystatechange = () => {
        try {
          switch (this.xhr.readyState) {
            case 0:
              console.log("uninitialized");
              break;
            case 1:
              console.log("loading");
              break;
            case 2:
              console.log("loaded");
              break;
            case 3:
              console.log("interactive");
              break;
            case 4:
              console.log("complete: status = "+ this.xhr.status);
              switch (this.xhr.status) {
                case 200:
                  this.onComplete(this.xhr.response);
                  break;
                default:
              }
              break;
            default:
          }
        } catch (ex) {
          console.log(ex);
        }
      };
      this.xhr.send();
    }
  }

  export interface IBindVertexInput {
    semantic: string;
    input_semantic: string;
    input_set: number;
  }

  export interface IInstanceMaterial {
    symbol: string;
    target: string;
    bind_vertex_input: IBindVertexInput[];
  }
  export interface IBindMaterial {
    technique_common: ITechniqueCommon[];
  }
  export interface ITechniqueCommon {
    instance_material: IInstanceMaterial[];

  }
  export interface IInstanceGeometry {
    url: string;
    bind_material: IBindMaterial[];
  }

  export class VisualSceneNode {
    id: string;
    location: number[];
    rotation_z: number[];
    rotation_y: number[];
    rotation_x: number[];
    scale:number[]
    instance_geometry: IInstanceGeometry[];
  }

  
  export class Mesh {
    /**
     * daeデータのsemantic(VERTEX, NORMAL,TEXCOORD)をキーとし、各要素の座標値を配列として保持します。
     * @property vertex
     * @type {[key]:string: number[]}
     * @default undefined
     */
    vertex: { [key: string]: number[] };
    stride: { [key: string]: number };

    /**
     * インデックス値を配列として保持します。
     * @property indices 
     * @type number[] 
     * @default undefined
     */
    indices: number[];

    /**
     * 使用しているテクスチャがある場合、そのファイル名を保持します。
     * @property texture_filename
     * @type string
     * @default undefined
     */
    texture_filename: string;

    texture_data: string;

    /**
     * daeファイルをパースした結果の単一のメッシュ情報です。
     * @class Mesh
     * @constructor
     */
    constructor() {
      this.vertex = {};
      this.vertex["VERTEX"] = [];
      this.vertex["NORMAL"] = [];
      this.vertex["TEXCOORD"] = [];
      this.vertex["COLOR"] = [];

      this.stride = {};
      this.stride["VERTEX"] = 3;
      this.stride["NORMAL"] = 3;
      this.stride["TEXCOORD"] = 2;
      this.stride["COLOR"] = 4;
    }
  }

  export class ColladaParser {
    private root: XMLDocument;

    /**
     * daeファイルをパースした際のメッシュ情報を格納します
     * @property mesh_data_list
     * @type Mesh[]
     */
    mesh_data_list: Mesh[] = new Array();

    /**
     * Colladaのdaeデータをパースします。
     * @class ColladaParser
     * @constructor
     * @param {string} text daeファイルのXMLを文字列として受け取ります
     */
    constructor(text: string) {
      let parser = new DOMParser();
      this.root = parser.parseFromString(text, "application/xml");

      //Scene要素の取得
      let scenes: HTMLElement[] = <HTMLElement[]><any>this.root.getElementsByTagName("scene");
      if (scenes.length == 0) {
        //console.error("scenes要素が見つかりません");
        return;
      }
      for (let i = 0; i < scenes.length; ++i) {
        //scene > instance_visual_sceneのurl属性の取得(instance_visual_sceneの数だけ)
        let instance_visual_scenes: HTMLElement[] = this.getChildElement(scenes[i], "instance_visual_scene");
        //url属性を元にlibrary_visual_scenesの処理を開始
        for (let j = 0; j < instance_visual_scenes.length; ++j) {
          //console.log("---processing scene url = " + instance_visual_scenes[j].getAttribute("url") + "---");
          let visual_scenes: HTMLElement[] = this.getVisualScenes(instance_visual_scenes[j].getAttribute("url").substr(1));
          this.getVisualSceneNodes(visual_scenes);
        }
      }
    }


    private getChildElement(parent: HTMLElement, tagname: string, where?: { [key: string]: string }):HTMLElement[] {
      let nodes: HTMLElement[] = <HTMLElement[]><any>parent.childNodes;
      let return_element: HTMLElement[] = new Array();
      for (let i = 0; i < nodes.length; ++i) {
        if (where) {
          if (nodes[i].tagName == tagname) {
            for (let key in where) {
              //console.log(key + ":" + where[key]);
              if (nodes[i].getAttribute(key) == where[key]) {
                return_element.push(nodes[i]);
              }
            }
          }
        } else {
          if (nodes[i].tagName == tagname) {
            return_element.push(nodes[i]);
          }
        }
      }
      return return_element;
    }

    private getVisualSceneNodes(visual_scenes: HTMLElement[]): void {
      let visual_scene_data: { [key: string]: [string[], string[], number[]] };
      for (let i = 0; i < visual_scenes.length; ++i) {
        visual_scene_data = this.parseVisualScene(visual_scenes[i]);
      }

      for (let key in visual_scene_data) {
        let mesh: Mesh;
        let vsd:[string[], string[], number[]] = visual_scene_data[key];

        //console.log("visual_scenes:" + key);

        //LibraryGeometries(メッシュ)の処理
        let library_geometries: HTMLElement[] = <HTMLElement[]><any>this.root.getElementsByTagName("library_geometries");
        for (let i = 0; i < library_geometries.length; ++i) 
          if (library_geometries[i].tagName == "library_geometries") mesh = this.parseLibraryGeometries(library_geometries[i], vsd[0]);
        //Meshがなかった場合には処理を中断
        if (!mesh) continue;

        //LibraryMaterials(質感、テクスチャ等)の処理
        let library_materials: HTMLElement[] = <HTMLElement[]><any>this.root.getElementsByTagName("library_materials");
        for (let i = 0; i < library_materials.length; ++i) { 
          if (library_materials[i].tagName == "library_materials") mesh.texture_filename = "/resources/f14.png";
        }

        //console.log("push mesh");
        this.mesh_data_list.push(mesh);
      }
    }

    /**
     * Scenes要素のinstance_visual_sceneのurl属性を受け取り、library_visual_scenes以下からvisual_sceneの要素を解析する
     */
    private getVisualScenes(scene_url:string): HTMLElement[] {
      let library_visual_scenes: HTMLElement[] = <HTMLElement[]><any>this.root.getElementsByTagName("library_visual_scenes");
      if (library_visual_scenes.length == 0) {
        //console.error("library_visual_scenesが見つかりません");
        return;
      }

      let visual_scenes: HTMLElement[] = new Array();
      for (let i = 0; i < library_visual_scenes.length; ++i) {
        let where: { [key: string]: string } = { "id" :scene_url};
        let tmp_visual_scenes: HTMLElement[] = this.getChildElement(library_visual_scenes[i], "visual_scene", where);
        for (let k = 0; k < tmp_visual_scenes.length; ++k) {
          visual_scenes.push(tmp_visual_scenes[k]);
        }
      }
      if (visual_scenes.length == 0) {
        //console.error("visual_sceneが見つかりません");
        return;
      }

      return visual_scenes;

      
    }

    private parseLibraryGeometries(library_geometry: HTMLElement, vsd: string[]): Mesh {
      //console.log("-----parseLibraryGeometries");
      let geometries: HTMLElement[] = <HTMLElement[]><any>library_geometry.childNodes;
      for (let j = 0; j < geometries.length; ++j) {
        if (geometries[j].tagName == "geometry") {
          if (geometries[j].getAttribute("id") == vsd[0]) {
            //console.log(geometries[j].tagName + ":" + geometries[j].id);
            let meshes: HTMLElement[] = <HTMLElement[]><any>geometries[j].childNodes;
            for (let k = 0; k < meshes.length; ++k) {
              if (meshes[k].tagName == "mesh") {
                return this.parseMesh(meshes[k]);
              }
            }
          }
        }
      }
      return undefined;
    }

    /**
     * 三角ポリゴンへ変換
     * @method convertTrianglePolygons
     * @param {string[]} semantics semanticの配列(VERTEX, NORMAL, TEXCOORD)
     * @param {HTMLElement} polylist polylist要素
     * @return {[key:string]:any} semanticをキーとした三角ポリゴン化したインデックス情報
     */
    private convertTrianglePolygons(semantics: string[], polylist: HTMLElement): { [key: string]: any } {
      let triangles_index_buffer: { [key: string]: any } = {};
      //semanticのタイプをキーとするオフセット値のリスト
      let offset_list: { [key: string]: number } = {};

      let vcount_list: number[] = new Array();
      let vcount_length: number = 0;

      let p_list: number[] = new Array();
      let p_length: number = 0;
      //input要素の数
      let input_count = 0;

      let children: HTMLElement[] = <HTMLElement[]><any>polylist.childNodes;
      for (let i = 0; i < children.length; ++i) {
        switch (children[i].tagName) {
          case "input":
            let semantic = children[i].getAttribute("semantic");
            offset_list[semantic] = parseInt(children[i].getAttribute("offset"), 10);
            input_count++;
            break;

          case "vcount":
            let vcount = children[i].textContent.split(" ");
            for (let j = 0; j < vcount.length; ++j) {
              vcount_list.push(parseInt(vcount[j], 10));
            }
            vcount_length = vcount_list.length;
            break;
          case "p":
            let p = children[i].textContent.split(" ");
            for (let j = 0; j < p.length; ++j) {
              p_list.push(parseInt(p[j], 10));
            }
            p_length = p_list.length;
            break;
        }
      }
      if (input_count == 0) console.log("not found input");
      if (vcount_list.length == 0) console.log("not found vcount");
      if (p_list.length == 0) console.log("not found p");


      let index = 0;
      for (let i = 0; i < semantics.length; ++i) {
        let current_semantic = semantics[i];
        //VERTEX,NORMAL,TEXCOORDのいずれかをキーとする
        triangles_index_buffer[current_semantic] = new Array();
        index = 0;
        for (let j = 0; j < vcount_list.length; ++j) {
          let start_index = index;
          for (let k = 0; k < vcount_list[j] - 2; ++k) {
            let target_index;
            target_index = start_index + offset_list[current_semantic];
            triangles_index_buffer[current_semantic].push(p_list[target_index]);

            target_index = start_index + offset_list[current_semantic] + (k + 1) * semantics.length;
            triangles_index_buffer[current_semantic].push(p_list[target_index]);

            target_index = start_index + offset_list[current_semantic] + (k + 2) * semantics.length;
            triangles_index_buffer[current_semantic].push(p_list[target_index]);
          }
          index += (vcount_list[j] * semantics.length);
        }
      }
      return triangles_index_buffer;
    }

    /**
     * Polylist要素のパース
     * @method parsePolylist
     * @param {HTMLElement} polylist
     * @return { [{ [key: string]: any }, { [key: string]: string }] } インデックスバッファとソースのURL(semanticをキーとする)
     */
    private parsePolylist(polylist: HTMLElement): [{ [key: string]: any }, { [key: string]: string }] {
      //inputのsemanticのリストを格納
      let semantics: string[] = new Array();
      let source_list: { [key: string]: string } = {};
      let children: HTMLElement[] = <HTMLElement[]><any>polylist.childNodes;
      for (let i = 0; i < children.length; ++i) {
        if (children[i].tagName == "input") {
          //semanticsにsemantic属性(VERTEX, TEXCOORD, NORMAL)をセット
          semantics.push(children[i].getAttribute("semantic"));
          //source属性の値を、semantic属性をキーとしてハッシュに追加
          source_list[children[i].getAttribute("semantic")] = children[i].getAttribute("source").substr(1);
        }
      }
      //console.log("input semantic list");
      //console.dir(semantics);

      //polylist > pの内容を全て三角ポリゴン用に変換した上で取得
      let triangles_index_buffer = this.convertTrianglePolygons(semantics, polylist);

      return [triangles_index_buffer, source_list];
    }

    /**
     * library_geometries > geometry > mesh以下のパースを開始
     * @param {HTMLElement} mesh mesh要素
     * @return {NT.Mesh} パースした情報を元に作成したメッシュオブジェクト
     */
    private parseMesh(mesh: HTMLElement): Mesh {
      //console.log("---parseMesh---");
      let data: Mesh = new Mesh();

      //Polylistをパースした結果を保持する変数
      //タプルの0番目にはsemanticをキーとしたインデックス情報、1番目にはsemanticをキーとした対応するsource要素のidを受け取る
      let polylist_result: [{ [key: string]: any }, { [key: string]: string }];
      let sources: HTMLElement[] = <HTMLElement[]><any>mesh.childNodes;
      for (let i = 0; i < sources.length; ++i) {
        if (sources[i].tagName == "polylist") {
          polylist_result = this.parsePolylist(sources[i]);
        } 
      }
      if (!polylist_result) return;
      //console.log("polylist_result");
      //console.dir(polylist_result);

      //インデックス情報をセット
      if (polylist_result[0]["TEXCOORD"]) {
        data.indices = polylist_result[0]["TEXCOORD"]; //triangles_index_buffer
      } else {
        //テクスチャ座標情報がない場合
        data.indices = polylist_result[0]["VERTEX"];
      }
      let source_urls = polylist_result[1]; //inputの各semanticのsource値

      //頂点座標のsource_idを取得
      source_urls["VERTEX"] = this.getVertexPositionSourceId(sources, source_urls["VERTEX"]);


      let vertex: { [key: string]: number[] } = {};
      let stride: { [key: string]: number } = {};

      data.vertex = {};
      for (let semantic in source_urls) {
        for (let i = 0; i < sources.length; ++i) {
          if (sources[i].tagName == "source") {
            let source_id = sources[i].getAttribute("id");
            if (source_urls[semantic] == source_id) {
              vertex[semantic] = this.getFloatArray(sources[i]);
              //console.log(semantic);
              //console.dir(vertex[semantic]);
              if (semantic == "VERTEX") stride["VERTEX"] = 3;
              if (semantic == "NORMAL") stride["NORMAL"] = 3;
              if (semantic == "TEXCOORD") stride["TEXCOORD"] = 2;

              data.vertex[semantic] = new Array();
              for (let j = 0; j < data.indices.length; ++j) {
                let vertex_index = data.indices[j];
                let target_index = polylist_result[0][semantic][j];
                for (let k = 0; k < stride[semantic]; k++) {
                  data.vertex[semantic][vertex_index * stride[semantic] + k] = vertex[semantic][target_index * stride[semantic] + k];
                }
              }
              if (semantic == "TEXCOORD") {
                //Y軸(S,Tで言うとT軸)の座標を反転する
                for (let j = 1; j < data.vertex["TEXCOORD"].length; j += 2) {
                  let t = data.vertex["TEXCOORD"][j] * -1;
                  data.vertex["TEXCOORD"][j] = t;
                }
              }
            }
          }
        }
      }
      data.stride["VERTEX"] = stride["VERTEX"];
      data.stride["NORMAL"] = stride["NORMAL"];
      data.stride["TEXCOORD"] = stride["TEXCOORD"];
      return data;
    }

    /**
     * polylistのvertexのsource idから該当するverticesを取得し、semantic=POSITIONのsource値を取得
     * @method getVertexPositionSourceId
     */
    private getVertexPositionSourceId(sources: HTMLElement[], source_id: string): string {
      //VERTEXの場合はvertices要素を見てsource値を取得
      let vertex_position_source_id: string;
      for (let i = 0; i < sources.length; ++i) {
        if (sources[i].tagName == "vertices" && (sources[i].getAttribute("id") == source_id)) {
          let input_list: HTMLElement[] = <HTMLElement[]><any>sources[i].childNodes;
          for (let j = 0; j < input_list.length; ++j) {
            if (input_list[j].tagName == "input"
              && input_list[j].getAttribute("semantic") == "POSITION") {
              vertex_position_source_id = input_list[j].getAttribute("source").substr(1);
            }
          }
        }
      }
      return vertex_position_source_id;
    }

    /**
     * 座標配列を取得
     * @method getFloatArray
     * @param {HTMLElement} source
     * @return {number[]}
     */
    private getFloatArray(source: HTMLElement): number[] {
      let source_children: HTMLElement[] = <HTMLElement[]><any>source.childNodes;
      let vertex: number[];
      for (let j = 0; j < source_children.length; ++j) {
        if (source_children[j].tagName == "float_array") {
          vertex = this.convertFloatArrayFromStringArray(source_children[j].textContent.split(" "));
          break;
        }
      }
      return vertex;
    }

    /**
     * 文字列の配列を数値の配列に変換します。
     *
     * @method convertFloatArrayFromStringArray
     * @param {string[]} arr 変換元となる文字列の配列
     * @return {number[]} 変換後の数値の配列
     */
    private convertFloatArrayFromStringArray(arr: string[]): number[] {
      let ret: number[] = new Array();
      for (let i = 0; i < arr.length; ++i) {
        ret.push(parseFloat(arr[i]));
      }
      return ret;
    }

    /**
     * visual_scene要素以下のパース
     * @method parseVisualScene
     * @param {HTMLElement} visual_scene
     * @return {[key:string]:[string[], string[], number[]]} ノードのIDをキーとし、instnace_geometryのURL、instance_materialのtarget、node直下のmatrixの値をタプルで格納し返します
     */
    private parseVisualScene(visual_scene: HTMLElement): { [key: string]: [string[], string[], number[]] } {

      let node_list: { [key: string]: [string[], string[], number[]] } = {};

      let nodes: HTMLElement[] = <HTMLElement[]><any>visual_scene.childNodes;
      for (let j = 0; j < nodes.length; ++j) {
        if (nodes[j].tagName == undefined) continue;

        if (nodes[j].getAttribute("type") == "NODE") {
          let vs_node = new VisualSceneNode();

          let instance_geometry_urls: string[] = [];
          let instance_material_targets: string[] = [];
          let node_matrix: number[] = [];

          let node_children: HTMLElement[] = <HTMLElement[]><any>nodes[j].childNodes;
          for (let k = 0; k < node_children.length; ++k) {
            //node_childはmatrixかinstance_geometry
            let node_child: HTMLElement = node_children[k];
            if (node_child.tagName == undefined) continue;

            switch (node_child.tagName) {
              case "matrix":
                let matrix_list: string[] = node_child.textContent.split(" ");
                for (let l = 0; l < matrix_list.length; ++l) {
                  if (!matrix_list[l]) continue;
                  node_matrix.push(parseInt(matrix_list[l], 10));
                }
                break;
              case "instance_geometry":
                instance_geometry_urls.push(node_child.getAttribute("url").substr(1));
                let bind_materials: HTMLElement[] = <HTMLElement[]><any>node_child.childNodes;
                for (let l = 0; l < bind_materials.length; ++l) {
                  if (bind_materials[l].tagName == undefined) continue;
                  let technique_commons: HTMLElement[] = <HTMLElement[]><any>bind_materials[l].childNodes;
                  for (let m = 0; m < technique_commons.length; ++m) {
                    if (technique_commons[l].tagName == undefined) continue;
                    let instance_materials: HTMLElement[] = <HTMLElement[]><any>technique_commons[m].childNodes;
                    for (let n = 0; n < instance_materials.length; ++n) {
                      if (instance_materials[n].tagName == undefined) continue;
                      instance_material_targets.push(instance_materials[n].getAttribute("target").substr(1));
                    }
                  }
                }
                break;
              default:
            }


            //処理中のvisual_scene > nodeのid名をキーとしてタプルをセット
            let node_name = nodes[j].getAttribute("id");
            node_list[node_name] = [instance_geometry_urls, instance_material_targets, node_matrix];
          }
        }
      }

      return node_list;
    }
  }
} 
