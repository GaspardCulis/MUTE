import { EventEmitter } from "events";

export declare interface EditorVariable<T> {
  on(event: "updated", listener: (new_value: T) => void): this;
}

export class EditorVariable<T> extends EventEmitter {
  constructor(private value: T) {
    super();
  }

  get(): T {
    return this.value;
  }

  set(new_value: T) {
    this.value = new_value;
    this.emit("updated", new_value);
  }
}

export default class Editor {
  private static _instance: Editor;

  readonly variables = {
    "title.top": new EditorVariable("Minecraft"),
    "title.middle": new EditorVariable("Update"),
    "title.bottom": new EditorVariable("Title Editor"),
  };

  private constructor() {}

  static get(): Editor {
    if (!Editor._instance) {
      Editor._instance = new Editor();
    }

    return Editor._instance;
  }
}
