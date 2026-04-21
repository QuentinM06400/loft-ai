"use client";
import { QuestionNav, C } from "../WizardUI";
import { PROPERTY_SCHEMA } from "@/app/lib/propertySchema";

function getCompletionForSection(sectionId, propertyData) {
  const section = PROPERTY_SCHEMA.sections.find(s => s.id === sectionId);
  if (!section) return null;
  const data = propertyData[sectionId];
  if (!data) return { touched: false };
  const required = section.fields.filter(f => f.required && f.type !== "repeatable" && f.type !== "toggle-list");
  const missing = required.filter(f => {
    const v = data[f.id];
    return v === null || v === undefined || v === "";
  });
  return { touched: true, complete: missing.length === 0, missingCount: missing.length };
}

function SectionSummary({ section, propertyData, onComplete }) {
  const status = getCompletionForSection(section.id, propertyData);
  const data = propertyData[section.id];

  // Build 2-3 line summary
  let preview = [];
  if (section.id === "info" && data) {
    if (data.address) preview.push(`📍 ${data.address}, ${data.city || ""}`);
    if (data.maxGuests) preview.push(`👥 ${data.maxGuests} voyageurs max`);
    if (data.propertyType) preview.push(`🏠 ${data.propertyType}`);
  } else if (section.id === "checkin" && data) {
    if (data.checkinTime) preview.push(`✈️ Arrivée : ${data.checkinTime}`);
    if (data.checkoutTime) preview.push(`🚀 Départ : ${data.checkoutTime}`);
    if (data.accessMode) preview.push(`🔑 ${data.accessMode}`);
  } else if (section.id === "rules" && data) {
    if (data.quietHoursStart) preview.push(`🔇 Silence à partir de ${data.quietHoursStart}`);
    if (data.smokingPolicy) preview.push(`🚬 ${data.smokingPolicy}`);
    if (data.petsAllowed) preview.push(`🐾 Animaux : ${data.petsAllowed}`);
  } else if (section.id === "appliances" && data?.items) {
    const count = Object.values(data.items).filter(v => v?.enabled).length;
    if (count > 0) preview.push(`${count} appareil(s) configuré(s)`);
  } else if (section.id === "tv" && data) {
    if (data.tvModel) preview.push(`📺 ${data.tvModel}`);
    if (data.streamingServices?.length) preview.push(data.streamingServices.join(", "));
  } else if (section.id === "location" && data?.pointsOfInterest?.length) {
    preview.push(`${data.pointsOfInterest.length} point(s) d'intérêt`);
  } else if (section.id === "recommendations" && data?.categories) {
    const count = Object.values(data.categories).filter(c => c?.enabled).length;
    if (count > 0) preview.push(`${count} catégorie(s) de recommandations`);
  } else if (section.id === "activities" && data?.categories) {
    const count = Object.values(data.categories).filter(c => c?.enabled).length;
    if (count > 0) preview.push(`${count} catégorie(s) d'activités`);
  } else if (section.id === "transport" && data?.categories) {
    const count = Object.values(data.categories).filter(c => c?.enabled).length;
    if (count > 0) preview.push(`${count} moyen(s) de transport`);
  }

  const isComplete = status?.complete;
  const isTouched  = status?.touched;

  return (
    <div style={{
      background: "#fff", borderRadius: 14, padding: "14px 16px",
      border: isComplete
        ? "1px solid rgba(42,107,90,0.2)"
        : isTouched
          ? "1px solid rgba(240,140,0,0.2)"
          : "1px solid rgba(0,0,0,0.08)",
      display: "flex", alignItems: "flex-start", gap: 12,
      opacity: !isTouched ? 0.6 : 1,
    }}>
      <span style={{ fontSize: 22, flexShrink: 0 }}>{section.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: preview.length ? 6 : 0 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1A1A" }}>{section.label}</span>
          {isComplete && <span style={{ fontSize: 13 }}>✅</span>}
          {isTouched && !isComplete && (
            <span style={{
              fontSize: 10, fontWeight: 600, color: "#C05A00",
              background: "rgba(240,140,0,0.1)", borderRadius: 8, padding: "2px 7px",
            }}>À compléter</span>
          )}
        </div>
        {preview.length > 0 && (
          <div style={{ fontSize: 12, color: "#6B6B6B", lineHeight: 1.6 }}>
            {preview.slice(0, 3).join(" · ")}
          </div>
        )}
      </div>
      {isTouched && !isComplete && (
        <button
          type="button"
          onClick={() => onComplete(section.id)}
          style={{
            padding: "4px 10px", borderRadius: 8, border: `1px solid ${C.green}`,
            background: "none", color: C.green, fontSize: 11, fontWeight: 600,
            cursor: "pointer", fontFamily: C.font, flexShrink: 0,
          }}
        >Compléter</button>
      )}
    </div>
  );
}

export default function Step7Recapitulatif({ propertyData, onActivate, onComplete, onBack, saving }) {
  const sections = PROPERTY_SCHEMA.sections;
  const touchedCount = sections.filter(s => propertyData[s.id]).length;
  const completedCount = sections.filter(s => {
    const st = getCompletionForSection(s.id, propertyData);
    return st?.complete;
  }).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "24px 0" }}>
      <QuestionNav onBack={onBack} />
      {/* Header */}
      <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
        <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: "#1A1A1A" }}>
          Votre concierge est presque prêt !
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: "#6B6B6B" }}>
          Vous avez renseigné <strong style={{ color: C.green }}>{touchedCount}/12 sections</strong> — votre concierge peut déjà répondre aux questions de base !
        </p>
      </div>

      {/* Progress */}
      <div style={{ height: 8, borderRadius: 8, background: "rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 8, background: C.green,
          width: `${(completedCount / sections.length) * 100}%`,
          transition: "width .4s ease",
        }} />
      </div>

      {/* Sections grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sections.map(section => (
          <SectionSummary
            key={section.id}
            section={section}
            propertyData={propertyData}
            onComplete={onComplete}
          />
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 8 }}>
        <button
          type="button"
          onClick={onActivate}
          disabled={saving}
          style={{
            width: "100%", height: 56, borderRadius: 14, border: "none",
            background: saving ? "rgba(42,107,90,0.4)" : C.green,
            color: "#fff", fontSize: 16, fontWeight: 700, cursor: saving ? "default" : "pointer",
            fontFamily: C.font, boxShadow: saving ? "none" : "0 6px 20px rgba(42,107,90,0.35)",
            transition: "all .15s",
          }}
        >
          {saving ? "Activation en cours..." : "🚀 Activer mon concierge"}
        </button>
        <button
          type="button"
          onClick={() => onComplete(null)}
          style={{
            width: "100%", height: 48, borderRadius: 14,
            border: "2px solid rgba(0,0,0,0.1)", background: "#fff",
            color: "#1A1A1A", fontSize: 14, fontWeight: 500, cursor: "pointer",
            fontFamily: C.font, transition: "background .15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#F5F5F3"}
          onMouseLeave={e => e.currentTarget.style.background = "#fff"}
        >
          Compléter les sections manquantes dans l'admin →
        </button>
      </div>
    </div>
  );
}
