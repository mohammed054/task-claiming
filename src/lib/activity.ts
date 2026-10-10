import type { Activity, Member } from "./types";

/** Sentence parts: `${actor} ${before}${task}${after}` */
export function describeActivity(
  a: Activity,
  memberById: Map<string, Member>,
): { before: string; after: string } {
  const to = typeof a.detail?.to === "string" ? (memberById.get(a.detail.to)?.name ?? "someone") : "someone";
  switch (a.action) {
    case "claimed":
      return { before: "claimed ", after: "" };
    case "released":
      return { before: "released ", after: "" };
    case "started":
      return { before: "started work on ", after: "" };
    case "completed":
      return { before: "completed ", after: "" };
    case "reopened":
      return { before: "reopened ", after: "" };
    case "requested":
      return { before: "requested ", after: ` from ${to}` };
    case "transferred":
      return { before: "handed over ", after: ` to ${to}` };
    case "declined":
      return { before: `declined ${to}'s request for `, after: "" };
    case "created":
      return { before: "created ", after: "" };
    case "edited":
      return { before: "edited ", after: "" };
    case "deleted":
      return { before: "deleted ", after: "" };
    case "imported":
      return { before: "imported ", after: "" };
    default:
      return { before: `${a.action} `, after: "" };
  }
}
