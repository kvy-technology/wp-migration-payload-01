import * as migration_20250929_111647 from './20250929_111647';
import * as migration_20251112_042811 from './20251112_042811';
import * as migration_20251113_084358 from './20251113_084358';
import * as migration_20251113_095155 from './20251113_095155';
import * as migration_20251114_021801 from './20251114_021801';

export const migrations = [
  {
    up: migration_20250929_111647.up,
    down: migration_20250929_111647.down,
    name: '20250929_111647',
  },
  {
    up: migration_20251112_042811.up,
    down: migration_20251112_042811.down,
    name: '20251112_042811',
  },
  {
    up: migration_20251113_084358.up,
    down: migration_20251113_084358.down,
    name: '20251113_084358',
  },
  {
    up: migration_20251113_095155.up,
    down: migration_20251113_095155.down,
    name: '20251113_095155',
  },
  {
    up: migration_20251114_021801.up,
    down: migration_20251114_021801.down,
    name: '20251114_021801'
  },
];
