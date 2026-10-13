import type { Member } from "./types";

/** Vivid, well-separated colours that read on the dark board. Everyone gets a different one. */
export const MEMBER_PALETTE = [
  "#ff5d73", "#ff8a3d", "#ffc233", "#d4e157", "#7ddf64", "#2fd39b",
  "#22d3ee", "#38a3ff", "#6c7bff", "#9b6bff", "#c75bff", "#ff5fc4",
  "#ff7a7a", "#ffa94d", "#e8d44d", "#a0e060", "#3fe0c5", "#5ec8ff",
  "#8fa2ff", "#b99aff", "#ee8cff", "#ff8fb8", "#e4572e", "#17bebb",
  "#f4a259", "#5b8e7d", "#bc4b51", "#8cb369", "#4d9de0", "#e15554",
  "#7768ae", "#3bb273",
];

export const HEX = /^#[0-9a-fA-F]{6}$/;

function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** rough perceptual distance, 0 = identical */
export function colorDistance(a: string, b: string): number {
  const [r1, g1, b1] = rgb(a);
  const [r2, g2, b2] = rgb(b);
  const rm = (r1 + r2) / 2;
  return Math.sqrt((2 + rm / 256) * (r1 - r2) ** 2 + 4 * (g1 - g2) ** 2 + (2 + (255 - rm) / 256) * (b1 - b2) ** 2);
}

/** too close to another person's colour to tell apart in the ring */
export const TOO_CLOSE = 60;

function hslToHex(h: number, s: number, l: number): string {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** a random colour nobody else is using (or close to), falling back to generated hues once the palette runs out */
export function pickFreeColor(taken: Iterable<string>): string {
  const used = [...taken].filter((c) => HEX.test(c));
  const free = MEMBER_PALETTE.filter((c) => used.every((u) => colorDistance(u, c) >= TOO_CLOSE));
  if (free.length) return free[Math.floor(Math.random() * free.length)];
  let best = MEMBER_PALETTE[0];
  let bestScore = -1;
  for (let i = 0; i < 80; i++) {
    const c = hslToHex(Math.random() * 360, 0.72, 0.6);
    const score = Math.min(...used.map((u) => colorDistance(u, c)), 999);
    if (score > bestScore) {
      best = c;
      bestScore = score;
    }
  }
  return best;
}

/**
 * The colour every person is shown with. Picked colours are used as-is; people who have not picked yet
 * get the next unused palette colour, in join order, so every browser agrees and nobody shares a colour.
 */
export function resolveMemberColors(members: Member[]): Map<string, string> {
  const out = new Map<string, string>();
  const used = new Set<string>();
  for (const m of members) {
    if (m.color && HEX.test(m.color)) {
      out.set(m.id, m.color.toLowerCase());
      used.add(m.color.toLowerCase());
    }
  }
  const waiting = members
    .filter((m) => !out.has(m.id))
    .sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id));
  let i = 0;
  for (const m of waiting) {
    let c = MEMBER_PALETTE[i % MEMBER_PALETTE.length];
    while (used.has(c.toLowerCase()) && i < MEMBER_PALETTE.length * 2) {
      i++;
      c = MEMBER_PALETTE[i % MEMBER_PALETTE.length];
    }
    i++;
    out.set(m.id, c.toLowerCase());
    used.add(c.toLowerCase());
  }
  return out;
}
