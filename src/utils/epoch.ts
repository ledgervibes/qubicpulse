export const EPOCH_DURATION_SECONDS = 604800;
export const EPOCH_DURATION_TICKS = 14112000;
export const TICKS_PER_SECOND = 15.38;

const REFERENCE_EPOCH = 137;
const REFERENCE_TICK = 26755200;

export function calculateEpochStartTick(epoch: number): number {
  return REFERENCE_TICK + (epoch - REFERENCE_EPOCH) * EPOCH_DURATION_TICKS;
}

export interface EpochCountdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  progress: number;
  currentEpoch: number;
  epochStartTick: number;
  epochEndTick: number;
}

export function calculateEpochCountdown(
  currentTick: number,
  currentEpoch: number
): EpochCountdown {
  const epochStartTick = calculateEpochStartTick(currentEpoch);
  const epochEndTick = epochStartTick + EPOCH_DURATION_TICKS;
  const ticksInCurrentEpoch = currentTick - epochStartTick;
  const progress = Math.min(100, Math.max(0, (ticksInCurrentEpoch / EPOCH_DURATION_TICKS) * 100));
  const remainingTicks = Math.max(0, epochEndTick - currentTick);
  const remainingSeconds = Math.floor(remainingTicks / TICKS_PER_SECOND);

  return {
    days: Math.floor(remainingSeconds / 86400),
    hours: Math.floor((remainingSeconds % 86400) / 3600),
    minutes: Math.floor((remainingSeconds % 3600) / 60),
    seconds: Math.floor(remainingSeconds % 60),
    progress,
    currentEpoch,
    epochStartTick,
    epochEndTick,
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
