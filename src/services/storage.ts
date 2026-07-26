const PREFIX = "qubicpulse_";

export function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function setItem<T>(key: string, value: T): void {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export function removeItem(key: string): void {
  localStorage.removeItem(PREFIX + key);
}

export function exportAll(): string {
  const data: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(PREFIX)) {
      data[key.replace(PREFIX, "")] = JSON.parse(localStorage.getItem(key)!);
    }
  }
  return JSON.stringify(data, null, 2);
}

export function importAll(json: string): void {
  const data = JSON.parse(json) as Record<string, unknown>;
  for (const [key, value] of Object.entries(data)) {
    setItem(key, value);
  }
}
