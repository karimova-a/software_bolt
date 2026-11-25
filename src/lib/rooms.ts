export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  blocked: boolean;
}

export interface Booking {
  roomId: string;
  start: number; // minutes from midnight
  end: number;
  owner: string;
}

export const ROOMS: Room[] = [
  { id: 'a101', name: 'Room A101', building: 'Science Hall', capacity: 24, blocked: false },
  { id: 'b204', name: 'Room B204', building: 'Engineering Wing', capacity: 40, blocked: false },
  { id: 'c112', name: 'Room C112', building: 'Library Annex', capacity: 12, blocked: true },
  { id: 'd310', name: 'Room D310', building: 'Science Hall', capacity: 60, blocked: false },
];

export const INITIAL_BOOKINGS: Booking[] = [
  { roomId: 'a101', start: 540, end: 600, owner: 'CS 101 Lecture' },
  { roomId: 'a101', start: 780, end: 840, owner: 'Study Group' },
  { roomId: 'b204', start: 600, end: 720, owner: 'Fluid Mechanics' },
  { roomId: 'd310', start: 480, end: 540, owner: 'Orientation Talk' },
  { roomId: 'd310', start: 870, end: 990, owner: 'Robotics Lab' },
];

export function minutesToLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const suffix = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}
