import { loadJson } from "./Utils";

export type FontCharacterCube = {
  from: Vec3;
  to: Vec3;
  faces: {
    north?: Vec4;
    east?: Vec4;
    south?: Vec4;
    west?: Vec4;
    up?: Vec4;
    down?: Vec4;
  };
};

export type FontTexture = {
  name: string;
  author: string;
  variants?: { [id: string]: FontTexture };
};

export default class Font {
  static FONTS_PATH = "/title-fonts/fonts";
  static DEFAULT_HEIGHT = 44;
  static DEFAULT_DEPTH = 20;
  private static _cache: Map<string, Font> = new Map();

  constructor(
    readonly id: string,
    readonly characters: { [id: string]: FontCharacterCube[] },
    readonly textures: { [id: string]: FontTexture },
    readonly properties: {
      author?: string;
      height?: number;
      flat?: boolean;
      overlay?: boolean;
      ends: [Vec4, Vec4, Vec4];
    },
  ) {}

  static async load(id: string): Promise<Font> {
    if (this._cache.has(id)) {
      return this._cache.get(id) as Font;
    }

    const path = `${Font.FONTS_PATH}/${id}`;

    // Fonts
    const fonts = await loadJson(`${Font.FONTS_PATH}.json`);
    const font_properties = fonts.find((f: any) => f.id === id);
    console.log(font_properties);

    // Font's chars
    const characters = await loadJson(`${path}/characters.json`);

    // Font's textures
    const textures_content = await loadJson(`${path}/textures.json`);

    const textures =
      textures_content.textures ||
      (() => {
        throw Error("No texture field");
      })();

    const font = new Font(id, characters, textures, font_properties);
    this._cache.set(id, font);

    return font;
  }

  getTextureURL(texture_id: string): string {
    return `${Font.FONTS_PATH}/${this.id}/textures/${texture_id}.png`;
  }
}
