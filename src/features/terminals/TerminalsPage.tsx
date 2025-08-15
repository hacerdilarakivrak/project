import React, { useEffect, useState } from "react";
import type { Terminal } from "./types";
import { loadTerminals, updateTerminal, deleteTerminal } from "./storage";

import TerminalForm from "./TerminalForm";
import TerminalList from "./TerminalList";
import TerminalEditModal from "./TerminalEditModal";

export default function TerminalsPage() {
  const [items, setItems] = useState<Terminal[]>([]);
  const [editing, setEditing] = useState<Terminal | null>(null);

  useEffect(() => {
    setItems(loadTerminals());
  }, []);

  function handleCreated(created: Terminal[]) {
    setItems((prev) => [...prev, ...created]);
  }

  function handleEdit(t: Terminal) {
    setEditing(t);
  }

  function handleSave(updated: Terminal) {
    const newList = updateTerminal(updated);
    setItems(newList);
    setEditing(null);
  }

  function handleDelete(id: string) {
    if (!window.confirm("Bu terminal silinecek. Emin misiniz?")) return;
    const newList = deleteTerminal(id);
    setItems(newList);
    if (editing?.id === id) setEditing(null);
  }

  return (
    <div className="space-y-6">
      <TerminalForm onCreated={handleCreated} />
      <TerminalList items={items} onEdit={handleEdit} onDelete={handleDelete} />

      {editing && (
        <TerminalEditModal
          initial={editing}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}



