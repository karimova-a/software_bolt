import type { Booking, Room } from './rooms';

export type ReasonCode =
  | 'none'
  | 'no_room'
  | 'invalid_interval'
  | 'start_in_past'
  | 'too_long'
  | 'blocked'
  | 'overlap';

export interface CheckRequest {
  room: Room | null;
  start: number; // minutes after midnight, NaN when missing
  duration: number; // whole minutes, NaN when missing
  nowMinutes: number;
  bookings: Booking[];
}

export interface CheckResult {
  available: boolean;
  reasonCode: ReasonCode;
  message: string;
}

const MAX_DURATION = 120;

export function checkAvailability({
  room,
  start,
  duration,
  nowMinutes,
  bookings,
}: CheckRequest): CheckResult {
  if (!room) {
    return { available: false, reasonCode: 'no_room', message: 'Please select a room.' };
  }
  const intervalValid =
    Number.isInteger(start) &&
    Number.isInteger(duration) &&
    start >= 0 &&
    duration > 0 &&
    start + duration <= 1440;
  if (!intervalValid) {
    return {
      available: false,
      reasonCode: 'invalid_interval',
      message: 'Enter a start time and a duration above 0 minutes that ends by 24:00.',
    };
  }
  if (start <= nowMinutes) {
    return {
      available: false,
      reasonCode: 'start_in_past',
      message: 'The start time must be after the current time.',
    };
  }
  if (duration > MAX_DURATION) {
    return {
      available: false,
      reasonCode: 'too_long',
      message: `Bookings are limited to ${MAX_DURATION} minutes or less.`,
    };
  }
  if (room.blocked) {
    return {
      available: false,
      reasonCode: 'blocked',
      message: `${room.name} is currently blocked and cannot be booked.`,
    };
  }
  const end = start + duration;
  const conflict = bookings.find((b) => b.roomId === room.id && start < b.end && end > b.start);
  if (conflict) {
    return {
      available: false,
      reasonCode: 'overlap',
      message: `This overlaps an existing booking (${conflict.owner}).`,
    };
  }
  return {
    available: true,
    reasonCode: 'none',
    message: `${room.name} is available for your selected interval.`,
  };
}
