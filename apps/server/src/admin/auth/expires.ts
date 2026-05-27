export function parseExpiresMs(value: string): number {
  const match = value.trim().match(/^(\d+)\s*([smhd])?$/i);
  if (!match) {
    throw new Error(`Unsupported expires value: ${value}`);
  }

  const n = Number(match[1]);
  const unit = (match[2] ?? 's').toLowerCase();
  const factor =
    unit === 's' ? 1000 : unit === 'm' ? 60_000 : unit === 'h' ? 3_600_000 : 86_400_000;

  return n * factor;
}

export function parseExpiresSeconds(value: string): number {
  return Math.floor(parseExpiresMs(value) / 1000);
}
