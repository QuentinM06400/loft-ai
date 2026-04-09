"use client";
import { useState } from "react";
import { QuestionScreen, ContinueButton, BigButtonChoice, MultiButtonChoice, BigTextInput, BigTextarea, ChipChecklist, InfoNote, C } from "../WizardUI";

const CHECKIN_TIMES  = ["14:00", "15:00", "16:00", "Flexible", "Flexible sur demande"];
const CHECKOUT_TIMES = ["10:00", "11:00", "12:00", "Flexible", "Flexible sur demande"];
const ACCESS_MODES   = ["Accueil en personne", "Boîte à clés", "Serrure connectée", "Digicode"];
const WHO_WELCOMES   = ["Le propriétaire", "Un co-hôte", "Une personne de confiance", "Une agence / conciergerie"];
const DEPARTURE_SUGGESTIONS = [
  "Fermer les fenêtres", "Éteindre les lumières et la climatisation",
  "Sortir les poubelles", "Laisser les clés sur la table", "Tirer la porte à clé",
  "Lancer une machine de draps", "Vider le réfrigérateur", "Fermer la porte à clé",
];

function MultiTimeChoice({ options, values = [], otherValue = "", onValuesChange, onOtherChange }) {
  const toggle = (opt) => {
    const next = values.includes(opt) ? values.filter(v => v !== opt) : [...values, opt];
    onValuesChange(next);
  };
  const hasOther = values.includes("__autre__");
  const toggleOther = () => {
    if (hasOther) {
      onValuesChange(values.filter(v => v !== "__autre__"));
      onOtherChange("");
    } else {
      onValuesChange([...values, "__autre__"]);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
        {options.map(t => {
          const sel = values.includes(t);
          return (
            <button key={t} type="button" onClick={() => toggle(t)} style={{
              minHeight: 52, padding: "12px 24px", borderRadius: 14,
              border: sel ? `2px solid ${C.green}` : "2px solid rgba(0,0,0,0.1)",
              background: sel ? C.green : "#fff",
              color: sel ? "#fff" : "#1A1A1A",
              fontSize: 16, fontWeight: sel ? 700 : 400,
              cursor: "pointer", fontFamily: C.font, transition: "all .15s",
              boxShadow: sel ? "0 3px 12px rgba(42,107,90,0.25)" : "none",
            }}>{sel ? "✓ " : ""}{t}</button>
          );
        })}
        <button type="button" onClick={toggleOther} style={{
          minHeight: 52, padding: "12px 24px", borderRadius: 14,
          border: hasOther ? `2px solid ${C.green}` : "2px solid rgba(0,0,0,0.1)",
          background: hasOther ? "rgba(42,107,90,0.09)" : "#fff",
          color: hasOther ? C.green : "#6B6B6B",
          fontSize: 16, cursor: "pointer", fontFamily: C.font, transition: "all .15s",
        }}>Autre</button>
      </div>
      {hasOther && (
        <input
          type="time"
          value={otherValue || ""}
          onChange={e => onOtherChange(e.target.value)}
          autoFocus
          style={{
            padding: "14px 16px", borderRadius: 14, border: `2px solid ${C.green}`,
            fontFamily: C.font, fontSize: 16, outline: "none",
            width: "100%", maxWidth: 200, margin: "0 auto", display: "block", boxSizing: "border-box",
          }}
        />
      )}
    </div>
  );
}

export default function Step2Acces({ data = {}, onChange, onNext, onBack, onSkip }) {
  const set = (k, v) => onChange({ ...data, [k]: v });

  const [q, setQ] = useState(0);
  const [vis, setVis] = useState(true);

  function goTo(n) {
    setVis(false);
    setTimeout(() => { setQ(n); setVis(true); window.scrollTo({ top: 0, behavior: "instant" }); }, 400);
  }
  function fwd(n) { goTo(n); }

  const accessModes = data.accessModes || [];

  const checkinTimes = data.checkinTimes || (data.checkinTime ? [data.checkinTime] : []);
  const checkoutTimes = data.checkoutTimes || (data.checkoutTime ? [data.checkoutTime] : []);

  function setCheckinTimes(vals) {
    const real = vals.filter(v => v !== "__autre__");
    onChange({ ...data, checkinTimes: vals, checkinTime: real.join(" / ") || data.checkinTimeOther || "" });
  }
  function setCheckoutTimes(vals) {
    const real = vals.filter(v => v !== "__autre__");
    onChange({ ...data, checkoutTimes: vals, checkoutTime: real.join(" / ") || data.checkoutTimeOther || "" });
  }

  return (
    <>
      {q === 0 && (
        <QuestionScreen title="À quelle heure vos voyageurs peuvent-ils arriver ?" sub="Vous pouvez sélectionner plusieurs créneaux." visible={vis}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <MultiTimeChoice
              options={CHECKIN_TIMES}
              values={checkinTimes}
              otherValue={data.checkinTimeOther || ""}
              onValuesChange={setCheckinTimes}
              onOtherChange={v => {
                const real = checkinTimes.filter(t => t !== "__autre__");
                onChange({ ...data, checkinTimes, checkinTimeOther: v, checkinTime: [...real, v].filter(Boolean).join(" / ") });
              }}
            />
            <ContinueButton onClick={() => fwd(1)} />
          </div>
        </QuestionScreen>
      )}
      {q === 1 && (
        <QuestionScreen title="À quelle heure doivent-ils quitter le logement ?" sub="Vous pouvez sélectionner plusieurs créneaux." visible={vis}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <MultiTimeChoice
              options={CHECKOUT_TIMES}
              values={checkoutTimes}
              otherValue={data.checkoutTimeOther || ""}
              onValuesChange={setCheckoutTimes}
              onOtherChange={v => {
                const real = checkoutTimes.filter(t => t !== "__autre__");
                onChange({ ...data, checkoutTimes, checkoutTimeOther: v, checkoutTime: [...real, v].filter(Boolean).join(" / ") });
              }}
            />
            <ContinueButton onClick={() => fwd(2)} />
          </div>
        </QuestionScreen>
      )}
      {q === 2 && (
        <QuestionScreen title="Comment accède-t-on au logement ?" sub="Vous pouvez sélectionner plusieurs options." visible={vis}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {ACCESS_MODES.map(mode => {
                const sel = accessModes.includes(mode);
                return (
                  <button key={mode} type="button" onClick={() => {
                    const next = sel ? accessModes.filter(m => m !== mode) : [...accessModes, mode];
                    set("accessModes", next);
                  }} style={{
                    minHeight: 52, padding: "12px 16px", borderRadius: 14,
                    border: sel ? `2px solid ${C.green}` : "2px solid rgba(0,0,0,0.1)",
                    background: sel ? C.green : "#fff",
                    color: sel ? "#fff" : "#1A1A1A",
                    fontSize: 14, fontWeight: sel ? 600 : 400,
                    cursor: "pointer", fontFamily: C.font, transition: "all .15s",
                  }}>{sel ? "✓ " : ""}{mode}</button>
                );
              })}
              <button type="button" onClick={() => {
                const hasOther = accessModes.some(m => !ACCESS_MODES.includes(m));
                if (hasOther) {
                  set("accessModes", accessModes.filter(m => ACCESS_MODES.includes(m)));
                } else {
                  set("accessModes", [...accessModes.filter(m => ACCESS_MODES.includes(m)), "__autre__"]);
                }
              }} style={{
                minHeight: 52, padding: "12px 16px", borderRadius: 14,
                border: accessModes.some(m => !ACCESS_MODES.includes(m)) ? `2px solid ${C.green}` : "2px solid rgba(0,0,0,0.1)",
                background: accessModes.some(m => !ACCESS_MODES.includes(m)) ? "rgba(42,107,90,0.09)" : "#fff",
                color: accessModes.some(m => !ACCESS_MODES.includes(m)) ? C.green : "#6B6B6B",
                fontSize: 14, cursor: "pointer", fontFamily: C.font, transition: "all .15s",
              }}>Autre</button>
            </div>
            {accessModes.some(m => !ACCESS_MODES.includes(m)) && (
              <BigTextInput
                value={accessModes.find(m => !ACCESS_MODES.includes(m) && m !== "__autre__") || ""}
                onChange={v => {
                  const base = accessModes.filter(m => ACCESS_MODES.includes(m));
                  set("accessModes", v.trim() ? [...base, v] : [...base, "__autre__"]);
                }}
                placeholder="Précisez le mode d'accès..."
                autoFocus
              />
            )}
            <ContinueButton onClick={() => fwd(accessModes.includes("Accueil en personne") ? 3 : 4)} disabled={accessModes.length === 0} />
          </div>
        </QuestionScreen>
      )}
      {q === 3 && (
        <QuestionScreen title="Qui accueille les voyageurs ?" sub="Vous pouvez sélectionner plusieurs réponses." visible={vis}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <MultiButtonChoice
              options={WHO_WELCOMES}
              value={Array.isArray(data.whoWelcomes) ? data.whoWelcomes : data.whoWelcomes ? [data.whoWelcomes] : []}
              onChange={v => set("whoWelcomes", v)}
              columns={2}
              withOther
            />
            <ContinueButton onClick={() => fwd(4)} />
          </div>
        </QuestionScreen>
      )}
      {q === 4 && (
        <QuestionScreen title="Y a-t-il des codes d'accès ?" sub="Ces informations sont confidentielles — uniquement partagées avec vos voyageurs via le concierge." visible={vis}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <BigTextInput value={data.buildingCode} onChange={v => set("buildingCode", v)} placeholder="Code immeuble (optionnel) — ex : 1234A" />
            <BigTextInput value={data.unitCode} onChange={v => set("unitCode", v)} placeholder="Code logement / boîte à clés (optionnel)" />
            <InfoNote>Ces codes ne sont accessibles qu'aux voyageurs via votre concierge AI.</InfoNote>
            <ContinueButton onClick={() => fwd(5)} label="Continuer →" />
            <button type="button" onClick={() => fwd(5)} style={{ background: "none", border: "none", color: "#9A9A9A", fontSize: 13, cursor: "pointer", fontFamily: C.font, padding: "8px", margin: "0 auto", display: "block" }}>Pas de code →</button>
          </div>
        </QuestionScreen>
      )}
      {q === 5 && (
        <QuestionScreen title="Des instructions particulières pour l'arrivée ?" sub="Optionnel" visible={vis}>
          <p style={{ margin: "0 0 8px", fontSize: 13, color: "#9CA3AF", fontStyle: "italic" }}>
            Ex : Sonner à l'interphone Dupont, code 1234B, 2ème étage à gauche...
          </p>
          <BigTextarea value={data.arrivalInstructions} onChange={v => set("arrivalInstructions", v)} rows={4} />
          <ContinueButton onClick={() => fwd(6)} />
          <button type="button" onClick={() => fwd(6)} style={{ background: "none", border: "none", color: "#9A9A9A", fontSize: 13, cursor: "pointer", fontFamily: C.font, padding: "8px", margin: "0 auto", display: "block" }}>Pas d'instructions particulières →</button>
        </QuestionScreen>
      )}
      {q === 6 && (
        <QuestionScreen title="Quelles consignes pour le départ ?" sub="Cliquez sur les suggestions ou ajoutez les vôtres." visible={vis}>
          <ChipChecklist
            items={data.departureChecklist || []}
            onChange={v => set("departureChecklist", v)}
            suggestions={DEPARTURE_SUGGESTIONS}
            placeholder="Ex : Vider le réfrigérateur..."
          />
          <ContinueButton onClick={onNext} label="Étape suivante →" />
        </QuestionScreen>
      )}
    </>
  );
}
