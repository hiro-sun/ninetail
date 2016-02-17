/**
 * NineTail
 * @module NT
 */
module NT {
  export class Stack<T> {
    data:Array<T>;
    top:number;
    STACK_MAX:number = 60;

    constructor() {
      this.data = new Array<T>(this.STACK_MAX);

      this.top = 0;
    }

    public push(v:T):void {
      if (this.top != this.STACK_MAX) {
        this.data[this.top] = v;
        this.top++;
      } 
    }

    public pop():T {
      if (this.top != 0) {
        delete this.data[this.top];
        this.top--;
        return this.data[this.top];
      } else {
        return null;
      }
    }
  }
}
