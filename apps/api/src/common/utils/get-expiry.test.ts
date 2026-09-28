import { afterEach, describe, expect, it, vi } from 'vitest';
import { getOpenParkExpiry } from './get-expiry.js';

describe('getOpenParkExpiry', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    ['Monday', '2025-01-03T12:00:00.000Z'],
    ['Tuesday', '2025-01-04T12:00:00.000Z'],
    ['Wednesday', '2025-01-05T12:00:00.000Z'],
  ])(
    'returns the next Thursday when one month from now is %s',
    (_weekday, now) => {
      vi.setSystemTime(new Date(now));

      expect(getOpenParkExpiry()).toBe('February 06, 2025');
    },
  );

  it.each([
    ['Friday', '2025-01-07T12:00:00.000Z', 'February 07, 2025'],
    ['Saturday', '2025-01-08T12:00:00.000Z', 'February 08, 2025'],
  ])(
    'keeps the date unchanged when one month from now is %s',
    (_weekday, now, expectedExpiry) => {
      vi.setSystemTime(new Date(now));

      expect(getOpenParkExpiry()).toBe(expectedExpiry);
    },
  );
});
