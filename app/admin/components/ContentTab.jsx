"use client";
import { useState } from "react";
import Step1Logement    from "./wizard/steps/Step1Logement";
import Step2Acces       from "./wizard/steps/Step2Acces";
import Step3Regles      from "./wizard/steps/Step3Regles";
import Step4Equipements from "./wizard/steps/Step4Equipements";
import Step5Quartier    from "./wizard/steps/Step5Quartier";
import Step6Contacts    from "./wizard/steps/Step6Contacts";
import StepPersonality  from "./wizard/steps/StepPersonality";

const G    = "#2A6B5A";
const FONT = "'DM Sans', sans-serif";

// ── Accordion wrapper ─────────────────────────────────────────────────────────

function AccordionSection({ icon, label, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderRadius: 14,
      background: "#fff",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      overflow: open ? "visible" : "hidden",
    }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 12,
          padding: "16px 20px", background: "none",
          border: "none", borderBottom: open ? "1px solid rgba(0,0,0,0.05)" : "none",
          cursor: "pointer", fontFamily: FONT, textAlign: "left",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "#F7F7F5"}
        onMouseLeave={e => e.currentTarget.style.background = "none"}
      >
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: "#1A1A1A" }}>{label}</span>
        <span style={{
          fontSize: 12, color: "#9A9A9A",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform .2s",
          display: "inline-block",
        }}>▼</span>
      </button>
      {open && children}
    </div>
  );
}

// ── Save button ───────────────────────────────────────────────────────────────

function SaveButton({ saving, saved, onClick }) {
  return (
    <div style={{ padding: "4px 20px 20px", display: "flex", justifyContent: "flex-end" }}>
      <button
        type="button"
        onClick={onClick}
        disabled={saving}
        style={{
          padding: "12px 24px", borderRadius: 10, fontSize: 13, fontWeight: 600,
          border: "none",
          background: saved ? "rgba(42,107,90,0.12)" : G,
          color: saved ? G : "#fff",
          cursor: saving ? "default" : "pointer",
          fontFamily: FONT,
          boxShadow: saved ? "none" : "0 3px 12px rgba(42,107,90,0.25)",
          transition: "all .2s",
        }}
      >
        {saving ? "Sauvegarde..." : saved ? "✅ Sauvegardé" : "Sauvegarder cette section"}
      </button>
    </div>
  );
}

// ── Generic section editor ────────────────────────────────────────────────────
// getInit(propertyData)  → initialLocalData
// buildUpdate(propertyData, localData) → updatedPropertyData

function SectionEditor({ icon, label, propertyData, onSave, getInit, buildUpdate, StepComponent, stepProps }) {
  const [localData, setLocalData] = useState(() => getInit(propertyData));
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(buildUpdate(propertyData, localData));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AccordionSection icon={icon} label={label}>
      <StepComponent
        data={localData}
        onChange={setLocalData}
        onNext={() => {}}
        onBack={() => {}}
        onSkip={() => {}}
        {...(stepProps || {})}
      />
      <SaveButton saving={saving} saved={saved} onClick={handleSave} />
    </AccordionSection>
  );
}

// ── ContentTab ────────────────────────────────────────────────────────────────

export default function ContentTab({ propertyData, onSave }) {
  const pd = propertyData || {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

      {/* 1. Logement → wizardData.info */}
      <SectionEditor
        icon="🏠" label="Logement"
        propertyData={pd} onSave={onSave}
        getInit={p => p.info || {}}
        buildUpdate={(p, d) => ({ ...p, info: d })}
        StepComponent={Step1Logement}
      />

      {/* 2. Accès → wizardData.checkin */}
      <SectionEditor
        icon="🔑" label="Accès & Check-in"
        propertyData={pd} onSave={onSave}
        getInit={p => p.checkin || {}}
        buildUpdate={(p, d) => ({ ...p, checkin: d })}
        StepComponent={Step2Acces}
      />

      {/* 3. Règles → wizardData.rules */}
      <SectionEditor
        icon="📋" label="Règles"
        propertyData={pd} onSave={onSave}
        getInit={p => p.rules || {}}
        buildUpdate={(p, d) => ({ ...p, rules: d })}
        StepComponent={Step3Regles}
      />

      {/* 4. Équipements → wizardData.appliances */}
      <SectionEditor
        icon="🔧" label="Équipements"
        propertyData={pd} onSave={onSave}
        getInit={p => p.appliances || {}}
        buildUpdate={(p, d) => ({ ...p, appliances: d })}
        StepComponent={Step4Equipements}
      />

      {/* 5. Quartier → wizardData.location + recommendations + activities + transport */}
      <SectionEditor
        icon="📍" label="Quartier"
        propertyData={pd} onSave={onSave}
        getInit={p => ({
          location:        p.location        || {},
          recommendations: p.recommendations || {},
          activities:      p.activities      || {},
          transport:       p.transport       || {},
        })}
        buildUpdate={(p, d) => ({
          ...p,
          location:        d.location,
          recommendations: d.recommendations,
          activities:      d.activities,
          transport:       d.transport,
        })}
        StepComponent={Step5Quartier}
      />

      {/* 6. Contacts & WiFi → wizardData.info (merge contacts/wifi) */}
      <SectionEditor
        icon="📞" label="Contacts & WiFi"
        propertyData={pd} onSave={onSave}
        getInit={p => ({
          contacts:     p.info?.contacts     || [{}],
          wifiName:     p.info?.wifiName     || "",
          wifiPassword: p.info?.wifiPassword || "",
        })}
        buildUpdate={(p, d) => ({
          ...p,
          info: {
            ...(p.info || {}),
            contacts:     d.contacts,
            wifiName:     d.wifiName,
            wifiPassword: d.wifiPassword,
          },
        })}
        StepComponent={Step6Contacts}
      />

      {/* 7. Personnalité → wizardData.personality */}
      <SectionEditor
        icon="🎭" label="Personnalité"
        propertyData={pd} onSave={onSave}
        getInit={p => p.personality || {}}
        buildUpdate={(p, d) => ({ ...p, personality: d })}
        StepComponent={StepPersonality}
        stepProps={{ wizardContacts: pd.info?.contacts || [] }}
      />

    </div>
  );
}
