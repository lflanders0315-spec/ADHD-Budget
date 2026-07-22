/**
 * Simple UUID-like ID generator — no external dependencies.
 * Uses crypto.randomUUID when available (React Native / modern JS),
 * falls back to a timestamp + random string.
 */

let _cryptoAvailable: boolean | null = null;

function isCryptoAvailable(): boolean {
  if (_cryptoAvailable !== null) return _cryptoAvailable;
  try {
    _cryptoAvailable =
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function";
  } catch {
    _cryptoAvailable = false;
  }
  return _cryptoAvailable;
}

export function generateId(): string {
  if (isCryptoAvailable()) {
    return crypto.randomUUID();
  }
  // Fallback: timestamp + random
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 11);
  return `${timestamp}-${random}`;
}
