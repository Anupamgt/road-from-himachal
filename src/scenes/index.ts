import { stages } from '../content';
import type { Scene } from './base';
import { finish } from './finish';
import { km0 } from './km0';
import { km1 } from './km1';
import { km2 } from './km2';
import { km3 } from './km3';
import { km4 } from './km4';
import { km5 } from './km5';
import { km6 } from './km6';
import { km7 } from './km7';

// One scene per stage, registered by the scene id in content.ts.
const registry = new Map<string, Scene>();
for (const scene of [km0, km1, km2, km3, km4, km5, km6, km7, finish]) registry.set(scene.id, scene);

for (const stage of stages) {
  if (!registry.has(stage.scene)) throw new Error(`No scene registered for ${stage.scene}`);
}

export function getScene(sceneId: string): Scene {
  const s = registry.get(sceneId);
  if (!s) throw new Error(`No scene registered for ${sceneId}`);
  return s;
}
