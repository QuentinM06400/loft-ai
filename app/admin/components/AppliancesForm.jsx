"use client";
import { useState } from "react";
import { RepeatableBlock, CustomFieldsBlock, GroupDivider, ToggleSwitch, Textarea } from "./ui";
import { APPLIANCE_CATEGORIES } from "@/app/lib/propertySchema";

const CATEGORY_ICONS = {
  kitchen: "🍳", smallKitchen: "☕", maintenance: "🧺", comfort: "❄️", bathroom: "🚿",
};

function ApplianceRow({ appliance, data, onChange }) {
  const enabled = !!(data?.enabled);
  const toggle = () => onChange({ ...data, enabled: !enabled });
  const set = (key, val) => onChange({ ...data, enabled, [key]: val });

  return (
    <div style={{
      borderRadius: 10,
      border: `1px solid ${enabled ? "rgba(42,107,90,0.2)" : "rgba(0,0,0,0.08)"}`,
      overflow: "hidden", marginBottom: 8, transition: "border .2s",
    }}>
      {/* Header row */}
      <div
        style={{
          display: "flex", alignItems: "center", gap: 10, padding: "11px 14px",
          background: enabled ? "rgba(42,107,90,0.03)" : "#fff",
          cursor: "pointer", transition: "background .2s",
        }}
        onClick={toggle}
      >
        <ToggleSwitch value={enabled} onChange={() => {}} />
        <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: enabled ? "#1A1A1A" : "#9A9A9A" }}>
          {appliance.label}
        </span>
        {enabled && (
          <span style={{ fontSize: 11, color: "#2A6B5A" }}>
            {data?.brandModel ? "✓ configuré" : "à configurer"}
          </span>
        )}
      </div>

      {/* Expanded fields */}
      {enabled && (
        <div style={{
          borderTop: "1px solid rgba(0,0,0,0.06)",
          padding: "12px 14px",
          display: "flex", flexDirection: "column", gap: 10,
          background: "#FAFAF8",
        }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#6B6B6B", display: "block", marginBottom: 4 }}>
              Marque &amp; Modèle
            </label>
            <input
              value={data?.brandModel || ""}
              onChange={e => set("brandModel", e.target.value)}
              placeholder="Ex : AEG BPB331021B — notre AI connaît déjà le mode d'emploi"
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 8, fontSize: 13,
                border: "1px solid rgba(0,0,0,0.1)", background: "#fff",
                fontFamily: "inherit", outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#6B6B6B", display: "block", marginBottom: 4 }}>
              Emplacement
            </label>
            <input
              value={data?.location || ""}
              onChange={e => set("location", e.target.value)}
              placeholder="Ex : À gauche de l'évier, sous le plan de travail"
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 8, fontSize: 13,
                border: "1px solid rgba(0,0,0,0.1)", background: "#fff",
                fontFamily: "inherit", outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#6B6B6B", display: "block", marginBottom: 4 }}>
              Instructions spécifiques <span style={{ color: "#9A9A9A", fontWeight: 400 }}>(optionnel)</span>
            </label>
            <textarea
              value={data?.specificInstructions || ""}
              onChange={e => set("specificInstructions", e.target.value)}
              rows={2}
              placeholder="Uniquement les particularités propres à votre logement"
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 8, fontSize: 13,
                border: "1px solid rgba(0,0,0,0.1)", background: "#fff",
                fontFamily: "inherit", outline: "none", resize: "vertical",
                lineHeight: 1.5, boxSizing: "border-box",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function AppliancesForm({ data = {}, onChange }) {
  const items = data.items || {};
  const setItem = (id, val) => onChange({ ...data, items: { ...items, [id]: val } });
  const set = (key, val) => onChange({ ...data, [key]: val });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {APPLIANCE_CATEGORIES.map(cat => (
        <div key={cat.id}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8, marginBottom: 10,
          }}>
            <span style={{ fontSize: 16 }}>{CATEGORY_ICONS[cat.id]}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#6B6B6B", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {cat.label}
            </span>
          </div>
          {cat.items.map(appliance => (
            <ApplianceRow
              key={appliance.id}
              appliance={appliance}
              data={items[appliance.id]}
              onChange={val => setItem(appliance.id, val)}
            />
          ))}
        </div>
      ))}

      <GroupDivider label="Appareils personnalisés" />
      <RepeatableBlock
        items={data.customAppliances || []}
        onChange={v => set("customAppliances", v)}
        addLabel="+ Ajouter un appareil personnalisé"
        header={(item) => item.name || "Nouvel appareil"}
        fields={[
          { id: "name",                 label: "Nom de l'appareil",     type: "text",     required: true },
          { id: "brandModel",           label: "Marque / Modèle",       type: "text" },
          { id: "location",             label: "Emplacement",           type: "text" },
          { id: "specificInstructions", label: "Instructions spécifiques", type: "textarea" },
        ]}
      />

      <CustomFieldsBlock value={data.customFields || []} onChange={v => set("customFields", v)} />
    </div>
  );
}
