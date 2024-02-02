import { EventEmitter } from "events";

export declare interface EditorVariable<T> {
  on(event: "changed", listener: (new_value: T) => void): this;
}

export class EditorVariable<T> extends EventEmitter {
  constructor(private value: T) {
    super();
    this.setMaxListeners(20);
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
      font: "minecraft-five-bold-block",
      text: [{ text: "Update", texture: "live" }],
    }),
    "title.bottom": new EditorVariable<StyledText>({
      font: "minecraft-ten",
      text: [{ text: "Title Editor", texture: "trails_and_tales" }],
    }),

    "selection.font": new EditorVariable("minecraft-ten"),
    "selection.texture": new EditorVariable("cracked"),
    "selection.title_row": new EditorVariable("title.top"),
    "selection.title_column_index": new EditorVariable(0),
  };
  download_url: string = "https://i.ytimg.com/vi/prZBPTfcrbA/maxresdefault.jpg";

  private constructor() {}

  static get(): Editor {
    if (!Editor._instance) {
      Editor._instance = new Editor();

      for (const [key, value] of Object.entries(this._instance.variables)) {
        value.on("changed", (new_value) => {
          console.debug(
            `Editor: "${key}" updated to ` + JSON.stringify(new_value),
          );
        });
      }
    }

    return Editor._instance;
  }
}
