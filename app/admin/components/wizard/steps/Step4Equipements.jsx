"use client";
import { useState, useRef } from "react";
import { QuestionScreen, QuestionNav, ContinueButton, BigButtonChoice, C } from "../WizardUI";
import { APPLIANCE_CATEGORIES } from "@/app/lib/propertySchema";

const CATEGORY_ICONS = { kitchen: "🍳", smallKitchen: "☕", maintenance: "🧺", comfort: "❄️", bathroom: "🚿" };

function ToggleApplianceGrid({ cat, items, onChange }) {
  return (
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

export default function Step4Equipements({ data = {}, onChange, onNext, onBack, onSkip }) {
  const items = data.items || {};
  const customAppliances = data.customAppliances || [];
  const setItems = (newItems) => onChange({ ...data, items: newItems });
  const setCustom = (arr) => onChange({ ...data, customAppliances: arr });

  // screens: "intro" | 0..4 (categories) | "custom" | "summary"
  const [screen, setScreen] = useState("intro");
  const [vis, setVis] = useState(true);
  const [addMore, setAddMore] = useState(null);
  const [newName, setNewName] = useState("");
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

  const allSelected = APPLIANCE_CATEGORIES.flatMap(cat => cat.items.filter(a => items[a.id]?.enabled).map(a => ({ ...a, cat: cat.id })));

  return (
    <>
      {screen === "intro" && (
        <QuestionScreen title="Quels équipements sont disponibles dans votre logement ?" sub="Cochez ceux qui sont présents — vous pourrez ajouter les détails maintenant ou plus tard." visible={vis}>
          <ContinueButton onClick={() => fwd(0)} label="Commencer →" />
          <QuestionNav onBack={bk} onSkip={() => fwd("summary")} skipLabel="Passer cette étape →" />
        </QuestionScreen>
      )}
      {typeof screen === "number" && screen >= 0 && screen <= 4 && (() => {
        const cat = APPLIANCE_CATEGORIES[screen];
        return (
          <QuestionScreen title={`${CATEGORY_ICONS[cat.id]} ${cat.label} — Quels appareils avez-vous ?`} visible={vis}>
            <ToggleApplianceGrid cat={cat} items={items} onChange={setItems} />
            <ContinueButton onClick={() => fwd(screen < 4 ? screen + 1 : "custom")} />
            <QuestionNav onBack={bk} onSkip={() => fwd(screen < 4 ? screen + 1 : "custom")} />
          </QuestionScreen>
        );
      })()}
      {screen === "custom" && (
        <QuestionScreen title="Avez-vous d'autres appareils à ajouter ?" visible={vis}>
          <BigButtonChoice options={["Oui", "Non"]} value={addMore} onChange={v => { setAddMore(v); if (v === "Non") fwd("summary"); }} columns={2} />
          {addMore === "Oui" && (
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nom de l'appareil" style={{ ...inpStyle, flex: 1, fontSize: 15 }} />
                <button type="button" onClick={() => { if (newName.trim()) { setCustom([...customAppliances, { name: newName.trim() }]); setNewName(""); }}} style={{ padding: "0 18px", height: 52, borderRadius: 14, border: "none", background: newName.trim() ? C.green : "rgba(0,0,0,0.08)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: newName.trim() ? "pointer" : "default", fontFamily: C.font }}>Ajouter</button>
              </div>
              {customAppliances.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {customAppliances.map((a, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#fff", borderRadius: 10, border: "1px solid rgba(0,0,0,0.08)" }}>
                      <span style={{ flex: 1, fontSize: 14 }}>✅ {a.name}</span>
                      <button type="button" onClick={() => setCustom(customAppliances.filter((_, j) => j !== i))} style={{ width: 24, height: 24, borderRadius: 6, border: "none", background: "rgba(229,62,62,0.08)", color: "#E53E3E", cursor: "pointer", fontSize: 12 }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
              <ContinueButton onClick={() => fwd("summary")} label="Voir le récapitulatif →" />
            </div>
          )}
          <QuestionNav onBack={bk} onSkip={() => fwd("summary")} />
        </QuestionScreen>
      )}
      {screen === "summary" && (
        <QuestionScreen title="Récapitulatif de vos équipements" sub={allSelected.length > 0 ? `${allSelected.length} appareil(s) sélectionné(s) — ajoutez les détails pour enrichir votre concierge.` : "Aucun appareil sélectionné pour l'instant."} visible={vis}>
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
          {customAppliances.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8, width: "100%" }}>
              {customAppliances.map((a, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)", padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{a.name}</div>
                  <button type="button" onClick={() => setCustom(customAppliances.filter((_, j) => j !== i))} style={{ width: 28, height: 28, borderRadius: 6, border: "none", background: "rgba(229,62,62,0.08)", color: "#E53E3E", cursor: "pointer", fontSize: 13 }}>✕</button>
                </div>
              ))}
            </div>
          )}
          <ContinueButton onClick={onNext} label="Étape suivante →" />
          <QuestionNav onBack={bk} onSkip={onNext} skipLabel="Passer →" />
        </QuestionScreen>
      )}
    </>
  );
}
