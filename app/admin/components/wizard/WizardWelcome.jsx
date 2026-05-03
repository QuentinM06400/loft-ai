"use client";
import { useState } from "react";
import { C } from "./WizardUI";
import ImportModal from "../ImportModal";

export default function WizardWelcome({ onManual, onImportData }) {
  const [showImport,   setShowImport]   = useState(false);
  const [importedData, setImportedData] = useState(null);

  function handleImport(data) {
    onImportData?.(data);
    setImportedData(data);
    setShowImport(false);
  }

  if (importedData) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "#FAFAF8", fontFamily: C.font, padding: "24px 20px",
      }}>
        <div style={{ textAlign: "center", maxWidth: 440 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18, background: C.green,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, color: "#fff", fontWeight: 800, marginBottom: 24,
            boxShadow: "0 6px 24px rgba(42,107,90,0.35)",
          }}>✓</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#1A1A1A", margin: "0 0 12px" }}>
            Données importées !
          </h2>
          <p style={{ fontSize: 15, color: "#6B6B6B", margin: "0 0 32px", lineHeight: 1.6 }}>
            Vous pouvez maintenant configurer votre espace depuis l'onglet Contenu.
          </p>
          <button
            type="button"
            onClick={() => { window.location.href = "/admin"; }}
            style={{
              padding: "14px 28px", borderRadius: 14, border: "none",
              fontFamily: C.font, fontSize: 15, fontWeight: 700,
              background: C.green, color: "#fff", cursor: "pointer",
              boxShadow: "0 4px 18px rgba(42,107,90,0.3)",
            }}
          >
            Accéder à l'onglet Contenu →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "#FAFAF8", fontFamily: C.font, padding: "24px 20px",
    }}>
      {showImport && (
        <ImportModal
          onImport={handleImport}
          onClose={() => setShowImport(false)}
        />
      )}

      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18, background: C.green,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontSize: 26, color: "#fff", fontWeight: 800, marginBottom: 16,
          boxShadow: "0 6px 24px rgba(42,107,90,0.35)",
        }}>L</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1A1A1A", margin: "0 0 8px" }}>
          Bienvenue sur LOFT AI !
        </h1>
        <p style={{ fontSize: 16, color: "#6B6B6B", margin: 0, maxWidth: 400, lineHeight: 1.6 }}>
          Je vais vous guider pour configurer votre concierge intelligent en quelques minutes.
        </p>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", maxWidth: 440 }}>

        {/* Import button */}
        <button
          type="button"
          onClick={() => setShowImport(true)}
          style={{
            width: "100%", padding: "20px 24px", borderRadius: 16,
            border: `2px solid ${C.green}`,
            background: "#fff", cursor: "pointer",
            fontFamily: C.font, textAlign: "left",
            display: "flex", alignItems: "center", gap: 16,
            transition: "all .15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(42,107,90,0.04)";
            e.currentTarget.style.boxShadow = "0 4px 18px rgba(42,107,90,0.14)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "#fff";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <span style={{ fontSize: 28 }}>📥</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.green, marginBottom: 3 }}>
              Importer depuis Airbnb / Booking
            </div>
            <div style={{ fontSize: 12, color: "#6B6B6B" }}>
              Collez le lien de votre annonce pour pré-remplir automatiquement votre profil
            </div>
          </div>
        </button>

        {/* Manual config button */}
        <button
          type="button"
          onClick={onManual}
          style={{
            width: "100%", padding: "20px 24px", borderRadius: 16,
            border: `2px solid ${C.green}`,
            background: "#fff", cursor: "pointer",
            fontFamily: C.font, textAlign: "left",
            display: "flex", alignItems: "center", gap: 16,
            boxShadow: "0 4px 20px rgba(42,107,90,0.12)",
            transition: "all .15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(42,107,90,0.04)";
            e.currentTarget.style.boxShadow = "0 6px 24px rgba(42,107,90,0.18)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "#fff";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(42,107,90,0.12)";
          }}
        >
          <span style={{ fontSize: 28 }}>✏️</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.green, marginBottom: 3 }}>
              Configurer manuellement
            </div>
            <div style={{ fontSize: 12, color: "#6B6B6B" }}>
              Je n'ai pas encore d'annonce en ligne ou je préfère tout saisir moi-même
            </div>
          </div>
          <span style={{ marginLeft: "auto", fontSize: 20, color: C.green }}>→</span>
        </button>
      </div>

      <p style={{ marginTop: 32, fontSize: 12, color: "#9A9A9A" }}>
        Vous pourrez toujours modifier tout cela depuis votre espace admin.
      </p>
    </div>
  );
}
