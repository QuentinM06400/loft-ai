"use client";
import { useState, useRef } from "react";
import { QuestionScreen, QuestionNav, ContinueButton, BigButtonChoice, C } from "../WizardUI";
import { APPLIANCE_CATEGORIES } from "@/app/lib/propertySchema";

// Build wizard categories: merge kitchen+smallKitchen, add 3 new ones
const WIZARD_CATS = [
  {
    id: "kitchen_all",
    label: "Cuisine",
    icon: "🍳",
    items: [
      ...(APPLIANCE_CATEGORIES.find(c => c.id === "kitchen")?.items || []),
      ...(APPLIANCE_CATEGORIES.find(c => c.id === "smallKitchen")?.items || []),
    ],
  },
  ...["maintenance", "comfort", "bathroom", "lighting", "tv", "storage"].map(id => {
    const cat = APPLIANCE_CATEGORIES.find(c => c.id === id);
    const icons = { maintenance: "🧺", comfort: "❄️", bathroom: "🚿", lighting: "💡", tv: "📺", storage: "🗄️" };
    return { id, label: cat?.label || id, icon: icons[id] || "🔧", items: cat?.items || [] };
  }),
];

function ToggleApplianceGrid({ cat, items, onChange }) {
  const [otherInput, setOtherInput] = useState("");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
        {cat.items.map(appliance => {
          const enabled = items[appliance.id]?.enabled;
          return (
            <button key={appliance.id} type="button" onClick={() => {
              const cur = items[appliance.id] || {};
              onChange({ ...items, [appliance.id]: { ...cur, enabled: !enabled } });
            }} style={{
              minHeight: 52, padding: "12px 14px", borderRadius: 14,
              border: enabled ? `2px solid ${C.green}` : "2px solid rgba(0,0,0,0.1)",
              background: enabled ? "rgba(42,107,90,0.08)" : "#fff",
              color: enabled ? C.green : "#1A1A1A",
              fontSize: 14, fontWeight: enabled ? 600 : 400,
              cursor: "pointer", fontFamily: C.font, textAlign: "left",
              display: "flex", alignItems: "center", gap: 6, transition: "all .15s",
            }}>
              {enabled ? "✓ " : ""}{appliance.label}
            </button>
          );
        })}
      </div>
      {/* Autre (préciser) */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          value={otherInput}
          onChange={e => setOtherInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && otherInput.trim()) {
              e.preventDefault();
              const id = `custom_${cat.id}_${Date.now()}`;
              onChange({ ...items, [id]: { enabled: true, label: otherInput.trim(), isCustom: true } });
              setOtherInput("");
            }
          }}
          placeholder="Autre (préciser)..."
          style={{
            flex: 1, padding: "10px 14px", borderRadius: 14,
            border: "2px dashed rgba(0,0,0,0.12)", background: "#fff",
            fontFamily: C.font, fontSize: 14, outline: "none",
          }}
        />
        <button
          type="button"
          disabled={!otherInput.trim()}
          onClick={() => {
            if (!otherInput.trim()) return;
            const id = `custom_${cat.id}_${Date.now()}`;
            onChange({ ...items, [id]: { enabled: true, label: otherInput.trim(), isCustom: true } });
            setOtherInput("");
          }}
          style={{
            padding: "0 16px", height: 44, borderRadius: 12, border: "none",
            background: otherInput.trim() ? C.green : "rgba(0,0,0,0.08)",
            color: "#fff", fontSize: 13, fontWeight: 600,
            cursor: otherInput.trim() ? "pointer" : "default", fontFamily: C.font,
          }}
        >+ Ajouter</button>
      </div>
      {/* Show custom items added for this category */}
      {Object.entries(items).filter(([id, v]) => v?.isCustom && id.startsWith(`custom_${cat.id}_`) && v.enabled).map(([id, v]) => (
        <div key={id} style={{
          display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
          background: "rgba(42,107,90,0.06)", borderRadius: 10, border: `1px solid rgba(42,107,90,0.15)`,
        }}>
          <span style={{ flex: 1, fontSize: 13, color: C.green, fontWeight: 500 }}>✓ {v.label}</span>
          <button type="button" onClick={() => onChange({ ...items, [id]: { ...v, enabled: false } })} style={{
            width: 24, height: 24, borderRadius: 6, border: "none",
            background: "rgba(229,62,62,0.08)", color: "#E53E3E", cursor: "pointer", fontSize: 12,
          }}>✕</button>
        </div>
      ))}
    </div>
  );
}

function SummaryItem({ applianceId, applianceLabel, itemData, onUpdate, onRemove }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ brandModel: itemData.brandModel || "", location: itemData.location || "" });

  function save() {
    onUpdate({ ...itemData, brandModel: draft.brandModel, location: draft.location });
    setOpen(false);
  }

  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden" }}>
      <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A" }}>{applianceLabel}</div>
          {(itemData.brandModel || itemData.location) && (
            <div style={{ fontSize: 12, color: "#6B6B6B", marginTop: 2 }}>
              {[itemData.brandModel, itemData.location].filter(Boolean).join(" · ")}
            </div>
          )}
        </div>
        <button type="button" onClick={() => setOpen(o => !o)} style={{
          padding: "6px 12px", borderRadius: 8, border: `1px solid ${C.green}`,
          background: "none", color: C.green, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: C.font,
        }}>{open ? "Fermer" : itemData.brandModel ? "Modifier" : "Ajouter détails"}</button>
        <button type="button" onClick={onRemove} style={{
          width: 28, height: 28, borderRadius: 6, border: "none",
          background: "rgba(229,62,62,0.08)", color: "#E53E3E", cursor: "pointer", fontSize: 13,
        }}>✕</button>
      </div>
      {open && (
        <div style={{ padding: "0 14px 14px", borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: 8 }}>
          <input value={draft.brandModel} onChange={e => setDraft(d => ({ ...d, brandModel: e.target.value }))}
            placeholder="Marque & Modèle (ex : AEG BPB331021B)" style={inpStyle} />
          <input value={draft.location} onChange={e => setDraft(d => ({ ...d, location: e.target.value }))}
            placeholder="Emplacement (ex : À gauche de l'évier)" style={inpStyle} />
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={save} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: C.green, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: C.font }}>✓ Valider</button>
            <button type="button" onClick={() => setOpen(false)} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)", background: "#fff", color: "#6B6B6B", fontSize: 13, cursor: "pointer", fontFamily: C.font }}>Plus tard</button>
          </div>
        </div>
      )}
    </div>
  );
}

const inpStyle = { padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)", fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" };

// ── Multi-chip select (for category detail fields) ──────────────────────────
function MultiChipSelect({ options, value = [], onChange, label }) {
  const toggle = (opt) => {
    const next = value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt];
    onChange(next);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <div style={{ fontSize: 12, color: "#6B6B6B", fontWeight: 500 }}>{label}</div>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {options.map(opt => {
          const sel = value.includes(opt);
          return (
            <button key={opt} type="button" onClick={() => toggle(opt)} style={{
              padding: "6px 12px", borderRadius: 20, fontFamily: C.font,
              border: sel ? `2px solid ${C.green}` : "2px solid rgba(0,0,0,0.1)",
              background: sel ? "rgba(42,107,90,0.1)" : "#fff",
              color: sel ? C.green : "#1A1A1A",
              fontSize: 12, fontWeight: sel ? 600 : 400, cursor: "pointer", transition: "all .15s",
            }}>{sel ? "✓ " : ""}{opt}</button>
          );
        })}
      </div>
    </div>
  );
}

// ── Yes/No chip ──────────────────────────────────────────────────────────────
function YesNoChip({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {["Oui", "Non"].map(opt => {
        const sel = value === opt;
        return (
          <button key={opt} type="button" onClick={() => onChange(opt)} style={{
            flex: 1, height: 40, borderRadius: 10,
            border: sel ? `2px solid ${C.green}` : "2px solid rgba(0,0,0,0.1)",
            background: sel ? C.green : "#fff",
            color: sel ? "#fff" : "#1A1A1A",
            fontSize: 13, fontWeight: sel ? 600 : 400, cursor: "pointer", fontFamily: C.font,
          }}>{opt}</button>
        );
      })}
    </div>
  );
}

const detailSection = {
  display: "flex", flexDirection: "column", gap: 12,
  paddingTop: 12, marginTop: 4, borderTop: "1px solid rgba(0,0,0,0.06)",
};
const detailLabel = { fontSize: 12, color: "#6B6B6B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" };
const subLabel = { fontSize: 13, color: "#1A1A1A", marginBottom: 4 };

// ── Lighting category form ───────────────────────────────────────────────────
function LightingCategoryForm({ cat, items, details, onItemsChange, onDetailsChange }) {
  const d = details || {};
  const set = (k, v) => onDetailsChange({ ...d, [k]: v });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <ToggleApplianceGrid cat={cat} items={items} onChange={onItemsChange} />
      <div style={detailSection}>
        <div style={detailLabel}>Détails supplémentaires</div>
        <MultiChipSelect
          label="Types d'interrupteurs"
          options={["Standard", "Variateur", "Tactile", "Va-et-vient"]}
          value={d.switchTypes || []}
          onChange={v => set("switchTypes", v)}
        />
        {(items.shutters?.enabled || items.blinds?.enabled) && (
          <MultiChipSelect
            label="Type de volets / stores"
            options={["Manuel", "Électrique", "Télécommande"]}
            value={d.shutterType || []}
            onChange={v => set("shutterType", v)}
          />
        )}
        {items.skylights?.enabled && (
          <MultiChipSelect
            label="Type de Velux"
            options={["Ouvrant", "Fixe", "Avec store"]}
            value={d.veluxType || []}
            onChange={v => set("veluxType", v)}
          />
        )}
        <div>
          <div style={subLabel}>Luminaires spéciaux à signaler aux locataires</div>
          <input value={d.specialLighting || ""} onChange={e => set("specialLighting", e.target.value)}
            placeholder="Ex : Lustre à variateur dans le salon, spots sous-meubles cuisine..." style={inpStyle} />
        </div>
      </div>
    </div>
  );
}

// ── TV category form ─────────────────────────────────────────────────────────
function TvCategoryForm({ cat, items, details, onItemsChange, onDetailsChange }) {
  const d = details || {};
  const set = (k, v) => onDetailsChange({ ...d, [k]: v });
  const STREAMING = ["Netflix", "Disney+", "Prime Video", "Apple TV+", "Canal+", "YouTube"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <ToggleApplianceGrid cat={cat} items={items} onChange={onItemsChange} />
      <div style={detailSection}>
        <div style={detailLabel}>Détails</div>
        <input value={d.tvBrandModel || ""} onChange={e => set("tvBrandModel", e.target.value)}
          placeholder="Marque et modèle TV (ex : Samsung 65' QLED)" style={inpStyle} />
        <input value={d.boxBrandModel || ""} onChange={e => set("boxBrandModel", e.target.value)}
          placeholder="Box internet — opérateur et modèle (ex : Orange Livebox 5)" style={inpStyle} />
        <input value={d.hdmiInputs || ""} onChange={e => set("hdmiInputs", e.target.value)}
          placeholder="Entrées disponibles (ex : HDMI 1 = PS5, HDMI 2 = Chromecast)" style={inpStyle} />
        <MultiChipSelect
          label="Services streaming accessibles"
          options={STREAMING}
          value={d.streamingServices || []}
          onChange={v => set("streamingServices", v)}
        />
        <input value={d.remotesInfo || ""} onChange={e => set("remotesInfo", e.target.value)}
          placeholder="Télécommandes — nombre et emplacement (ex : 2 sur la table basse)" style={inpStyle} />
      </div>
    </div>
  );
}

// ── Storage category form ────────────────────────────────────────────────────
function StorageCategoryForm({ cat, items, details, onItemsChange, onDetailsChange }) {
  const d = details || {};
  const set = (k, v) => onDetailsChange({ ...d, [k]: v });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <ToggleApplianceGrid cat={cat} items={items} onChange={onItemsChange} />
      <div style={detailSection}>
        <div style={detailLabel}>Détails</div>
        <div>
          <div style={subLabel}>Draps et serviettes fournis ?</div>
          <YesNoChip value={d.linensProvided} onChange={v => set("linensProvided", v)} />
          {d.linensProvided === "Oui" && (
            <input value={d.linensLocation || ""} onChange={e => set("linensLocation", e.target.value)}
              placeholder="Emplacement (ex : Armoire couloir, étagère du bas)" style={{ ...inpStyle, marginTop: 8 }} />
          )}
        </div>
        <div>
          <div style={subLabel}>Produits ménagers fournis ?</div>
          <YesNoChip value={d.cleaningProvided} onChange={v => set("cleaningProvided", v)} />
          {d.cleaningProvided === "Oui" && (
            <input value={d.cleaningLocation || ""} onChange={e => set("cleaningLocation", e.target.value)}
              placeholder="Emplacement" style={{ ...inpStyle, marginTop: 8 }} />
          )}
        </div>
        <div>
          <div style={subLabel}>Tri sélectif ?</div>
          <YesNoChip value={d.recycling} onChange={v => set("recycling", v)} />
          <input value={d.binLocation || ""} onChange={e => set("binLocation", e.target.value)}
            placeholder="Emplacement des bacs / poubelles" style={{ ...inpStyle, marginTop: 8 }} />
        </div>
        <input value={d.guestClosets || ""} onChange={e => set("guestClosets", e.target.value)}
          placeholder="Placards / rangements réservés aux locataires" style={inpStyle} />
      </div>
    </div>
  );
}

export default function Step4Equipements({ data = {}, onChange, onNext, onBack, onSkip }) {
  const items = data.items || {};
  const setItems = (newItems) => onChange({ ...data, items: newItems });
  const setDetails = (key, val) => onChange({ ...data, [key]: val });

  // screens: "intro" | 0..N-1 (categories) | "summary"
  const [screen, setScreen] = useState("intro");
  const [vis, setVis] = useState(true);
  const screenHist = useRef([]);

  function goTo(s) {
    setVis(false);
    setTimeout(() => { setScreen(s); setVis(true); window.scrollTo({ top: 0, behavior: "instant" }); }, 400);
  }
  function fwd(s) { screenHist.current = [...screenHist.current, screen]; goTo(s); }
  function bk() {
    const p = screenHist.current[screenHist.current.length - 1];
    if (p === undefined) onBack?.(); else { screenHist.current = screenHist.current.slice(0, -1); goTo(p); }
  }

  // All enabled standard items for summary
  const allKnownIds = APPLIANCE_CATEGORIES.flatMap(cat => cat.items.map(a => a.id));
  const allSelected = Object.entries(items)
    .filter(([id, v]) => v?.enabled)
    .map(([id, v]) => ({
      id,
      label: v.isCustom
        ? v.label
        : (APPLIANCE_CATEGORIES.flatMap(c => c.items).find(a => a.id === id)?.label || id),
    }));

  return (
    <>
      {screen === "intro" && (
        <QuestionScreen title="Quels équipements sont disponibles dans votre logement ?" sub="Cochez ceux qui sont présents — vous pourrez ajouter les détails maintenant ou plus tard." visible={vis}>
          <ContinueButton onClick={() => fwd(0)} label="Commencer →" />
          <QuestionNav onBack={bk} onSkip={() => fwd("summary")} skipLabel="Passer" />
        </QuestionScreen>
      )}
      {typeof screen === "number" && screen >= 0 && screen < WIZARD_CATS.length && (() => {
        const cat = WIZARD_CATS[screen];
        const nextScreen = screen < WIZARD_CATS.length - 1 ? screen + 1 : "summary";
        let content;
        if (cat.id === "lighting") {
          content = (
            <LightingCategoryForm
              cat={cat} items={items} details={data.lightingDetails}
              onItemsChange={setItems} onDetailsChange={v => setDetails("lightingDetails", v)}
            />
          );
        } else if (cat.id === "tv") {
          content = (
            <TvCategoryForm
              cat={cat} items={items} details={data.tvDetails}
              onItemsChange={setItems} onDetailsChange={v => setDetails("tvDetails", v)}
            />
          );
        } else if (cat.id === "storage") {
          content = (
            <StorageCategoryForm
              cat={cat} items={items} details={data.storageDetails}
              onItemsChange={setItems} onDetailsChange={v => setDetails("storageDetails", v)}
            />
          );
        } else {
          content = <ToggleApplianceGrid cat={cat} items={items} onChange={setItems} />;
        }
        return (
          <QuestionScreen title={`${cat.icon} ${cat.label}`} visible={vis}>
            {content}
            <ContinueButton onClick={() => fwd(nextScreen)} />
            <QuestionNav onBack={bk} onSkip={() => fwd(nextScreen)} skipLabel="Passer" />
          </QuestionScreen>
        );
      })()}
      {screen === "summary" && (
        <QuestionScreen
          title="Récapitulatif de vos équipements"
          sub={allSelected.length > 0
            ? `${allSelected.length} appareil(s) sélectionné(s) — ajoutez les détails pour enrichir votre concierge.`
            : "Aucun appareil sélectionné pour l'instant."
          }
          visible={vis}
        >
          {/* Mode d'emploi hint */}
          <div style={{
            padding: "12px 14px", borderRadius: 10,
            background: "rgba(42,107,90,0.06)", border: "1px solid rgba(42,107,90,0.15)",
            fontSize: 13, color: "#2A6B5A", lineHeight: 1.6, marginBottom: 8,
          }}>
            💡 Les équipements renseignés permettront au concierge de guider vos locataires avec le mode d'emploi adapté.
          </div>
          {allSelected.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
              {allSelected.map(a => (
                <SummaryItem
                  key={a.id}
                  applianceId={a.id}
                  applianceLabel={a.label}
                  itemData={items[a.id] || {}}
                  onUpdate={updated => setItems({ ...items, [a.id]: updated })}
                  onRemove={() => setItems({ ...items, [a.id]: { ...items[a.id], enabled: false } })}
                />
              ))}
            </div>
          )}
          <ContinueButton onClick={onNext} label="Étape suivante →" />
          <QuestionNav onBack={bk} onSkip={onNext} skipLabel="Passer" />
        </QuestionScreen>
      )}
    </>
  );
}
