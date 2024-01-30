import * as THREE from "three";
import fonts from "../../public/title-fonts/fonts.json";
import type Font from "./Font";
import type { FontCharacterCube, FontTexture } from "./Font";
import type { number } from "astro/zod";

type Style = {
  font: Font;
  type?: "top" | "bottom" | "small";
  row?: number;
  scale?: Vec3;
  rotation?: Vec3;
  space_width?: number;
};

export function createRenderer(container: HTMLElement): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setClearColor(0xffffff, 1);
  container.appendChild(renderer.domElement);
  return renderer;
}

export function createScene(
  width: number,
  height: number,
): [THREE.Scene, THREE.PerspectiveCamera] {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, width / height, 1, 1000);

  camera.position.x = 0;
  camera.position.y = -150;
  camera.position.z = -300;
  camera.lookAt(new THREE.Vector3(0, 22, 0));
  camera.up.set(0, 1, 0);
  return [scene, camera];
}

async function loadTexture(
  url: string,
  loader: THREE.TextureLoader,
): Promise<THREE.Texture> {
  const texture = await loader.loadAsync(url);

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.flipY = true;

  return texture;
}

function applyUV(mesh: THREE.Mesh, char: FontCharacterCube) {
  const indexes = {
    north: 40,
    east: 0,
    south: 32,
    west: 8,
    up: 16,
    down: 24,
  };

  for (const key of Object.keys(indexes)) {
    // @ts-ignore
    const face = char.faces[key] as Vec4 | undefined;
    // @ts-ignore
    const i = indexes[key] as number;
    if (face) {
      const uv = [
        [face[0] / 16, 1 - face[1] / 16],
        [face[2] / 16, 1 - face[1] / 16],
        [face[0] / 16, 1 - face[3] / 16],
        [face[2] / 16, 1 - face[3] / 16],
      ];
      mesh.geometry.attributes.uv.array.set(uv[0], i + 0);
      mesh.geometry.attributes.uv.array.set(uv[1], i + 2);
      mesh.geometry.attributes.uv.array.set(uv[2], i + 4);
      mesh.geometry.attributes.uv.array.set(uv[3], i + 6);
    } else {
      mesh.geometry.attributes.uv.array.set([1, 1], i + 0);
      mesh.geometry.attributes.uv.array.set([1, 1], i + 2);
      mesh.geometry.attributes.uv.array.set([1, 1], i + 4);
      mesh.geometry.attributes.uv.array.set([1, 1], i + 6);
    }
  }
}

function createCharMeshes(
  char: string,
  material: THREE.MeshBasicMaterial,
  style: Style,
): [THREE.Group, number, number] {
  let min = Infinity;
  let max = -Infinity;

  const character = new THREE.Group();
  for (let cube of style.font.characters[char]) {
    min = Math.min(min, cube.from[0], cube.to[0]);
    max = Math.max(max, cube.from[0], cube.to[0]);

    if (style.type == "bottom") {
      if (cube.to[2] > cube.from[2]) {
        cube.to[2] += 20;
      } else {
        cube.from[2] += 20;
      }
    }

    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(
        cube.to[0] - cube.from[0],
        cube.to[1] - cube.from[1],
        cube.to[2] - cube.from[2],
      ),
      material,
    );

    mesh.position.fromArray([
      (cube.from[0] + cube.to[0]) / 2,
      (cube.from[1] + cube.to[1]) / 2,
      (cube.from[2] + cube.to[2]) / 2,
    ]);

    applyUV(mesh, cube);

    character.add(mesh);
  }

  return [character, min, max];
}

export async function addTitleText(
  text: { text: string; texture: string }[],
  scene: THREE.Scene,
  loader: THREE.TextureLoader,
  style: Style,
) {
  let width = 0;
  const cubes: THREE.Object3D[] = [];
  const text_group = new THREE.Group();

  for (const str of text) {
    const texture = await loadTexture(
      style.font.getTextureURL(str.texture),
      loader,
    );

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.01,
    });

    for (const char of str.text) {
      if (char === " ") {
        width += style.space_width || 8;
        continue;
      }

      if (!style.font.characters[char]) {
        console.warn(
          `Character '${char}' not found in font '${style.font.id}'`,
        );
        continue;
      }

      const [char_group, min, max] = createCharMeshes(char, material, style);
      text_group.add(char_group);
      cubes.push(...char_group.children);
      for (const cube of char_group.children) {
        cube.position.x -= width + max;
      }
      width += max - min;
    }
  }

  for (const cube of cubes) {
    cube.position.x += width / 2;
  }

  if (style.row) {
    text_group.position.y += style.font.height * style.row;
  }

  if (style.type === "bottom") {
    text_group.scale.setX(0.75);
    text_group.scale.setY(1.6);
    text_group.scale.setZ(0.75);
    text_group.rotation.fromArray([-Math.PI / 2, 0, 0]);
    text_group.position.z += style.font.height + 49;
    text_group.position.y -= 25 - style.font.depth;
  } else if (style.type === "small") {
    text_group.scale.setX(0.35);
    text_group.scale.setY(0.35);
    text_group.scale.setZ(0.35);
    text_group.position.y -= style.font.height * 0.35;
  }

  if (style.scale) {
    text_group.scale.setX(text_group.scale.x * style.scale[0]);
    text_group.scale.setY(text_group.scale.y * style.scale[1]);
    text_group.scale.setZ(text_group.scale.z * style.scale[2]);
  }

  if (style.rotation) {
    const old = text_group.rotation.toArray();
    text_group.rotation.fromArray(
      // @ts-ignore
      style.rotation.map((e, i) => (e / 360) * (Math.PI * 2) + old[i]),
    );
  }

  scene.add(text_group);
}

export async function renderTitleScene(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.OrthographicCamera,
  scaleFactor: number,
) {
  renderer.render(scene, camera);
}
