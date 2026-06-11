import * as migration_20260602_195124_initial from './20260602_195124_initial';
import * as migration_20260603_003223_tracking_codes from './20260603_003223_tracking_codes';

export const migrations = [
  {
    up: migration_20260602_195124_initial.up,
    down: migration_20260602_195124_initial.down,
    name: '20260602_195124_initial',
  },
  {
    up: migration_20260603_003223_tracking_codes.up,
    down: migration_20260603_003223_tracking_codes.down,
    name: '20260603_003223_tracking_codes'
  },
];
