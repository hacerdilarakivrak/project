import React, { useEffect, useState } from "react";
import TerminalForm from "./TerminalForm";
import TerminalList from "./TerminalList";
import TerminalEditModal from "./TerminalEditModal";
import type { Terminal } from "./types";
import { loadTerminals, updateTerminal } from "./storage";
import { toast } from "react-toastify";

export default function TerminalsPage() {
  const [items, setItems] = useState<Terminal[]>([]);
  const [editing, setEditing] = useState<Terminal | null>(null);

  const refresh = () => setItems(loadTerminals());

  useEffect(() => {
    refresh();
  }, []);

  const handleCreated = () => {
    refresh();
    toast.success("Terminal(ler) eklendi");
  };

  const onEditClick = (t: Terminal) => setEditing(t);

  const onSaveEdit = (updated: Terminal) => {
    updateTerminal(updated);
    setEditing(null);
    refresh();
    toast.success(
      updated.kayitDurum === 0 ? "Terminal kapatıldı" : "Terminal güncellendi"
    );
  };

  return (
    <div className="space-y-6">
      <TerminalForm onCreated={handleCreated} />
      <TerminalList items={items} onEdit={onEditClick} />
      {editing && (
        <TerminalEditModal
          initial={editing}
          onSave={onSaveEdit}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
