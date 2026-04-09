"use client";
import { useRef, useState } from "react";
import { QuestionScreen, QuestionNav, ContinueButton, BigButtonChoice, BigTimeChoice, BigTextInput, BigTextarea, ChipChecklist, InfoNote, C } from "../WizardUI";

const CHECKIN_TIMES  = ["14:00", "15:00", "16:00", "Flexible"];
const CHECKOUT_TIMES = ["10:00", "11:00", "12:00"];
const ACCESS_MODES   = ["Accueil en personne", "Boîte à clés", "Serrure connectée", "Digicode"];
const WHO_WELCOMES   = ["Le propriétaire", "Un co-hôte", "Une personne de confiance", "Une agence / conciergerie"];
const DEPARTURE_SUGGESTIONS = [
  "Fermer les fenêtres", "Éteindre les lumières et la climatisation",
  "Sortir les poubelles", "Laisser les clés sur la table", "Tirer la porte à clé",
  "Lancer une machine de draps", "Vider le réfrigérateur", "Fermer la porte à clé",
];

export default function Step2Acces({ data = {}, onChange, onNext, onBack, onSkip }) {
  const set = (k, v) => onChange({ ...data, [k]: v });

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

  const accessModes = data.accessModes || [];
  const hasPersonalWelcome = accessModes.includes("Accueil en personne");

  // q0: checkin, q1: checkout, q2: access modes, q3: who welcomes (conditional), q4: codes, q5: arrival instructions, q6: departure checklist

  return (
    <>
      {q === 0 && (
        <QuestionScreen title="À quelle heure vos voyageurs peuvent-ils arriver ?" visible={vis}>
          <BigTimeChoice options={CHECKIN_TIMES} value={data.checkinTime} onChange={v => { set("checkinTime", v); fwd(1); }} />
          <QuestionNav onBack={bk} onSkip={() => fwd(1)} />
        </QuestionScreen>
      )}
      {q === 1 && (
        <QuestionScreen title="À quelle heure doivent-ils quitter le logement ?" visible={vis}>
          <BigTimeChoice options={CHECKOUT_TIMES} value={data.checkoutTime} onChange={v => { set("checkoutTime", v); fwd(2); }} />
          <QuestionNav onBack={bk} onSkip={() => fwd(2)} />
        </QuestionScreen>
      )}
      {q === 2 && (
        <QuestionScreen title="Comment accède-t-on au logement ?" sub="Vous pouvez sélectionner plusieurs options." visible={vis}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[...ACCESS_MODES, "Autre"].map(mode => {
                const sel = accessModes.includes(mode === "Autre" ? (accessModes.find(m => !ACCESS_MODES.includes(m)) || mode) : mode);
                return (
                  <button key={mode} type="button" onClick={() => {
                    let next;
                    if (mode === "Autre") {
                      const custom = accessModes.find(m => !ACCESS_MODES.includes(m));
                      next = custom ? accessModes.filter(m => m !== custom) : [...accessModes, "Autre"];
                    } else {
                      next = accessModes.includes(mode) ? accessModes.filter(m => m !== mode) : [...accessModes, mode];
                    }
                    set("accessModes", next);
                  }} style={{
                    minHeight: 52, padding: "12px 16px", borderRadius: 14,
                    border: accessModes.includes(mode) ? `2px solid ${C.green}` : "2px solid rgba(0,0,0,0.1)",
                    background: accessModes.includes(mode) ? C.green : "#fff",
                    color: accessModes.includes(mode) ? "#fff" : "#1A1A1A",
                    fontSize: 14, fontWeight: accessModes.includes(mode) ? 600 : 400,
                    cursor: "pointer", fontFamily: C.font, transition: "all .15s",
                  }}>{accessModes.includes(mode) ? "✓ " : ""}{mode}</button>
                );
              })}
            </div>
            <ContinueButton onClick={() => fwd(accessModes.includes("Accueil en personne") ? 3 : 4)} disabled={accessModes.length === 0} />
          </div>
          <QuestionNav onBack={bk} onSkip={() => fwd(4)} />
        </QuestionScreen>
      )}
      {q === 3 && (
        <QuestionScreen title="Qui accueille les voyageurs ?" visible={vis}>
          <BigButtonChoice options={WHO_WELCOMES} value={data.whoWelcomes} onChange={v => { set("whoWelcomes", v); fwd(4); }} columns={2} withOther />
          <QuestionNav onBack={bk} onSkip={() => fwd(4)} />
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
          <QuestionNav onBack={bk} />
        </QuestionScreen>
      )}
      {q === 5 && (
        <QuestionScreen title="Des instructions particulières pour l'arrivée ?" sub="Optionnel" visible={vis}>
          <BigTextarea value={data.arrivalInstructions} onChange={v => set("arrivalInstructions", v)} placeholder="Ex : Sonner à l'interphone 3B, monter au 2ème sans ascenseur, la porte est au fond du couloir à droite..." rows={4} />
          <ContinueButton onClick={() => fwd(6)} />
          <button type="button" onClick={() => fwd(6)} style={{ background: "none", border: "none", color: "#9A9A9A", fontSize: 13, cursor: "pointer", fontFamily: C.font, padding: "8px", margin: "0 auto", display: "block" }}>Pas d'instructions particulières →</button>
          <QuestionNav onBack={bk} />
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
          <QuestionNav onBack={bk} onSkip={onNext} skipLabel="Passer cette étape →" />
        </QuestionScreen>
      )}
    </>
  );
}
