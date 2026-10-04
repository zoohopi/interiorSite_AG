export const clamp = n => Math.max(0, Math.min(1, n));
export const HOLD = 1.7;
export const TRAVEL = 1.65;
export const TOTAL = HOLD * 7 + TRAVEL * 6;
export const stopPosition = i => i * (HOLD + TRAVEL) + HOLD * .62;

// Distances are viewport heights, independent of the clips' running times.
export function sample(distance) {
  const d = Math.max(0, Math.min(TOTAL, distance));
  const scene = Math.min(6, Math.floor(d / (HOLD + TRAVEL)));
  const local = d - scene * (HOLD + TRAVEL);
  if (local <= HOLD || scene === 6) {
    const t = clamp(local / HOLD);
    const exit = scene === 6 ? 1 : 1 - clamp((t - .82) / .18);
    return { kind: 'hold', scene, t, shade: clamp((t - .06) / .24) * exit,
      copy: clamp((t - .25) / .22) * exit };
  }
  return { kind: 'travel', scene, t: clamp((local - HOLD) / TRAVEL), shade: 0, copy: 0 };
}
