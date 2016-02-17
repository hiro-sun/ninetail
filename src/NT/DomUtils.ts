module NT.DomUtils {
  /**
   * HTMLのルート要素から指定したエレメントまでの位置（左上の座標）を取得し、渡したdestに格納
   */
  function updateElementPositionFromRoot(elem: HTMLElement, dest:[number, number]): void {
    let html = document.documentElement;
    let rect = elem.getBoundingClientRect();
    dest[0] = rect.left - html.clientLeft;
    dest[1] = rect.top - html.clientTop;
  }

  export function getElementPosition(elem: HTMLElement): [number, number]{
    let dest: [number, number] = [0, 0];
    let html = document.documentElement;
    let body = document.body;
    updateElementPositionFromRoot(elem, dest);
    dest[0] += (body.scrollLeft || html.scrollLeft);
    dest[1] += (body.scrollTop || html.scrollTop);
    return dest;
  }


  function outputPositions(positions:[number,number][], begin_positions:[number, number][]): void {
    let position1 = document.getElementById("touch_position1");
    let position2 = document.getElementById("touch_position2");
    let position_text_list: string[] = new Array(2);

    position_text_list[0] = "";
    position_text_list[1] = "";
    for (let i = 0; i < positions.length; ++i) {
      if (positions[i]) {
        position_text_list[i] += "pos(" + positions[i][0] + ":" + positions[i][1] + ")";
      } else {
        position_text_list[i] += "pos(undefined)";
      }
      if (begin_positions[i]) {
        position_text_list[i] += "begin(" + begin_positions[i][0] + ":" + begin_positions[i][1] + ")";
      } else {
        position_text_list[i] += "begin(undefined)";
      }
    }
    position1.innerHTML = position_text_list[0];
    position2.innerHTML = position_text_list[1];
  
  }
}