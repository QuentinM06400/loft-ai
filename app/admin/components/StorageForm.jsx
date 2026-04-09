"use client";
import { RepeatableBlock, CustomFieldsBlock, GroupDivider } from "./ui";

const storageFields = [
  { id: "name",     label: "Nom",        type: "text",     required: true, placeholder: "Ex : Placard couloir" },
  { id: "location", label: "Emplacement", type: "text",    required: true, placeholder: "Ex : À droite de l'entrée" },
  { id: "details",  label: "Détails",     type: "textarea", placeholder: "Ce qu'il contient, comment l'utiliser..." },
];

const consumableFields = [
  { id: "name",     label: "Nom",        type: "text",     required: true, placeholder: "Ex : Capsules café, papier toilette..." },
  { id: "location", label: "Emplacement", type: "text",    required: true, placeholder: "Ex : Sous l'évier, placard cuisine" },
  { id: "details",  label: "Détails",     type: "textarea", placeholder: "Quantité fournie, où trouver plus..." },
];

const wasteFields = [
  { id: "type",         label: "Type de déchet", type: "text",  required: true, placeholder: "Ex : Ordures ménagères, Recyclable, Verre" },
  { id: "location",     label: "Emplacement",    type: "text",  required: true, placeholder: "Ex : Bac vert au rez-de-chaussée" },
  { id: "instructions", label: "Instructions",   type: "text",  placeholder: "Jours de collecte, règles de tri..." },
];

export default function StorageForm({ data = {}, onChange }) {
  const set = (key, val) => onChange({ ...data, [key]: val });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      <GroupDivider label="Rangements" />
      <RepeatableBlock
        items={data.storageItems || []}
        onChange={v => set("storageItems", v)}
        addLabel="+ Ajouter un rangement"
        header={(item) => item.name || "Nouveau rangement"}
        fields={storageFields}
      />

      <GroupDivider label="Consommables fournis" />
      <RepeatableBlock
        items={data.suppliedConsumables || []}
        onChange={v => set("suppliedConsumables", v)}
        addLabel="+ Ajouter un consommable"
        header={(item) => item.name || "Nouveau consommable"}
        fields={consumableFields}
      />

      <GroupDivider label="Poubelles & Tri sélectif" />
      <RepeatableBlock
        items={data.wasteManagement || []}
        onChange={v => set("wasteManagement", v)}
        addLabel="+ Ajouter un type de déchet"
        header={(item) => item.type || "Nouveau déchet"}
        fields={wasteFields}
      />

      <CustomFieldsBlock value={data.customFields || []} onChange={v => set("customFields", v)} />
    </div>
  );
}
