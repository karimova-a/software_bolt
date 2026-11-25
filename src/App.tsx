import { useState } from 'react';
import { CalendarClock, CheckCircle2, XCircle, Clock, Ban } from 'lucide-react';
import { INITIAL_BOOKINGS, ROOMS, minutesToLabel, timeToMinutes } from '@/lib/rooms';
import type { Booking, Room } from '@/lib/rooms';
import { checkAvailability } from '@/lib/validation';
import type { CheckResult } from '@/lib/validation';

function currentTimeMinutes(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

function currentLabel(now: number): string {
  const h = Math.floor(now / 60);
  const m = now % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

interface RoomCardProps {
  room: Room;
  bookings: Booking[];
  testClock: string; // HH:MM, empty string means use the real clock
}

function RoomCard({ room, bookings, testClock }: RoomCardProps) {
  const [start, setStart] = useState('');
  const [duration, setDuration] = useState('');
  const [checked, setChecked] = useState<CheckResult | null>(null);
  const [usedNow, setUsedNow] = useState<number | null>(null);

  const todaysBookings = bookings
    .filter((b) => b.roomId === room.id)
    .sort((a, b) => a.start - b.start);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const nowMinutes = testClock ? timeToMinutes(testClock) : currentTimeMinutes();
    setUsedNow(nowMinutes);
    setChecked(
      checkAvailability({
        room,
        start: timeToMinutes(start),
        duration: parseInt(duration, 10),
        nowMinutes,
        bookings,
      }),
    );
  };

  const available = checked?.available ?? false;

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 p-4">
        <div>
          <h3 className="font-semibold text-slate-900">{room.name}</h3>
          <p className="text-sm text-slate-500">
            {room.building} · {room.capacity} seats
          </p>
        </div>
        {room.blocked ? (
          <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
            <Ban className="h-3.5 w-3.5" /> Blocked
          </span>
        ) : (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            Open
          </span>
        )}
      </div>

      <form onSubmit={handleCheck} className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-[1fr_1fr_auto]">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Start</span>
          <input
            type="time"
            value={start}
            onChange={(e) => {
              setStart(e.target.value);
              setChecked(null);
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
            required
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Duration (minutes)</span>
          <input
            type="number"
            min={1}
            step={1}
            placeholder="e.g. 60"
            value={duration}
            onChange={(e) => {
              setDuration(e.target.value);
              setChecked(null);
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
          />
        </label>
        <button
          type="submit"
          className="self-end rounded-lg bg-teal-600 px-4 py-2 font-medium text-white transition-colors hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400 sm:justify-self-end"
        >
          Check
        </button>
      </form>

      {checked && (
        <div
          role="status"
          aria-live="polite"
          className={`mx-4 mb-2 flex items-start gap-2 rounded-lg p-3 text-sm ${
            available ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
          }`}
        >
          {available ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span>
            <strong className="font-semibold">{available ? 'Available' : 'Unavailable'}</strong>
            <span
              className={`ml-2 rounded px-1.5 py-0.5 font-mono text-xs ${
                available ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {checked.reasonCode}
            </span>
            {' — '}
            {checked.message}
            {usedNow !== null && (
              <span className="mt-1 block text-xs text-slate-500">
                Checked against current time {currentLabel(usedNow)}
                {testClock ? ' (test clock)' : ' (real clock)'}.
              </span>
            )}
          </span>
        </div>
      )}

      <div className="mt-auto p-4 pt-2">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
          <Clock className="h-3.5 w-3.5" /> Today's bookings
        </p>
        {todaysBookings.length === 0 ? (
          <p className="text-sm text-slate-400">No bookings yet.</p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {todaysBookings.map((b, i) => (
              <li
                key={i}
                className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600"
                title={b.owner}
              >
                {minutesToLabel(b.start)} – {minutesToLabel(b.end)} · {b.owner}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [testClock, setTestClock] = useState('');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-600 text-white">
              <CalendarClock className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-lg font-semibold leading-tight">Smart Campus Room Checker</h1>
              <p className="text-sm text-slate-500">Find a free study or class room, instantly.</p>
            </div>
          </div>
          <label className="text-sm sm:text-right">
            <span className="mb-1 block font-medium text-slate-700">
              Test clock (simulated)
              <span className="ml-1 font-normal text-slate-400">leave empty for real time</span>
            </span>
            <input
              type="time"
              value={testClock}
              onChange={(e) => setTestClock(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 sm:w-40"
            />
          </label>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            {testClock ? (
              <>
                Simulated current time:{' '}
                <strong className="font-semibold text-slate-900">{testClock}</strong>
              </>
            ) : (
              <>
                Real current time:{' '}
                <strong className="font-semibold text-slate-900">
                  {currentLabel(currentTimeMinutes())}
                </strong>
              </>
            )}
          </p>
          <p className="text-xs text-slate-400">
            Rules are applied in the contract's order; the first failing rule is shown.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {ROOMS.map((room) => (
            <RoomCard key={room.id} room={room} bookings={INITIAL_BOOKINGS} testClock={testClock} />
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Sample data only — checking a slot never changes the schedule.
        </p>
      </main>
    </div>
  );
}
