"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const G    = "#2A6B5A";
const FONT = "'DM Sans', sans-serif";

const INFO_LABELS = {
  propertyType: "Type de logement",
  street:       "Rue",
  city:         "Ville",
  postalCode:   "Code postal",
  country:      "Pays",
  floor:        "Étage",
  hasElevator:  "Ascenseur",
  description:  "Description",
  maxGuests:    "Capacité max",
  bedrooms:     "Chambres",
  beds:         "Lits",
  bathrooms:    "Salles de bain",
};

const CHECKIN_LABELS = {
  checkinTime:  "Heure d'arrivée",
  checkoutTime: "Heure de départ",
};

const RULES_LABELS = {
  petsAllowed:    "Animaux",
  smokingPolicy:  "Fumée",
  partiesAllowed: "Fêtes",
};

const APPLIANCE_LABELS = {
  oven:           "Four",
  cooktop:        "Plaques de cuisson",
  hood:           "Hotte",
  fridge:         "Réfrigérateur",
  freezer:        "Congélateur",
  dishwasher:     "Lave-vaisselle",
  microwave:      "Micro-ondes",
  coffeeMachine:  "Machine à café",
  kettle:         "Bouilloire",
  toaster:        "Grille-pain",
  blender:        "Blender",
  foodProcessor:  "Robot culinaire",
  washingMachine: "Lave-linge",
  dryer:          "Sèche-linge",
  vacuum:         "Aspirateur",
  iron:           "Fer à repasser",
  robotVacuum:    "Robot aspirateur",
  airConditioning:"Climatisation",
  heating:        "Chauffage",
  waterHeater:    "Chauffe-eau",
  fan:            "Ventilateur",
  airPurifier:    "Purificateur d'air",
  hairDryer:      "Sèche-cheveux",
  towelWarmer:    "Sèche-serviettes",
};

function hasAnyData(data) {
  if (!data) return false;
  if (Object.values(data.info    || {}).some(v => v !== null && v !== undefined && v !== "")) return true;
  if (Object.values(data.checkin || {}).some(v => v !== null && v !== undefined && v !== "")) return true;
  if (Object.values(data.rules   || {}).some(v => v !== null && v !== undefined && v !== "")) return true;
  if (Object.values(data.appliances?.items || {}).some(i => i?.enabled)) return true;
  if (Object.keys(data.appliances?.tvWizard?.streamingAccess || {}).length > 0) return true;
  return false;
}

function PreviewRow({ label, value }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div style={{ display: "flex", gap: 8, padding: "6px 0", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
      <span style={{ fontSize: 12, color: "#6B6B6B", minWidth: 140, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#1A1A1A" }}>{String(value)}</span>
    </div>
  );
}

function SectionPreview({ icon, title, rows }) {
  if (!rows.some(r => r.value !== null && r.value !== undefined && r.value !== "")) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: G, marginBottom: 8 }}>
        {icon} {title}
      </div>
      {rows.map((r, i) => <PreviewRow key={i} label={r.label} value={r.value} />)}
    </div>
  );
}

export default function ImportModal({ onImport, onClose }) {
  const [mounted, setMounted]       = useState(false);
  const [phase, setPhase]           = useState("input");
  const [url, setUrl]               = useState("");
  const [rgpd, setRgpd]             = useState(false);
  const [blocked, setBlocked]       = useState(false);
  const [blockReason, setBlockReason] = useState(null);
  const [pasteText, setPasteText]   = useState("");
  const [urlError, setUrlError]     = useState("");
  const [extractedData, setExtractedData] = useState(null);

  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);

  async function analyze(payload) {
    setPhase("loading");
    setUrlError("");
    try {
      const res  = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.blocked) {
        setBlocked(true);
        setBlockReason(json.reason || null);
        setPhase("input");
        return;
      }
      if (json.success) {
        setExtractedData(json.data);
        setPhase("preview");
      } else {
        setUrlError(json.error || "Une erreur est survenue.");
        setPhase("input");
      }
    } catch {
      setUrlError("Impossible de contacter le serveur.");
      setPhase("input");
    }
  }

  function handleAnalyzeUrl()  { analyze({ url }); }
  function handleAnalyzeText() { analyze({ text: pasteText }); }

  function handleConfirm() {
    onImport(extractedData);
    onClose();
  }

  if (!mounted) return null;

  const modal = (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.45)", display: "flex",
      alignItems: "center", justifyContent: "center",
      padding: "20px", boxSizing: "border-box",
      fontFamily: FONT,
    }}>
      <div style={{
        background: "#fff", borderRadius: 20,
        width: "100%", maxWidth: 560,
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        padding: "32px 28px",
        boxSizing: "border-box",
      }}>

        {/* ── Loading ─────────────────────────────────────── */}
        {phase === "loading" && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              border: `4px solid rgba(42,107,90,0.2)`,
              borderTopColor: G,
              margin: "0 auto 20px",
              animation: "importSpin 0.8s linear infinite",
            }} />
            <style>{`@keyframes importSpin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1A1A1A", marginBottom: 8 }}>
              Analyse en cours...
            </div>
            <div style={{ fontSize: 13, color: "#6B6B6B" }}>
              Claude analyse votre annonce et extrait les informations
            </div>
          </div>
        )}

        {/* ── Input ───────────────────────────────────────── */}
        {phase === "input" && (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1A1A1A", margin: "0 0 8px" }}>
              Importer votre annonce
            </h2>
            <p style={{ fontSize: 14, color: "#6B6B6B", margin: "0 0 24px", lineHeight: 1.6 }}>
              Gagnez du temps en important automatiquement les informations
              de votre annonce Airbnb ou Booking.com
            </p>

            {/* URL field */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#1A1A1A", display: "block", marginBottom: 6 }}>
                URL de votre annonce
              </label>
              <input
                type="url"
                value={url}
                onChange={e => { setUrl(e.target.value); setBlocked(false); setBlockReason(null); setUrlError(""); }}
                placeholder="https://www.airbnb.fr/rooms/..."
                style={{
                  width: "100%", padding: "11px 14px", borderRadius: 10,
                  border: `1px solid ${urlError ? "#E53E3E" : "rgba(0,0,0,0.12)"}`,
                  fontFamily: FONT, fontSize: 13, outline: "none",
                  boxSizing: "border-box", color: "#1A1A1A",
                }}
                onFocus={e  => (e.target.style.borderColor = G)}
                onBlur={e   => (e.target.style.borderColor = urlError ? "#E53E3E" : "rgba(0,0,0,0.12)")}
              />
              {urlError && (
                <p style={{ margin: "6px 0 0", fontSize: 12, color: "#E53E3E" }}>{urlError}</p>
              )}
            </div>

            {/* Blocked fallback */}
            {blocked && (
              <div style={{
                padding: "14px 16px", borderRadius: 12,
                background: "rgba(255,193,7,0.08)", border: "1px solid rgba(255,193,7,0.3)",
                marginBottom: 16,
              }}>
                <p style={{ margin: "0 0 10px", fontSize: 13, color: "#856404", lineHeight: 1.5 }}>
                  {blockReason === "timeout"
                    ? "L'analyse a pris trop de temps. Réessayez ou copiez-collez le texte."
                    : "Import automatique indisponible pour cette URL. Copiez-collez le texte de votre annonce ci-dessous :"}
                </p>
                <textarea
                  value={pasteText}
                  onChange={e => setPasteText(e.target.value)}
                  rows={5}
                  placeholder="Collez ici le texte complet de votre annonce..."
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: 10,
                    border: "1px solid rgba(0,0,0,0.12)", fontFamily: FONT,
                    fontSize: 13, resize: "vertical", outline: "none",
                    boxSizing: "border-box", color: "#1A1A1A",
                  }}
                  onFocus={e => (e.target.style.borderColor = G)}
                  onBlur={e  => (e.target.style.borderColor = "rgba(0,0,0,0.12)")}
                />
                <button
                  type="button"
                  onClick={handleAnalyzeText}
                  disabled={!pasteText.trim()}
                  style={{
                    marginTop: 10, padding: "10px 20px", borderRadius: 10,
                    border: "none", fontFamily: FONT, fontSize: 13, fontWeight: 600,
                    background: pasteText.trim() ? G : "rgba(0,0,0,0.1)",
                    color: pasteText.trim() ? "#fff" : "#999",
                    cursor: pasteText.trim() ? "pointer" : "default",
                  }}
                >
                  Analyser le texte
                </button>
              </div>
            )}

            {/* RGPD */}
            <label style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              marginBottom: 24, cursor: "pointer",
            }}>
              <input
                type="checkbox"
                checked={rgpd}
                onChange={e => setRgpd(e.target.checked)}
                style={{ marginTop: 2, accentColor: G, flexShrink: 0 }}
              />
              <span style={{ fontSize: 12, color: "#6B6B6B", lineHeight: 1.5 }}>
                Je confirme être l'hôte de ce logement et autorise l'analyse
                de mon annonce publique à des fins de configuration.
              </span>
            </label>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={handleAnalyzeUrl}
                disabled={!url.trim() || !rgpd}
                style={{
                  flex: 1, padding: "12px 20px", borderRadius: 12,
                  border: "none", fontFamily: FONT, fontSize: 14, fontWeight: 600,
                  background: (!url.trim() || !rgpd) ? "rgba(0,0,0,0.08)" : G,
                  color: (!url.trim() || !rgpd) ? "#999" : "#fff",
                  cursor: (!url.trim() || !rgpd) ? "default" : "pointer",
                  boxShadow: (!url.trim() || !rgpd) ? "none" : "0 3px 12px rgba(42,107,90,0.25)",
                }}
              >
                Analyser l'annonce
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "12px 20px", borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.12)", fontFamily: FONT,
                  fontSize: 14, fontWeight: 500, background: "#fff",
                  color: "#6B6B6B", cursor: "pointer",
                }}
              >
                Annuler
              </button>
            </div>
          </>
        )}

        {/* ── Preview ─────────────────────────────────────── */}
        {phase === "preview" && extractedData && !hasAnyData(extractedData) && (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1A1A1A", margin: "0 0 8px" }}>
              Aucune donnée détectée
            </h2>
            <div style={{
              padding: "14px 16px", borderRadius: 12,
              background: "rgba(255,193,7,0.08)", border: "1px solid rgba(255,193,7,0.3)",
              marginBottom: 20,
            }}>
              <p style={{ margin: 0, fontSize: 13, color: "#856404", lineHeight: 1.6 }}>
                Aucune donnée n'a pu être extraite automatiquement.<br />
                Airbnb bloque probablement l'accès automatique à cette page.<br />
                Copiez-collez le texte de votre annonce ci-dessous :
              </p>
            </div>
            <textarea
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              rows={6}
              placeholder="Collez ici le texte complet de votre annonce..."
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 10,
                border: "1px solid rgba(0,0,0,0.12)", fontFamily: FONT,
                fontSize: 13, resize: "vertical", outline: "none",
                boxSizing: "border-box", color: "#1A1A1A", marginBottom: 14,
              }}
              onFocus={e => (e.target.style.borderColor = G)}
              onBlur={e  => (e.target.style.borderColor = "rgba(0,0,0,0.12)")}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={handleAnalyzeText}
                disabled={!pasteText.trim()}
                style={{
                  flex: 1, padding: "12px 20px", borderRadius: 12,
                  border: "none", fontFamily: FONT, fontSize: 14, fontWeight: 600,
                  background: pasteText.trim() ? G : "rgba(0,0,0,0.08)",
                  color: pasteText.trim() ? "#fff" : "#999",
                  cursor: pasteText.trim() ? "pointer" : "default",
                  boxShadow: pasteText.trim() ? "0 3px 12px rgba(42,107,90,0.25)" : "none",
                }}
              >
                Analyser le texte
              </button>
              <button
                type="button"
                onClick={() => setPhase("input")}
                style={{
                  padding: "12px 20px", borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.12)", fontFamily: FONT,
                  fontSize: 14, fontWeight: 500, background: "#fff",
                  color: "#6B6B6B", cursor: "pointer",
                }}
              >
                Retour
              </button>
            </div>
          </>
        )}

        {phase === "preview" && extractedData && hasAnyData(extractedData) && (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1A1A1A", margin: "0 0 8px" }}>
              Données détectées
            </h2>
            <p style={{ fontSize: 14, color: "#6B6B6B", margin: "0 0 24px", lineHeight: 1.6 }}>
              Vérifiez les informations extraites avant de les importer
            </p>

            {/* Logement */}
            <SectionPreview
              icon="🏠" title="Logement"
              rows={Object.entries(INFO_LABELS).map(([k, label]) => ({
                label, value: extractedData.info?.[k] ?? null,
              }))}
            />

            {/* Accès */}
            <SectionPreview
              icon="🔑" title="Accès"
              rows={Object.entries(CHECKIN_LABELS).map(([k, label]) => ({
                label, value: extractedData.checkin?.[k] ?? null,
              }))}
            />

            {/* Règles */}
            <SectionPreview
              icon="📋" title="Règles"
              rows={Object.entries(RULES_LABELS).map(([k, label]) => ({
                label, value: extractedData.rules?.[k] ?? null,
              }))}
            />

            {/* Équipements */}
            {(() => {
              const items   = extractedData.appliances?.items || {};
              const streams = extractedData.appliances?.tvWizard?.streamingAccess || {};
              const appRows = Object.keys(items)
                .filter(id => items[id]?.enabled)
                .map(id => ({ label: APPLIANCE_LABELS[id] || id, value: "✓" }));
              const streamRows = Object.keys(streams)
                .map(s => ({ label: s, value: "✓" }));
              return (
                <SectionPreview
                  icon="📺" title="Équipements"
                  rows={[...appRows, ...streamRows]}
                />
              );
            })()}

            {/* Warning */}
            <div style={{
              padding: "10px 14px", borderRadius: 10,
              background: "rgba(42,107,90,0.06)", border: "1px solid rgba(42,107,90,0.15)",
              fontSize: 12, color: G, lineHeight: 1.5, marginBottom: 24,
            }}>
              Les champs existants seront fusionnés. Vous pourrez tout modifier
              dans l'onglet Contenu.
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={handleConfirm}
                style={{
                  flex: 1, padding: "12px 20px", borderRadius: 12,
                  border: "none", fontFamily: FONT, fontSize: 14, fontWeight: 600,
                  background: G, color: "#fff", cursor: "pointer",
                  boxShadow: "0 3px 12px rgba(42,107,90,0.25)",
                }}
              >
                Confirmer l'import
              </button>
              <button
                type="button"
                onClick={() => setPhase("input")}
                style={{
                  padding: "12px 20px", borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.12)", fontFamily: FONT,
                  fontSize: 14, fontWeight: 500, background: "#fff",
                  color: "#6B6B6B", cursor: "pointer",
                }}
              >
                Retour
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
