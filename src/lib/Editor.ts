import { EventEmitter } from "events";

export declare interface EditorVariable<T> {
  on(event: "changed", listener: (new_value: T) => void): this;
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
    this.emit("changed", new_value);
  }
}

export default class Editor {
  private static _instance: Editor;

  readonly variables = {
    "title.top": new EditorVariable<StyledText>({
      font: "minecraft-ten",
      text: [{ text: "Minecraft", texture: "cracked" }],
    }),
    "title.middle": new EditorVariable<StyledText>({
      font: "minecraft-ten",
      text: [{ text: "Update", texture: "flat" }],
    }),
    "title.bottom": new EditorVariable<StyledText>({
      font: "minecraft-ten",
      text: [{ text: "Title Editor", texture: "trails_and_tales" }],
    }),

    "selection.font": new EditorVariable("minecraft-ten"),
    "selection.texture": new EditorVariable("cracked"),
  };

  private constructor() {}

  static get(): Editor {
    if (!Editor._instance) {
      Editor._instance = new Editor();

      for (const [key, value] of Object.entries(this._instance.variables)) {
        value.on("changed", (new_value) => {
          console.debug(`[UPDATE] ${key} = ` + JSON.stringify(new_value));
        });
      }
    }

    return Editor._instance;
  }
}
