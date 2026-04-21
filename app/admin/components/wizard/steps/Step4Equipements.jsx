"use client";
import { useState, useRef } from "react";
import { QuestionScreen, QuestionNav, ContinueButton, BigButtonChoice, BigTextarea, C } from "../WizardUI";
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

// ── Lighting sub-wizard (Fenêtres / Fermetures / Lumières) ───────────────────
function LightingSubWizard({ data = {}, onChange, onNext, onBack, outerVis }) {
  const lw = data.lightingWizard || {};
  const set = (k, v) => onChange({ ...data, lightingWizard: { ...lw, [k]: v } });

  const [q, setQ] = useState(0);
  const [vis, setVis] = useState(true);
  const hist = useRef([]);

  function goTo(n) {
    setVis(false);
    setTimeout(() => { setQ(n); setVis(true); window.scrollTo({ top: 0, behavior: "instant" }); }, 400);
  }
  function fwd(n) { hist.current = [...hist.current, q]; goTo(n); }
  function bk() {
    const p = hist.current[hist.current.length - 1];
    if (p === undefined) onBack?.(); else { hist.current = hist.current.slice(0, -1); goTo(p); }
  }

  const combined = vis && (outerVis !== false);
  const closureTypes = lw.closureTypes || [];
  const hasStores = closureTypes.includes("Stores");
  const onlyAucun = closureTypes.length === 1 && closureTypes.includes("Aucun");
  const lightingTypes = lw.lightingTypes || [];
  const hasLightingContent = lightingTypes.some(t => t !== "Aucune") && lightingTypes.length > 0;
  const openingScopes = lw.openingScopes || [];
  const storesTypes = lw.storesTypes || [];

  function toggleClosure(type) {
    const next = closureTypes.includes(type) ? closureTypes.filter(t => t !== type) : [...closureTypes, type];
    set("closureTypes", next);
  }

  return (
    <>
      {/* ── FENÊTRES Q1 ── */}
      {q === 0 && (
        <QuestionScreen title="Avez-vous des instructions spécifiques sur vos ouvrants ?" visible={combined}>
          <p style={{ margin: "0 0 16px", fontSize: 13, color: "#9CA3AF", fontStyle: "italic" }}>
            Ex : velux avec télécommande, fenêtre nécessitant une forte pression...
          </p>
          <BigButtonChoice
            options={["Oui", "Non"]}
            value={lw.hasOpeningInstructions}
            onChange={v => { set("hasOpeningInstructions", v); fwd(v === "Non" ? 2 : 1); }}
            columns={2}
          />
          <QuestionNav onBack={hist.current.length > 0 ? bk : onBack} onSkip={() => fwd(2)} />
        </QuestionScreen>
      )}

      {/* ── FENÊTRES Q2 ── */}
      {q === 1 && (
        <QuestionScreen title="Ces instructions concernent..." visible={combined}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {["Tous les ouvrants", "Des ouvrants spécifiques"].map(opt => {
              const sel = openingScopes.includes(opt);
              const next = sel ? openingScopes.filter(s => s !== opt) : [...openingScopes, opt];
              return (
                <button key={opt} type="button" onClick={() => set("openingScopes", next)} style={{
                  minHeight: 52, padding: "12px 16px", borderRadius: 14,
                  border: sel ? `2px solid ${C.green}` : "2px solid rgba(0,0,0,0.1)",
                  background: sel ? C.green : "#fff", color: sel ? "#fff" : "#1A1A1A",
                  fontSize: 15, fontWeight: sel ? 600 : 400,
                  cursor: "pointer", fontFamily: C.font, transition: "all .15s",
                  boxShadow: sel ? "0 3px 12px rgba(42,107,90,0.25)" : "none",
                }}>{sel ? "✓ " : ""}{opt}</button>
              );
            })}
            {openingScopes.includes("Tous les ouvrants") && (
              <BigTextarea
                value={lw.openingGeneralInstructions || ""}
                onChange={v => set("openingGeneralInstructions", v)}
                placeholder="Instructions générales pour tous les ouvrants..."
                rows={3}
              />
            )}
            {openingScopes.includes("Des ouvrants spécifiques") && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(lw.openingSpecificItems || [{ room: "", location: "", instructions: "" }]).map((item, i) => {
                  const allItems = lw.openingSpecificItems || [{ room: "", location: "", instructions: "" }];
                  const upd = (f, v) => set("openingSpecificItems", allItems.map((it, idx) => idx === i ? { ...it, [f]: v } : it));
                  return (
                    <div key={i} style={{ background: "#f9f9f9", borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", gap: 8, border: "1px solid rgba(0,0,0,0.08)" }}>
                      {allItems.length > 1 && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 12, color: "#6B6B6B", fontWeight: 600 }}>Ouvrant {i + 1}</span>
                          <button type="button" onClick={() => set("openingSpecificItems", allItems.filter((_, idx) => idx !== i))} style={{ width: 24, height: 24, borderRadius: 6, border: "none", background: "rgba(229,62,62,0.08)", color: "#E53E3E", cursor: "pointer", fontSize: 12 }}>✕</button>
                        </div>
                      )}
                      <input value={item.room || ""} onChange={e => upd("room", e.target.value)} placeholder="Pièce (ex : Chambre 1)" style={inpStyle} />
                      <input value={item.location || ""} onChange={e => upd("location", e.target.value)} placeholder="Emplacement exact (ex : Fenêtre côté rue)" style={inpStyle} />
                      <textarea value={item.instructions || ""} onChange={e => upd("instructions", e.target.value)} placeholder="Instructions" rows={2} style={{ ...inpStyle, resize: "vertical" }} />
                    </div>
                  );
                })}
                <button type="button" onClick={() => set("openingSpecificItems", [...(lw.openingSpecificItems || []), { room: "", location: "", instructions: "" }])} style={{ padding: "10px 16px", borderRadius: 10, border: "2px dashed rgba(42,107,90,0.4)", background: "rgba(42,107,90,0.04)", color: C.green, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: C.font }}>+ Ajouter un ouvrant</button>
              </div>
            )}
            {openingScopes.length > 0 && <ContinueButton onClick={() => fwd(2)} />}
          </div>
          <QuestionNav onBack={bk} onSkip={() => fwd(2)} />
        </QuestionScreen>
      )}

      {/* ── FERMETURES Q1 ── */}
      {q === 2 && (
        <QuestionScreen title="Type de fermeture de vos ouvrants ?" sub="Vous pouvez sélectionner plusieurs options." visible={combined}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
              {["Stores", "Volets", "Aucun"].map(type => {
                const sel = closureTypes.includes(type);
                return (
                  <button key={type} type="button" onClick={() => toggleClosure(type)} style={{
                    minHeight: 52, padding: "12px 24px", borderRadius: 14,
                    border: sel ? `2px solid ${C.green}` : "2px solid rgba(0,0,0,0.1)",
                    background: sel ? C.green : "#fff", color: sel ? "#fff" : "#1A1A1A",
                    fontSize: 16, fontWeight: sel ? 700 : 400, cursor: "pointer", fontFamily: C.font, transition: "all .15s",
                  }}>{sel ? "✓ " : ""}{type}</button>
                );
              })}
              <button type="button" onClick={() => { set("closureHasAutre", !lw.closureHasAutre); if (lw.closureHasAutre) set("closureAutreLabel", ""); }} style={{
                minHeight: 52, padding: "12px 24px", borderRadius: 14,
                border: lw.closureHasAutre ? `2px solid ${C.green}` : "2px solid rgba(0,0,0,0.1)",
                background: lw.closureHasAutre ? "rgba(42,107,90,0.09)" : "#fff",
                color: lw.closureHasAutre ? C.green : "#6B6B6B",
                fontSize: 16, cursor: "pointer", fontFamily: C.font, transition: "all .15s",
              }}>Autre</button>
            </div>
            {lw.closureHasAutre && (
              <input value={lw.closureAutreLabel || ""} onChange={e => set("closureAutreLabel", e.target.value)} placeholder="Précisez le type de fermeture..." style={inpStyle} />
            )}
            <ContinueButton onClick={() => { if (onlyAucun) fwd(5); else if (hasStores) fwd(3); else fwd(4); }} />
          </div>
          <QuestionNav onBack={bk} onSkip={() => fwd(5)} />
        </QuestionScreen>
      )}

      {/* ── FERMETURES Q2 (stores type) ── */}
      {q === 3 && (
        <QuestionScreen title="Stores manuels ou télécommandés ?" visible={combined}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {["Manuels", "Télécommandés"].map(opt => {
                const sel = storesTypes.includes(opt);
                const next = sel ? storesTypes.filter(t => t !== opt) : [...storesTypes, opt];
                return (
                  <button key={opt} type="button" onClick={() => set("storesTypes", next)} style={{
                    minHeight: 52, padding: "12px 16px", borderRadius: 14,
                    border: sel ? `2px solid ${C.green}` : "2px solid rgba(0,0,0,0.1)",
                    background: sel ? C.green : "#fff", color: sel ? "#fff" : "#1A1A1A",
                    fontSize: 15, fontWeight: sel ? 600 : 400,
                    cursor: "pointer", fontFamily: C.font, transition: "all .15s",
                    boxShadow: sel ? "0 3px 12px rgba(42,107,90,0.25)" : "none",
                  }}>{sel ? "✓ " : ""}{opt}</button>
                );
              })}
            </div>
            {storesTypes.includes("Manuels") && (
              <input value={lw.storesManualNote || ""} onChange={e => set("storesManualNote", e.target.value)} placeholder="Précisez si des instructions spécifiques sont nécessaires" style={inpStyle} />
            )}
            {storesTypes.includes("Télécommandés") && (
              <input value={lw.storesRemoteLocation || ""} onChange={e => set("storesRemoteLocation", e.target.value)} placeholder="Précisez l'emplacement des télécommandes (ex : tiroir salon, crochet entrée...)" style={inpStyle} />
            )}
            <ContinueButton onClick={() => fwd(4)} />
          </div>
          <QuestionNav onBack={bk} onSkip={() => fwd(4)} />
        </QuestionScreen>
      )}

      {/* ── FERMETURES Q3 (instructions) ── */}
      {q === 4 && (
        <QuestionScreen title="Instructions spécifiques pour les fermetures ?" visible={combined}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <BigButtonChoice
              options={["Toutes les fermetures", "Fermetures spécifiques", "Aucune"]}
              value={lw.closureInstructionType}
              onChange={v => { set("closureInstructionType", v); if (v === "Aucune") fwd(5); }}
              columns={1}
            />
            {lw.closureInstructionType === "Toutes les fermetures" && (
              <>
                <BigTextarea value={lw.closureGeneralInstructions || ""} onChange={v => set("closureGeneralInstructions", v)} placeholder="Instructions générales pour toutes les fermetures..." rows={3} />
                <ContinueButton onClick={() => fwd(5)} />
              </>
            )}
            {lw.closureInstructionType === "Fermetures spécifiques" && (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(lw.closureSpecificItems || [{ opening: "", instructions: "" }]).map((item, i) => {
                    const allItems = lw.closureSpecificItems || [{ opening: "", instructions: "" }];
                    const upd = (f, v) => set("closureSpecificItems", allItems.map((it, idx) => idx === i ? { ...it, [f]: v } : it));
                    return (
                      <div key={i} style={{ background: "#f9f9f9", borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", gap: 8, border: "1px solid rgba(0,0,0,0.08)" }}>
                        {allItems.length > 1 && (
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 12, color: "#6B6B6B", fontWeight: 600 }}>Fermeture {i + 1}</span>
                            <button type="button" onClick={() => set("closureSpecificItems", allItems.filter((_, idx) => idx !== i))} style={{ width: 24, height: 24, borderRadius: 6, border: "none", background: "rgba(229,62,62,0.08)", color: "#E53E3E", cursor: "pointer", fontSize: 12 }}>✕</button>
                          </div>
                        )}
                        <input value={item.opening || ""} onChange={e => upd("opening", e.target.value)} placeholder="Quelle fermeture ? (ex : Volet chambre principale)" style={inpStyle} />
                        <textarea value={item.instructions || ""} onChange={e => upd("instructions", e.target.value)} placeholder="Instructions" rows={2} style={{ ...inpStyle, resize: "vertical" }} />
                      </div>
                    );
                  })}
                  <button type="button" onClick={() => set("closureSpecificItems", [...(lw.closureSpecificItems || []), { opening: "", instructions: "" }])} style={{ padding: "10px 16px", borderRadius: 10, border: "2px dashed rgba(42,107,90,0.4)", background: "rgba(42,107,90,0.04)", color: C.green, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: C.font }}>+ Ajouter</button>
                </div>
                <ContinueButton onClick={() => fwd(5)} />
              </>
            )}
          </div>
          <QuestionNav onBack={bk} onSkip={() => fwd(5)} />
        </QuestionScreen>
      )}

      {/* ── LUMIÈRES Q1 ── */}
      {q === 5 && (
        <QuestionScreen title="Instructions spécifiques sur les lumières ?" visible={combined}>
          <p style={{ margin: "0 0 16px", fontSize: 13, color: "#9CA3AF", fontStyle: "italic" }}>
            Ex : interrupteur terrasse caché, LED avec interrupteur discret...
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
              {["Utilisation", "Emplacements", "Aucune"].map(type => {
                const sel = lightingTypes.includes(type);
                return (
                  <button key={type} type="button" onClick={() => {
                    let next;
                    if (type === "Aucune") {
                      next = sel ? [] : ["Aucune"];
                    } else {
                      next = sel ? lightingTypes.filter(t => t !== type) : [...lightingTypes.filter(t => t !== "Aucune"), type];
                    }
                    set("lightingTypes", next);
                    if (next.includes("Aucune")) setTimeout(() => onNext(), 350);
                  }} style={{
                    minHeight: 52, padding: "12px 24px", borderRadius: 14,
                    border: sel ? `2px solid ${C.green}` : "2px solid rgba(0,0,0,0.1)",
                    background: sel ? C.green : "#fff", color: sel ? "#fff" : "#1A1A1A",
                    fontSize: 16, fontWeight: sel ? 700 : 400, cursor: "pointer", fontFamily: C.font, transition: "all .15s",
                  }}>{sel ? "✓ " : ""}{type}</button>
                );
              })}
            </div>
            {hasLightingContent && (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(lw.lightingItems || [{ room: "", light: "", instruction: "" }]).map((item, i) => {
                    const allItems = lw.lightingItems || [{ room: "", light: "", instruction: "" }];
                    const upd = (f, v) => set("lightingItems", allItems.map((it, idx) => idx === i ? { ...it, [f]: v } : it));
                    return (
                      <div key={i} style={{ background: "#f9f9f9", borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", gap: 8, border: "1px solid rgba(0,0,0,0.08)" }}>
                        {allItems.length > 1 && (
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 12, color: "#6B6B6B", fontWeight: 600 }}>Lumière {i + 1}</span>
                            <button type="button" onClick={() => set("lightingItems", allItems.filter((_, idx) => idx !== i))} style={{ width: 24, height: 24, borderRadius: 6, border: "none", background: "rgba(229,62,62,0.08)", color: "#E53E3E", cursor: "pointer", fontSize: 12 }}>✕</button>
                          </div>
                        )}
                        <input value={item.room || ""} onChange={e => upd("room", e.target.value)} placeholder="Pièce (ex : Salon)" style={inpStyle} />
                        <input value={item.light || ""} onChange={e => upd("light", e.target.value)} placeholder="Lumière concernée (ex : Plafonnier, LED sous-meuble)" style={inpStyle} />
                        <textarea value={item.instruction || ""} onChange={e => upd("instruction", e.target.value)} placeholder="Instruction et/ou emplacement" rows={2} style={{ ...inpStyle, resize: "vertical" }} />
                      </div>
                    );
                  })}
                  <button type="button" onClick={() => set("lightingItems", [...(lw.lightingItems || []), { room: "", light: "", instruction: "" }])} style={{ padding: "10px 16px", borderRadius: 10, border: "2px dashed rgba(42,107,90,0.4)", background: "rgba(42,107,90,0.04)", color: C.green, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: C.font }}>+ Ajouter une lumière</button>
                </div>
                <ContinueButton onClick={onNext} label="Continuer →" />
              </>
            )}
          </div>
          <QuestionNav onBack={bk} onSkip={onNext} />
        </QuestionScreen>
      )}
    </>
  );
}

// ── TV sub-wizard ─────────────────────────────────────────────────────────────
const TV_HARDWARE = ["TV", "Box Internet", "Décodeur", "Home Cinéma", "Barre de son"];
const TV_STREAMING = ["Netflix", "Disney+", "Amazon Prime Video", "Apple TV+", "Canal+", "Spotify"];

function TvSubWizard({ data = {}, onChange, onNext, onBack, outerVis }) {
  const tw = data.tvWizard || {};
  const set = (k, v) => onChange({ ...data, tvWizard: { ...tw, [k]: v } });
  const setMulti = (patch) => onChange({ ...data, tvWizard: { ...tw, ...patch } });

  const [q, setQ] = useState(0);
  const [tvIdx, setTvIdx] = useState(0);
  const [vis, setVis] = useState(true);
  const hist = useRef([]);

  function goTo(nextQ, nextTvIdx = 0) {
    setVis(false);
    setTimeout(() => { setQ(nextQ); setTvIdx(nextTvIdx); setVis(true); window.scrollTo({ top: 0, behavior: "instant" }); }, 400);
  }
  function fwd(nextQ, nextTvIdx = 0) { hist.current = [...hist.current, [q, tvIdx]]; goTo(nextQ, nextTvIdx); }
  function bk() {
    const prev = hist.current[hist.current.length - 1];
    if (prev === undefined) onBack?.();
    else { hist.current = hist.current.slice(0, -1); goTo(prev[0], prev[1]); }
  }

  const combined = vis && (outerVis !== false);
  const equipment = tw.equipment || [];
  const counts = tw.counts || {};
  const tvCount = equipment.includes("TV") ? (counts.TV || 1) : 0;
  const tvItems = tw.tvItems || [];
  const streamingSelected = TV_STREAMING.filter(s => equipment.includes(s));

  function nextStep(afterQ) {
    const checks = [
      [1, equipment.includes("TV")],
      [2, equipment.includes("Box Internet")],
      [3, equipment.includes("Décodeur")],
      [4, equipment.includes("Home Cinéma")],
      [5, equipment.includes("Barre de son")],
      [6, streamingSelected.length > 0],
      [7, equipment.includes("Autre")],
    ];
    for (const [targetQ, cond] of checks) {
      if (targetQ > afterQ && cond) return targetQ;
    }
    return null;
  }

  function advanceFrom(currentQ, currentTvIdx = tvIdx) {
    if (currentQ === 1) {
      if (currentTvIdx < tvCount - 1) { fwd(1, currentTvIdx + 1); }
      else { const n = nextStep(1); if (n !== null) fwd(n); else onNext(); }
    } else {
      const n = nextStep(currentQ); if (n !== null) fwd(n); else onNext();
    }
  }

  function toggleEquipment(item) {
    const newEq = equipment.includes(item) ? equipment.filter(e => e !== item) : [...equipment, item];
    const newCounts = { ...counts };
    if (!newEq.includes(item)) { delete newCounts[item]; }
    else if (TV_HARDWARE.includes(item) && !newCounts[item]) { newCounts[item] = 1; }
    setMulti({ equipment: newEq, counts: newCounts });
  }

  function setCount(item, n) {
    const newCounts = { ...counts, [item]: Math.max(0, n) };
    let newEq = [...equipment];
    if (n <= 0) { newEq = newEq.filter(e => e !== item); delete newCounts[item]; }
    else if (!newEq.includes(item)) { newEq.push(item); }
    setMulti({ equipment: newEq, counts: newCounts });
  }

  const tvLabels = Array.from({ length: tvCount }, (_, i) => {
    const loc = tvItems[i]?.location?.trim();
    return loc ? `TV ${i + 1} — ${loc}` : `TV ${i + 1}`;
  });

  function updTv(idx, field, val) {
    const arr = Array.from({ length: tvCount }, (_, i) => tvItems[i] || {});
    arr[idx] = { ...arr[idx], [field]: val };
    set("tvItems", arr);
  }
  const tvItem = tvItems[tvIdx] || {};

  return (
    <>
      {/* ── Q1 — Équipements disponibles ── */}
      {q === 0 && (
        <QuestionScreen title="📺 TV & Multimédia" sub="Sélectionnez les équipements disponibles." visible={combined}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {TV_HARDWARE.map(item => {
              const sel = equipment.includes(item);
              const cnt = counts[item] || 0;
              return (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button type="button" onClick={() => toggleEquipment(item)} style={{
                    flex: 1, minHeight: 48, padding: "10px 14px", borderRadius: 12, textAlign: "left",
                    border: sel ? `2px solid ${C.green}` : "2px solid rgba(0,0,0,0.1)",
                    background: sel ? C.green : "#fff", color: sel ? "#fff" : "#1A1A1A",
                    fontSize: 15, fontWeight: sel ? 600 : 400, cursor: "pointer", fontFamily: C.font, transition: "all .15s",
                  }}>{sel ? "✓ " : ""}{item}</button>
                  {sel && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      <button type="button" onClick={() => setCount(item, cnt - 1)} style={{ width: 32, height: 32, borderRadius: 8, border: "2px solid rgba(0,0,0,0.12)", background: "#fff", fontSize: 18, cursor: "pointer", fontFamily: C.font, color: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                      <span style={{ width: 24, textAlign: "center", fontSize: 15, fontWeight: 700, fontFamily: C.font }}>{cnt}</span>
                      <button type="button" onClick={() => setCount(item, cnt + 1)} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: C.green, color: "#fff", fontSize: 18, cursor: "pointer", fontFamily: C.font, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                    </div>
                  )}
                </div>
              );
            })}
            {TV_STREAMING.map(item => {
              const sel = equipment.includes(item);
              return (
                <button key={item} type="button" onClick={() => toggleEquipment(item)} style={{
                  minHeight: 48, padding: "10px 14px", borderRadius: 12, textAlign: "left", width: "100%",
                  border: sel ? `2px solid ${C.green}` : "2px solid rgba(0,0,0,0.1)",
                  background: sel ? C.green : "#fff", color: sel ? "#fff" : "#1A1A1A",
                  fontSize: 15, fontWeight: sel ? 600 : 400, cursor: "pointer", fontFamily: C.font, transition: "all .15s",
                }}>{sel ? "✓ " : ""}{item}</button>
              );
            })}
            {/* Autre */}
            {(() => {
              const sel = equipment.includes("Autre");
              const cnt = counts["Autre"] || 0;
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button type="button" onClick={() => toggleEquipment("Autre")} style={{
                      flex: 1, minHeight: 48, padding: "10px 14px", borderRadius: 12, textAlign: "left",
                      border: sel ? `2px solid ${C.green}` : "2px solid rgba(0,0,0,0.1)",
                      background: sel ? C.greenBg : "#fff", color: sel ? C.green : "#6B6B6B",
                      fontSize: 15, cursor: "pointer", fontFamily: C.font, transition: "all .15s",
                    }}>{sel ? "✓ Autre" : "Autre (précisez)"}</button>
                    {sel && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        <button type="button" onClick={() => setCount("Autre", cnt - 1)} style={{ width: 32, height: 32, borderRadius: 8, border: "2px solid rgba(0,0,0,0.12)", background: "#fff", fontSize: 18, cursor: "pointer", fontFamily: C.font, color: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                        <span style={{ width: 24, textAlign: "center", fontSize: 15, fontWeight: 700, fontFamily: C.font }}>{cnt}</span>
                        <button type="button" onClick={() => setCount("Autre", cnt + 1)} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: C.green, color: "#fff", fontSize: 18, cursor: "pointer", fontFamily: C.font, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                      </div>
                    )}
                  </div>
                  {sel && (
                    <input value={tw.autreLabel || ""} onChange={e => set("autreLabel", e.target.value)} placeholder="Précisez l'équipement..." style={inpStyle} />
                  )}
                </div>
              );
            })()}
          </div>
          <ContinueButton onClick={() => { const n = nextStep(0); if (n !== null) fwd(n); else onNext(); }} label="Continuer →" />
          <QuestionNav onBack={hist.current.length > 0 ? bk : onBack} onSkip={onNext} />
        </QuestionScreen>
      )}

      {/* ── Q2 — TV (une page par TV) ── */}
      {q === 1 && (
        <QuestionScreen
          title={tvCount > 1 ? `TV ${tvIdx + 1} / ${tvCount}` : "Votre TV"}
          sub="Renseignez les informations de cet écran."
          visible={combined}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input value={tvItem.location || ""} onChange={e => updTv(tvIdx, "location", e.target.value)} placeholder="Pièce / emplacement (ex : Salon, chambre principale)" style={inpStyle} />
            <input value={tvItem.brand || ""} onChange={e => updTv(tvIdx, "brand", e.target.value)} placeholder="Marque (ex : Samsung, LG)" style={inpStyle} />
            <input value={tvItem.model || ""} onChange={e => updTv(tvIdx, "model", e.target.value)} placeholder="Modèle (ex : 65' QLED 4K)" style={inpStyle} />
            <div>
              <div style={{ fontSize: 13, color: "#6B6B6B", marginBottom: 6, fontFamily: C.font }}>Télécommande</div>
              <div style={{ display: "flex", gap: 8 }}>
                {["Incluse", "Perdue", "Application mobile"].map(opt => {
                  const sel = tvItem.remote === opt;
                  return (
                    <button key={opt} type="button" onClick={() => updTv(tvIdx, "remote", opt)} style={{
                      flex: 1, padding: "9px 6px", borderRadius: 10,
                      border: sel ? `2px solid ${C.green}` : "2px solid rgba(0,0,0,0.1)",
                      background: sel ? C.green : "#fff", color: sel ? "#fff" : "#1A1A1A",
                      fontSize: 12, fontWeight: sel ? 600 : 400, cursor: "pointer", fontFamily: C.font, transition: "all .15s",
                    }}>{opt}</button>
                  );
                })}
              </div>
            </div>
            <textarea value={tvItem.notes || ""} onChange={e => updTv(tvIdx, "notes", e.target.value)} placeholder="Instructions spécifiques (optionnel)" rows={2} style={{ ...inpStyle, resize: "vertical" }} />
          </div>
          <ContinueButton onClick={() => advanceFrom(1, tvIdx)} label={tvIdx < tvCount - 1 ? "TV suivante →" : "Continuer →"} />
          <QuestionNav onBack={bk} onSkip={() => { hist.current = [...hist.current, [q, tvIdx]]; const n = nextStep(1); if (n !== null) goTo(n); else onNext(); }} />
        </QuestionScreen>
      )}

      {/* ── Q3 — Box Internet ── */}
      {q === 2 && (
        <QuestionScreen title="Box Internet" visible={combined}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input value={tw.boxOperator || ""} onChange={e => set("boxOperator", e.target.value)} placeholder="Opérateur (ex : Orange, SFR, Bouygues)" style={inpStyle} />
            <input value={tw.boxLocation || ""} onChange={e => set("boxLocation", e.target.value)} placeholder="Emplacement de la box (ex : Meuble TV, entrée)" style={inpStyle} />
            <textarea value={tw.boxNotes || ""} onChange={e => set("boxNotes", e.target.value)} placeholder="Instructions spécifiques (optionnel)" rows={2} style={{ ...inpStyle, resize: "vertical" }} />
          </div>
          <ContinueButton onClick={() => advanceFrom(2)} />
          <QuestionNav onBack={bk} onSkip={() => advanceFrom(2)} />
        </QuestionScreen>
      )}

      {/* ── Q4 — Décodeur ── */}
      {q === 3 && (
        <QuestionScreen title="Décodeur" visible={combined}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input value={tw.decoderBrand || ""} onChange={e => set("decoderBrand", e.target.value)} placeholder="Marque / opérateur (ex : Canal+, Freebox)" style={inpStyle} />
            <input value={tw.decoderLocation || ""} onChange={e => set("decoderLocation", e.target.value)} placeholder="Emplacement (ex : Sous la TV salon)" style={inpStyle} />
            {tvCount > 0 && (
              <div>
                <div style={{ fontSize: 13, color: "#6B6B6B", marginBottom: 6, fontFamily: C.font }}>Sur quelle TV ?</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {["Toutes", ...tvLabels].map(opt => {
                    const sel = tw.decoderTv === opt;
                    return (
                      <button key={opt} type="button" onClick={() => set("decoderTv", opt)} style={{
                        minHeight: 42, padding: "10px 14px", borderRadius: 10, textAlign: "left",
                        border: sel ? `2px solid ${C.green}` : "2px solid rgba(0,0,0,0.1)",
                        background: sel ? C.green : "#fff", color: sel ? "#fff" : "#1A1A1A",
                        fontSize: 14, fontWeight: sel ? 600 : 400, cursor: "pointer", fontFamily: C.font, transition: "all .15s",
                      }}>{sel ? "✓ " : ""}{opt}</button>
                    );
                  })}
                </div>
              </div>
            )}
            <textarea value={tw.decoderNotes || ""} onChange={e => set("decoderNotes", e.target.value)} placeholder="Instructions spécifiques (optionnel)" rows={2} style={{ ...inpStyle, resize: "vertical" }} />
          </div>
          <ContinueButton onClick={() => advanceFrom(3)} />
          <QuestionNav onBack={bk} onSkip={() => advanceFrom(3)} />
        </QuestionScreen>
      )}

      {/* ── Q5 — Home Cinéma ── */}
      {q === 4 && (
        <QuestionScreen title="Home Cinéma" visible={combined}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input value={tw.hcBrand || ""} onChange={e => set("hcBrand", e.target.value)} placeholder="Marque (ex : Sony, Bose, Yamaha)" style={inpStyle} />
            <input value={tw.hcLocation || ""} onChange={e => set("hcLocation", e.target.value)} placeholder="Emplacement (ex : Salon, meuble sous TV)" style={inpStyle} />
            <textarea value={tw.hcNotes || ""} onChange={e => set("hcNotes", e.target.value)} placeholder="Instructions spécifiques (optionnel)" rows={2} style={{ ...inpStyle, resize: "vertical" }} />
          </div>
          <ContinueButton onClick={() => advanceFrom(4)} />
          <QuestionNav onBack={bk} onSkip={() => advanceFrom(4)} />
        </QuestionScreen>
      )}

      {/* ── Q6 — Barre de son ── */}
      {q === 5 && (
        <QuestionScreen title="Barre de son" visible={combined}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input value={tw.soundbarBrand || ""} onChange={e => set("soundbarBrand", e.target.value)} placeholder="Marque (ex : Samsung, Sonos, JBL)" style={inpStyle} />
            <input value={tw.soundbarLocation || ""} onChange={e => set("soundbarLocation", e.target.value)} placeholder="Emplacement (ex : Sous la TV salon)" style={inpStyle} />
            {tvCount > 0 && (
              <div>
                <div style={{ fontSize: 13, color: "#6B6B6B", marginBottom: 6, fontFamily: C.font }}>Couplée à quelle TV ?</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {["Toutes", ...tvLabels].map(opt => {
                    const sel = tw.soundbarTv === opt;
                    return (
                      <button key={opt} type="button" onClick={() => set("soundbarTv", opt)} style={{
                        minHeight: 42, padding: "10px 14px", borderRadius: 10, textAlign: "left",
                        border: sel ? `2px solid ${C.green}` : "2px solid rgba(0,0,0,0.1)",
                        background: sel ? C.green : "#fff", color: sel ? "#fff" : "#1A1A1A",
                        fontSize: 14, fontWeight: sel ? 600 : 400, cursor: "pointer", fontFamily: C.font, transition: "all .15s",
                      }}>{sel ? "✓ " : ""}{opt}</button>
                    );
                  })}
                </div>
              </div>
            )}
            <textarea value={tw.soundbarNotes || ""} onChange={e => set("soundbarNotes", e.target.value)} placeholder="Instructions spécifiques (optionnel)" rows={2} style={{ ...inpStyle, resize: "vertical" }} />
          </div>
          <ContinueButton onClick={() => advanceFrom(5)} />
          <QuestionNav onBack={bk} onSkip={() => advanceFrom(5)} />
        </QuestionScreen>
      )}

      {/* ── Q7 — Services streaming ── */}
      {q === 6 && (
        <QuestionScreen title="Ces services sont-ils accessibles aux locataires ?" visible={combined}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {streamingSelected.map(service => {
              const sa = (tw.streamingAccess || {})[service] || {};
              const setSA = (field, val) => set("streamingAccess", { ...(tw.streamingAccess || {}), [service]: { ...sa, [field]: val } });
              return (
                <div key={service} style={{ display: "flex", flexDirection: "column", gap: 8, padding: 12, background: "#f9f9f9", borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A", fontFamily: C.font }}>{service}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["Oui", "Non"].map(opt => {
                      const sel = sa.accessible === opt;
                      return (
                        <button key={opt} type="button" onClick={() => setSA("accessible", opt)} style={{
                          flex: 1, height: 38, borderRadius: 8,
                          border: sel ? `2px solid ${C.green}` : "2px solid rgba(0,0,0,0.1)",
                          background: sel ? C.green : "#fff", color: sel ? "#fff" : "#1A1A1A",
                          fontSize: 13, fontWeight: sel ? 600 : 400, cursor: "pointer", fontFamily: C.font, transition: "all .15s",
                        }}>{opt}</button>
                      );
                    })}
                  </div>
                  {sa.accessible === "Oui" && (
                    <input value={sa.instructions || ""} onChange={e => setSA("instructions", e.target.value)} placeholder="Instructions d'accès ou limites d'utilisation (optionnel)" style={inpStyle} />
                  )}
                </div>
              );
            })}
          </div>
          <ContinueButton onClick={() => advanceFrom(6)} />
          <QuestionNav onBack={bk} onSkip={() => advanceFrom(6)} />
        </QuestionScreen>
      )}

      {/* ── Q8 — Autre ── */}
      {q === 7 && (
        <QuestionScreen title={tw.autreLabel || "Autre équipement"} visible={combined}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input value={tw.autreLocation || ""} onChange={e => set("autreLocation", e.target.value)} placeholder="Emplacement" style={inpStyle} />
            <textarea value={tw.autreNotes || ""} onChange={e => set("autreNotes", e.target.value)} placeholder="Instructions spécifiques (optionnel)" rows={3} style={{ ...inpStyle, resize: "vertical" }} />
          </div>
          <ContinueButton onClick={onNext} label="Continuer →" />
          <QuestionNav onBack={bk} onSkip={onNext} />
        </QuestionScreen>
      )}
    </>
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

  // screens: 0..N-1 (categories) | "summary"
  const [screen, setScreen] = useState(0);
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
      {typeof screen === "number" && screen >= 0 && screen < WIZARD_CATS.length && (() => {
        const cat = WIZARD_CATS[screen];
        const nextScreen = screen < WIZARD_CATS.length - 1 ? screen + 1 : "summary";
        if (cat.id === "lighting") {
          return (
            <LightingSubWizard
              data={data}
              onChange={onChange}
              onNext={() => fwd(nextScreen)}
              onBack={screenHist.current.length > 0 ? bk : onBack}
              outerVis={vis}
            />
          );
        }
        if (cat.id === "tv") {
          return (
            <TvSubWizard
              data={data}
              onChange={onChange}
              onNext={() => fwd(nextScreen)}
              onBack={screenHist.current.length > 0 ? bk : onBack}
              outerVis={vis}
            />
          );
        }
        let content;
        if (cat.id === "storage") {
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
            <ContinueButton onClick={() => fwd(nextScreen)} label={nextScreen === "summary" ? "Voir le récapitulatif →" : "Continuer →"} />
            <QuestionNav onBack={screenHist.current.length > 0 ? bk : onBack} onSkip={() => fwd(nextScreen)} />
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
          <QuestionNav onBack={bk} onSkip={onNext} />
        </QuestionScreen>
      )}
    </>
  );
}
