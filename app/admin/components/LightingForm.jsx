"use client";
import { RepeatableBlock, CustomFieldsBlock } from "./ui";

const CONTROL_TYPES = ["Interrupteur", "Télécommande", "Variateur", "Connecté", "Autre"];

export default function LightingForm({ data = {}, onChange }) {
  const set = (key, val) => onChange({ ...data, [key]: val });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <RepeatableBlock
        items={data.zones || []}
        onChange={v => set("zones", v)}
        addLabel="+ Ajouter une zone d'éclairage"
        header={(item) => item.zoneName || "Nouvelle zone"}
        fields={[
          { id: "zoneName",        label: "Nom de la zone",          type: "text",     required: true, placeholder: "Ex : Salon — boules lumineuses" },
          { id: "controlType",     label: "Type de commande",        type: "select",   options: CONTROL_TYPES, required: true },
          { id: "controlLocation", label: "Emplacement de la commande", type: "text",  required: true, placeholder: "Ex : Interrupteur à gauche de la porte d'entrée" },
          { id: "instructions",    label: "Instructions",            type: "textarea", placeholder: "Fonctionnement particulier, réglages..." },
        ]}
      />
      <CustomFieldsBlock value={data.customFields || []} onChange={v => set("customFields", v)} />
    </div>
  );
}
