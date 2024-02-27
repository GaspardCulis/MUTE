/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
type Vec3 = [number, number, number];
type Vec4 = [number, number, number, number];
type StyledText = { font: string; text: { text: string; texture: string }[] };

type AdvancementParams = {
  title: string;
  icon: string | URL;
  children?: HTMLElement[];
};

interface Window {
  pushAdvancement(id: string, params: AdvancementParams): void;
  popAdvancement(id: string): void;
}
