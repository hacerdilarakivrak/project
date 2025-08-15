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
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        background: "#2c2c2c",   
        padding: "32px 0",
      }}
    >
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 16px" }}>
        <h1
          style={{
            textAlign: "center",
            fontSize: 36,
            fontWeight: 700,
            marginBottom: 20,
            letterSpacing: ".3px",
            color: "#ffffff",
          }}
        >
          Terminal Yönetimi
        </h1>

        <div
          style={{
            borderRadius: 16,
            border: "1px solid #3a3a3a",
            background: "#1a1a1a",
            boxShadow: "0 10px 40px rgba(0,0,0,.35)",
            padding: 24,
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <TerminalForm onCreated={handleCreated} />
          </div>

          <TerminalList
            items={items}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

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
