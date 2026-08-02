import assert from 'node:assert/strict';
import test from 'node:test';

import { getStallKey, getStallProgressValue } from './stallKeys.js';

test('getStallKey normalizes numeric and string stall values', () => {
  assert.equal(getStallKey(1), 'STALL01');
  assert.equal(getStallKey('stall2'), 'STALL02');
  assert.equal(getStallKey('STALL03'), 'STALL03');
  assert.equal(getStallKey('https://example.com/STALL04'), 'STALL04');
});

test('getStallProgressValue supports the new and legacy progress shapes', () => {
  const progress = {
    STALL01: { startedAt: true },
    stall2: { completed: true },
  };

  assert.deepEqual(getStallProgressValue(progress, 1), { startedAt: true });
  assert.deepEqual(getStallProgressValue(progress, 2), { completed: true });
});
