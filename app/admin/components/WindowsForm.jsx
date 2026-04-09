"use client";
import { RepeatableBlock, CustomFieldsBlock } from "./ui";

const WINDOW_TYPES  = ["Fenêtre simple", "Fenêtre double battant", "Baie vitrée", "Velux", "Porte-fenêtre", "Autre"];
const SHUTTER_TYPES = ["Roulant électrique", "Roulant manuel", "Battant", "Aucun"];

export default function WindowsForm({ data = {}, onChange }) {
  const set = (key, val) => onChange({ ...data, [key]: val });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <RepeatableBlock
        items={data.openings || []}
        onChange={v => set("openings", v)}
        addLabel="+ Ajouter une ouverture"
        header={(item) => [item.room, item.type].filter(Boolean).join(" — ") || "Nouvelle ouverture"}
        fields={[
          { id: "type",         label: "Type",          type: "select",   options: WINDOW_TYPES,  required: true },
          { id: "room",         label: "Pièce",         type: "text",     required: true, placeholder: "Ex : Salon, Chambre, Salle de douche..." },
          { id: "shutterType",  label: "Type de volet", type: "select",   options: SHUTTER_TYPES },
          { id: "instructions", label: "Instructions",  type: "textarea", placeholder: "Comment ouvrir, fermer, verrouiller..." },
        ]}
      />
      <CustomFieldsBlock value={data.customFields || []} onChange={v => set("customFields", v)} />
    </div>
  );
}
