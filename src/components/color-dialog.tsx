"use client";

import { useMemo, useState } from "react";
import { Check, Shuffle } from "lucide-react";
import { useBoard } from "@/lib/store";
import { colorDistance, HEX, MEMBER_PALETTE, pickFreeColor, TOO_CLOSE } from "@/lib/colors";
import { cn, initials } from "@/lib/utils";
import { Button } from "./ui/button";
import { Modal } from "./ui/overlay";

/**
 * Pick your colour. Shown once automatically to anyone who has not chosen yet (`first`),
 * and any time from the name menu in the header.
 */
export function ColorDialog({ open, first, onClose }: { open: boolean; first?: boolean; onClose: () => void }) {
  const board = useBoard();
  if (!open || !board.me) return null;
  return <Inner key={board.me.id} first={first} onClose={onClose} />;
}

function Inner({ first, onClose }: { first?: boolean; onClose: () => void }) {
  const board = useBoard();
  const me = board.me!;

  // colours other people have really picked cannot be taken; the suggestion also steers clear of
  // the temporary colours people who have not picked yet are shown with
  const takenBy = useMemo(() => {
    const m = new Map<string, string>();
    for (const o of board.members) if (o.id !== me.id && o.color) m.set(o.color.toLowerCase(), o.name);
    return m;
  }, [board.members, me.id]);

  const [color, setColor] = useState(() => {
    if (me.color) return me.color.toLowerCase();
    const others = [...board.colorOf].filter(([id]) => id !== me.id).map(([, c]) => c);
    return pickFreeColor(others);
  });
  const [saving, setSaving] = useState(false);

  function conflict(c: string): string | null {
    for (const [taken, name] of takenBy) if (colorDistance(taken, c) < TOO_CLOSE) return name;
    return null;
  }
  const clash = conflict(color);
  const valid = HEX.test(color) && !clash;

  async function save() {
    if (!valid) return;
    setSaving(true);
    const ok = await board.setMyColor(color);
    setSaving(false);
    if (ok) onClose();
  }

  const shuffle = () => {
    const taken = [...board.colorOf].filter(([id]) => id !== me.id).map(([, c]) => c);
    let next = pickFreeColor(taken);
    for (let i = 0; i < 6 && next === color; i++) next = pickFreeColor(taken);
    setColor(next);
  };

  return (
    <Modal
      open
      onClose={onClose}
      dismissible={!first}
      title={first ? "Pick your colour" : "Change your colour"}
      description={
        first
          ? "This is you on the progress ring and on your tasks. Everyone gets their own colour."
          : "Used for your slice of the progress ring and your tasks."
      }
      className="max-w-md"
      footer={
        <>
          {!first && (
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button variant="primary" onClick={() => void save()} disabled={!valid} loading={saving}>
            {first ? "Use this colour" : "Save"}
          </Button>
        </>
      }
    >
      <div className="flex items-center gap-4 rounded-xl border border-line bg-raised p-4">
        <span
          className="flex size-14 shrink-0 items-center justify-center rounded-full text-[18px] font-semibold text-black/80 transition-colors duration-200"
          style={{ background: color, boxShadow: `0 0 28px ${color}66` }}
        >
          {initials(me.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold">{me.name}</p>
          <p className="mt-0.5 font-mono text-[12px] text-muted uppercase">{color}</p>
        </div>
        <Button variant="secondary" size="sm" className="ml-auto" onClick={shuffle} title="Pick a random free colour">
          <Shuffle size={13} />
          Surprise me
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-8 gap-2" role="radiogroup" aria-label="Colours">
        {MEMBER_PALETTE.map((c) => {
          const owner = conflict(c);
          const selected = c.toLowerCase() === color.toLowerCase();
          return (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={owner ? `${c} (taken by ${owner})` : c}
              disabled={Boolean(owner)}
              title={owner ? `Taken by ${owner}` : c}
              onClick={() => setColor(c)}
              style={{ background: c }}
              className={cn(
                "relative flex aspect-square items-center justify-center rounded-full transition-transform",
                owner ? "cursor-not-allowed opacity-20" : "hover:scale-110",
                selected && "ring-2 ring-white ring-offset-2 ring-offset-[#0d0f14]",
              )}
            >
              {selected && <Check size={14} className="text-black/75" strokeWidth={3} />}
            </button>
          );
        })}
      </div>

      <label className="mt-4 flex items-center gap-3 text-[12.5px] text-muted">
        <span>Or any colour</span>
        <input
          type="color"
          value={HEX.test(color) ? color : "#7c9cff"}
          onChange={(e) => setColor(e.target.value.toLowerCase())}
          className="h-8 w-12 cursor-pointer rounded border border-line-strong bg-transparent p-0.5"
        />
      </label>
      {clash && (
        <p className="mt-2 text-[12.5px] text-claimed">That is too close to {clash}&apos;s colour. Pick one that stands out.</p>
      )}
    </Modal>
  );
}
