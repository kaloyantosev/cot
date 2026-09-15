'use client';

import { useEffect, useState } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getNextFriday1530ET(): Date {
  const now = new Date();

  const easternFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = easternFormatter.formatToParts(now);
  const get = (type: string) => parseInt(parts.find((p) => p.type === type)?.value ?? '0', 10);

  const etYear = get('year');
  const etMonth = get('month') - 1;
  const etDay = get('day');
  const etHour = get('hour');
  const etMinute = get('minute');

  const etNow = new Date(etYear, etMonth, etDay, etHour, etMinute, 0);
  const dayOfWeek = etNow.getDay(); // 0=Sun, 5=Fri

  let daysUntilFriday = (5 - dayOfWeek + 7) % 7;
  if (daysUntilFriday === 0) {
    const releaseMinutes = 15 * 60 + 30;
    const nowMinutes = etHour * 60 + etMinute;
    if (nowMinutes >= releaseMinutes) {
      daysUntilFriday = 7;
    }
  }

  const targetETDate = new Date(etYear, etMonth, etDay + daysUntilFriday, 15, 30, 0, 0);

  // Convert target ET wall-clock time to UTC by computing the actual offset
  const tentativeUTC = new Date(
    Date.UTC(
      targetETDate.getFullYear(),
      targetETDate.getMonth(),
      targetETDate.getDate(),
      targetETDate.getHours(),
      targetETDate.getMinutes(),
      0,
    ),
  );

  const targetParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(tentativeUTC);

  const targetHourET = parseInt(targetParts.find((p) => p.type === 'hour')?.value ?? '0', 10);
  const targetMinuteET = parseInt(targetParts.find((p) => p.type === 'minute')?.value ?? '0', 10);

  const utcHour = tentativeUTC.getUTCHours();
  const utcMinute = tentativeUTC.getUTCMinutes();
  const offsetMinutes = utcHour * 60 + utcMinute - (targetHourET * 60 + targetMinuteET);

  return new Date(tentativeUTC.getTime() + offsetMinutes * 60 * 1000);
}

function isLiveRelease(): boolean {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);
  const weekday = parts.find((p) => p.type === 'weekday')?.value;
  const hour = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0', 10);
  const minute = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0', 10);
  return weekday === 'Fri' && hour * 60 + minute >= 15 * 60 + 30;
}

function calcTimeLeft(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [live, setLive] = useState(false);

  useEffect(() => {
    const tick = () => {
      if (isLiveRelease()) {
        setLive(true);
        return;
      }
      setLive(false);
      const target = getNextFriday1530ET();
      setTimeLeft(calcTimeLeft(target));
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (live) {
    return (
      <span
        className="font-mono text-xs font-semibold tracking-wide"
        style={{ color: '#10b981' }}
      >
        🟢 LIVE — Data Released Today
      </span>
    );
  }

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <span className="font-mono text-xs tracking-wide text-[#94a3b8]">
      Next release in:{' '}
      <span style={{ color: '#6366f1' }} className="font-bold">
        {timeLeft.days}d {pad(timeLeft.hours)}h {pad(timeLeft.minutes)}m {pad(timeLeft.seconds)}s
      </span>
    </span>
  );
}
