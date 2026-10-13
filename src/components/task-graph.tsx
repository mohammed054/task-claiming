"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChartPie, Check, Crosshair, Minus, Plus, RotateCcw, Scan, X } from "lucide-react";
import { useBoard } from "@/lib/store";
import {
  buildBranchPath,
  chainOf,
  curveBBox,
  curvePath,
  hubCurve,
  layoutBlocks,
  linkCurve,
  NODE_H,
  NODE_W,
  packBlocks,
  type LayoutEdge,
} from "@/lib/graph-layout";
import type { Priority, TaskState } from "@/lib/types";
import { cn, initials, naturalCompare } from "@/lib/utils";
import { Button } from "./ui/button";
import { STATE_META } from "./status";

/* ------------------------------------------------------------------ palette */

/** One vivid colour per block: it tints that block's branches, strips and labels. */
const BLOCK_COLORS = [
  "#7c9cff",
  "#ffb454",
  "#34d399",
  "#c084fc",
  "#fb7185",
  "#22d3ee",
  "#a3e635",
  "#f472b6",
  "#facc15",
  "#60a5fa",
  "#fb923c",
  "#2dd4bf",
];

const STATE_HEX: Record<TaskState, string> = {
  locked: "#566074",
  open: "#d9dfeb",
  claimed: "#fbbf24",
  in_progress: "#38bdf8",
  done: "#34d399",
};

const PRIORITY_HEX: Record<Priority, string> = {
  critical: "#fb7185",
  high: "#fbbf24",
  medium: "#94a3b8",
  low: "#556070",
};

const STATE_ORDER: TaskState[] = ["locked", "open", "claimed", "in_progress", "done"];

/** zoom thresholds: below PILL_K tasks are glowing bars, below CARD_K labelled chips, above that full cards */
const PILL_K = 0.27;
const CARD_K = 0.62;
const MIN_K = 0.015;
const MAX_K = 2.6;
const DRAWER_W = 560;
const OFFSETS_KEY = "taskboard.nodeOffsets.v1";

const colorCache = new Map<string, string>();
function hexA(hex: string, a: number): string {
  const key = `${hex}${a.toFixed(2)}`;
  let v = colorCache.get(key);
  if (!v) {
    const n = parseInt(hex.slice(1), 16);
    v = `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a.toFixed(2)})`;
    colorCache.set(key, v);
  }
  return v;
}

function avatarColor(name: string): string {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return `hsl(${h % 360} 38% 34%)`;
}

function pctText(share: number): string {
  const p = share * 100;
  if (p <= 0) return "0";
  return p >= 10 ? String(Math.round(p)) : p >= 0.1 ? p.toFixed(1).replace(/\.0$/, "") : "<0.1";
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/* -------------------------------------------------------------------- types */

interface Item {
  id: string;
  code: string;
  title: string;
  x: number;
  y: number;
  state: TaskState;
  color: string;
  blockId: string;
  owner: string | null;
  mine: boolean;
  priority: Priority;
  estimate: string;
  deps: number;
  unlocks: number;
}

type Bounds = { minX: number; minY: number; maxX: number; maxY: number };
type REdge = LayoutEdge & { si: number; ti: number; color: string; bbox0: [number, number, number, number] };
type RRootEdge = LayoutEdge & { ti: number; color: string };

interface Live {
  items: Item[];
  edges: REdge[];
  rootEdges: RRootEdge[];
  hubs: { x: number; y: number; color: string }[];
  bounds: Bounds;
  auras: { cx: number; cy: number; r: number; color: string }[];
  anchors: { x: number; y: number; label: string; color: string }[];
  /** edges (and hub edges) touching each task, so dragging a task can re-route just those */
  incident: { e: number[]; h: number[] }[];
  /** 1 where the task passes the current filters */
  match: Uint8Array;
  /** 1 where the task is in the hovered task's chain, null when nothing is hovered */
  chain: Uint8Array | null;
  hover: number;
  selected: number;
  /** the contribution ring (drawn under everything else) */
  ring: RingDraw | null;
}

interface RingSeg {
  id: string;
  name: string;
  n: number;
  color: string;
}

interface RingDraw {
  segs: RingSeg[];
  done: number;
  total: number;
  place: { x: number; y: number; r: number };
}

interface Cam {
  x: number;
  y: number;
  k: number;
}

/* -------------------------------------------------------------- component */

export function TaskGraph({
  matched,
  selectedId,
  onOpen,
  filtering,
  insetTop = 76,
  blockFilter,
  onPickBlock,
}: {
  matched: Set<string>;
  selectedId: string | null;
  onOpen: (code: string) => void;
  filtering: boolean;
  /** space at the top covered by the floating toolbar */
  insetTop?: number;
  blockFilter: string;
  onPickBlock: (blockId: string) => void;
}) {
  const board = useBoard();

  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const miniRef = useRef<HTMLCanvasElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  const cam = useRef<Cam>({ x: 0, y: 0, k: 1 });
  const target = useRef<Cam>({ x: 0, y: 0, k: 1 });
  const size = useRef({ w: 0, h: 0, dpr: 1 });
  const dirty = useRef(true);
  const pulse = useRef(false);
  const userMoved = useRef(false);
  const insetRef = useRef(insetTop);
  insetRef.current = insetTop;
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;
  const minimapMap = useRef({ s: 1, ox: 0, oy: 0 });
  const miniDrag = useRef(false);

  const ringWork = useRef({ x: 0, y: 0, r: 100 });
  const ringAnimStart = useRef<number | null>(null);
  const editRef = useRef(false);
  const [editingRing, setEditingRing] = useState(false);
  const [savingRing, setSavingRing] = useState(false);

  const [hoverItem, setHoverItem] = useState<Item | null>(null);
  const [hint, setHint] = useState(true);
  const [ready, setReady] = useState(false);

  /* ---------------------------------------------------------------- layout */

  const blockIndex = useMemo(() => {
    const m = new Map<string, number>();
    board.blocks.forEach((b, i) => m.set(b.id, i));
    return m;
  }, [board.blocks]);

  const ordered = useMemo(
    () =>
      [...board.tasks].sort(
        (a, b) =>
          (blockIndex.get(a.block_id) ?? 0) - (blockIndex.get(b.block_id) ?? 0) || naturalCompare(a.code, b.code),
      ),
    [board.tasks, blockIndex],
  );

  // positions only depend on the shape of the graph, not on who owns what
  const shapeKey = useMemo(
    () =>
      ordered.map((t) => t.id).join(",") +
      "|" +
      board.deps
        .map((d) => `${d.task_id}>${d.depends_on_id}`)
        .sort()
        .join(","),
    [ordered, board.deps],
  );

  // each block is laid out once per shape…
  const blockLayouts = useMemo(
    () =>
      layoutBlocks(
        ordered,
        board.deps,
        board.blocks.map((b) => b.id),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shapeKey, board.blocks],
  );

  // …and the clusters are re-packed whenever the viewport changes shape
  const [aspect, setAspect] = useState(1.8);
  const layout = useMemo(() => {
    const taskBlock = new Map<string, string>();
    for (const t of ordered) taskBlock.set(t.id, t.block_id);
    return packBlocks(blockLayouts, board.deps, taskBlock, aspect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockLayouts, aspect]);

  const blockColor = useMemo(() => {
    const m = new Map<string, string>();
    board.blocks.forEach((b, i) => m.set(b.id, BLOCK_COLORS[i % BLOCK_COLORS.length]));
    return m;
  }, [board.blocks]);

  // static geometry (paths) – rebuilt only when the shape changes
  const geometry = useMemo(() => {
    const idx = new Map<string, number>();
    ordered.forEach((t, i) => idx.set(t.id, i));
    const color = (taskId: string) => blockColor.get(board.taskById.get(taskId)?.block_id ?? "") ?? BLOCK_COLORS[0];
    const edges = layout.edges.map((e) => ({
      ...e,
      bbox0: e.bbox,
      si: idx.get(e.src) ?? 0,
      ti: idx.get(e.tgt) ?? 0,
      color: color(e.src),
    }));
    const rootEdges = layout.hubEdges.map((e) => ({ ...e, ti: idx.get(e.tgt) ?? 0, color: color(e.tgt) }));
    const incident: Live["incident"] = ordered.map(() => ({ e: [], h: [] }));
    edges.forEach((e, i) => {
      incident[e.si]?.e.push(i);
      incident[e.ti]?.e.push(i);
    });
    rootEdges.forEach((e, i) => incident[e.ti]?.h.push(i));
    return { edges, rootEdges, idx, incident };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, blockColor]);

  const pathsRef = useRef<{ edges: Path2D[]; rootEdges: Path2D[]; vine: Path2D | null }>({ edges: [], rootEdges: [], vine: null });

  /* ------------------------------------------------------------ live data */

  const live = useRef<Live>({
    items: [],
    edges: [],
    rootEdges: [],
    hubs: [],
    bounds: { minX: 0, minY: 0, maxX: 1, maxY: 1 },
    auras: [],
    anchors: [],
    incident: [],
    match: new Uint8Array(0),
    chain: null,
    hover: -1,
    selected: -1,
    ring: null,
  });

  // Path2D only exists in the browser, so the curves are built here and not during server rendering
  useEffect(() => {
    pathsRef.current.vine = layout.vine.length >= 4 ? buildBranchPath(layout.vine) : null;
    dirty.current = true;
  }, [layout]);

  /* ----------------------------------------------- manual positions (drag) */

  // offsets from the automatic layout, so a moved task stays put even if the clusters re-pack
  const offsets = useRef<Map<string, [number, number]>>(new Map());
  const [offVer, setOffVer] = useState(0);
  const [movedCount, setMovedCount] = useState(0);
  const basePos = useRef(layout.pos);
  basePos.current = layout.pos;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(OFFSETS_KEY);
      if (raw) {
        const obj = JSON.parse(raw) as Record<string, [number, number]>;
        offsets.current = new Map(Object.entries(obj));
        setMovedCount(offsets.current.size);
        setOffVer((v) => v + 1);
      }
    } catch {
      /* private mode etc. – positions just won't persist */
    }
  }, []);

  const persistOffsets = useCallback(() => {
    setMovedCount(offsets.current.size);
    try {
      if (offsets.current.size) localStorage.setItem(OFFSETS_KEY, JSON.stringify(Object.fromEntries(offsets.current)));
      else localStorage.removeItem(OFFSETS_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const routeEdge = useCallback((i: number) => {
    const L = live.current;
    const e = L.edges[i];
    const a = L.items[e.si];
    const b = L.items[e.ti];
    if (!a || !b) return;
    const moved = offsets.current.has(a.id) || offsets.current.has(b.id);
    if (e.kind === "in" && !moved) {
      pathsRef.current.edges[i] = buildBranchPath(e.pts);
      e.bbox = e.bbox0;
    } else {
      const c = linkCurve(a, b);
      pathsRef.current.edges[i] = curvePath(c);
      e.bbox = curveBBox(c);
    }
  }, []);

  const routeHub = useCallback((i: number) => {
    const L = live.current;
    const e = L.rootEdges[i];
    const t = L.items[e.ti];
    if (!t) return;
    const c = hubCurve({ x: e.pts[0], y: e.pts[1] }, t);
    pathsRef.current.rootEdges[i] = curvePath(c);
    e.bbox = curveBBox(c);
  }, []);

  const routeNode = useCallback(
    (idx: number) => {
      const inc = live.current.incident[idx];
      if (!inc) return;
      inc.e.forEach(routeEdge);
      inc.h.forEach(routeHub);
    },
    [routeEdge, routeHub],
  );

  const resetPositions = useCallback(() => {
    offsets.current = new Map();
    persistOffsets();
    setOffVer((v) => v + 1);
  }, [persistOffsets]);

  const items = useMemo<Item[]>(
    () =>
      ordered.map((task) => {
        const p = layout.pos.get(task.id) ?? { x: 0, y: 0 };
        const off = offsets.current.get(task.id);
        const owner = task.claimed_by ? board.memberById.get(task.claimed_by) : null;
        return {
          id: task.id,
          code: task.code,
          title: task.title,
          x: p.x + (off?.[0] ?? 0),
          y: p.y + (off?.[1] ?? 0),
          state: board.stateOf(task),
          color: blockColor.get(task.block_id) ?? BLOCK_COLORS[0],
          blockId: task.block_id,
          owner: owner?.name ?? null,
          mine: !!owner && owner.id === board.me?.id,
          priority: task.priority,
          estimate: task.estimate,
          deps: board.depsOf.get(task.id)?.length ?? 0,
          unlocks: board.dependentsOf.get(task.id)?.length ?? 0,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ordered, layout, board, blockColor, offVer],
  );

  const { auras, anchors, hubs } = useMemo(() => {
    const auras: Live["auras"] = [];
    const anchors: Live["anchors"] = [];
    for (const reg of layout.regions) {
      const color = blockColor.get(reg.blockId) ?? BLOCK_COLORS[0];
      const b = board.blockById.get(reg.blockId);
      auras.push({ cx: reg.x + reg.w / 2, cy: reg.y + reg.h / 2, r: Math.max(reg.w, reg.h) * 0.62 + 200, color });
      anchors.push({ x: reg.x + 100, y: reg.y + 22, label: b ? `${b.code} · ${b.name}` : "", color });
    }
    const hubs = layout.hubs.map((h) => ({ x: h.x, y: h.y, color: blockColor.get(h.blockId) ?? BLOCK_COLORS[0] }));
    return { auras, anchors, hubs };
  }, [layout, blockColor, board.blockById]);

  const selectedIdx = selectedId ? (geometry.idx.get(selectedId) ?? -1) : -1;

  /* ---------------------------------------------------- contribution ring */

  // who finished what: each person's slice is their finished tasks out of ALL tasks,
  // so the filled part of the ring is the overall progress and each colour is who did it
  const ringStats = useMemo(() => {
    const counts = new Map<string, number>();
    let done = 0;
    for (const t of board.tasks) {
      if (t.status !== "done") continue;
      done++;
      const key = t.claimed_by ?? "";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const segs: RingSeg[] = [...counts].map(([id, n]) => {
      const m = id ? board.memberById.get(id) : undefined;
      return { id, n, name: m?.name ?? "Former member", color: m ? (board.colorOf.get(id) ?? "#6b7280") : "#6b7280" };
    });
    segs.sort((a, b) => b.n - a.n || a.name.localeCompare(b.name));
    return { segs, done, total: board.tasks.length };
  }, [board.tasks, board.memberById, board.colorOf]);

  // default spot: big, bottom-left of the map, behind everything
  const defaultRing = useMemo(() => {
    const b = layout.bounds;
    const r = Math.max(120, Math.min(b.maxX - b.minX, b.maxY - b.minY) * 0.22);
    return { x: b.minX + r * 1.1, y: b.maxY - r * 1.1, r };
  }, [layout.bounds]);
  const savedRing = board.ring ?? defaultRing;

  useEffect(() => {
    live.current.ring = { ...ringStats, place: editingRing ? ringWork.current : savedRing };
    dirty.current = true;
  }, [ringStats, savedRing, editingRing]);

  const startEditRing = () => {
    ringWork.current = { ...savedRing };
    editRef.current = true;
    setEditingRing(true);
    userMoved.current = true;
    setHint(false);
  };
  const stopEditRing = () => {
    editRef.current = false;
    setEditingRing(false);
    dirty.current = true;
  };
  const saveEditedRing = async () => {
    setSavingRing(true);
    const w = ringWork.current;
    const ok = await board.saveRing({ x: Math.round(w.x), y: Math.round(w.y), r: Math.round(w.r) });
    setSavingRing(false);
    if (ok) stopEditRing();
  };

  useEffect(() => {
    const L = live.current;
    const match = new Uint8Array(items.length);
    items.forEach((it, i) => {
      match[i] = matched.has(it.id) ? 1 : 0;
    });
    L.items = items;
    L.edges = geometry.edges;
    L.rootEdges = geometry.rootEdges;
    L.hubs = hubs;
    L.incident = geometry.incident;
    L.bounds = layout.bounds;
    L.auras = auras;
    L.anchors = anchors;
    L.match = match;
    L.selected = selectedIdx;
    if (L.hover >= items.length) {
      L.hover = -1;
      L.chain = null;
    }
    pulse.current = items.some((i) => i.state === "in_progress");
    dirty.current = true;
  }, [items, geometry, layout, auras, anchors, hubs, matched, selectedIdx]);

  // (re)build every curve from the current task positions – automatic ones and dragged ones alike
  useEffect(() => {
    const L = live.current;
    pathsRef.current.edges = new Array(L.edges.length);
    pathsRef.current.rootEdges = new Array(L.rootEdges.length);
    for (let i = 0; i < L.edges.length; i++) routeEdge(i);
    for (let i = 0; i < L.rootEdges.length; i++) routeHub(i);
    dirty.current = true;
  }, [items, geometry, routeEdge, routeHub]);

  /* ---------------------------------------------------------------- camera */

  const boundsFit = useCallback((b: Bounds, maxK = 1.15): Cam => {
    const { w, h } = size.current;
    const padX = w < 700 ? 20 : 56;
    const top = insetRef.current + 12;
    const bottom = 68;
    const bw = Math.max(1, b.maxX - b.minX);
    const bh = Math.max(1, b.maxY - b.minY);
    const k = Math.max(MIN_K, Math.min(maxK, (w - padX * 2) / bw, (h - top - bottom) / bh));
    return {
      k,
      x: (w - bw * k) / 2 - b.minX * k,
      y: top + (h - top - bottom - bh * k) / 2 - b.minY * k,
    };
  }, []);

  const fitAll = useCallback(
    (instant: boolean) => {
      if (!size.current.w) return;
      const c = boundsFit(live.current.bounds);
      target.current = c;
      if (instant) cam.current = { ...c };
      dirty.current = true;
    },
    [boundsFit],
  );

  const fitMatches = useCallback(() => {
    const L = live.current;
    let x0 = Infinity,
      y0 = Infinity,
      x1 = -Infinity,
      y1 = -Infinity;
    L.items.forEach((it, i) => {
      if (!L.match[i]) return;
      x0 = Math.min(x0, it.x);
      y0 = Math.min(y0, it.y);
      x1 = Math.max(x1, it.x + NODE_W);
      y1 = Math.max(y1, it.y + NODE_H);
    });
    if (x0 === Infinity) return;
    userMoved.current = true;
    target.current = boundsFit({ minX: x0, minY: y0, maxX: x1, maxY: y1 }, 1.0);
    dirty.current = true;
  }, [boundsFit]);

  const zoomAt = useCallback((sx: number, sy: number, factor: number) => {
    const t = target.current;
    const k = Math.max(MIN_K, Math.min(MAX_K, t.k * factor));
    const f = k / t.k;
    target.current = { k, x: sx - (sx - t.x) * f, y: sy - (sy - t.y) * f };
    userMoved.current = true;
    dirty.current = true;
  }, []);

  const zoomCenter = useCallback(
    (factor: number) => {
      const { w, h } = size.current;
      zoomAt(w / 2, (h + insetRef.current) / 2, factor);
    },
    [zoomAt],
  );

  // the fit is instant: the page opens already showing the whole tree
  useEffect(() => {
    if (!userMoved.current) fitAll(true);
  }, [layout, insetTop, fitAll]);

  // glide to a task when it is opened
  useEffect(() => {
    if (selectedIdx < 0 || !size.current.w) return;
    const it = live.current.items[selectedIdx];
    if (!it) return;
    const { w, h } = size.current;
    const k = Math.max(target.current.k, 0.95);
    const freeW = w >= 900 ? w - DRAWER_W : w;
    userMoved.current = true;
    target.current = {
      k,
      x: freeW / 2 - (it.x + NODE_W / 2) * k,
      y: (insetRef.current + h) / 2 - (it.y + NODE_H / 2) * k,
    };
    dirty.current = true;
  }, [selectedIdx]);

  /* ----------------------------------------------------------- interaction */

  const hitTest = useCallback((sx: number, sy: number, pad: number): number => {
    const L = live.current;
    const { x, y, k } = cam.current;
    const wx = (sx - x) / k;
    const wy = (sy - y) / k;
    const p = pad / k;
    let best = -1;
    let bestD = Infinity;
    for (let i = L.items.length - 1; i >= 0; i--) {
      const it = L.items[i];
      if (wx < it.x - p || wx > it.x + NODE_W + p || wy < it.y - p || wy > it.y + NODE_H + p) continue;
      const d = (wx - it.x - NODE_W / 2) ** 2 + (wy - it.y - NODE_H / 2) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  }, []);

  const setHover = useCallback(
    (idx: number) => {
      const L = live.current;
      if (idx === L.hover) return;
      L.hover = idx;
      if (idx < 0) {
        L.chain = null;
        setHoverItem(null);
      } else {
        const it = L.items[idx];
        const set = chainOf(it.id, board.depsOf, board.dependentsOf);
        const flags = new Uint8Array(L.items.length);
        L.items.forEach((o, i) => {
          if (set.has(o.id)) flags[i] = 1;
        });
        L.chain = flags;
        setHoverItem(it);
      }
      dirty.current = true;
    },
    [board.depsOf, board.dependentsOf],
  );

  useEffect(() => {
    const canvas = canvasRef.current!;
    const pointers = new Map<number, { x: number; y: number }>();
    let drag: { x: number; y: number; cx: number; cy: number; moved: boolean } | null = null;
    let pinch: { dist: number; k: number } | null = null;
    // dragging a task around (as opposed to panning the map)
    let nodeDrag: { idx: number; x: number; y: number; ix: number; iy: number; moved: boolean } | null = null;

    const local = (e: { clientX: number; clientY: number }) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const interacted = () => {
      userMoved.current = true;
      setHint(false);
    };

    // the ring can be moved / resized while "edit ring" is on
    let ringDrag: { mode: "move" | "size"; px: number; py: number; ox: number; oy: number; or: number } | null = null;
    const ringGeom = () => {
      const R = live.current.ring;
      if (!R) return null;
      const c = cam.current;
      const cx = R.place.x * c.k + c.x;
      const cy = R.place.y * c.k + c.y;
      const rr = R.place.r * c.k;
      return { R, cx, cy, rr, kx: cx + rr * Math.SQRT1_2, ky: cy - rr * Math.SQRT1_2 };
    };
    /** handles sit above everything; the ring body only counts where no task is */
    const ringHandle = (sx: number, sy: number, coarse: boolean): "move" | "size" | null => {
      if (!editRef.current) return null;
      const g = ringGeom();
      if (!g) return null;
      const pad = coarse ? 12 : 0;
      if (Math.hypot(sx - g.kx, sy - g.ky) <= 15 + pad) return "size";
      if (Math.hypot(sx - g.cx, sy - g.cy) <= 20 + pad) return "move";
      return null;
    };
    const ringBody = (sx: number, sy: number): boolean => {
      if (!editRef.current) return false;
      const g = ringGeom();
      return !!g && Math.hypot(sx - g.cx, sy - g.cy) <= g.rr;
    };

    const down = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const p = local(e);
      pointers.set(e.pointerId, p);
      if (pointers.size === 1) {
        const forcePan = e.shiftKey || e.button === 1;
        const handle = forcePan ? null : ringHandle(p.x, p.y, e.pointerType !== "mouse");
        const idx0 = forcePan || handle ? -1 : hitTest(p.x, p.y, e.pointerType === "mouse" ? 5 : 14);
        const body = !forcePan && !handle && idx0 < 0 && ringBody(p.x, p.y);
        if (handle || body) {
          const w = ringWork.current;
          ringDrag = { mode: handle ?? "move", px: p.x, py: p.y, ox: w.x, oy: w.y, or: w.r };
          drag = null;
          nodeDrag = null;
          canvas.style.cursor = "grabbing";
          interacted();
          return;
        }
        const idx = idx0;
        if (idx >= 0) {
          const it = live.current.items[idx];
          nodeDrag = { idx, x: p.x, y: p.y, ix: it.x, iy: it.y, moved: false };
          drag = null;
        } else {
          drag = { x: p.x, y: p.y, cx: target.current.x, cy: target.current.y, moved: false };
        }
      } else if (pointers.size === 2) {
        nodeDrag = null;
        const [a, b] = [...pointers.values()];
        pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, k: target.current.k };
        drag = null;
      }
    };

    const move = (e: PointerEvent) => {
      const p = local(e);
      if (pointers.has(e.pointerId)) pointers.set(e.pointerId, p);

      if (pinch && pointers.size >= 2) {
        const [a, b] = [...pointers.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        const wantK = Math.max(MIN_K, Math.min(MAX_K, pinch.k * (dist / pinch.dist)));
        zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, wantK / target.current.k);
        interacted();
        return;
      }

      if (ringDrag && pointers.has(e.pointerId)) {
        const k = cam.current.k;
        const w = ringWork.current;
        if (ringDrag.mode === "move") {
          w.x = ringDrag.ox + (p.x - ringDrag.px) / k;
          w.y = ringDrag.oy + (p.y - ringDrag.py) / k;
        } else {
          // the knob sits at the top-right of the edge: the radius follows the pointer's distance from the centre
          const c = cam.current;
          const d = Math.hypot(p.x - (w.x * k + c.x), p.y - (w.y * k + c.y)) / k;
          const bnd = live.current.bounds;
          w.r = Math.max(60, Math.min(Math.max(bnd.maxX - bnd.minX, bnd.maxY - bnd.minY), d));
        }
        dirty.current = true;
        return;
      }

      if (nodeDrag && pointers.has(e.pointerId)) {
        const dx = p.x - nodeDrag.x;
        const dy = p.y - nodeDrag.y;
        if (!nodeDrag.moved && Math.hypot(dx, dy) > 4) {
          nodeDrag.moved = true;
          canvas.style.cursor = "grabbing";
          setHover(-1);
          interacted();
        }
        if (nodeDrag.moved) {
          const L = live.current;
          const it = L.items[nodeDrag.idx];
          const k = cam.current.k;
          it.x = nodeDrag.ix + dx / k;
          it.y = nodeDrag.iy + dy / k;
          const base = basePos.current.get(it.id);
          if (base) {
            const ox = Math.round(it.x - base.x);
            const oy = Math.round(it.y - base.y);
            if (ox === 0 && oy === 0) offsets.current.delete(it.id);
            else offsets.current.set(it.id, [ox, oy]);
          }
          routeNode(nodeDrag.idx);
          dirty.current = true;
        }
        return;
      }

      if (drag && pointers.has(e.pointerId)) {
        const dx = p.x - drag.x;
        const dy = p.y - drag.y;
        if (!drag.moved && Math.hypot(dx, dy) > 4) {
          drag.moved = true;
          canvas.style.cursor = "grabbing";
          setHover(-1);
        }
        if (drag.moved) {
          const nx = drag.cx + dx;
          const ny = drag.cy + dy;
          const ddx = nx - target.current.x;
          const ddy = ny - target.current.y;
          target.current = { ...target.current, x: nx, y: ny };
          cam.current = { ...cam.current, x: cam.current.x + ddx, y: cam.current.y + ddy };
          dirty.current = true;
          interacted();
        }
        return;
      }

      if (e.pointerType === "mouse") {
        const handle = ringHandle(p.x, p.y, false);
        const idx = handle ? -1 : hitTest(p.x, p.y, 5);
        setHover(idx);
        canvas.style.cursor = handle
          ? handle === "size"
            ? "nesw-resize"
            : "move"
          : idx >= 0
            ? "pointer"
            : ringBody(p.x, p.y)
              ? "move"
              : "grab";
      }
    };

    const up = (e: PointerEvent) => {
      const p = local(e);
      const wasDrag = drag;
      const wasNode = nodeDrag;
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinch = null;
      if (pointers.size === 0) {
        const wasRing = ringDrag;
        ringDrag = null;
        drag = null;
        nodeDrag = null;
        canvas.style.cursor = "grab";
        if (wasRing) return;
        if (wasNode) {
          if (wasNode.moved) persistOffsets();
          else {
            setHint(false);
            onOpenRef.current(live.current.items[wasNode.idx].code);
          }
        } else if (wasDrag && !wasDrag.moved) {
          const idx = hitTest(p.x, p.y, e.pointerType === "mouse" ? 5 : 16);
          if (idx >= 0) {
            setHint(false);
            onOpenRef.current(live.current.items[idx].code);
          }
        }
      }
    };

    const leave = () => {
      if (!drag && !nodeDrag) setHover(-1);
    };

    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const p = local(e);
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
      const speed = e.ctrlKey ? 0.011 : 0.0016;
      zoomAt(p.x, p.y, Math.exp(-e.deltaY * unit * speed));
      interacted();
    };

    const dbl = (e: MouseEvent) => {
      const p = local(e);
      if (hitTest(p.x, p.y, 5) < 0) {
        zoomAt(p.x, p.y, 2);
        interacted();
      }
    };

    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("pointerleave", leave);
    canvas.addEventListener("wheel", wheel, { passive: false });
    canvas.addEventListener("dblclick", dbl);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      canvas.removeEventListener("pointerleave", leave);
      canvas.removeEventListener("wheel", wheel);
      canvas.removeEventListener("dblclick", dbl);
    };
  }, [hitTest, setHover, zoomAt, routeNode, persistOffsets]);

  // keyboard: F fits, + / - zoom
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "SELECT" || t.tagName === "TEXTAREA")) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "f" || e.key === "F") {
        userMoved.current = false;
        fitAll(false);
      } else if (e.key === "+" || e.key === "=") zoomCenter(1.4);
      else if (e.key === "-" || e.key === "_") zoomCenter(1 / 1.4);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fitAll, zoomCenter]);

  /* ------------------------------------------------------------- the loop */

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const mini = miniRef.current!;
    const ctx = canvas.getContext("2d")!;
    const mctx = mini.getContext("2d")!;

    const wrapLines = new Map<string, string[]>();

    const sans = getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
    const probe = document.createElement("span");
    probe.className = "font-mono";
    document.body.appendChild(probe);
    const mono = getComputedStyle(probe).fontFamily || "ui-monospace, monospace";
    probe.remove();
    Promise.all([
      document.fonts.load(`600 14px ${sans}`),
      document.fonts.load(`500 12px ${sans}`),
      document.fonts.load(`500 12px ${mono}`),
      document.fonts.load(`600 12px ${mono}`),
    ])
      .then(() => {
        wrapLines.clear();
        dirty.current = true;
      })
      .catch(() => {});

    const titleLines = (id: string, title: string): string[] => {
      const key = `${id}\u0001${title}`;
      const cached = wrapLines.get(key);
      if (cached) return cached;
      ctx.font = `600 14.5px ${sans}`;
      const maxW = NODE_W - 30;
      const words = title.trim().split(/\s+/);
      const lines: string[] = [];
      let cur = "";
      let consumed = 0;
      for (let i = 0; i < words.length; i++) {
        const next = cur ? `${cur} ${words[i]}` : words[i];
        if (ctx.measureText(next).width <= maxW) {
          cur = next;
          consumed = i + 1;
        } else if (cur && lines.length < 1) {
          lines.push(cur);
          cur = words[i];
          consumed = i + 1;
        } else {
          break;
        }
      }
      if (cur) lines.push(cur);
      let last = lines[lines.length - 1] ?? "";
      const truncated = consumed < words.length;
      if (truncated || ctx.measureText(last).width > maxW) {
        while (last.length > 1 && ctx.measureText(`${last}…`).width > maxW) last = last.slice(0, -1);
        last = `${last}…`;
        lines[Math.max(0, lines.length - 1)] = last;
      }
      wrapLines.set(key, lines);
      return lines;
    };

    const fitText = (text: string, maxW: number): string => {
      if (ctx.measureText(text).width <= maxW) return text;
      let t = text;
      while (t.length > 1 && ctx.measureText(`${t}…`).width > maxW) t = t.slice(0, -1);
      return `${t}…`;
    };

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      const dpr = Math.min(2.5, window.devicePixelRatio || 1);
      const w = Math.max(1, Math.round(r.width));
      const h = Math.max(1, Math.round(r.height));
      const first = size.current.w === 0;
      size.current = { w, h, dpr };
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      mini.width = Math.round(176 * dpr);
      mini.height = Math.round(104 * dpr);
      const usable = Math.max(200, h - insetRef.current - 80);
      setAspect(Math.max(0.7, Math.min(3.4, Math.round((w / usable) * 8) / 8)));
      if (first || !userMoved.current) fitAll(true);
      if (first) {
        ringAnimStart.current = performance.now();
        setReady(true);
      }
      dirty.current = true;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    /* ------------------------------------------------------------ drawing */

    const drawCard = (
      it: Item,
      sx: number,
      sy: number,
      k: number,
      alpha: number,
      o: { sel: boolean; hov: boolean; lit: boolean; now: number },
    ) => {
      const W = NODE_W;
      const H = NODE_H;
      const sc = STATE_HEX[it.state];
      const meta = STATE_META[it.state];
      ctx.save();
      ctx.translate(sx, sy);
      ctx.scale(k, k);
      ctx.globalAlpha = alpha;

      // soft glow for anything alive
      if (it.state !== "locked" && alpha > 0.5) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = hexA(sc, o.sel || o.hov ? 0.16 : 0.07);
        ctx.beginPath();
        ctx.roundRect(-7, -7, W + 14, H + 14, 18);
        ctx.fill();
        ctx.restore();
      }

      if (o.sel || o.hov) {
        ctx.shadowColor = hexA(o.sel ? "#ffffff" : sc, 0.5);
        ctx.shadowBlur = 28;
      }
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#1b1f28");
      g.addColorStop(1, "#12151b");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, 12);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";

      // strips: block colour on top, state colour on the left
      ctx.save();
      ctx.clip();
      ctx.fillStyle = it.color;
      ctx.fillRect(0, 0, W, 3);
      ctx.fillStyle = sc;
      ctx.fillRect(0, 0, 3.5, H);
      ctx.restore();

      ctx.lineWidth = o.sel ? 1.8 : 1;
      ctx.strokeStyle = o.sel
        ? "#ffffff"
        : o.hov || o.lit
          ? hexA(sc, 0.85)
          : it.mine
            ? hexA("#fbbf24", 0.6)
            : "rgba(255,255,255,0.08)";
      ctx.beginPath();
      ctx.roundRect(0.5, 0.5, W - 1, H - 1, 12);
      ctx.stroke();

      if (it.state === "in_progress") {
        ctx.strokeStyle = hexA(STATE_HEX.in_progress, 0.25 + 0.25 * Math.sin(o.now / 420));
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-3, -3, W + 6, H + 6, 15);
        ctx.stroke();
      }

      ctx.textBaseline = "middle";
      // row 1: code + state
      ctx.fillStyle = it.color;
      ctx.beginPath();
      ctx.arc(19, 18, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = `500 12px ${mono}`;
      ctx.fillStyle = "#9aa4b6";
      ctx.textAlign = "left";
      ctx.fillText(it.code, 28, 18.5);

      ctx.font = `600 11px ${sans}`;
      ctx.textAlign = "right";
      ctx.fillStyle = sc;
      ctx.fillText(meta.label, W - 14, 18.5);
      const lw = ctx.measureText(meta.label).width;
      ctx.beginPath();
      ctx.arc(W - 14 - lw - 9, 18, 3.2, 0, Math.PI * 2);
      ctx.fill();

      // title
      const lines = titleLines(it.id, it.title);
      ctx.textAlign = "left";
      ctx.font = `600 14.5px ${sans}`;
      ctx.fillStyle = it.state === "locked" ? "#aab2c2" : "#f1f4f9";
      const ty = lines.length === 1 ? 44 : 38;
      lines.forEach((ln, i) => ctx.fillText(ln, 15, ty + i * 17));

      // footer
      const fy = H - 13;
      ctx.font = `500 11.5px ${sans}`;
      if (it.owner) {
        ctx.fillStyle = avatarColor(it.owner);
        ctx.beginPath();
        ctx.arc(22, fy, 7.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.textAlign = "center";
        ctx.font = `600 8px ${sans}`;
        ctx.fillText(initials(it.owner), 22, fy + 0.5);
        ctx.textAlign = "left";
        ctx.font = `500 11.5px ${sans}`;
        ctx.fillStyle = it.mine ? "#f1f4f9" : "#8d97a9";
        ctx.fillText(fitText(it.mine ? "You" : it.owner, 120), 35, fy + 0.5);
      } else {
        ctx.fillStyle = "#667086";
        ctx.fillText(it.state === "locked" ? "Waiting on dependencies" : "Unclaimed", 15, fy + 0.5);
      }
      ctx.textAlign = "right";
      ctx.fillStyle = PRIORITY_HEX[it.priority] ?? PRIORITY_HEX.medium;
      ctx.beginPath();
      ctx.arc(W - 15, fy, 3.6, 0, Math.PI * 2);
      ctx.fill();
      if (it.estimate) {
        ctx.fillStyle = "#7d879b";
        ctx.fillText(it.estimate, W - 27, fy + 0.5);
      }
      ctx.restore();
    };

    /** the contribution ring: one coloured slice per person, sized by their share of ALL tasks */
    const drawRing = (L: Live, c: Cam, now: number) => {
      const R0 = L.ring;
      if (!R0) return;
      const k = c.k;
      const { w, h } = size.current;
      const cx = R0.place.x * c.k + c.x;
      const cy = R0.place.y * c.k + c.y;
      const R = R0.place.r * k;
      if (R < 6 || cx + R < 0 || cy + R < 0 || cx - R > w || cy - R > h) return;

      const t = ringAnimStart.current === null ? 1 : Math.min(1, (now - ringAnimStart.current) / 1200);
      const p = easeOut(t);
      const band = R * 0.17;
      const mid = R - band / 2;
      // the whole ring is the work that has been done; each slice is one person's share of it
      const total = Math.max(1, R0.done);

      ctx.save();
      // dark plate so the ring reads against the grid, but stays quiet behind the tasks
      const plate = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.12);
      plate.addColorStop(0, "rgba(10,12,18,0.72)");
      plate.addColorStop(0.86, "rgba(10,12,18,0.6)");
      plate.addColorStop(1, "rgba(10,12,18,0)");
      ctx.fillStyle = plate;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.12, 0, Math.PI * 2);
      ctx.fill();

      ctx.lineCap = "butt";
      ctx.lineWidth = band;
      ctx.strokeStyle = "rgba(255,255,255,0.07)";
      ctx.beginPath();
      ctx.arc(cx, cy, mid, 0, Math.PI * 2);
      ctx.stroke();

      // slices
      let a = -Math.PI / 2;
      const slices: { a0: number; a1: number; color: string }[] = [];
      for (const s of R0.segs) {
        const len = (s.n / total) * Math.PI * 2 * p;
        slices.push({ a0: a, a1: a + len, color: s.color });
        a += len;
      }
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.lineWidth = band * 1.9;
      for (const s of slices) {
        ctx.strokeStyle = hexA(s.color, 0.1);
        ctx.beginPath();
        ctx.arc(cx, cy, mid, s.a0, s.a1);
        ctx.stroke();
      }
      ctx.restore();
      ctx.lineWidth = band;
      const gap = slices.length > 1 ? Math.min(0.012, 0.4 / Math.max(R, 1)) : 0;
      for (const s of slices) {
        const len = s.a1 - s.a0;
        if (len <= 0) continue;
        ctx.strokeStyle = s.color;
        ctx.beginPath();
        ctx.arc(cx, cy, mid, s.a0 + Math.min(gap, len / 3), Math.max(s.a1 - Math.min(gap, len / 3), s.a0 + 0.004));
        ctx.stroke();
      }

      // thin rims
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, R - band, 0, Math.PI * 2);
      ctx.stroke();

      // centre: overall percentage, then who did it
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (R >= 46) {
        const pctFont = R * 0.3;
        ctx.font = `700 ${pctFont}px ${sans}`;
        ctx.fillStyle = "rgba(244,247,252,0.95)";
        ctx.fillText(String(Math.round(R0.done * p)), cx, cy - R * 0.27);
        const small = R * 0.068;
        if (small >= 6) {
          ctx.font = `500 ${small}px ${sans}`;
          ctx.fillStyle = "rgba(154,163,180,0.95)";
          ctx.fillText(R0.done === 1 ? "task done · who did it" : "tasks done · who did it", cx, cy - R * 0.07);

          const rows = R0.segs.slice(0, 5);
          const more = R0.segs.length - rows.length;
          const rowH = R * 0.1;
          const x0 = cx - R * 0.46;
          const x1 = cx + R * 0.46;
          const y0 = cy + R * 0.12;
          ctx.font = `600 ${small * 1.05}px ${sans}`;
          if (!rows.length) {
            ctx.font = `500 ${small}px ${sans}`;
            ctx.fillStyle = "rgba(125,135,155,0.95)";
            ctx.fillText("Nothing finished yet", cx, y0 + rowH * 0.6);
          }
          rows.forEach((s, i) => {
            const y = y0 + i * rowH + rowH / 2;
            ctx.textAlign = "left";
            ctx.fillStyle = s.color;
            ctx.beginPath();
            ctx.arc(x0 + small * 0.4, y, small * 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "rgba(232,236,244,0.95)";
            ctx.font = `600 ${small * 1.05}px ${sans}`;
            ctx.fillText(fitText(s.name, (x1 - x0) * 0.64), x0 + small * 1.3, y + small * 0.04);
            ctx.textAlign = "right";
            ctx.fillStyle = "rgba(190,198,214,0.95)";
            ctx.fillText(`${pctText((s.n / total) * p)}%`, x1, y + small * 0.04);
          });
          if (more > 0) {
            ctx.textAlign = "center";
            ctx.font = `500 ${small}px ${sans}`;
            ctx.fillStyle = "rgba(125,135,155,0.95)";
            ctx.fillText(`+${more} more`, cx, y0 + rows.length * rowH + rowH / 2);
          }
        }
      }
      ctx.restore();
    };

    /** edit chrome (drawn above the tasks so the handles are always reachable) */
    const drawRingHandles = (L: Live, c: Cam) => {
      const R0 = L.ring;
      if (!R0 || !editRef.current) return;
      const cx = R0.place.x * c.k + c.x;
      const cy = R0.place.y * c.k + c.y;
      const R = R0.place.r * c.k;
      ctx.save();
      ctx.setLineDash([7, 6]);
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      // move grip
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#f4f7fc";
      ctx.beginPath();
      ctx.arc(cx, cy, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#0b0d12";
      ctx.lineWidth = 1.8;
      ctx.lineCap = "round";
      ctx.beginPath();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        ctx.moveTo(cx + dx * 3, cy + dy * 3);
        ctx.lineTo(cx + dx * 9, cy + dy * 9);
      }
      ctx.stroke();
      // resize knob
      const kx = cx + R * Math.SQRT1_2;
      const ky = cy - R * Math.SQRT1_2;
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#7c9cff";
      ctx.beginPath();
      ctx.arc(kx, ky, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    };

    const drawMini = (L: Live, c: Cam) => {
      const { dpr, w, h } = size.current;
      const mw = 176;
      const mh = 104;
      mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      mctx.clearRect(0, 0, mw, mh);
      const b = L.bounds;
      const bw = b.maxX - b.minX || 1;
      const bh = b.maxY - b.minY || 1;
      const s = Math.min((mw - 12) / bw, (mh - 12) / bh);
      const ox = (mw - bw * s) / 2 - b.minX * s;
      const oy = (mh - bh * s) / 2 - b.minY * s;
      for (let i = 0; i < L.items.length; i++) {
        const it = L.items[i];
        mctx.fillStyle = hexA(STATE_HEX[it.state], L.match[i] ? 0.9 : 0.15);
        mctx.fillRect(it.x * s + ox, it.y * s + oy, Math.max(1.6, NODE_W * s), Math.max(1.4, NODE_H * s * 0.8));
      }
      const vx = (-c.x / c.k) * s + ox;
      const vy = (-c.y / c.k) * s + oy;
      const vw = (w / c.k) * s;
      const vh = (h / c.k) * s;
      mctx.fillStyle = "rgba(124,156,255,0.08)";
      mctx.strokeStyle = "rgba(160,185,255,0.85)";
      mctx.lineWidth = 1;
      mctx.fillRect(vx, vy, vw, vh);
      mctx.strokeRect(vx + 0.5, vy + 0.5, vw, vh);
      minimapMap.current = { s, ox, oy };
    };

    const draw = (now: number) => {
      const L = live.current;
      const { w, h, dpr } = size.current;
      const c = cam.current;
      const k = c.k;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // ---- dot grid (screen space, follows the camera)
      let gs = 44 * k;
      while (gs < 22) gs *= 2;
      while (gs > 88) gs /= 2;
      const gx = ((c.x % gs) + gs) % gs;
      const gy = ((c.y % gs) + gs) % gs;
      ctx.fillStyle = "rgba(150,170,210,0.10)";
      for (let x = gx; x < w; x += gs) for (let y = gy; y < h; y += gs) ctx.fillRect(x - 0.6, y - 0.6, 1.2, 1.2);

      // ---- auras: each block glows softly in its own colour
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (const a of L.auras) {
        const sx = a.cx * k + c.x;
        const sy = a.cy * k + c.y;
        const r = a.r * k;
        if (sx + r < 0 || sy + r < 0 || sx - r > w || sy - r > h) continue;
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
        g.addColorStop(0, hexA(a.color, 0.09));
        g.addColorStop(1, hexA(a.color, 0));
        ctx.fillStyle = g;
        ctx.fillRect(sx - r, sy - r, r * 2, r * 2);
      }
      ctx.restore();

      // ---- contribution ring: part of the background, so everything below draws over it
      drawRing(L, c, now);

      const vx0 = -c.x / k - 40;
      const vy0 = -c.y / k - 40;
      const vx1 = (w - c.x) / k + 40;
      const vy1 = (h - c.y) / k + 40;
      const chain = L.chain;
      const focus = chain !== null;
      const paths = pathsRef.current;

      // ---- branches (world space)
      ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * c.x, dpr * c.y);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const baseWpx = Math.min(2.6, 1.1 + k * 1.1);

      const strokeEdge = (path: Path2D, bbox: [number, number, number, number], color: string, alpha: number, wpx: number) => {
        if (bbox[2] < vx0 || bbox[0] > vx1 || bbox[3] < vy0 || bbox[1] > vy1) return;
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = color;
        ctx.lineWidth = wpx / k;
        ctx.stroke(path);
      };

      // the trunk vine through every hub
      if (paths.vine) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 0.07;
        ctx.strokeStyle = "#8fa8ff";
        ctx.lineWidth = 8 / k;
        ctx.stroke(paths.vine);
        ctx.restore();
        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = "#b4c6ff";
        ctx.lineWidth = Math.min(2.2, 1.2 + k) / k;
        ctx.stroke(paths.vine);
      }

      // hubs → starting tasks
      for (let i = 0; i < L.rootEdges.length; i++) {
        const e = L.rootEdges[i];
        const lit = !chain || chain[e.ti] === 1;
        const on = L.match[e.ti] === 1;
        strokeEdge(paths.rootEdges[i], e.bbox, e.color, !on ? 0.04 : lit ? 0.22 : 0.05, baseWpx * 0.85);
      }

      const hi: number[] = [];
      for (let i = 0; i < L.edges.length; i++) {
        const e = L.edges[i];
        if (chain) {
          if (chain[e.si] === 1 && chain[e.ti] === 1) {
            hi.push(i);
            continue;
          }
          strokeEdge(paths.edges[i], e.bbox, e.color, 0.045, baseWpx);
          continue;
        }
        const both = L.match[e.si] === 1 && L.match[e.ti] === 1;
        const done = L.items[e.si].state === "done";
        // links that leave their row or their block stay quiet until you trace them
        const quiet = e.kind === "in" ? 1 : e.kind === "wrap" ? 0.5 : 0.38;
        strokeEdge(
          paths.edges[i],
          e.bbox,
          e.color,
          (!both ? 0.04 : done ? 0.6 : 0.3) * quiet,
          (done ? baseWpx * 1.15 : baseWpx) * (e.kind === "in" ? 1 : 0.8),
        );
      }

      // highlighted chain: a lit trunk with glow
      if (hi.length) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        for (const i of hi) strokeEdge(paths.edges[i], L.edges[i].bbox, L.edges[i].color, 0.22, 7);
        ctx.restore();
        for (const i of hi) strokeEdge(paths.edges[i], L.edges[i].bbox, "#eef3ff", 0.95, 2.1);
      }
      ctx.globalAlpha = 1;

      // ---- screen space from here on
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // hub orbs: where each block's branches begin
      L.hubs.forEach((hub, hi2) => {
        const sx = hub.x * k + c.x;
        const sy = hub.y * k + c.y;
        const r = Math.max(9, 24 * k) * (hi2 === 0 ? 1.35 : 1);
        if (sx + r * 3 < 0 || sy + r * 3 < 0 || sx - r * 3 > w || sy - r * 3 > h) return;
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 3);
        g.addColorStop(0, hexA(hub.color, 0.6));
        g.addColorStop(0.3, hexA(hub.color, 0.22));
        g.addColorStop(1, hexA(hub.color, 0));
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = g;
        ctx.fillRect(sx - r * 3, sy - r * 3, r * 6, r * 6);
        ctx.restore();
        ctx.fillStyle = "#f3f6ff";
        ctx.beginPath();
        ctx.arc(sx, sy, r * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = hexA(hub.color, 0.8);
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(sx, sy, r * 0.72, 0, Math.PI * 2);
        ctx.stroke();
      });

      // ---- tasks
      const cw = NODE_W * k;
      const ch = NODE_H * k;
      const mode = k < PILL_K ? 0 : k < CARD_K ? 1 : 2;
      let needPulse = false;
      let hoverDraw = -1;

      for (let i = 0; i < L.items.length; i++) {
        const it = L.items[i];
        if (it.x > vx1 || it.x + NODE_W < vx0 || it.y > vy1 || it.y + NODE_H < vy0) continue;
        const sx = it.x * k + c.x;
        const sy = it.y * k + c.y;
        const on = L.match[i] === 1;
        const lit = !chain || chain[i] === 1;
        const isSel = i === L.selected;
        const isHov = i === L.hover;
        let alpha = !on ? 0.13 : !lit ? 0.12 : it.state === "locked" ? 0.62 : 1;
        if (isSel || isHov) alpha = 1;
        if (mode === 2 && it.state === "in_progress" && alpha > 0.5) needPulse = true;

        if (isHov && mode !== 2) {
          hoverDraw = i;
          continue; // drawn last, on top
        }

        if (mode === 2) {
          drawCard(it, sx, sy, k, alpha, { sel: isSel, hov: isHov, lit: focus && lit, now });
          continue;
        }

        const sc = STATE_HEX[it.state];
        const bw = Math.max(3, cw);
        const bh = Math.max(3, ch);
        const r = Math.min(bh / 2, mode === 0 ? 3.5 : 9);

        if (it.state !== "locked" && alpha > 0.5) {
          const gl = mode === 0 ? 3.5 : 7;
          ctx.save();
          ctx.globalCompositeOperation = "lighter";
          ctx.fillStyle = hexA(sc, mode === 0 ? 0.2 : 0.1);
          ctx.beginPath();
          ctx.roundRect(sx - gl, sy - gl, bw + gl * 2, bh + gl * 2, r + gl);
          ctx.fill();
          ctx.restore();
        }

        ctx.globalAlpha = alpha;
        if (mode === 0) {
          ctx.fillStyle = sc;
          ctx.beginPath();
          ctx.roundRect(sx, sy, bw, bh, r);
          ctx.fill();
          if (bw > 14) {
            ctx.fillStyle = it.color;
            ctx.fillRect(sx, sy + 1, Math.min(3, bw * 0.12), bh - 2);
          }
        } else {
          ctx.fillStyle = hexA(sc, 0.14);
          ctx.beginPath();
          ctx.roundRect(sx, sy, bw, bh, r);
          ctx.fill();
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = hexA(sc, 0.75);
          ctx.stroke();
          ctx.fillStyle = it.color;
          ctx.fillRect(sx + 1, sy + bh * 0.2, 3, bh * 0.6);
          const fs = bh * 0.44;
          ctx.font = `600 ${fs}px ${mono}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = it.state === "locked" ? "#9aa4b6" : "#f4f7fc";
          ctx.fillText(it.code, sx + bw / 2 + 1, sy + bh / 2 + fs * 0.04);
        }
        ctx.globalAlpha = 1;

        if (isSel) {
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(sx - 4, sy - 4, bw + 8, bh + 8, r + 4);
          ctx.stroke();
        }
      }

      // hovered chip/pill on top: enlarged + glowing so it is obvious what you point at
      if (hoverDraw >= 0) {
        const it = L.items[hoverDraw];
        const sc = STATE_HEX[it.state];
        const sx = it.x * k + c.x;
        const sy = it.y * k + c.y;
        const bw = Math.max(3, cw);
        const bh = Math.max(3, ch);
        const grow = mode === 0 ? 3 : 5;
        ctx.save();
        ctx.shadowColor = hexA(sc, 0.9);
        ctx.shadowBlur = 22;
        ctx.fillStyle = mode === 0 ? sc : "#1a1f2a";
        ctx.beginPath();
        ctx.roundRect(sx - grow, sy - grow, bw + grow * 2, bh + grow * 2, Math.min((bh + grow * 2) / 2, 10));
        ctx.fill();
        ctx.restore();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.6;
        ctx.stroke();
        if (mode === 1) {
          const fs = bh * 0.44;
          ctx.font = `600 ${fs}px ${mono}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#ffffff";
          ctx.fillText(it.code, sx + bw / 2, sy + bh / 2 + fs * 0.04);
        }
      }

      // ---- block flags (only while zoomed out – cards carry their own colour strip)
      if (mode !== 2) {
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.font = `600 12.5px ${sans}`;
        const fade = mode === 1 ? Math.max(0, 1 - (k - PILL_K) / (CARD_K - PILL_K)) * 0.6 + 0.4 : 1;
        for (const a of L.anchors) {
          if (!a.label) continue;
          const sx = a.x * k + c.x;
          const sy = a.y * k + c.y;
          if (sx > w || sx + 260 < 0 || sy > h || sy < -30) continue;
          const tw = ctx.measureText(a.label).width + 24;
          ctx.globalAlpha = fade;
          ctx.fillStyle = "rgba(10,12,17,0.85)";
          ctx.beginPath();
          ctx.roundRect(sx, sy - 12, tw, 24, 12);
          ctx.fill();
          ctx.strokeStyle = hexA(a.color, 0.7);
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillStyle = a.color;
          ctx.beginPath();
          ctx.arc(sx + 11, sy, 3.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#e8ecf4";
          ctx.fillText(a.label, sx + 20, sy + 0.5);
        }
        ctx.globalAlpha = 1;
      }

      // ---- tooltip follows the hovered task
      const tip = tipRef.current;
      if (tip) {
        if (L.hover >= 0 && mode !== 2) {
          const it = L.items[L.hover];
          const sx = it.x * k + c.x + cw / 2;
          const sy = it.y * k + c.y;
          const tw = tip.offsetWidth || 270;
          const th = tip.offsetHeight || 100;
          const tx = Math.max(10, Math.min(w - tw - 10, sx - tw / 2));
          let ty = sy - th - 16;
          if (ty < insetRef.current + 8) ty = sy + ch + 16;
          tip.style.transform = `translate(${Math.round(tx)}px, ${Math.round(ty)}px)`;
          tip.style.opacity = "1";
        } else {
          tip.style.opacity = "0";
        }
      }

      drawRingHandles(L, c);
      drawMini(L, c);
      pulse.current = needPulse;
    };

    /* ------------------------------------------------------------- loop */
    let raf = 0;
    let last = performance.now();
    let lastDraw = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(64, now - last);
      last = now;

      const c = cam.current;
      const t = target.current;
      const dk = Math.abs(Math.log(t.k / c.k));
      const dx = Math.abs(t.x - c.x);
      const dy = Math.abs(t.y - c.y);
      if (dk > 0.0005 || dx > 0.15 || dy > 0.15) {
        const f = 1 - Math.exp(-dt / 85);
        c.k = Math.exp(Math.log(c.k) + (Math.log(t.k) - Math.log(c.k)) * f);
        c.x += (t.x - c.x) * f;
        c.y += (t.y - c.y) * f;
        dirty.current = true;
      } else if (dk > 0 || dx > 0 || dy > 0) {
        c.k = t.k;
        c.x = t.x;
        c.y = t.y;
        dirty.current = true;
      }

      if (ringAnimStart.current !== null && now - ringAnimStart.current < 1300) dirty.current = true;
      if (!dirty.current && !(pulse.current && now - lastDraw > 33)) return;
      dirty.current = false;
      lastDraw = now;
      draw(now);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [fitAll]);

  /* --------------------------------------------------------------- minimap */

  const jumpTo = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const { s, ox, oy } = minimapMap.current;
    const wx = (e.clientX - r.left - ox) / s;
    const wy = (e.clientY - r.top - oy) / s;
    const { w, h } = size.current;
    const k = target.current.k;
    userMoved.current = true;
    target.current = { k, x: w / 2 - wx * k, y: (h + insetRef.current) / 2 - wy * k };
    dirty.current = true;
    setHint(false);
  };

  /* ----------------------------------------------------------------- stats */

  const blockStats = useMemo(
    () =>
      board.blocks.map((b) => {
        const tasks = board.tasksByBlock.get(b.id) ?? [];
        const done = tasks.filter((t) => t.status === "done").length;
        return { block: b, total: tasks.length, done, color: blockColor.get(b.id) ?? BLOCK_COLORS[0] };
      }),
    [board.blocks, board.tasksByBlock, blockColor],
  );

  const tip = hoverItem;
  const tipMeta = tip ? STATE_META[tip.state] : null;
  const TipIcon = tipMeta?.icon;

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0 overflow-hidden"
      style={{
        background:
          "radial-gradient(1100px 650px at 12% 40%, rgba(99,102,241,0.13), transparent 62%), radial-gradient(900px 600px at 88% 78%, rgba(34,211,238,0.08), transparent 60%), radial-gradient(700px 500px at 60% 0%, rgba(168,85,247,0.07), transparent 60%), #07080c",
      }}
    >
      <canvas
        ref={canvasRef}
        className={cn("absolute inset-0 touch-none outline-none transition-opacity duration-500", ready ? "opacity-100" : "opacity-0")}
        style={{ cursor: "grab" }}
        aria-label="Task dependency tree"
      />

      {/* tooltip (zoomed out) */}
      <div
        ref={tipRef}
        className="pointer-events-none absolute top-0 left-0 z-10 w-[270px] rounded-xl border border-white/10 bg-[#0d1016]/95 p-3 opacity-0 shadow-2xl shadow-black/70 backdrop-blur-md transition-opacity duration-100"
      >
        {tip && TipIcon && tipMeta && (
          <>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 font-mono text-[12px] text-muted">
                <span className="size-2 rounded-full" style={{ background: tip.color }} />
                {tip.code}
              </span>
              <span className={cn("flex items-center gap-1.5 text-[11.5px] font-medium", tipMeta.text)}>
                <TipIcon size={12} />
                {tipMeta.label}
              </span>
            </div>
            <p className="mt-1.5 text-[14px] leading-snug font-semibold text-fg">{tip.title}</p>
            <p className="mt-2 flex items-center justify-between text-[11.5px] text-muted">
              <span>{tip.owner ? (tip.mine ? "Claimed by you" : tip.owner) : "Unclaimed"}</span>
              <span className="text-faint">
                {tip.deps} in · {tip.unlocks} out{tip.estimate ? ` · ${tip.estimate}` : ""}
              </span>
            </p>
            <p className="mt-2 border-t border-white/5 pt-2 text-[11px] text-faint">Click to open</p>
          </>
        )}
      </div>

      {/* bottom bar: legend + blocks, zoom controls, minimap */}
      <div className="pointer-events-none absolute inset-x-3 bottom-3 z-10 flex items-end justify-between gap-3">
        <div className="pointer-events-auto flex max-w-[calc(100%-64px)] min-w-0 items-center gap-4 overflow-x-auto rounded-xl border border-white/10 bg-[#0b0d12]/80 px-3.5 py-2.5 text-[12px] text-muted shadow-xl shadow-black/40 backdrop-blur-md sm:max-w-[calc(100%-212px)]">
          <span className="flex shrink-0 items-center gap-3">
            {STATE_ORDER.map((s) => (
              <span key={s} className="flex items-center gap-1.5">
                <span
                  className="size-2.5 rounded-[3px]"
                  style={{ background: STATE_HEX[s], boxShadow: `0 0 8px ${hexA(STATE_HEX[s], 0.55)}` }}
                />
                {STATE_META[s].label}
              </span>
            ))}
          </span>
          <span className="h-4 w-px shrink-0 bg-white/10" />
          <span className="flex items-center gap-1">
            {blockStats.map(({ block, total, done, color }) => {
              const active = blockFilter === block.id;
              return (
                <button
                  key={block.id}
                  type="button"
                  onClick={() => onPickBlock(active ? "all" : block.id)}
                  title={`${block.name} · ${done}/${total} done`}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-white/5",
                    active && "bg-white/10",
                  )}
                >
                  <span className="size-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${hexA(color, 0.6)}` }} />
                  <span className="font-mono text-fg">{block.code}</span>
                  <span className="text-faint tabular-nums">
                    {done}/{total}
                  </span>
                </button>
              );
            })}
          </span>
        </div>

        <div className="pointer-events-auto flex shrink-0 flex-col items-end gap-2">
          <button
            type="button"
            onClick={() => (editingRing ? stopEditRing() : startEditRing())}
            title="Move or resize the progress ring, then save its position for everyone"
            className={cn(
              "flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-[#0b0d12]/80 px-3 text-[12px] font-medium shadow-xl shadow-black/40 backdrop-blur-md transition-colors hover:bg-white/5",
              editingRing ? "text-fg" : "text-muted hover:text-fg",
            )}
          >
            <ChartPie size={14} />
            Move ring
          </button>
          <div className="flex flex-col overflow-hidden rounded-lg border border-white/10 bg-[#0b0d12]/80 shadow-xl shadow-black/40 backdrop-blur-md">
            {movedCount > 0 && (
              <button
                type="button"
                onClick={resetPositions}
                title="Reset moved tasks to the automatic layout"
                className="flex size-9 items-center justify-center border-b border-white/10 text-muted transition-colors hover:bg-white/5 hover:text-fg"
              >
                <RotateCcw size={14} />
              </button>
            )}
            {filtering && (
              <button
                type="button"
                onClick={fitMatches}
                title="Zoom to the tasks matching your filters"
                className="flex size-9 items-center justify-center border-b border-white/10 text-claimed transition-colors hover:bg-white/5"
              >
                <Crosshair size={15} />
              </button>
            )}
            <button
              type="button"
              onClick={() => zoomCenter(1.5)}
              title="Zoom in (+)"
              className="flex size-9 items-center justify-center border-b border-white/10 text-muted transition-colors hover:bg-white/5 hover:text-fg"
            >
              <Plus size={15} />
            </button>
            <button
              type="button"
              onClick={() => zoomCenter(1 / 1.5)}
              title="Zoom out (−)"
              className="flex size-9 items-center justify-center border-b border-white/10 text-muted transition-colors hover:bg-white/5 hover:text-fg"
            >
              <Minus size={15} />
            </button>
            <button
              type="button"
              onClick={() => {
                userMoved.current = false;
                fitAll(false);
              }}
              title="Fit everything (F)"
              className="flex size-9 items-center justify-center text-muted transition-colors hover:bg-white/5 hover:text-fg"
            >
              <Scan size={15} />
            </button>
          </div>
          <div className="hidden overflow-hidden rounded-xl border border-white/10 bg-[#0b0d12]/80 shadow-xl shadow-black/40 backdrop-blur-md sm:block">
            <canvas
              ref={miniRef}
              style={{ width: 176, height: 104, cursor: "pointer", touchAction: "none" }}
              onPointerDown={(e) => {
                miniDrag.current = true;
                e.currentTarget.setPointerCapture(e.pointerId);
                jumpTo(e);
              }}
              onPointerMove={(e) => miniDrag.current && jumpTo(e)}
              onPointerUp={() => {
                miniDrag.current = false;
              }}
            />
          </div>
        </div>
      </div>

      {/* ring placement: move / resize it, then save for everyone */}
      {editingRing && (
        <div className="pointer-events-auto absolute bottom-[84px] left-1/2 z-20 flex max-w-[calc(100%-24px)] -translate-x-1/2 flex-wrap items-center justify-center gap-2 rounded-xl border border-white/15 bg-[#0b0d12]/90 px-3 py-2 shadow-2xl shadow-black/60 backdrop-blur-md">
          <span className="px-1 text-[12px] text-muted">
            Drag the <b className="font-medium text-fg">white handle</b> to move · the <b className="font-medium text-[#7c9cff]">blue dot</b> to resize
          </span>
          <Button size="sm" variant="ghost" onClick={() => { ringWork.current = { ...defaultRing }; dirty.current = true; }}>
            <RotateCcw size={12} />
            Default
          </Button>
          <Button size="sm" variant="ghost" onClick={stopEditRing}>
            <X size={12} />
            Cancel
          </Button>
          <Button size="sm" variant="primary" loading={savingRing} onClick={() => void saveEditedRing()}>
            <Check size={12} />
            Save for everyone
          </Button>
        </div>
      )}

      {/* first-visit hint */}
      <p
        className={cn(
          "pointer-events-none absolute bottom-[84px] left-1/2 z-10 hidden -translate-x-1/2 rounded-full border border-white/10 bg-[#0b0d12]/75 px-3.5 py-1.5 text-[11.5px] whitespace-nowrap text-muted backdrop-blur-md transition-opacity duration-700 sm:block",
          hint && !editingRing ? "opacity-100" : "opacity-0",
        )}
      >
        Scroll to zoom · drag empty space to pan · drag a task to move it · hover to trace · click to open
      </p>
    </div>
  );
}
