import * as THREE from "three";
import fonts from "../../public/title-fonts/fonts.json";
import type Font from "./Font";

export function createRenderer(container: HTMLElement): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  return renderer;
}

export function createScene(
  width: number,
  height: number,
): [THREE.Scene, THREE.OrthographicCamera] {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(
    -width / 2,
    width / 2,
    height / 2,
    -height / 2,
    1,
    1000,
  );

  camera.position.x = 0;
  camera.position.y = 22;
  camera.position.z = -320;
  camera.lookAt(new THREE.Vector3(0, 22, 0));
  camera.up.set(0, 1, 0);
  return [scene, camera];
}

async function loadTexture(path: string): Promise<THREE.CanvasTexture> {
  throw Error("Not implemented");
}

export async function addTitleText(
  scene: THREE.Scene,
  str: string,
  args: {
    font: Font;
    type?: "top" | "bottom" | "small";
    row?: number;
    scale?: Vec3;
    rotation?: Vec3;
  },
) {
  const texture = new THREE.TextureLoader().load(
    args.font.getTextureURL("crystal"),
  );

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.flipY = true;

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.01,
  });

  let width = 0;
  const cubes = [];
  const group = new THREE.Group();
  for (const char of str) {
    if (char === " ") {
      width += 8;
      continue;
    }
    if (!args.font.characters[char]) continue;
    let min = Infinity;
    let max = -Infinity;
    const character = new THREE.Group();
    for (let cube of args.font.characters[char]) {
      if (!cube.parsed) {
        cube.parsed = true;
        for (const [direction, uv] of Object.entries(cube.faces)) {
          cube.faces[direction] = { uv };
        }
      }

      cube = JSON.parse(JSON.stringify(cube));
      min = Math.min(min, cube.from[0], cube.to[0]);
      max = Math.max(max, cube.from[0], cube.to[0]);

      if (args.type === "bottom") {
        if (cube.to[2] > cube.from[2]) {
          cube.to[2] += 20;
        } else {
          cube.from[2] += 20;
        }
      }

      const geometry = new THREE.BoxGeometry(
        cube.to[0] - cube.from[0],
        cube.to[1] - cube.from[1],
        cube.to[2] - cube.from[2],
      );
      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.fromArray([
        (cube.from[0] + cube.to[0]) / 2,
        (cube.from[1] + cube.to[1]) / 2,
        (cube.from[2] + cube.to[2]) / 2,
      ]);

      const indexes = {
        north: 40,
        east: 0,
        south: 32,
        west: 8,
        up: 16,
        down: 24,
      };

      for (const key of Object.keys(indexes)) {
        const face = cube.faces[key];
        const i = indexes[key];
        if (face) {
          const uv = [
            [face.uv[0] / 16, 1 - face.uv[1] / 16],
            [face.uv[2] / 16, 1 - face.uv[1] / 16],
            [face.uv[0] / 16, 1 - face.uv[3] / 16],
            [face.uv[2] / 16, 1 - face.uv[3] / 16],
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
      character.add(mesh);
      cubes.push(mesh);
    }
    for (const cube of character.children) {
      cube.position.x -= width + max;
    }
    group.add(character);
    width += max - min;
  }

  for (const cube of cubes) {
    cube.position.x += width / 2;
  }

  if (args.row) {
    group.position.y += args.font.height * args.row;
  }

  if (args.type === "bottom") {
    group.scale.setX(0.75);
    group.scale.setY(1.6);
    group.scale.setZ(0.75);
    group.rotation.fromArray([-Math.PI / 3, 0, 0]);
    group.position.z += args.font.height + 49;
    group.position.y -= 25 - args.font.depth;
  } else if (args.type === "small") {
    group.scale.setX(0.35);
    group.scale.setY(0.35);
    group.scale.setZ(0.35);
    group.position.y -= args.font.height * 0.35;
  }

  if (args.scale) {
    group.scale.setX(group.scale.x * args.scale[0]);
    group.scale.setY(group.scale.y * args.scale[1]);
    group.scale.setZ(group.scale.z * args.scale[2]);
  }

  if (args.rotation) {
    const old = group.rotation.toArray();
    group.rotation.fromArray(
      // @ts-ignore
      args.rotation.map((e, i) => (e / 360) * (Math.PI * 2) + old[i]),
    );
  }

  scene.add(group);
}

export async function renderTitleScene(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.OrthographicCamera,
  scaleFactor: number,
) {
  renderer.render(scene, camera);
}

export async function addTitleTextClean(
  text: string,
  type: "top" | "middle" | "bottom",
  font: Font,
  texture: THREE.Texture,
  scene: THREE.Scene,
) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.flipY = true;

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.01,
  });

  let width = 0;
  const cubes = [];
  const group = new THREE.Group();
  for (const char of text) {
    if (char == " ") {
      width += 8;
      continue;
    }
    if (!font.characters[char]) {
      console.warn(`Can't get character '${char}' of font '${font.id}'`);
      continue;
    }

    let min = Infinity;
    let max = -Infinity;
    const char_group = new THREE.Group();

    for (let cube of font.characters[char]) {
      if (type == "bottom") {
        if (cube.to[2] > cube.from[2]) {
          cube.to[2] += 20;
        } else {
          cube.from[2] += 20;
        }
      }

      const geometry = new THREE.BoxGeometry(
        cube.to[0] - cube.from[0],
        cube.to[1] - cube.from[1],
        cube.to[2] - cube.from[2],
      );
      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.fromArray([
        (cube.from[0] + cube.to[0]) / 2,
        (cube.from[1] + cube.to[1]) / 2,
        (cube.from[2] + cube.to[2]) / 2,
      ]);

      mesh.position.fromArray([
        (cube.from[0] + cube.to[0]) / 2,
        (cube.from[1] + cube.to[1]) / 2,
        (cube.from[2] + cube.to[2]) / 2,
      ]);

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
        const face = cube.faces[key];
        // @ts-ignore
        const i = indexes[key];
        if (face) {
          const uv = [
            [face[0] / 16, 1 - face[1] / 16],
            [face[2] / 16, 1 - face[1] / 16],
            [face[0] / 16, 1 - face[3] / 16],
            [face[2] / 16, 1 - face[3] / 16],
          ];
          mesh.geometry.attributes.array.set(uv[0], i + 0);
          mesh.geometry.attributes.array.set(uv[1], i + 2);
          mesh.geometry.attributes.array.set(uv[2], i + 4);
          mesh.geometry.attributes.array.set(uv[3], i + 6);
        } else {
          mesh.geometry.attributes.array.set([1, 1], i + 0);
          mesh.geometry.attributes.array.set([1, 1], i + 2);
          mesh.geometry.attributes.array.set([1, 1], i + 4);
          mesh.geometry.attributes.array.set([1, 1], i + 6);
        }
      }
      char_group.add(mesh);
      cubes.push(mesh);
    }
    for (const cube of char_group.children) {
      cube.position.x -= width + max;
    }
    group.add(char_group);
    width += max - min;
  }
  for (const cube of cubes) {
    cube.position.x += width / 2;
  }

  scene.add(group);

  console.log(font);
}
