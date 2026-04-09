"use client";
import { RepeatableBlock, CustomFieldsBlock } from "./ui";

const POI_CATEGORIES = ["Transport", "Commerce", "Santé", "Plage", "Culture", "Sport", "Autre"];

export default function LocationForm({ data = {}, onChange }) {
  const set = (key, val) => onChange({ ...data, [key]: val });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Info banner */}
      <div style={{
        padding: "12px 16px", borderRadius: 10,
        background: "rgba(42,107,90,0.06)", border: "1px solid rgba(42,107,90,0.15)",
        fontSize: 13, color: "#2A6B5A", lineHeight: 1.5,
      }}>
        📍 Ces points d'intérêt peuvent être complétés manuellement. Une génération automatique depuis votre adresse sera disponible prochainement.
      </div>

      <RepeatableBlock
        items={data.pointsOfInterest || []}
        onChange={v => set("pointsOfInterest", v)}
        addLabel="+ Ajouter un lieu"
        header={(item) => [item.name, item.category].filter(Boolean).join(" — ") || "Nouveau lieu"}
        fields={[
          { id: "name",            label: "Lieu",               type: "text",   required: true, placeholder: "Ex : Plage de la Croisette" },
          { id: "category",        label: "Catégorie",          type: "select", options: POI_CATEGORIES, required: true },
          { id: "walkingDistance", label: "Distance à pied",    type: "text",   required: true, placeholder: "Ex : 5 min à pied" },
          { id: "drivingDistance", label: "Distance en voiture", type: "text",  placeholder: "Ex : 3 min en voiture" },
          { id: "ownerNote",       label: "Note du propriétaire", type: "text", placeholder: "Conseil ou info complémentaire" },
        ]}
      />

      <CustomFieldsBlock value={data.customFields || []} onChange={v => set("customFields", v)} />
    </div>
  );
}
