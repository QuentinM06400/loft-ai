"use client";
import { useState, useEffect, useCallback } from "react";
import { PROPERTY_SCHEMA, SCHEMA_GROUPS } from "@/app/lib/propertySchema";
import { DEFAULT_PROPERTY_DATA } from "@/app/lib/defaultContent";
import { Toast } from "./ui";

import InfoForm          from "./InfoForm";
import CheckinForm       from "./CheckinForm";
import RulesForm         from "./RulesForm";
import LightingForm      from "./LightingForm";
import WindowsForm       from "./WindowsForm";
import AppliancesForm    from "./AppliancesForm";
import TvForm            from "./TvForm";
import StorageForm       from "./StorageForm";
import LocationForm      from "./LocationForm";
import RecommendationsForm from "./RecommendationsForm";
import ActivitiesForm    from "./ActivitiesForm";
import TransportForm     from "./TransportForm";

// ── Map section id → form component ──────────────────────────────────────────

const SECTION_FORMS = {
  info:            InfoForm,
  checkin:         CheckinForm,
  rules:           RulesForm,
  lighting:        LightingForm,
  windows:         WindowsForm,
  appliances:      AppliancesForm,
  tv:              TvForm,
  storage:         StorageForm,
  location:        LocationForm,
  recommendations: RecommendationsForm,
  activities:      ActivitiesForm,
  transport:       TransportForm,
};

// ── Completion check ──────────────────────────────────────────────────────────

function getSectionRequired(sectionId) {
  const section = PROPERTY_SCHEMA.sections.find(s => s.id === sectionId);
  return (section?.fields || []).filter(f => f.required && f.type !== "repeatable" && f.type !== "toggle-list");
}

function checkCompletion(sectionId, data) {
  if (!data) return { touched: false, complete: false, missingCount: null };
  const required = getSectionRequired(sectionId);
  const missing = required.filter(f => {
    const v = data[f.id];
    return v === null || v === undefined || v === "";
  });
  return { touched: true, complete: missing.length === 0, missingCount: missing.length };
}

// ── Sidebar section item ──────────────────────────────────────────────────────

function SidebarItem({ section, isActive, onClick, data }) {
  const { touched, complete, missingCount } = checkCompletion(section.id, data);

  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        width: "100%", padding: "9px 14px",
        background: isActive ? "rgba(42,107,90,0.08)" : "transparent",
        border: "none", borderLeft: isActive ? "3px solid #2A6B5A" : "3px solid transparent",
        cursor: "pointer", fontFamily: "inherit", textAlign: "left",
        transition: "background .12s",
      }}
    >
      <span style={{ fontSize: 14 }}>{section.icon}</span>
      <span style={{
        fontSize: 12, fontWeight: isActive ? 600 : 400,
        color: isActive ? "#2A6B5A" : touched ? "#1A1A1A" : "#9A9A9A",
        flex: 1, lineHeight: 1.3,
      }}>{section.label}</span>
      {touched && complete && (
        <span style={{ fontSize: 14 }} title="Section complète">✅</span>
      )}
      {touched && !complete && missingCount > 0 && (
        <span style={{
          fontSize: 10, fontWeight: 600, color: "#C05A00", background: "rgba(240,140,0,0.1)",
          borderRadius: 8, padding: "2px 6px", flexShrink: 0,
        }}>
          {missingCount} champ{missingCount > 1 ? "s" : ""}
        </span>
      )}
    </button>
  );
}

// ── ContentTab ─────────────────────────────────────────────────────────────────

export default function ContentTab({ password }) {
  const [propertyData, setPropertyData] = useState(null);
  const [activeSection, setActiveSection] = useState("info");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  // Load
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/content", { headers: { "x-admin-password": password } });
        const d = await res.json();
        setPropertyData(d.propertyData || DEFAULT_PROPERTY_DATA);
      } catch {
        setPropertyData(DEFAULT_PROPERTY_DATA);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [password]);

  // Section data helpers
  const getSectionData = (sectionId) => {
    if (!propertyData) return DEFAULT_PROPERTY_DATA[sectionId] || {};
    return propertyData[sectionId] ?? DEFAULT_PROPERTY_DATA[sectionId] ?? {};
  };

  const handleSectionChange = useCallback((sectionId, sectionData) => {
    setPropertyData(prev => ({ ...prev, [sectionId]: sectionData }));
    setIsDirty(true);
  }, []);

  // Save
  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ propertyData }),
      });
      if (res.ok) {
        setIsDirty(false);
        showToast("Modifications sauvegardées ✓", "ok");
      } else {
        showToast("Erreur lors de la sauvegarde", "error");
      }
    } catch {
      showToast("Erreur lors de la sauvegarde", "error");
    } finally {
      setSaving(false);
    }
  }

  function showToast(msg, type) {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  // Section completion for progress bar
  const sections = PROPERTY_SCHEMA.sections;
  const completedCount = sections.filter(s => {
    const { complete } = checkCompletion(s.id, propertyData?.[s.id]);
    return complete;
  }).length;
  const totalSections = sections.length;

  // Group sections by schema groups
  const groupedSections = [
    { ...SCHEMA_GROUPS.essential,    id: "essential",    sections: sections.filter(s => s.group === "essential") },
    { ...SCHEMA_GROUPS.apartment,    id: "apartment",    sections: sections.filter(s => s.group === "apartment") },
    { ...SCHEMA_GROUPS.neighborhood, id: "neighborhood", sections: sections.filter(s => s.group === "neighborhood") },
  ];

  const activeSection_ = sections.find(s => s.id === activeSection);
  const FormComponent = SECTION_FORMS[activeSection];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 60, color: "#6B6B6B", fontSize: 13 }}>
        Chargement du contenu...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Progress bar */}
      <div style={{
        background: "#fff", borderRadius: 14,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "14px 18px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#1A1A1A" }}>Sections complétées</span>
          <span style={{
            fontSize: 12, fontWeight: 500,
            color: completedCount === totalSections ? "#2A6B5A" : "#6B6B6B",
          }}>
            {completedCount}/{totalSections}
          </span>
        </div>
        <div style={{ height: 6, borderRadius: 6, background: "rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 6, background: "#2A6B5A",
            width: `${(completedCount / totalSections) * 100}%`,
            transition: "width .4s ease",
          }} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {/* Sidebar */}
        <div style={{
          width: 220, flexShrink: 0, background: "#fff",
          borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          overflow: "hidden", paddingBottom: 6,
        }}>
          {groupedSections.map((group, gi) => (
            <div key={group.id}>
              <div style={{
                padding: gi === 0 ? "12px 14px 6px" : "14px 14px 6px",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ fontSize: 12 }}>{group.icon}</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: "#9A9A9A",
                  letterSpacing: "0.06em", textTransform: "uppercase",
                }}>{group.label}</span>
              </div>
              {group.sections.map(section => (
                <SidebarItem
                  key={section.id}
                  section={section}
                  isActive={section.id === activeSection}
                  onClick={() => setActiveSection(section.id)}
                  data={propertyData?.[section.id]}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Form area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Section header */}
          <div style={{
            background: "#fff", borderRadius: 14,
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            padding: "14px 18px", display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{ fontSize: 22 }}>{activeSection_?.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1A1A" }}>
                {activeSection_?.label}
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={!isDirty || saving}
              style={{
                padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                border: "none",
                background: isDirty && !saving ? "#2A6B5A" : "rgba(42,107,90,0.25)",
                color: "#fff", cursor: isDirty && !saving ? "pointer" : "default",
                fontFamily: "inherit",
                boxShadow: isDirty ? "0 3px 12px rgba(42,107,90,0.25)" : "none",
                transition: "all .15s",
              }}
            >
              {saving ? "Sauvegarde..." : "Sauvegarder"}
            </button>
          </div>

          {/* Form */}
          {FormComponent && (
            <div style={{
              background: "#fff", borderRadius: 14,
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "20px 22px",
            }}>
              <FormComponent
                data={getSectionData(activeSection)}
                onChange={(sectionData) => handleSectionChange(activeSection, sectionData)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      <Toast message={toast?.msg} type={toast?.type} />
    </div>
  );
}
