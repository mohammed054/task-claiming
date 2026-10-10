export type TaskStatus = "open" | "claimed" | "in_progress" | "done";
/** What the UI shows: "locked" is an open task whose dependencies are not all done. */
export type TaskState = TaskStatus | "locked";
export type Priority = "low" | "medium" | "high" | "critical";

export interface Member {
  id: string;
  name: string;
  created_at: string;
}

export interface Block {
  id: string;
  code: string;
  name: string;
  description: string;
  position: number;
}

export interface TaskLink {
  label: string;
  url: string;
}

export interface Task {
  id: string;
  block_id: string;
  code: string;
  title: string;
  description: string;
  acceptance_criteria: string;
  estimate: string;
  priority: Priority;
  tags: string[];
  links: TaskLink[];
  notes: string;
  status: TaskStatus;
  claimed_by: string | null;
  claimed_at: string | null;
  completed_at: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Dependency {
  task_id: string;
  depends_on_id: string;
}

export interface ClaimRequest {
  id: string;
  task_id: string;
  requester_id: string;
  message: string;
  status: "pending" | "approved" | "declined" | "cancelled";
  created_at: string;
  resolved_at: string | null;
}

export interface Activity {
  id: string;
  task_id: string | null;
  member_id: string | null;
  action: string;
  detail: Record<string, unknown>;
  created_at: string;
}

export interface TaskInput {
  block_id: string;
  code: string;
  title: string;
  description: string;
  acceptance_criteria: string;
  estimate: string;
  priority: Priority;
  tags: string[];
  links: TaskLink[];
  notes: string;
}

export interface BlockInput {
  code: string;
  name: string;
  description: string;
}
