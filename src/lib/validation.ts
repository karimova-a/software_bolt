import type { Booking, Room } from './rooms';

export interface CheckRequest {
  room: Room;
  start: number;
  end: number;
  nowMinutes: number;
  bookings: Booking[];
}

export interface CheckResult {
  available: boolean;
  reason: string;
}

const MAX_DURATION = 120;

export function checkAvailability({ room, start, end, nowMinutes, bookings }: CheckRequest): CheckResult {
  if (Number.isNaN(start) || Number.isNaN(end)) {
    return { available: false, reason: 'Please provide both a start and an end time.' };
  }
  if (start < 0 || end > 1440 || start >= end) {
    return {
      available: false,
      reason: 'Times must be within the day (0:00–24:00) and the start must be before the end.',
    };
  }
  if (start <= nowMinutes) {
    return { available: false, reason: 'The start time must be after the current time.' };
  }
  if (end - start > MAX_DURATION) {
    return { available: false, reason: `Bookings are limited to ${MAX_DURATION} minutes or less.` };
  }
  if (room.blocked) {
    return { available: false, reason: `${room.name} is currently blocked and cannot be booked.` };
  }
  const conflict = bookings.find((b) => b.roomId === room.id && start < b.end && end > b.start);
  if (conflict) {
    return {
      available: false,
      reason: `This overlaps an existing booking (${conflict.owner}). Touching endpoints are fine, overlaps are not.`,
    };
  }
  return { available: true, reason: `${room.name} is available for your selected interval.` };
}
