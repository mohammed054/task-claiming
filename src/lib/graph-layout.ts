import dagre from "@dagrejs/dagre";

/** Footprint of one task in world units. The renderer draws cards at exactly this size. */
export const NODE_W = 236;
export const NODE_H = 84;

const RANK_SEP = 112;
const NODE_SEP = 22;
const PITCH = NODE_W + RANK_SEP;
const HEADER = 70; // room for the block flag above each cluster
const HUB_PAD = 120; // room for the hub orb left of each cluster
const ROW_GAP = 70;
const REGION_GAP = 150;

export interface LayoutEdge {
  src: string;
  tgt: string;
  /** flat [x0, y0, x1, y1, …] route, world units */
  pts: number[];
  bbox: [number, number, number, number];
}

export interface Region {
  blockId: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Layout {
  /** top-left of every task */
  pos: Map<string, { x: number; y: number }>;
  edges: LayoutEdge[];
  /** the glowing seed each block grows from */
  hubs: { blockId: string; x: number; y: number }[];
  hubEdges: LayoutEdge[];
  /** the trunk: one smooth vine through every hub, in block order */
  vine: number[];
  regions: Region[];
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
}

function bboxOf(pts: number[]): [number, number, number, number] {
  let x0 = Infinity,
    y0 = Infinity,
    x1 = -Infinity,
    y1 = -Infinity;
  for (let i = 0; i < pts.length; i += 2) {
    x0 = Math.min(x0, pts[i]);
    x1 = Math.max(x1, pts[i]);
    y0 = Math.min(y0, pts[i + 1]);
    y1 = Math.max(y1, pts[i + 1]);
  }
  return [x0, y0, x1, y1];
}

/** one block, laid out on its own in local coordinates (origin = region top-left) */
export interface BlockLayout {
  blockId: string;
  w: number;
  h: number;
  pos: Map<string, { x: number; y: number }>;
  edges: LayoutEdge[];
  hub: { x: number; y: number };
  hubTargets: string[];
}

interface TaskLite {
  id: string;
  block_id: string;
}
interface DepLite {
  task_id: string;
  depends_on_id: string;
}

/**
 * Lay every block out on its own (left → right by dependency depth), then fold the long strip into
 * rows so each cluster ends up roughly screen-shaped. `tasks` should already be ordered – it is the tie-break.
 */
export function layoutBlocks(tasks: TaskLite[], deps: DepLite[], blockIds: string[]): BlockLayout[] {
  const out: BlockLayout[] = [];
  const byBlock = new Map<string, TaskLite[]>();
  for (const t of tasks) {
    const arr = byBlock.get(t.block_id) ?? [];
    arr.push(t);
    byBlock.set(t.block_id, arr);
  }
  const order = [...blockIds.filter((b) => byBlock.has(b)), ...[...byBlock.keys()].filter((b) => !blockIds.includes(b))];

  for (const blockId of order) {
    const list = byBlock.get(blockId)!;
    const ids = new Set(list.map((t) => t.id));
    const local = deps.filter((d) => ids.has(d.task_id) && ids.has(d.depends_on_id));

    const g = new dagre.graphlib.Graph();
    g.setGraph({
      rankdir: "LR",
      ranksep: RANK_SEP,
      nodesep: NODE_SEP,
      marginx: 0,
      marginy: 0,
      ranker: list.length > 220 ? "tight-tree" : "network-simplex",
    });
    g.setDefaultEdgeLabel(() => ({}));
    for (const t of list) g.setNode(t.id, { width: NODE_W, height: NODE_H });
    for (const d of local) g.setEdge(d.depends_on_id, d.task_id);
    dagre.layout(g);

    let minL = Infinity,
      minT = Infinity,
      maxB = -Infinity,
      maxRank = 0;
    for (const t of list) {
      const n = g.node(t.id);
      minL = Math.min(minL, n.x - NODE_W / 2);
      minT = Math.min(minT, n.y - NODE_H / 2);
      maxB = Math.max(maxB, n.y + NODE_H / 2);
    }
    const rankOf = (cx: number) => Math.round((cx - NODE_W / 2 - minL) / PITCH);
    for (const t of list) maxRank = Math.max(maxRank, rankOf(g.node(t.id).x));
    const ranks = maxRank + 1;
    const H0 = Math.max(NODE_H, maxB - minT);

    // fold: pick the row count that makes the cluster close to 1.7 : 1
    const stripW = ranks * PITCH - RANK_SEP;
    const rows = Math.max(1, Math.min(ranks, Math.round(Math.sqrt(stripW / (1.7 * (H0 + ROW_GAP))))));
    const perRow = Math.ceil(ranks / rows);
    const rowsUsed = Math.ceil(ranks / perRow);
    const rowStride = H0 + ROW_GAP;

    const place = (cx: number, cy: number, rank: number) => {
      const row = Math.floor(rank / perRow);
      return {
        row,
        x: cx - NODE_W / 2 - minL - row * perRow * PITCH + HUB_PAD,
        y: cy - NODE_H / 2 - minT + row * rowStride + HEADER,
      };
    };

    const pos = new Map<string, { x: number; y: number }>();
    const rowOf = new Map<string, number>();
    for (const t of list) {
      const n = g.node(t.id);
      const p = place(n.x, n.y, rankOf(n.x));
      pos.set(t.id, { x: p.x, y: p.y });
      rowOf.set(t.id, p.row);
    }

    const edges: LayoutEdge[] = [];
    for (const d of local) {
      const a = pos.get(d.depends_on_id)!;
      const b = pos.get(d.task_id)!;
      const ra = rowOf.get(d.depends_on_id)!;
      const rb = rowOf.get(d.task_id)!;
      const pts = [a.x + NODE_W, a.y + NODE_H / 2];
      if (ra === rb) {
        const label = g.edge(d.depends_on_id, d.task_id) as { points?: { x: number; y: number }[] } | undefined;
        for (const p of (label?.points ?? []).slice(1, -1)) {
          pts.push(p.x - minL - ra * perRow * PITCH + HUB_PAD, p.y - minT + ra * rowStride + HEADER);
        }
      }
      pts.push(b.x, b.y + NODE_H / 2);
      edges.push({ src: d.depends_on_id, tgt: d.task_id, pts, bbox: bboxOf(pts) });
    }

    // the hub grows into the block's starting tasks in the first row
    const hasLocalDep = new Set(local.map((d) => d.task_id));
    const hubTargets = list
      .filter((t) => !hasLocalDep.has(t.id) && rowOf.get(t.id) === 0)
      .slice(0, 40)
      .map((t) => t.id);

    const w = HUB_PAD + perRow * PITCH - RANK_SEP;
    const h = HEADER + rowsUsed * H0 + (rowsUsed - 1) * ROW_GAP + 20;
    out.push({ blockId, w, h, pos, edges, hub: { x: 44, y: HEADER + H0 / 2 }, hubTargets });
  }
  return out;
}

/** Arrange the clusters in a snaking grid whose shape matches the viewport (`aspect` = width / height). */
export function packBlocks(blocks: BlockLayout[], deps: DepLite[], taskBlock: Map<string, string>, aspect: number): Layout {
  const n = blocks.length;
  const empty: Layout = {
    pos: new Map(),
    edges: [],
    hubs: [],
    hubEdges: [],
    vine: [],
    regions: [],
    bounds: { minX: 0, minY: 0, maxX: 1, maxY: 1 },
  };
  if (!n) return empty;

  // try every column count, keep the one that fills the viewport best
  let best = { cols: 1, score: -1 };
  for (let cols = 1; cols <= n; cols++) {
    const rows = Math.ceil(n / cols);
    const colW = new Array<number>(cols).fill(0);
    const rowH = new Array<number>(rows).fill(0);
    blocks.forEach((b, i) => {
      colW[i % cols] = Math.max(colW[i % cols], b.w);
      rowH[Math.floor(i / cols)] = Math.max(rowH[Math.floor(i / cols)], b.h);
    });
    const bw = colW.reduce((a, b) => a + b, 0) + (cols - 1) * REGION_GAP;
    const bh = rowH.reduce((a, b) => a + b, 0) + (rows - 1) * REGION_GAP;
    const score = Math.min(aspect / bw, 1 / bh); // scale at which this arrangement fits a viewport of aspect × 1
    if (score > best.score) best = { cols, score };
  }
  const cols = best.cols;
  const rows = Math.ceil(n / cols);
  const colW = new Array<number>(cols).fill(0);
  const rowH = new Array<number>(rows).fill(0);
  const colOf = (i: number) => {
    const r = Math.floor(i / cols);
    const c = i % cols;
    return r % 2 === 0 ? c : cols - 1 - c; // snake: odd rows run right → left so the trunk never doubles back
  };
  blocks.forEach((b, i) => {
    colW[colOf(i)] = Math.max(colW[colOf(i)], b.w);
    rowH[Math.floor(i / cols)] = Math.max(rowH[Math.floor(i / cols)], b.h);
  });
  const colX: number[] = [];
  let ax = 0;
  for (let c = 0; c < cols; c++) {
    colX.push(ax);
    ax += colW[c] + REGION_GAP;
  }
  const rowY: number[] = [];
  let ay = 0;
  for (let r = 0; r < rows; r++) {
    rowY.push(ay);
    ay += rowH[r] + REGION_GAP;
  }

  const pos = new Map<string, { x: number; y: number }>();
  const edges: LayoutEdge[] = [];
  const hubs: Layout["hubs"] = [];
  const hubEdges: LayoutEdge[] = [];
  const regions: Region[] = [];
  const vine: number[] = [];
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  blocks.forEach((b, i) => {
    const r = Math.floor(i / cols);
    const c = colOf(i);
    // centre each cluster in its cell
    const ox = colX[c] + (colW[c] - b.w) / 2;
    const oy = rowY[r] + (rowH[r] - b.h) / 2;
    regions.push({ blockId: b.blockId, x: ox, y: oy, w: b.w, h: b.h });
    minX = Math.min(minX, ox);
    minY = Math.min(minY, oy);
    maxX = Math.max(maxX, ox + b.w);
    maxY = Math.max(maxY, oy + b.h);
    for (const [id, p] of b.pos) pos.set(id, { x: p.x + ox, y: p.y + oy });
    for (const e of b.edges) {
      const pts = e.pts.map((v, k) => v + (k % 2 === 0 ? ox : oy));
      edges.push({ ...e, pts, bbox: bboxOf(pts) });
    }
    const hub = { blockId: b.blockId, x: b.hub.x + ox, y: b.hub.y + oy };
    hubs.push(hub);
    vine.push(hub.x, hub.y);
    for (const id of b.hubTargets) {
      const p = pos.get(id)!;
      const pts = [hub.x, hub.y, p.x, p.y + NODE_H / 2];
      hubEdges.push({ src: "", tgt: id, pts, bbox: bboxOf(pts) });
    }
  });

  // dependencies that cross from one block to another
  for (const d of deps) {
    const a = pos.get(d.depends_on_id);
    const bpos = pos.get(d.task_id);
    if (!a || !bpos) continue;
    if (taskBlock.get(d.depends_on_id) === taskBlock.get(d.task_id)) continue;
    const pts = [a.x + NODE_W, a.y + NODE_H / 2, bpos.x, bpos.y + NODE_H / 2];
    edges.push({ src: d.depends_on_id, tgt: d.task_id, pts, bbox: bboxOf(pts) });
  }

  return { pos, edges, hubs, hubEdges, vine, regions, bounds: { minX, minY, maxX, maxY } };
}

/**
 * Organic branch curve. Two-point links are a simple S-curve with horizontal tangents; links routed through
 * several points become one smooth Catmull-Rom spline so they flow instead of stepping around corners.
 */
export function buildBranchPath(pts: number[]): Path2D {
  const path = new Path2D();
  path.moveTo(pts[0], pts[1]);
  const n = pts.length / 2;
  if (n === 2) {
    const x0 = pts[0],
      y0 = pts[1],
      x1 = pts[2],
      y1 = pts[3];
    // forward links ease out half-way; links that wrap back swing out to the right first
    const dx = x1 >= x0 ? Math.max(40, (x1 - x0) * 0.5) : Math.min(320, 90 + (x0 - x1) * 0.12);
    path.bezierCurveTo(x0 + dx, y0, x1 - dx, y1, x1, y1);
    return path;
  }
  const P = (i: number): [number, number] => {
    if (i < 0) return [pts[0] - 70, pts[1]]; // keep the leaving tangent horizontal
    if (i >= n) return [pts[(n - 1) * 2] + 70, pts[(n - 1) * 2 + 1]]; // …and the arriving one
    return [pts[i * 2], pts[i * 2 + 1]];
  };
  for (let i = 0; i < n - 1; i++) {
    const p0 = P(i - 1),
      p1 = P(i),
      p2 = P(i + 1),
      p3 = P(i + 2);
    path.bezierCurveTo(
      p1[0] + (p2[0] - p0[0]) / 6,
      p1[1] + (p2[1] - p0[1]) / 6,
      p2[0] - (p3[0] - p1[0]) / 6,
      p2[1] - (p3[1] - p1[1]) / 6,
      p2[0],
      p2[1],
    );
  }
  return path;
}

/** Every task upstream and downstream of `id`, plus `id` itself. */
export function chainOf(
  id: string,
  depsOf: Map<string, string[]>,
  dependentsOf: Map<string, string[]>,
): Set<string> {
  const seen = new Set<string>([id]);
  for (const map of [depsOf, dependentsOf]) {
    const stack = [id];
    while (stack.length) {
      const cur = stack.pop()!;
      for (const next of map.get(cur) ?? []) {
        if (!seen.has(next)) {
          seen.add(next);
          stack.push(next);
        }
      }
    }
  }
  return seen;
}
