import { describe, expect, it } from 'vitest';
import { INITIAL_BOOKINGS, ROOMS } from './rooms';
import { checkAvailability } from './validation';

const NOW = 8 * 60; // simulated test clock: 08:00

const roomById = (id: string) => ROOMS.find((r) => r.id === id)!;

function snapshot(bookings: typeof INITIAL_BOOKINGS) {
  return JSON.stringify(bookings);
}

describe('checkAvailability (test clock 08:00)', () => {
  const before = snapshot(INITIAL_BOOKINGS);

  it('T1: valid free interval is available', () => {
    const result = checkAvailability({
      room: roomById('a101'),
      start: 15 * 60,
      duration: 60,
      nowMinutes: NOW,
      bookings: INITIAL_BOOKINGS,
    });
    expect(result.available).toBe(true);
    expect(result.reasonCode).toBe('none');
    expect(result.message).toBe('Room A101 is available for your selected interval.');
  });

  it('T2: overlapping interval is rejected', () => {
    const result = checkAvailability({
      room: roomById('a101'),
      start: 9 * 60 + 30,
      duration: 60,
      nowMinutes: NOW,
      bookings: INITIAL_BOOKINGS,
    });
    expect(result.available).toBe(false);
    expect(result.reasonCode).toBe('overlap');
    expect(result.message).toBe('This overlaps an existing booking (CS 101 Lecture).');
  });

  it('T3: blocked room is rejected', () => {
    const result = checkAvailability({
      room: roomById('c112'),
      start: 15 * 60,
      duration: 60,
      nowMinutes: NOW,
      bookings: INITIAL_BOOKINGS,
    });
    expect(result.available).toBe(false);
    expect(result.reasonCode).toBe('blocked');
    expect(result.message).toBe('Room C112 is currently blocked and cannot be booked.');
  });

  it('T4: duration zero is a validation error', () => {
    const result = checkAvailability({
      room: roomById('a101'),
      start: 15 * 60,
      duration: 0,
      nowMinutes: NOW,
      bookings: INITIAL_BOOKINGS,
    });
    expect(result.available).toBe(false);
    expect(result.reasonCode).toBe('invalid_interval');
  });

  it('T5: duration 121 is too long', () => {
    const result = checkAvailability({
      room: roomById('a101'),
      start: 15 * 60,
      duration: 121,
      nowMinutes: NOW,
      bookings: INITIAL_BOOKINGS,
    });
    expect(result.available).toBe(false);
    expect(result.reasonCode).toBe('too_long');
  });

  it('T6: past start is rejected', () => {
    const result = checkAvailability({
      room: roomById('a101'),
      start: 7 * 60,
      duration: 60,
      nowMinutes: NOW,
      bookings: INITIAL_BOOKINGS,
    });
    expect(result.available).toBe(false);
    expect(result.reasonCode).toBe('start_in_past');
  });

  it('T7: adjacent interval (touching endpoints) is available', () => {
    const result = checkAvailability({
      room: roomById('a101'),
      start: 10 * 60,
      duration: 60,
      nowMinutes: NOW,
      bookings: INITIAL_BOOKINGS,
    });
    expect(result.available).toBe(true);
    expect(result.reasonCode).toBe('none');
  });

  it('T8: bookings unchanged after T1-T7', () => {
    expect(snapshot(INITIAL_BOOKINGS)).toBe(before);
  });
});
