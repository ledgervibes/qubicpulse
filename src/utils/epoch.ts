export const EPOCH_DURATION_SECONDS = 604800;
const EPOCH_DURATION_MS = EPOCH_DURATION_SECONDS * 1000;
const EPOCH_START_DAY_UTC = 3;
const EPOCH_START_HOUR_UTC = 12;

export interface EpochCountdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  progress: number;
  currentEpoch: number;
  epochStartTick: number;
}

export function calculateEpochCountdown(
  currentEpoch: number,
  initialTick: number,
  now: Date = new Date()
): EpochCountdown {
  const epochStart = new Date(now);
  const daysSinceWednesday =
    (epochStart.getUTCDay() - EPOCH_START_DAY_UTC + 7) % 7;
  epochStart.setUTCDate(epochStart.getUTCDate() - daysSinceWednesday);
  epochStart.setUTCHours(EPOCH_START_HOUR_UTC, 0, 0, 0);

  if (epochStart.getTime() > now.getTime()) {
    epochStart.setUTCDate(epochStart.getUTCDate() - 7);
  }

  const epochEndTime = epochStart.getTime() + EPOCH_DURATION_MS;
  const elapsedMs = Math.min(
    EPOCH_DURATION_MS,
    Math.max(0, now.getTime() - epochStart.getTime())
  );
  const progress = (elapsedMs / EPOCH_DURATION_MS) * 100;
  const remainingSeconds = Math.max(
    0,
    Math.ceil((epochEndTime - now.getTime()) / 1000)
  );

  return {
    days: Math.floor(remainingSeconds / 86400),
    hours: Math.floor((remainingSeconds % 86400) / 3600),
    minutes: Math.floor((remainingSeconds % 3600) / 60),
    seconds: Math.floor(remainingSeconds % 60),
    progress,
    currentEpoch,
    epochStartTick: initialTick,
  };
}

export function formatEpochCountdown(countdown: EpochCountdown): string {
  const parts: string[] = [];
  if (countdown.days > 0) parts.push(`${countdown.days}d`);
  parts.push(`${String(countdown.hours).padStart(2, "0")}h`);
  parts.push(`${String(countdown.minutes).padStart(2, "0")}m`);
  parts.push(`${String(countdown.seconds).padStart(2, "0")}s`);
  return parts.join(" ");
}
