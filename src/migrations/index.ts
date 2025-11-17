import * as migration_20251116_160304 from './20251116_160304';

export const migrations = [
  {
    up: migration_20251116_160304.up,
    down: migration_20251116_160304.down,
    name: '20251116_160304',
  },
];
