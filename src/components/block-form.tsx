"use client";

import { useState } from "react";
import { useBoard } from "@/lib/store";
import type { Block } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Field, inputClass } from "./ui/fields";
import { Modal } from "./ui/overlay";

const CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

function Inner({ block, onClose }: { block: Block | null; onClose: () => void }) {
  const board = useBoard();
  const [code, setCode] = useState(block?.code ?? "");
  const [name, setName] = useState(block?.name ?? "");
  const [description, setDescription] = useState(block?.description ?? "");
  const [saving, setSaving] = useState(false);

  const codeValue = code.trim();
  const codeError = codeValue && !CODE_PATTERN.test(codeValue) ? "Letters, numbers, dots, dashes and underscores only" : null;
  const valid = codeValue && !codeError && name.trim();

  async function save() {
    if (!valid || saving) return;
    setSaving(true);
    const ok = await board.saveBlock({ code: codeValue, name: name.trim(), description: description.trim() }, block?.id);
    setSaving(false);
    if (ok) onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={block ? `Edit block ${block.code}` : "New block"}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={saving} disabled={!valid} onClick={() => void save()}>
            {block ? "Save changes" : "Create block"}
          </Button>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
          <Field label="Code" hint={codeError ?? undefined}>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="A"
              autoFocus={!block}
              className={cn(inputClass, "font-mono")}
            />
          </Field>
          <Field label="Name">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Foundation" className={inputClass} />
          </Field>
        </div>
        <Field label="Description">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClass} />
        </Field>
      </form>
    </Modal>
  );
}

export function BlockFormDialog({
  open,
  onClose,
  block = null,
}: {
  open: boolean;
  onClose: () => void;
  block?: Block | null;
}) {
  if (!open) return null;
  return <Inner key={block?.id ?? "new"} block={block} onClose={onClose} />;
}
