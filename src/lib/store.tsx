"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useToast } from "@/components/toast";
import { isConfigured, supabase } from "./supabase";
import { naturalCompare } from "./utils";
import type {
  Activity,
  Block,
  BlockInput,
  ClaimRequest,
  Dependency,
  Member,
  Task,
  TaskInput,
  TaskState,
} from "./types";

const STORAGE_KEY = "task-board.member";

interface Data {
  members: Member[];
  blocks: Block[];
  tasks: Task[];
  deps: Dependency[];
  requests: ClaimRequest[];
  activity: Activity[];
}

const EMPTY: Data = { members: [], blocks: [], tasks: [], deps: [], requests: [], activity: [] };

async function fetchAll<T>(table: string, order: string[]): Promise<{ rows: T[]; error: string | null }> {
  const rows: T[] = [];
  const size = 1000;
  for (let from = 0; ; from += size) {
    let query = supabase.from(table).select("*");
    for (const col of order) query = query.order(col);
    const { data, error } = await query.range(from, from + size - 1);
    if (error) return { rows, error: error.message };
    rows.push(...((data ?? []) as T[]));
    if (!data || data.length < size) break;
  }
  return { rows, error: null };
}

interface Board {
  /** true until the first load finishes */
  loading: boolean;
  /** load error text; setupNeeded is true when the tables do not exist yet */
  error: string | null;
  setupNeeded: boolean;
  configured: boolean;

  members: Member[];
  blocks: Block[];
  tasks: Task[];
  deps: Dependency[];
  activity: Activity[];
  pendingRequests: ClaimRequest[];

  memberById: Map<string, Member>;
  blockById: Map<string, Block>;
  taskById: Map<string, Task>;
  taskByCode: Map<string, Task>;
  tasksByBlock: Map<string, Task[]>;
  depsOf: Map<string, string[]>;
  dependentsOf: Map<string, string[]>;
  requestsByTask: Map<string, ClaimRequest[]>;

  stateOf: (task: Task) => TaskState;
  unmetDeps: (task: Task) => Task[];

  /** the person using this browser, null until they pick a name */
  me: Member | null;
  sessionReady: boolean;
  selectMember: (id: string) => void;
  addMember: (name: string) => Promise<Member | null>;
  signOut: () => void;

  refresh: () => Promise<void>;
  /** run a database action by name; shows an error toast and returns false on failure */
  act: (fn: string, args: Record<string, unknown>, successMessage?: string) => Promise<boolean>;

  saveTask: (input: TaskInput, deps: string[], id?: string) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
  saveBlock: (input: BlockInput, id?: string) => Promise<boolean>;
  deleteBlock: (id: string) => Promise<boolean>;
  moveBlock: (id: string, direction: -1 | 1) => Promise<void>;
}

const BoardContext = createContext<Board | null>(null);

export function useBoard(): Board {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error("useBoard must be used inside BoardProvider");
  return ctx;
}

function friendlyError(error: { message: string; code?: string }): string {
  if (error.code === "23505") {
    if (error.message.includes("tasks_code_key")) return "That task code is already in use.";
    if (error.message.includes("blocks_code_key")) return "That block code is already in use.";
    if (error.message.includes("members_name_key")) return "That name already exists.";
  }
  if (error.code === "23503") return "That item is still referenced elsewhere.";
  return error.message;
}

export function BoardProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [data, setData] = useState<Data>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const loadSeq = useRef(0);

  // ------------------------------------------------------------ loading
  const load = useCallback(async () => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }
    const seq = ++loadSeq.current;
    const [m, b, t, d, r, a] = await Promise.all([
      fetchAll<Member>("members", ["name", "id"]),
      fetchAll<Block>("blocks", ["position", "code"]),
      fetchAll<Task>("tasks", ["code"]),
      fetchAll<Dependency>("task_dependencies", ["task_id", "depends_on_id"]),
      supabase.from("claim_requests").select("*").eq("status", "pending"),
      supabase.from("activity").select("*").order("created_at", { ascending: false }).limit(400),
    ]);
    if (seq !== loadSeq.current) return; // a newer load is already running

    const failure = m.error ?? b.error ?? t.error ?? d.error ?? r.error?.message ?? a.error?.message ?? null;
    if (failure) {
      setError(failure);
      setSetupNeeded(/relation|schema cache|does not exist|PGRST20/i.test(failure));
      setLoading(false);
      return;
    }
    setError(null);
    setSetupNeeded(false);
    setData({
      members: m.rows,
      blocks: b.rows,
      tasks: t.rows,
      deps: d.rows,
      requests: (r.data ?? []) as ClaimRequest[],
      activity: (a.data ?? []) as Activity[],
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // live updates: any change in the database triggers a (debounced) reload
  useEffect(() => {
    if (!isConfigured) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(() => void load(), 150);
    };
    const channel = supabase
      .channel("board-changes")
      .on("postgres_changes", { event: "*", schema: "public" }, schedule)
      .subscribe();

    const onVisible = () => {
      if (document.visibilityState === "visible") schedule();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", schedule);
    const poll = setInterval(schedule, 60_000); // safety net if realtime drops

    return () => {
      clearTimeout(timer);
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", schedule);
      void supabase.removeChannel(channel);
    };
  }, [load]);

  // ------------------------------------------------------------ session
  useEffect(() => {
    try {
      setCurrentId(localStorage.getItem(STORAGE_KEY));
    } catch {
      /* storage unavailable: the picker will simply show every visit */
    }
    setSessionReady(true);
  }, []);

  const selectMember = useCallback((id: string) => {
    setCurrentId(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const signOut = useCallback(() => {
    setCurrentId(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  // ------------------------------------------------------------ derived
  const derived = useMemo(() => {
    const memberById = new Map(data.members.map((m) => [m.id, m]));
    const blockById = new Map(data.blocks.map((b) => [b.id, b]));
    const taskById = new Map(data.tasks.map((t) => [t.id, t]));
    const taskByCode = new Map(data.tasks.map((t) => [t.code, t]));

    const tasksByBlock = new Map<string, Task[]>();
    for (const task of data.tasks) {
      const list = tasksByBlock.get(task.block_id) ?? [];
      list.push(task);
      tasksByBlock.set(task.block_id, list);
    }
    for (const list of tasksByBlock.values()) list.sort((a, b) => naturalCompare(a.code, b.code));

    const depsOf = new Map<string, string[]>();
    const dependentsOf = new Map<string, string[]>();
    for (const d of data.deps) {
      depsOf.set(d.task_id, [...(depsOf.get(d.task_id) ?? []), d.depends_on_id]);
      dependentsOf.set(d.depends_on_id, [...(dependentsOf.get(d.depends_on_id) ?? []), d.task_id]);
    }

    const requestsByTask = new Map<string, ClaimRequest[]>();
    for (const r of data.requests) {
      requestsByTask.set(r.task_id, [...(requestsByTask.get(r.task_id) ?? []), r]);
    }
    for (const list of requestsByTask.values()) list.sort((a, b) => a.created_at.localeCompare(b.created_at));

    return { memberById, blockById, taskById, taskByCode, tasksByBlock, depsOf, dependentsOf, requestsByTask };
  }, [data]);

  const unmetDeps = useCallback(
    (task: Task): Task[] => {
      const out: Task[] = [];
      for (const id of derived.depsOf.get(task.id) ?? []) {
        const dep = derived.taskById.get(id);
        if (dep && dep.status !== "done") out.push(dep);
      }
      return out.sort((a, b) => naturalCompare(a.code, b.code));
    },
    [derived],
  );

  const stateOf = useCallback(
    (task: Task): TaskState => (task.status === "open" && unmetDeps(task).length > 0 ? "locked" : task.status),
    [unmetDeps],
  );

  const me = currentId ? (derived.memberById.get(currentId) ?? null) : null;

  // a remembered id that no longer exists (deleted person, reset database) is dropped
  useEffect(() => {
    if (!loading && !error && currentId && !derived.memberById.has(currentId)) signOut();
  }, [loading, error, currentId, derived.memberById, signOut]);

  // ------------------------------------------------------------ actions
  const act = useCallback<Board["act"]>(
    async (fn, args, successMessage) => {
      const { error: rpcError } = await supabase.rpc(fn, args);
      if (rpcError) {
        toast(friendlyError(rpcError), "error");
        await load();
        return false;
      }
      if (successMessage) toast(successMessage);
      await load();
      return true;
    },
    [load, toast],
  );

  const logActivity = useCallback(
    async (taskId: string | null, action: string, detail: Record<string, unknown> = {}) => {
      await supabase.from("activity").insert({ task_id: taskId, member_id: currentId, action, detail });
    },
    [currentId],
  );

  const addMember = useCallback<Board["addMember"]>(
    async (rawName) => {
      const name = rawName.trim().replace(/\s+/g, " ");
      if (!name) return null;
      const existing = data.members.find((m) => m.name.toLowerCase() === name.toLowerCase());
      if (existing) return existing;
      const { data: row, error: insertError } = await supabase.from("members").insert({ name }).select("*").single();
      if (insertError) {
        toast(friendlyError(insertError), "error");
        return null;
      }
      await load();
      return row as Member;
    },
    [data.members, load, toast],
  );

  const saveTask = useCallback<Board["saveTask"]>(
    async (input, deps, id) => {
      let taskId = id;
      if (id) {
        const { error: updateError } = await supabase.from("tasks").update(input).eq("id", id);
        if (updateError) {
          toast(friendlyError(updateError), "error");
          return false;
        }
      } else {
        const siblings = data.tasks.filter((t) => t.block_id === input.block_id);
        const position = siblings.reduce((max, t) => Math.max(max, t.position), 0) + 1;
        const { data: row, error: insertError } = await supabase
          .from("tasks")
          .insert({ ...input, position })
          .select("id")
          .single();
        if (insertError || !row) {
          toast(friendlyError(insertError ?? { message: "Could not create the task" }), "error");
          return false;
        }
        taskId = row.id as string;
      }

      const { error: clearError } = await supabase.from("task_dependencies").delete().eq("task_id", taskId!);
      if (clearError) {
        toast(friendlyError(clearError), "error");
        await load();
        return false;
      }
      if (deps.length > 0) {
        const { error: depError } = await supabase
          .from("task_dependencies")
          .insert(deps.map((depends_on_id) => ({ task_id: taskId, depends_on_id })));
        if (depError) {
          toast(friendlyError(depError), "error");
          await load();
          return false;
        }
      }
      await logActivity(taskId!, id ? "edited" : "created");
      toast(id ? "Task saved" : "Task created");
      await load();
      return true;
    },
    [data.tasks, load, logActivity, toast],
  );

  const deleteTask = useCallback<Board["deleteTask"]>(
    async (id) => {
      const task = derived.taskById.get(id);
      const { error: deleteError } = await supabase.from("tasks").delete().eq("id", id);
      if (deleteError) {
        toast(friendlyError(deleteError), "error");
        return false;
      }
      if (task) await logActivity(null, "deleted", { code: task.code, title: task.title });
      toast("Task deleted");
      await load();
      return true;
    },
    [derived.taskById, load, logActivity, toast],
  );

  const saveBlock = useCallback<Board["saveBlock"]>(
    async (input, id) => {
      if (id) {
        const { error: updateError } = await supabase.from("blocks").update(input).eq("id", id);
        if (updateError) {
          toast(friendlyError(updateError), "error");
          return false;
        }
      } else {
        const position = data.blocks.reduce((max, b) => Math.max(max, b.position), 0) + 1;
        const { error: insertError } = await supabase.from("blocks").insert({ ...input, position });
        if (insertError) {
          toast(friendlyError(insertError), "error");
          return false;
        }
      }
      toast(id ? "Block saved" : "Block created");
      await load();
      return true;
    },
    [data.blocks, load, toast],
  );

  const deleteBlock = useCallback<Board["deleteBlock"]>(
    async (id) => {
      const { error: deleteError } = await supabase.from("blocks").delete().eq("id", id);
      if (deleteError) {
        toast(friendlyError(deleteError), "error");
        return false;
      }
      toast("Block deleted");
      await load();
      return true;
    },
    [load, toast],
  );

  const moveBlock = useCallback<Board["moveBlock"]>(
    async (id, direction) => {
      const index = data.blocks.findIndex((b) => b.id === id);
      const other = data.blocks[index + direction];
      const current = data.blocks[index];
      if (!current || !other) return;
      // renumber everything so equal positions can never get stuck
      const reordered = [...data.blocks];
      reordered[index] = other;
      reordered[index + direction] = current;
      const results = await Promise.all(
        reordered.map((b, i) => supabase.from("blocks").update({ position: i + 1 }).eq("id", b.id)),
      );
      const failed = results.find((r) => r.error);
      if (failed?.error) toast(friendlyError(failed.error), "error");
      await load();
    },
    [data.blocks, load, toast],
  );

  const value: Board = {
    loading: loading || !sessionReady,
    error,
    setupNeeded,
    configured: isConfigured,
    members: data.members,
    blocks: data.blocks,
    tasks: data.tasks,
    deps: data.deps,
    activity: data.activity,
    pendingRequests: data.requests,
    ...derived,
    stateOf,
    unmetDeps,
    me,
    sessionReady,
    selectMember,
    addMember,
    signOut,
    refresh: load,
    act,
    saveTask,
    deleteTask,
    saveBlock,
    deleteBlock,
    moveBlock,
  };

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
}
