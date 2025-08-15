import React, { useEffect, useState } from "react";
import type { Terminal } from "./types";
import { loadTerminals, updateTerminal } from "./storage";

import TerminalForm from "./TerminalForm";
import TerminalList from "./TerminalList";
import TerminalEditModal from "./TerminalEditModal";

export default function TerminalsPage() {
  const [items, setItems] = useState<Terminal[]>([]);
  const [editing, setEditing] = useState<Terminal | null>(null);

  // Sayfa açılışında kayıtları yükle
  useEffect(() => {
    setItems(loadTerminals());
  }, []);

  // Formdan gelen yeni kayıtları listeye ekle
  function handleCreated(created: Terminal[]) {
    setItems((prev) => [...prev, ...created]);
  }

  // Listeden "Düzenle/Kapat" tıklanınca modalı aç
  function handleEdit(t: Terminal) {
    setEditing(t);
  }

  // Modalda kaydet -> storage güncelle + state yenile
  function handleSave(updated: Terminal) {
    const newList = updateTerminal(updated);
    setItems(newList);
    setEditing(null);
  }

  return (
    <div className="space-y-6">
      <TerminalForm onCreated={handleCreated} />
      <TerminalList items={items} onEdit={handleEdit} />

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

