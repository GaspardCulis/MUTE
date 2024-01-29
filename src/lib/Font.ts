import { loadJson } from "./Utils";

export type FontCharacter = {
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
}[];

export type FontTexture = {
  name: string;
  author: string;
  variants?: { [id: string]: FontTexture };
};

export default class Font {
  static FONTS_PATH = "/public/title-fonts/fonts";

  constructor(
    readonly id: string,
    readonly characters: { [id: string]: FontCharacter },
    readonly textures: { [id: string]: FontTexture },
    readonly height: number,
    readonly depth: number,
  ) {}

  static async load(id: string): Promise<Font> {
    const path = `${Font.FONTS_PATH}/${id}`;

    // Font's chars
    const characters = await loadJson(`${path}/characters.json`);

    // Font's textures
    const textures_content = await loadJson(`${path}/textures.json`);

    const textures =
      textures_content.textures ||
      (() => {
        throw Error("No texture field");
      })();

    return new Font(id, characters, textures, 44, -24);
  }

  getTextureURL(texture_id: string): string {
    return `${Font.FONTS_PATH}/${this.id}/textures/${texture_id}.png`;
  }
}
