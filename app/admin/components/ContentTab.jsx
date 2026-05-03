"use client";
import { useState } from "react";
import { RECOMMENDATION_CATEGORIES, ACTIVITY_CATEGORIES, TRANSPORT_CATEGORIES } from "@/app/lib/propertySchema";
import ImportModal from "./ImportModal";

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────────────────────────────────────
const G    = "#2A6B5A";
const FONT = "'DM Sans', sans-serif";
const INP  = {
  width: "100%", padding: "10px 12px", borderRadius: 10, boxSizing: "border-box",
  border: "1px solid rgba(0,0,0,0.12)", background: "#fff",
  fontFamily: FONT, fontSize: 13, outline: "none", color: "#1A1A1A",
  transition: "border .15s",
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared primitives
// ─────────────────────────────────────────────────────────────────────────────

function Label({ text, sub }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#1A1A1A" }}>{text}</span>
      {sub && <span style={{ fontSize: 11, color: "#9A9A9A", marginLeft: 6 }}>{sub}</span>}
    </div>
  );
}

function Field({ label, sub, children, style }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", ...style }}>
      {label && <Label text={label} sub={sub} />}
      {children}
    </div>
  );
}

function Inp({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={INP}
      onFocus={e  => (e.target.style.borderColor = G)}
      onBlur={e   => (e.target.style.borderColor = "rgba(0,0,0,0.12)")}
    />
  );
}

function Txt({ value, onChange, rows = 3, placeholder }) {
  return (
    <textarea
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{ ...INP, resize: "vertical", lineHeight: 1.5 }}
      onFocus={e => (e.target.style.borderColor = G)}
      onBlur={e  => (e.target.style.borderColor = "rgba(0,0,0,0.12)")}
    />
  );
}

function Sel({ value, onChange, options }) {
  return (
    <select
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      style={{ ...INP, cursor: "pointer" }}
    >
      <option value="">— Sélectionnez —</option>
      {options.map(o => (
        <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
      ))}
    </select>
  );
}

function Num({ value, onChange, min = 0, max = 99, label: lbl }) {
  const v = Number(value) || 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {lbl && <span style={{ fontSize: 12, fontWeight: 600, color: "#1A1A1A", flex: 1 }}>{lbl}</span>}
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F7F7F5", borderRadius: 10, padding: "4px 8px" }}>
        <button type="button" onClick={() => onChange(Math.max(min, v - 1))}
          style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)", background: "#fff", cursor: "pointer", fontFamily: FONT, fontSize: 16 }}>−</button>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#1A1A1A", minWidth: 28, textAlign: "center" }}>{v}</span>
        <button type="button" onClick={() => onChange(Math.min(max, v + 1))}
          style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)", background: "#fff", cursor: "pointer", fontFamily: FONT, fontSize: 16 }}>+</button>
      </div>
    </div>
  );
}

function YesNo({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {["Oui", "Non"].map(opt => {
        const sel = value === opt || (opt === "Oui" && value === true) || (opt === "Non" && value === false);
        return (
          <button key={opt} type="button" onClick={() => onChange(opt)}
            style={{
              padding: "8px 20px", borderRadius: 8, border: sel ? `2px solid ${G}` : "1px solid rgba(0,0,0,0.12)",
              background: sel ? G : "#fff", color: sel ? "#fff" : "#1A1A1A",
              fontFamily: FONT, fontSize: 13, fontWeight: sel ? 600 : 400, cursor: "pointer",
            }}>{opt}</button>
        );
      })}
    </div>
  );
}

function MultiCheck({ options, value = [], onChange }) {
  const toggle = opt => {
    const next = value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt];
    onChange(next);
  };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map(opt => {
        const sel = value.includes(opt);
        return (
          <button key={opt} type="button" onClick={() => toggle(opt)}
            style={{
              padding: "7px 14px", borderRadius: 20, fontFamily: FONT, fontSize: 13,
              border: sel ? `2px solid ${G}` : "1px solid rgba(0,0,0,0.12)",
              background: sel ? "rgba(42,107,90,0.1)" : "#fff",
              color: sel ? G : "#1A1A1A", fontWeight: sel ? 600 : 400, cursor: "pointer",
            }}>{sel ? "✓ " : ""}{opt}</button>
        );
      })}
    </div>
  );
}

function SubTitle({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: "#9A9A9A", letterSpacing: "0.06em",
      textTransform: "uppercase", padding: "4px 0 8px", borderBottom: "1px solid rgba(0,0,0,0.06)",
      marginBottom: 4,
    }}>{children}</div>
  );
}

function Row({ children, cols = 2 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Accordion + save button
// ─────────────────────────────────────────────────────────────────────────────

function AccordionSection({ icon, label, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderRadius: 14, background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "visible" }}>
      <button
        type="button" onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 12,
          padding: "16px 20px", background: "none",
          border: "none", borderBottom: open ? "1px solid rgba(0,0,0,0.06)" : "none",
          borderRadius: open ? "14px 14px 0 0" : 14,
          cursor: "pointer", fontFamily: FONT, textAlign: "left",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "#F7F7F5")}
        onMouseLeave={e => (e.currentTarget.style.background = "none")}
      >
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: "#1A1A1A" }}>{label}</span>
        <span style={{ fontSize: 11, color: "#9A9A9A", transform: open ? "rotate(180deg)" : "none", display: "inline-block", transition: "transform .2s" }}>▼</span>
      </button>
      {open && <div style={{ padding: "20px 20px 0" }}>{children}</div>}
    </div>
  );
}

function SaveButton({ saving, saved, onClick }) {
  return (
    <div style={{ padding: "16px 0 20px", display: "flex", justifyContent: "flex-end" }}>
      <button type="button" onClick={onClick} disabled={saving} style={{
        padding: "11px 24px", borderRadius: 10, border: "none", fontFamily: FONT,
        fontSize: 13, fontWeight: 600, cursor: saving ? "default" : "pointer",
        background: saved ? "rgba(42,107,90,0.12)" : G,
        color: saved ? G : "#fff",
        boxShadow: saved ? "none" : "0 3px 12px rgba(42,107,90,0.2)",
        transition: "all .2s",
      }}>
        {saving ? "Sauvegarde..." : saved ? "✅ Sauvegardé" : "Sauvegarder cette section"}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. LOGEMENT  →  propertyData.info
// ─────────────────────────────────────────────────────────────────────────────

const PROPERTY_TYPES = ["Appartement", "Studio", "Loft", "Maison", "Villa", "Autre"];

function LogementSection({ propertyData, onSave }) {
  const [d, setD] = useState(propertyData.info || {});
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ ...propertyData, info: d });
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  };

  return (
    <AccordionSection icon="🏠" label="Logement">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Row>
          <Field label="Type de logement">
            <Sel value={d.propertyType} onChange={v => set("propertyType", v)} options={PROPERTY_TYPES} />
          </Field>
          <Field label="Capacité max (voyageurs)">
            <Num value={d.maxGuests} onChange={v => set("maxGuests", v)} min={1} max={20} />
          </Field>
        </Row>

        <SubTitle>Adresse</SubTitle>
        <Row cols={3}>
          <Field label="Adresse" style={{ gridColumn: "span 2" }}>
            <Inp value={d.address} onChange={v => set("address", v)} placeholder="Rue et numéro" />
          </Field>
          <Field label="Code postal">
            <Inp value={d.postalCode} onChange={v => set("postalCode", v)} placeholder="06400" />
          </Field>
        </Row>
        <Row>
          <Field label="Ville">
            <Inp value={d.city} onChange={v => set("city", v)} placeholder="Cannes" />
          </Field>
          <Field label="Pays">
            <Inp value={d.country} onChange={v => set("country", v)} placeholder="France" />
          </Field>
        </Row>

        <Row>
          <Field label="Étage">
            <Num value={d.floor} onChange={v => set("floor", v)} min={0} max={50} />
          </Field>
          <Field label="Ascenseur">
            <YesNo value={d.hasElevator === true ? "Oui" : d.hasElevator === false ? "Non" : ""} onChange={v => set("hasElevator", v === "Oui")} />
          </Field>
        </Row>

        <Field label="Description du logement" sub="affichée par le concierge">
          <Txt value={d.description} onChange={v => set("description", v)} rows={4} placeholder="Ex : Loft design au 3ème étage, vue mer, parking privé inclus..." />
        </Field>

        <SubTitle>Couchages</SubTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Num value={d.bedrooms} onChange={v => set("bedrooms", v)} min={0} max={10} label="Chambre(s)" />
          <Num value={d.beds}     onChange={v => set("beds", v)}     min={0} max={20} label="Lit(s)" />
          <Num value={d.bathrooms} onChange={v => set("bathrooms", v)} min={0} max={10} label="Salle(s) de bain" />
        </div>

        <SubTitle>WiFi</SubTitle>
        <Row>
          <Field label="Nom du réseau">
            <Inp value={d.wifiName} onChange={v => set("wifiName", v)} placeholder="NomWiFi" />
          </Field>
          <Field label="Mot de passe">
            <Inp value={d.wifiPassword} onChange={v => set("wifiPassword", v)} placeholder="mot de passe" />
          </Field>
        </Row>

        <SaveButton saving={saving} saved={saved} onClick={handleSave} />
      </div>
    </AccordionSection>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ACCÈS & CHECK-IN  →  propertyData.checkin
// ─────────────────────────────────────────────────────────────────────────────

const ACCESS_MODES = ["Accueil en personne", "Boîte à clés", "Serrure connectée", "Digicode"];

function AccesSection({ propertyData, onSave }) {
  const src = propertyData.checkin || {};
  const [d, setD] = useState({
    ...src,
    accessModes: src.accessModes || (src.accessMode ? [src.accessMode] : []),
    departureChecklist: Array.isArray(src.departureChecklist)
      ? src.departureChecklist.map(i => (typeof i === "string" ? i : i?.task || "")).join("\n")
      : "",
  });
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const checklist = d.departureChecklist
        .split("\n").map(s => s.trim()).filter(Boolean);
      await onSave({ ...propertyData, checkin: {
        ...d,
        accessMode: d.accessModes.join(", "),
        departureChecklist: checklist,
      }});
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  };

  return (
    <AccordionSection icon="🔑" label="Accès & Check-in">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Row>
          <Field label="Heure de check-in" sub="ex : 15:00 ou Flexible">
            <Inp value={d.checkinTime} onChange={v => set("checkinTime", v)} placeholder="15:00" />
          </Field>
          <Field label="Heure de check-out" sub="ex : 11:00">
            <Inp value={d.checkoutTime} onChange={v => set("checkoutTime", v)} placeholder="11:00" />
          </Field>
        </Row>

        <Field label="Mode(s) d'accès">
          <MultiCheck options={ACCESS_MODES} value={d.accessModes} onChange={v => set("accessModes", v)} />
        </Field>

        <Field label="Qui accueille les voyageurs ?">
          <Inp value={Array.isArray(d.whoWelcomes) ? d.whoWelcomes.join(", ") : d.whoWelcomes || ""} onChange={v => set("whoWelcomes", v)} placeholder="Ex : Vous-même, Co-hôte..." />
        </Field>

        <SubTitle>Codes d'accès</SubTitle>
        <Row>
          <Field label="Code immeuble">
            <Inp value={d.buildingCode} onChange={v => set("buildingCode", v)} placeholder="1234A" />
          </Field>
          <Field label="Code logement / boîte à clés">
            <Inp value={d.unitCode} onChange={v => set("unitCode", v)} placeholder="Code ou instructions" />
          </Field>
        </Row>

        <Field label="Instructions d'arrivée">
          <Txt value={d.arrivalInstructions} onChange={v => set("arrivalInstructions", v)} rows={3} placeholder="Sonner à l'interphone Dupont, code 1234B, 2ème étage à gauche..." />
        </Field>

        <Field label="Checklist de départ" sub="une consigne par ligne">
          <Txt value={d.departureChecklist} onChange={v => set("departureChecklist", v)} rows={5} placeholder={"Fermer les fenêtres\nÉteindre les lumières\nLaisser les clés sur la table"} />
        </Field>

        <SaveButton saving={saving} saved={saved} onClick={handleSave} />
      </div>
    </AccordionSection>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. RÈGLES  →  propertyData.rules
// ─────────────────────────────────────────────────────────────────────────────

const SMOKING_OPTS = ["Interdit partout", "Extérieur uniquement", "Autorisé"];
const SHOES_OPTS   = ["Autorisées", "À retirer à l'entrée", "Pas de règle particulière"];
const PARTY_OPTS   = ["Oui", "Non", "Sous conditions"];
const PETS_OPTS    = ["Oui", "Non", "Sous conditions"];

function ReglesSection({ propertyData, onSave }) {
  const src = propertyData.rules || {};
  const [d, setD] = useState({
    ...src,
    additionalRules: Array.isArray(src.additionalRules)
      ? src.additionalRules.map(r => (typeof r === "string" ? r : r?.rule || "")).join("\n")
      : "",
  });
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const extraRules = d.additionalRules
        .split("\n").map(s => s.trim()).filter(Boolean)
        .map(rule => ({ rule }));
      await onSave({ ...propertyData, rules: { ...d, additionalRules: extraRules } });
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  };

  return (
    <AccordionSection icon="📋" label="Règles">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Row>
          <Field label="Silence nocturne à partir de" sub="heure">
            <Inp type="time" value={d.quietHoursStart} onChange={v => set("quietHoursStart", v)} />
          </Field>
          <Field label="Visiteurs extérieurs max">
            <Num value={d.maxVisitors} onChange={v => set("maxVisitors", v)} min={0} max={50} />
          </Field>
        </Row>

        <Row>
          <Field label="Politique fumeur">
            <Sel value={d.smokingPolicy} onChange={v => set("smokingPolicy", v)} options={SMOKING_OPTS} />
          </Field>
          <Field label="Chaussures">
            <Sel value={d.shoesPolicy} onChange={v => set("shoesPolicy", v)} options={SHOES_OPTS} />
          </Field>
        </Row>

        <Field label="Fêtes autorisées">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Sel value={d.partiesAllowed} onChange={v => set("partiesAllowed", v)} options={PARTY_OPTS} />
            {(d.partiesAllowed === "Oui" || d.partiesAllowed === "Sous conditions") && (
              <Inp value={d.partiesNote} onChange={v => set("partiesNote", v)} placeholder="Précisez les conditions..." />
            )}
          </div>
        </Field>

        <Field label="Animaux acceptés">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Sel value={d.petsAllowed} onChange={v => set("petsAllowed", v)} options={PETS_OPTS} />
            {(d.petsAllowed === "Oui" || d.petsAllowed === "Sous conditions") && (
              <Inp value={d.petsNote} onChange={v => set("petsNote", v)} placeholder="Ex : Petits chiens uniquement..." />
            )}
          </div>
        </Field>

        <Field label="Autres règles" sub="une règle par ligne">
          <Txt
            value={d.additionalRules}
            onChange={v => set("additionalRules", v)}
            rows={4}
            placeholder={"Ne pas claquer les portes\nRespecter les parties communes\nNombre de visiteurs limité"}
          />
        </Field>

        <SaveButton saving={saving} saved={saved} onClick={handleSave} />
      </div>
    </AccordionSection>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. TV & MULTIMÉDIA  →  propertyData.appliances.tvWizard
// ─────────────────────────────────────────────────────────────────────────────

const TV_HARDWARE   = ["TV", "Box Internet", "Décodeur", "Home Cinéma", "Barre de son", "Autre"];
const TV_STREAMING  = ["Netflix", "Disney+", "Amazon Prime Video", "Apple TV+", "Canal+", "Spotify"];
const REMOTE_OPTS   = ["Incluse", "Téléphone requis", "Application TV", "Pas de télécommande"];

function TvSection({ propertyData, onSave }) {
  const src = (propertyData.appliances || {}).tvWizard || {};
  const equipmentInit = (() => {
    const base = src.equipment || [];
    const fromAccess = Object.entries(src.streamingAccess || {})
      .filter(([k, v]) => v?.accessible === "Oui" && TV_STREAMING.includes(k) && !base.includes(k))
      .map(([k]) => k);
    return [...base, ...fromAccess];
  })();
  const [d, setD] = useState({
    equipment:      equipmentInit,
    counts:         src.counts         || {},
    tvItems:        src.tvItems        || [],
    boxOperator:    src.boxOperator    || "",
    boxLocation:    src.boxLocation    || "",
    boxNotes:       src.boxNotes       || "",
    decoderBrand:   src.decoderBrand   || "",
    decoderLocation:src.decoderLocation|| "",
    decoderNotes:   src.decoderNotes   || "",
    hcBrand:        src.hcBrand        || "",
    hcLocation:     src.hcLocation     || "",
    hcNotes:        src.hcNotes        || "",
    soundbarBrand:  src.soundbarBrand  || "",
    soundbarLocation:src.soundbarLocation|| "",
    soundbarNotes:  src.soundbarNotes  || "",
    streamingAccess:src.streamingAccess|| {},
    autreLabel:     src.autreLabel     || "",
    autreLocation:  src.autreLocation  || "",
    autreNotes:     src.autreNotes     || "",
  });
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        ...propertyData,
        appliances: { ...(propertyData.appliances || {}), tvWizard: d },
      });
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  };

  const hasEq = eq => d.equipment.includes(eq);

  const toggleEq = (eq) => {
    const next = hasEq(eq) ? d.equipment.filter(e => e !== eq) : [...d.equipment, eq];
    setD(prev => ({ ...prev, equipment: next }));
  };

  const tvCount = d.counts.TV || d.tvItems.length || 0;

  const setTvCount = (n) => {
    const items = [...d.tvItems];
    while (items.length < n) items.push({});
    setD(prev => ({ ...prev, counts: { ...prev.counts, TV: n }, tvItems: items.slice(0, n) }));
  };

  const setTvItem = (i, k, v) => {
    const items = d.tvItems.map((item, idx) => idx === i ? { ...item, [k]: v } : item);
    set("tvItems", items);
  };

  const setStreaming = (name, k, v) => {
    setD(prev => ({
      ...prev,
      streamingAccess: {
        ...prev.streamingAccess,
        [name]: { ...(prev.streamingAccess[name] || {}), [k]: v },
      },
    }));
  };

  return (
    <AccordionSection icon="📺" label="TV & Multimédia">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <SubTitle>Équipements présents</SubTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#6B6B6B", marginBottom: 2 }}>Matériel</div>
          <MultiCheck options={TV_HARDWARE} value={d.equipment.filter(e => TV_HARDWARE.includes(e))} onChange={sel => {
            const streaming = d.equipment.filter(e => TV_STREAMING.includes(e));
            setD(prev => ({ ...prev, equipment: [...sel, ...streaming] }));
          }} />
          <div style={{ fontSize: 12, fontWeight: 600, color: "#6B6B6B", marginTop: 4, marginBottom: 2 }}>Streaming</div>
          <MultiCheck options={TV_STREAMING} value={d.equipment.filter(e => TV_STREAMING.includes(e))} onChange={sel => {
            const hardware = d.equipment.filter(e => TV_HARDWARE.includes(e));
            setD(prev => ({ ...prev, equipment: [...hardware, ...sel] }));
          }} />
        </div>

        {/* TVs */}
        {hasEq("TV") && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <SubTitle>Télévisions</SubTitle>
            <Num value={tvCount} onChange={setTvCount} min={1} max={10} label="Nombre de TV" />
            {Array.from({ length: tvCount }).map((_, i) => (
              <div key={i} style={{ padding: "12px 14px", background: "#F7F7F5", borderRadius: 10, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: G }}>TV {tvCount > 1 ? i + 1 : ""}</div>
                <Row>
                  <Field label="Pièce">
                    <Inp value={d.tvItems[i]?.location} onChange={v => setTvItem(i, "location", v)} placeholder="Ex : Salon" />
                  </Field>
                  <Field label="Marque">
                    <Inp value={d.tvItems[i]?.brand} onChange={v => setTvItem(i, "brand", v)} placeholder="Samsung" />
                  </Field>
                </Row>
                <Row>
                  <Field label="Modèle">
                    <Inp value={d.tvItems[i]?.model} onChange={v => setTvItem(i, "model", v)} placeholder="QE55Q80C" />
                  </Field>
                  <Field label="Télécommande">
                    <Sel value={d.tvItems[i]?.remote} onChange={v => setTvItem(i, "remote", v)} options={REMOTE_OPTS} />
                  </Field>
                </Row>
                <Field label="Notes">
                  <Txt value={d.tvItems[i]?.notes} onChange={v => setTvItem(i, "notes", v)} rows={2} placeholder="Instructions particulières..." />
                </Field>
              </div>
            ))}
          </div>
        )}

        {/* Box Internet */}
        {hasEq("Box Internet") && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SubTitle>Box Internet</SubTitle>
            <Row>
              <Field label="Opérateur"><Inp value={d.boxOperator} onChange={v => set("boxOperator", v)} placeholder="Orange, SFR..." /></Field>
              <Field label="Emplacement"><Inp value={d.boxLocation} onChange={v => set("boxLocation", v)} placeholder="Meuble TV, couloir..." /></Field>
            </Row>
            <Field label="Notes"><Txt value={d.boxNotes} onChange={v => set("boxNotes", v)} rows={2} placeholder="Instructions de redémarrage, etc." /></Field>
          </div>
        )}

        {/* Décodeur */}
        {hasEq("Décodeur") && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SubTitle>Décodeur</SubTitle>
            <Row>
              <Field label="Marque"><Inp value={d.decoderBrand} onChange={v => set("decoderBrand", v)} placeholder="Canal+, TNT..." /></Field>
              <Field label="Emplacement"><Inp value={d.decoderLocation} onChange={v => set("decoderLocation", v)} placeholder="Meuble TV salon" /></Field>
            </Row>
            <Field label="Notes"><Txt value={d.decoderNotes} onChange={v => set("decoderNotes", v)} rows={2} /></Field>
          </div>
        )}

        {/* Home Cinéma */}
        {hasEq("Home Cinéma") && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SubTitle>Home Cinéma</SubTitle>
            <Row>
              <Field label="Marque"><Inp value={d.hcBrand} onChange={v => set("hcBrand", v)} placeholder="Sony, LG..." /></Field>
              <Field label="Emplacement"><Inp value={d.hcLocation} onChange={v => set("hcLocation", v)} /></Field>
            </Row>
            <Field label="Notes"><Txt value={d.hcNotes} onChange={v => set("hcNotes", v)} rows={2} /></Field>
          </div>
        )}

        {/* Barre de son */}
        {hasEq("Barre de son") && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SubTitle>Barre de son</SubTitle>
            <Row>
              <Field label="Marque"><Inp value={d.soundbarBrand} onChange={v => set("soundbarBrand", v)} placeholder="Sonos, Bose..." /></Field>
              <Field label="Emplacement"><Inp value={d.soundbarLocation} onChange={v => set("soundbarLocation", v)} /></Field>
            </Row>
            <Field label="Notes"><Txt value={d.soundbarNotes} onChange={v => set("soundbarNotes", v)} rows={2} /></Field>
          </div>
        )}

        {/* Streaming */}
        {TV_STREAMING.filter(s => hasEq(s)).length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SubTitle>Accès streaming</SubTitle>
            {TV_STREAMING.filter(s => hasEq(s)).map(name => {
              const info = d.streamingAccess[name] || {};
              return (
                <div key={name} style={{ padding: "10px 12px", background: "#F7F7F5", borderRadius: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{name}</span>
                    <span style={{ fontSize: 12, color: "#6B6B6B" }}>Accessible :</span>
                    <YesNo value={info.accessible || ""} onChange={v => setStreaming(name, "accessible", v)} />
                  </div>
                  {info.accessible === "Oui" && (
                    <Inp value={info.instructions} onChange={v => setStreaming(name, "instructions", v)} placeholder="Instructions de connexion..." />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Autre */}
        {hasEq("Autre") && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SubTitle>Autre équipement</SubTitle>
            <Row>
              <Field label="Nom de l'équipement"><Inp value={d.autreLabel} onChange={v => set("autreLabel", v)} placeholder="Projecteur, Chromecast..." /></Field>
              <Field label="Emplacement"><Inp value={d.autreLocation} onChange={v => set("autreLocation", v)} /></Field>
            </Row>
            <Field label="Notes"><Txt value={d.autreNotes} onChange={v => set("autreNotes", v)} rows={2} /></Field>
          </div>
        )}

        <SaveButton saving={saving} saved={saved} onClick={handleSave} />
      </div>
    </AccordionSection>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. CONTACTS  →  propertyData.info.contacts
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_OPTS = ["Propriétaire", "Gestionnaire", "Contact d'urgence", "Autre"];

function ContactsSection({ propertyData, onSave }) {
  const [contacts, setContacts] = useState(propertyData.info?.contacts || [{}]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const update = (i, k, v) => setContacts(prev => prev.map((c, idx) => idx === i ? { ...c, [k]: v } : c));
  const add    = ()  => setContacts(prev => [...prev, {}]);
  const remove = (i) => setContacts(prev => prev.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ ...propertyData, info: { ...(propertyData.info || {}), contacts } });
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  };

  return (
    <AccordionSection icon="📞" label="Contacts">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {contacts.map((c, i) => (
          <div key={i} style={{ padding: "14px", background: "#F7F7F5", borderRadius: 12, display: "flex", flexDirection: "column", gap: 10, position: "relative" }}>
            {contacts.length > 1 && (
              <button type="button" onClick={() => remove(i)} style={{
                position: "absolute", top: 10, right: 10, width: 26, height: 26,
                borderRadius: 6, border: "none", background: "rgba(229,62,62,0.1)",
                color: "#E53E3E", cursor: "pointer", fontSize: 13,
              }}>✕</button>
            )}
            <Row>
              <Field label="Nom complet">
                <Inp value={c.name} onChange={v => update(i, "name", v)} placeholder="Jean Dupont" />
              </Field>
              <Field label="Rôle">
                <Sel value={c.role} onChange={v => update(i, "role", v)} options={ROLE_OPTS} />
              </Field>
            </Row>
            {c.role === "Autre" && (
              <Field label="Précisez la fonction">
                <Inp value={c.roleOther} onChange={v => update(i, "roleOther", v)} placeholder="Femme de ménage, Voisin de confiance..." />
              </Field>
            )}
            <Row>
              <Field label="Téléphone">
                <Inp value={c.phone} onChange={v => update(i, "phone", v)} placeholder="+33 6 12 34 56 78" />
              </Field>
              <Field label="Email (optionnel)">
                <Inp value={c.email} onChange={v => update(i, "email", v)} placeholder="jean@email.com" type="email" />
              </Field>
            </Row>
          </div>
        ))}

        <button type="button" onClick={add} style={{
          padding: "10px", borderRadius: 10, border: `2px dashed rgba(42,107,90,0.3)`,
          background: "rgba(42,107,90,0.02)", color: G, fontSize: 13, fontWeight: 500,
          cursor: "pointer", fontFamily: FONT,
        }}>+ Ajouter un contact</button>

        <SaveButton saving={saving} saved={saved} onClick={handleSave} />
      </div>
    </AccordionSection>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. PERSONNALITÉ  →  propertyData.personality
// ─────────────────────────────────────────────────────────────────────────────

const TONE_OPTS = ["Hospitalier et convivial", "Professionnel et formel", "Décontracté et sympa"];

function PersonaliteSection({ propertyData, onSave }) {
  const [d, setD] = useState(propertyData.personality || {});
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ ...propertyData, personality: d });
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  };

  const contacts = propertyData.info?.contacts || [];
  const contactOptions = contacts
    .filter(c => c?.name?.trim())
    .map(c => c.name + (c.role && c.role !== "Autre" ? ` (${c.role})` : ""));

  return (
    <AccordionSection icon="🎭" label="Personnalité du concierge">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Ton du concierge">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {TONE_OPTS.map(opt => {
              const sel = d.tone === opt;
              return (
                <button key={opt} type="button" onClick={() => set("tone", opt)} style={{
                  padding: "12px 16px", borderRadius: 10, textAlign: "left",
                  border: sel ? `2px solid ${G}` : "1px solid rgba(0,0,0,0.12)",
                  background: sel ? "rgba(42,107,90,0.08)" : "#fff",
                  color: sel ? G : "#1A1A1A", fontFamily: FONT, fontSize: 13,
                  fontWeight: sel ? 600 : 400, cursor: "pointer",
                }}>{sel ? "● " : "○ "}{opt}</button>
              );
            })}
          </div>
        </Field>

        <Field label="Contact par défaut" sub="si le concierge ne peut pas répondre">
          {contactOptions.length > 0 ? (
            <Sel value={d.defaultContact} onChange={v => set("defaultContact", v)} options={contactOptions} />
          ) : (
            <Inp value={d.defaultContact} onChange={v => set("defaultContact", v)} placeholder="Ex : Jean Dupont, propriétaire" />
          )}
        </Field>

        <SaveButton saving={saving} saved={saved} onClick={handleSave} />
      </div>
    </AccordionSection>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. ÉQUIPEMENTS  →  propertyData.appliances.items
// ─────────────────────────────────────────────────────────────────────────────

const APPLIANCE_GROUPS = [
  {
    label: "Cuisine",
    items: [
      { id: "oven",          label: "Four" },
      { id: "cooktop",       label: "Plaques de cuisson" },
      { id: "hood",          label: "Hotte" },
      { id: "fridge",        label: "Réfrigérateur" },
      { id: "freezer",       label: "Congélateur" },
      { id: "dishwasher",    label: "Lave-vaisselle" },
      { id: "microwave",     label: "Micro-ondes" },
      { id: "coffeeMachine", label: "Machine à café" },
      { id: "kettle",        label: "Bouilloire" },
      { id: "toaster",       label: "Grille-pain" },
      { id: "blender",       label: "Blender" },
      { id: "foodProcessor", label: "Robot culinaire" },
    ],
  },
  {
    label: "Entretien",
    items: [
      { id: "washingMachine", label: "Lave-linge" },
      { id: "dryer",          label: "Sèche-linge" },
      { id: "vacuum",         label: "Aspirateur" },
      { id: "iron",           label: "Fer à repasser" },
      { id: "robotVacuum",    label: "Robot aspirateur" },
    ],
  },
  {
    label: "Confort",
    items: [
      { id: "airConditioning", label: "Climatisation" },
      { id: "heating",         label: "Chauffage" },
      { id: "waterHeater",     label: "Chauffe-eau" },
      { id: "fan",             label: "Ventilateur" },
      { id: "airPurifier",     label: "Purificateur d'air" },
    ],
  },
  {
    label: "Salle de bain",
    items: [
      { id: "hairDryer",    label: "Sèche-cheveux" },
      { id: "towelWarmer",  label: "Sèche-serviettes" },
    ],
  },
];

function EquipementsSection({ propertyData, onSave }) {
  const [items, setItems] = useState({ ...(propertyData.appliances?.items || {}) });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const setItem = (id, k, v) => setItems(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [k]: v } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ ...propertyData, appliances: { ...(propertyData.appliances || {}), items } });
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  };

  return (
    <AccordionSection icon="🍳" label="Équipements">
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {APPLIANCE_GROUPS.map(group => (
          <div key={group.label} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SubTitle>{group.label}</SubTitle>
            {group.items.map(({ id, label }) => {
              const item = items[id] || {};
              const enabled = item.enabled === true || item.enabled === "Oui";
              return (
                <div key={id} style={{ display: "flex", flexDirection: "column", gap: 8, padding: "10px 12px", background: "#F7F7F5", borderRadius: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#1A1A1A" }}>{label}</span>
                    <YesNo
                      value={enabled ? "Oui" : item.enabled === false || item.enabled === "Non" ? "Non" : ""}
                      onChange={v => setItem(id, "enabled", v === "Oui")}
                    />
                  </div>
                  {enabled && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <Row>
                        <Field label="Marque / Modèle">
                          <Inp value={item.brandModel} onChange={v => setItem(id, "brandModel", v)} placeholder="Ex : Samsung WW90T" />
                        </Field>
                        <Field label="Emplacement">
                          <Inp value={item.location} onChange={v => setItem(id, "location", v)} placeholder="Ex : Cuisine" />
                        </Field>
                      </Row>
                      <Field label="Instructions spécifiques" sub="optionnel">
                        <Txt value={item.specificInstructions} onChange={v => setItem(id, "specificInstructions", v)} rows={2} placeholder="Ex : Mettre à 60° pour le linge blanc..." />
                      </Field>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        <SaveButton saving={saving} saved={saved} onClick={handleSave} />
      </div>
    </AccordionSection>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. LUMIÈRES, FENÊTRES & FERMETURES  →  propertyData.appliances.lightingWizard
// ─────────────────────────────────────────────────────────────────────────────

function LumieresSection({ propertyData, onSave }) {
  const [lw, setLw] = useState({ ...(propertyData.appliances?.lightingWizard || {}) });
  const set = (k, v) => setLw(prev => ({ ...prev, [k]: v }));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ ...propertyData, appliances: { ...(propertyData.appliances || {}), lightingWizard: lw } });
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  };

  const openingItems   = lw.openingSpecificItems  || [{}];
  const closureItems   = lw.closureSpecificItems  || [{}];
  const lightingItems  = lw.lightingItems         || [{}];

  const setListItem = (key, i, k, v) =>
    setLw(prev => {
      const arr = [...(prev[key] || [{}])];
      arr[i] = { ...(arr[i] || {}), [k]: v };
      return { ...prev, [key]: arr };
    });
  const addListItem    = (key) => setLw(prev => ({ ...prev, [key]: [...(prev[key] || [{}]), {}] }));
  const removeListItem = (key, i) => setLw(prev => ({ ...prev, [key]: (prev[key] || []).filter((_, idx) => idx !== i) }));

  const hasSpecificOpening = (lw.openingScopes || []).includes("Des ouvrants spécifiques");
  const hasStores          = (lw.closureTypes  || []).includes("Stores");
  const lightingNotNone    = !(lw.lightingTypes || []).includes("Aucune") && (lw.lightingTypes || []).length > 0;

  return (
    <AccordionSection icon="💡" label="Lumières, Fenêtres & Fermetures">
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Ouvrants */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <SubTitle>Ouvrants (fenêtres)</SubTitle>
          <Field label="Y a-t-il des instructions ?">
            <YesNo value={lw.hasOpeningInstructions} onChange={v => set("hasOpeningInstructions", v)} />
          </Field>
          {lw.hasOpeningInstructions === "Oui" && (
            <>
              <Field label="Portée">
                <MultiCheck
                  options={["Tous les ouvrants", "Des ouvrants spécifiques"]}
                  value={lw.openingScopes || []}
                  onChange={v => set("openingScopes", v)}
                />
              </Field>
              <Field label="Instructions générales">
                <Txt value={lw.openingGeneralInstructions} onChange={v => set("openingGeneralInstructions", v)} rows={3} placeholder="Ex : Ne pas laisser les fenêtres ouvertes la nuit..." />
              </Field>
              {hasSpecificOpening && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Label text="Ouvrants spécifiques" />
                  {openingItems.map((item, i) => (
                    <div key={i} style={{ padding: "10px 12px", background: "#F7F7F5", borderRadius: 10, display: "flex", flexDirection: "column", gap: 8, position: "relative" }}>
                      {openingItems.length > 1 && (
                        <button type="button" onClick={() => removeListItem("openingSpecificItems", i)} style={{ position: "absolute", top: 8, right: 8, width: 24, height: 24, borderRadius: 6, border: "none", background: "rgba(229,62,62,0.1)", color: "#E53E3E", cursor: "pointer", fontSize: 12 }}>✕</button>
                      )}
                      <Row>
                        <Field label="Pièce"><Inp value={item.room} onChange={v => setListItem("openingSpecificItems", i, "room", v)} placeholder="Chambre" /></Field>
                        <Field label="Emplacement"><Inp value={item.location} onChange={v => setListItem("openingSpecificItems", i, "location", v)} placeholder="Fenêtre côté rue" /></Field>
                      </Row>
                      <Field label="Instructions"><Txt value={item.instructions} onChange={v => setListItem("openingSpecificItems", i, "instructions", v)} rows={2} /></Field>
                    </div>
                  ))}
                  <button type="button" onClick={() => addListItem("openingSpecificItems")} style={{ padding: "8px", borderRadius: 10, border: `2px dashed rgba(42,107,90,0.3)`, background: "rgba(42,107,90,0.02)", color: G, fontSize: 13, cursor: "pointer", fontFamily: FONT }}>+ Ajouter un ouvrant</button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Fermetures */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <SubTitle>Fermetures (stores / volets)</SubTitle>
          <Field label="Types présents">
            <MultiCheck options={["Stores", "Volets", "Aucun"]} value={lw.closureTypes || []} onChange={v => set("closureTypes", v)} />
          </Field>
          {hasStores && (
            <>
              <Field label="Type de stores">
                <MultiCheck options={["Manuels", "Télécommandés"]} value={lw.storesTypes || []} onChange={v => set("storesTypes", v)} />
              </Field>
              {(lw.storesTypes || []).includes("Manuels") && (
                <Field label="Note (stores manuels)"><Inp value={lw.storesManualNote} onChange={v => set("storesManualNote", v)} placeholder="Ex : Manivelle dans le placard..." /></Field>
              )}
              {(lw.storesTypes || []).includes("Télécommandés") && (
                <Field label="Emplacement télécommande"><Inp value={lw.storesRemoteLocation} onChange={v => set("storesRemoteLocation", v)} placeholder="Ex : Tiroir meuble TV" /></Field>
              )}
            </>
          )}
          <Field label="Type d'instructions">
            <Sel value={lw.closureInstructionType} onChange={v => set("closureInstructionType", v)} options={["Toutes", "Spécifiques", "Aucune"]} />
          </Field>
          {lw.closureInstructionType === "Toutes" && (
            <Field label="Instructions générales">
              <Txt value={lw.closureGeneralInstructions} onChange={v => set("closureGeneralInstructions", v)} rows={3} />
            </Field>
          )}
          {lw.closureInstructionType === "Spécifiques" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Label text="Fermetures spécifiques" />
              {closureItems.map((item, i) => (
                <div key={i} style={{ padding: "10px 12px", background: "#F7F7F5", borderRadius: 10, display: "flex", flexDirection: "column", gap: 8, position: "relative" }}>
                  {closureItems.length > 1 && (
                    <button type="button" onClick={() => removeListItem("closureSpecificItems", i)} style={{ position: "absolute", top: 8, right: 8, width: 24, height: 24, borderRadius: 6, border: "none", background: "rgba(229,62,62,0.1)", color: "#E53E3E", cursor: "pointer", fontSize: 12 }}>✕</button>
                  )}
                  <Field label="Ouvrant"><Inp value={item.opening} onChange={v => setListItem("closureSpecificItems", i, "opening", v)} placeholder="Volet chambre" /></Field>
                  <Field label="Instructions"><Txt value={item.instructions} onChange={v => setListItem("closureSpecificItems", i, "instructions", v)} rows={2} /></Field>
                </div>
              ))}
              <button type="button" onClick={() => addListItem("closureSpecificItems")} style={{ padding: "8px", borderRadius: 10, border: `2px dashed rgba(42,107,90,0.3)`, background: "rgba(42,107,90,0.02)", color: G, fontSize: 13, cursor: "pointer", fontFamily: FONT }}>+ Ajouter une fermeture</button>
            </div>
          )}
        </div>

        {/* Lumières */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <SubTitle>Lumières</SubTitle>
          <Field label="Type d'infos">
            <MultiCheck options={["Utilisation", "Emplacements", "Aucune"]} value={lw.lightingTypes || []} onChange={v => set("lightingTypes", v)} />
          </Field>
          {lightingNotNone && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Label text="Points lumineux" />
              {lightingItems.map((item, i) => (
                <div key={i} style={{ padding: "10px 12px", background: "#F7F7F5", borderRadius: 10, display: "flex", flexDirection: "column", gap: 8, position: "relative" }}>
                  {lightingItems.length > 1 && (
                    <button type="button" onClick={() => removeListItem("lightingItems", i)} style={{ position: "absolute", top: 8, right: 8, width: 24, height: 24, borderRadius: 6, border: "none", background: "rgba(229,62,62,0.1)", color: "#E53E3E", cursor: "pointer", fontSize: 12 }}>✕</button>
                  )}
                  <Row>
                    <Field label="Pièce"><Inp value={item.room} onChange={v => setListItem("lightingItems", i, "room", v)} placeholder="Salon" /></Field>
                    <Field label="Lumière"><Inp value={item.light} onChange={v => setListItem("lightingItems", i, "light", v)} placeholder="Lampadaire" /></Field>
                  </Row>
                  <Field label="Instruction"><Txt value={item.instruction} onChange={v => setListItem("lightingItems", i, "instruction", v)} rows={2} placeholder="Interrupteur derrière la porte..." /></Field>
                </div>
              ))}
              <button type="button" onClick={() => addListItem("lightingItems")} style={{ padding: "8px", borderRadius: 10, border: `2px dashed rgba(42,107,90,0.3)`, background: "rgba(42,107,90,0.02)", color: G, fontSize: 13, cursor: "pointer", fontFamily: FONT }}>+ Ajouter un point lumineux</button>
            </div>
          )}
        </div>

        <SaveButton saving={saving} saved={saved} onClick={handleSave} />
      </div>
    </AccordionSection>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. RANGEMENTS  →  propertyData.appliances.storageDetails
// ─────────────────────────────────────────────────────────────────────────────

function RangementsSection({ propertyData, onSave }) {
  const [s, setS] = useState({ ...(propertyData.appliances?.storageDetails || {}) });
  const set = (k, v) => setS(prev => ({ ...prev, [k]: v }));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ ...propertyData, appliances: { ...(propertyData.appliances || {}), storageDetails: s } });
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  };

  return (
    <AccordionSection icon="🗄️" label="Rangements">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Draps et serviettes fournis ?">
          <YesNo value={s.linensProvided} onChange={v => set("linensProvided", v)} />
        </Field>
        {s.linensProvided === "Oui" && (
          <Field label="Emplacement draps / serviettes">
            <Inp value={s.linensLocation} onChange={v => set("linensLocation", v)} placeholder="Ex : Placard couloir, étagère du haut" />
          </Field>
        )}

        <Field label="Produits ménagers fournis ?">
          <YesNo value={s.cleaningProvided} onChange={v => set("cleaningProvided", v)} />
        </Field>
        {s.cleaningProvided === "Oui" && (
          <Field label="Emplacement produits ménagers">
            <Inp value={s.cleaningLocation} onChange={v => set("cleaningLocation", v)} placeholder="Ex : Sous l'évier cuisine" />
          </Field>
        )}

        <Field label="Tri sélectif ?">
          <YesNo value={s.recycling} onChange={v => set("recycling", v)} />
        </Field>

        <Field label="Emplacement des poubelles">
          <Inp value={s.binLocation} onChange={v => set("binLocation", v)} placeholder="Ex : Local poubelles rez-de-chaussée, code 1234" />
        </Field>

        <Field label="Placards réservés aux locataires">
          <Txt value={s.guestClosets} onChange={v => set("guestClosets", v)} rows={3} placeholder="Ex : Placard chambre libre, 2 tiroirs à droite dans la cuisine..." />
        </Field>

        <SaveButton saving={saving} saved={saved} onClick={handleSave} />
      </div>
    </AccordionSection>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. QUARTIER  →  propertyData.recommendations / activities / transport
// ─────────────────────────────────────────────────────────────────────────────

const REC_ICONS  = { restaurants:"🍽️", barsAndCafes:"🍸", beaches:"🏖️", shopping:"🛍️", markets:"🧺", commerces:"🏪", nightlife:"🌙", other:"➕" };
const ACT_ICONS  = { onFoot:"🚶", byBoat:"⛵", excursions:"🗺️", sportsAndWellness:"🏋️", cultureAndMuseums:"🏛️", familyAndKids:"👨‍👩‍👧", other:"➕" };
const TRP_ICONS  = { publicTransport:"🚌", train:"🚆", taxiAndRideshare:"🚕", carRental:"🚗", bicycle:"🚲", other:"➕" };

function CategoryItems({ cat, data, itemsKey, itemFields, onChange }) {
  const items = data[cat.id]?.[itemsKey] || [];
  const enabled = data[cat.id]?.enabled;

  const update = (i, k, v) =>
    onChange({ ...data, [cat.id]: { ...(data[cat.id] || {}), [itemsKey]: items.map((it, idx) => idx === i ? { ...it, [k]: v } : it) } });
  const add = () =>
    onChange({ ...data, [cat.id]: { ...(data[cat.id] || {}), [itemsKey]: [...items, {}] } });
  const remove = (i) =>
    onChange({ ...data, [cat.id]: { ...(data[cat.id] || {}), [itemsKey]: items.filter((_, idx) => idx !== i) } });

  if (!enabled) return null;
  return (
    <div style={{ padding: "10px 12px", background: "#F7F7F5", borderRadius: 10, display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((item, i) => (
        <div key={i} style={{ background: "#fff", borderRadius: 8, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6, position: "relative" }}>
          <button type="button" onClick={() => remove(i)} style={{ position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: 5, border: "none", background: "rgba(229,62,62,0.1)", color: "#E53E3E", cursor: "pointer", fontSize: 11 }}>✕</button>
          {itemFields.map(f => (
            <Inp key={f.id} value={item[f.id]} onChange={v => update(i, f.id, v)} placeholder={f.placeholder} />
          ))}
        </div>
      ))}
      <button type="button" onClick={add} style={{ padding: "7px", borderRadius: 8, border: `2px dashed rgba(42,107,90,0.3)`, background: "rgba(42,107,90,0.02)", color: G, fontSize: 12, cursor: "pointer", fontFamily: FONT }}>+ Ajouter</button>
    </div>
  );
}

function CatToggleGroup({ categories, icons, data, onChange, itemsKey, itemFields }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {categories.map(cat => {
          const enabled = data[cat.id]?.enabled;
          return (
            <button key={cat.id} type="button" onClick={() =>
              onChange({ ...data, [cat.id]: { ...(data[cat.id] || {}), enabled: !enabled, [itemsKey]: data[cat.id]?.[itemsKey] || [] } })}
              style={{
                padding: "7px 12px", borderRadius: 20, fontSize: 12, fontFamily: FONT,
                border: enabled ? `2px solid ${G}` : "1px solid rgba(0,0,0,0.12)",
                background: enabled ? "rgba(42,107,90,0.1)" : "#fff",
                color: enabled ? G : "#1A1A1A", fontWeight: enabled ? 600 : 400, cursor: "pointer",
              }}
            >{icons[cat.id]} {cat.label}{enabled ? " ✓" : ""}</button>
          );
        })}
      </div>
      {categories.filter(cat => data[cat.id]?.enabled).map(cat => (
        <div key={cat.id}>
          <div style={{ fontSize: 12, fontWeight: 600, color: G, marginBottom: 4 }}>{icons[cat.id]} {cat.label}</div>
          <CategoryItems cat={cat} data={data} itemsKey={itemsKey} itemFields={itemFields} onChange={onChange} />
        </div>
      ))}
    </div>
  );
}

function QuartierSection({ propertyData, onSave }) {
  const [recs, setRecs]  = useState({ ...(propertyData.recommendations?.categories || {}) });
  const [acts, setActs]  = useState({ ...(propertyData.activities?.categories || {}) });
  const [trps, setTrps]  = useState({ ...(propertyData.transport?.categories || {}) });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        ...propertyData,
        recommendations: { ...(propertyData.recommendations || {}), categories: recs },
        activities:      { ...(propertyData.activities      || {}), categories: acts },
        transport:       { ...(propertyData.transport       || {}), categories: trps },
      });
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  };

  return (
    <AccordionSection icon="🗺️" label="Quartier & Recommandations">
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <SubTitle>Recommandations</SubTitle>
          <CatToggleGroup
            categories={RECOMMENDATION_CATEGORIES}
            icons={REC_ICONS}
            data={recs}
            onChange={setRecs}
            itemsKey="places"
            itemFields={[
              { id: "name",           placeholder: "Nom du lieu" },
              { id: "whyWeRecommend", placeholder: "Ce qu'on y aime..." },
            ]}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <SubTitle>Activités & Visites</SubTitle>
          <CatToggleGroup
            categories={ACTIVITY_CATEGORIES}
            icons={ACT_ICONS}
            data={acts}
            onChange={setActs}
            itemsKey="activities"
            itemFields={[
              { id: "name",        placeholder: "Nom de l'activité" },
              { id: "description", placeholder: "En quelques mots..." },
            ]}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <SubTitle>Transports</SubTitle>
          <CatToggleGroup
            categories={TRANSPORT_CATEGORIES}
            icons={TRP_ICONS}
            data={trps}
            onChange={setTrps}
            itemsKey="options"
            itemFields={[
              { id: "name",             placeholder: "Nom / Ligne (ex : Bus 200)" },
              { id: "practicalDetails", placeholder: "Infos pratiques (arrêt, tarif...)" },
            ]}
          />
        </div>

        <SaveButton saving={saving} saved={saved} onClick={handleSave} />
      </div>
    </AccordionSection>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ContentTab
// ─────────────────────────────────────────────────────────────────────────────

export default function ContentTab({ propertyData, onSave }) {
  const pd = propertyData || {};
  const [showImport, setShowImport] = useState(false);

  async function handleImport(data) {
    const merged = {
      ...pd,
      ...(data.info     ? { info:     { ...(pd.info     || {}), ...data.info     } } : {}),
      ...(data.checkin  ? { checkin:  { ...(pd.checkin  || {}), ...data.checkin  } } : {}),
      ...(data.rules    ? { rules:    { ...(pd.rules    || {}), ...data.rules    } } : {}),
      ...(data.appliances ? { appliances: { ...(pd.appliances || {}), ...data.appliances } } : {}),
    };
    await onSave(merged);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {showImport && (
        <ImportModal
          onImport={data => { handleImport(data); setShowImport(false); }}
          onClose={() => setShowImport(false)}
        />
      )}

      {/* Import button */}
      <button
        type="button"
        onClick={() => setShowImport(true)}
        style={{
          width: "100%", padding: "13px 18px", borderRadius: 12,
          border: `1.5px solid ${G}`, background: "#fff",
          color: G, fontFamily: FONT, fontSize: 13, fontWeight: 600,
          cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "center", gap: 8,
          transition: "background .15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(42,107,90,0.05)")}
        onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
      >
        🔄 Importer / Mettre à jour depuis Airbnb
      </button>

      <LogementSection    propertyData={pd} onSave={onSave} />
      <AccesSection       propertyData={pd} onSave={onSave} />
      <ReglesSection      propertyData={pd} onSave={onSave} />
      <EquipementsSection propertyData={pd} onSave={onSave} />
      <LumieresSection    propertyData={pd} onSave={onSave} />
      <RangementsSection  propertyData={pd} onSave={onSave} />
      <TvSection          propertyData={pd} onSave={onSave} />
      <QuartierSection    propertyData={pd} onSave={onSave} />
      <ContactsSection    propertyData={pd} onSave={onSave} />
      <PersonaliteSection propertyData={pd} onSave={onSave} />
    </div>
  );
}
