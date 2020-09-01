import { createCell } from '../src/cell';
import lulas, { LulasConfig } from '../src/lulas';

export function createTestLulas(config: Partial<LulasConfig> = {}) {
  return lulas({
    canvas: document.createElement('canvas'),
    cells: [createCell()],
    worldSize: { x: 1000, y: 1000 },
    behaviors: [],
    ...config,
  });
}
