"use client";
import { useRef, useState } from "react";
import { QuestionScreen, QuestionNav, ContinueButton, BigButtonChoice, BigTextInput, ChipChecklist, C } from "../WizardUI";

const QUIET_TIMES   = ["21:00", "22:00", "23:00", "Pas de restriction"];
const PARTY_OPTIONS = ["Oui", "Non", "Sous conditions", "Autre"];
const PET_OPTIONS   = ["Oui", "Non", "Sous conditions", "Autre"];
const SMOKE_OPTIONS = ["Interdit partout", "Extérieur uniquement", "Autorisé"];
const SHOE_OPTIONS  = ["Autorisées", "À retirer à l'entrée", "Pas de règle particulière"];
const RULE_SUGGESTIONS = ["Ne pas claquer les portes", "Respecter les parties communes", "Ne pas déplacer les meubles", "Nombre de visiteurs limité"];

export default function Step3Regles({ data = {}, onChange, onNext, onBack, onSkip }) {
  const set = (k, v) => onChange({ ...data, [k]: v });

  const [q, setQ] = useState(0);
  const [vis, setVis] = useState(true);
  const [showQuietOther, setShowQuietOther] = useState(
    data.quietHoursStart && !QUIET_TIMES.includes(data.quietHoursStart)
  );
  const hist = useRef([]);

  function goTo(n) {
    setVis(false);
    setTimeout(() => { setQ(n); setVis(true); window.scrollTo({ top: 0, behavior: "instant" }); }, 400);
  }
  function fwd(n) { hist.current = [...hist.current, q]; goTo(n); }
  function bk() {
    const p = hist.current[hist.current.length - 1];
    if (p === undefined) { onBack?.(); } else { hist.current = hist.current.slice(0, -1); goTo(p); }
  }

  return (
    <>
      {q === 0 && (
        <QuestionScreen title="À partir de quelle heure demandez-vous le silence ?" visible={vis}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
              {QUIET_TIMES.map(t => {
                const sel = data.quietHoursStart === t;
                return (
                  <button key={t} type="button" onClick={() => {
                    setShowQuietOther(false);
                    set("quietHoursStart", t);
                    setTimeout(() => fwd(1), 350);
                  }} style={{
                    minHeight: 52, padding: "12px 24px", borderRadius: 14,
                    border: sel ? `2px solid ${C.green}` : "2px solid rgba(0,0,0,0.1)",
                    background: sel ? C.green : "#fff", color: sel ? "#fff" : "#1A1A1A",
                    fontSize: 16, fontWeight: sel ? 700 : 400,
                    cursor: "pointer", fontFamily: C.font, transition: "all .15s",
                    boxShadow: sel ? "0 3px 12px rgba(42,107,90,0.25)" : "none",
                  }}>{t}</button>
                );
              })}
              <button type="button" onClick={() => { setShowQuietOther(true); set("quietHoursStart", ""); }} style={{
                minHeight: 52, padding: "12px 24px", borderRadius: 14,
                border: showQuietOther ? `2px solid ${C.green}` : "2px solid rgba(0,0,0,0.1)",
                background: showQuietOther ? "rgba(42,107,90,0.09)" : "#fff",
                color: showQuietOther ? C.green : "#6B6B6B",
                fontSize: 16, cursor: "pointer", fontFamily: C.font, transition: "all .15s",
              }}>Autre</button>
            </div>
            {showQuietOther && (
              <>
                <input
                  type="time"
                  value={data.quietHoursStart || ""}
                  onChange={e => set("quietHoursStart", e.target.value)}
                  autoFocus
                  style={{
                    padding: "14px 16px", borderRadius: 14, border: `2px solid ${C.green}`,
                    fontFamily: C.font, fontSize: 16, outline: "none",
                    maxWidth: 180, margin: "0 auto", display: "block", boxSizing: "border-box",
                  }}
                />
                <ContinueButton onClick={() => fwd(1)} />
              </>
            )}
          </div>
          <QuestionNav onBack={hist.current.length > 0 ? bk : onBack} onSkip={() => fwd(1)} skipLabel="Passer" />
        </QuestionScreen>
      )}
      {q === 1 && (
        <QuestionScreen title="Les fêtes sont-elles autorisées ?" visible={vis}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <BigButtonChoice options={PARTY_OPTIONS} value={data.partiesAllowed} onChange={v => {
              set("partiesAllowed", v);
              if (v !== "Sous conditions" && v !== "Autre") fwd(2);
            }} columns={2} />
            {(data.partiesAllowed === "Sous conditions" || data.partiesAllowed === "Autre") && (
              <>
                <BigTextInput
                  value={data.partiesNote}
                  onChange={v => set("partiesNote", v)}
                  placeholder={data.partiesAllowed === "Autre" ? "Précisez..." : "Précisez les conditions..."}
                  autoFocus
                />
                <ContinueButton onClick={() => fwd(2)} />
              </>
            )}
          </div>
          <QuestionNav onBack={bk} onSkip={() => fwd(2)} skipLabel="Passer" />
        </QuestionScreen>
      )}
      {q === 2 && (
        <QuestionScreen title="Les animaux sont-ils acceptés ?" visible={vis}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <BigButtonChoice options={PET_OPTIONS} value={data.petsAllowed} onChange={v => {
              set("petsAllowed", v);
              if (v !== "Sous conditions" && v !== "Autre") fwd(3);
            }} columns={2} />
            {(data.petsAllowed === "Sous conditions" || data.petsAllowed === "Autre") && (
              <>
                <BigTextInput
                  value={data.petsNote}
                  onChange={v => set("petsNote", v)}
                  placeholder={data.petsAllowed === "Autre" ? "Précisez..." : "Ex : Petits chiens uniquement, dépôt de garantie supplémentaire"}
                  autoFocus
                />
                <ContinueButton onClick={() => fwd(3)} />
              </>
            )}
          </div>
          <QuestionNav onBack={bk} onSkip={() => fwd(3)} skipLabel="Passer" />
        </QuestionScreen>
      )}
      {q === 3 && (
        <QuestionScreen title="Quelle est votre politique sur le tabac ?" visible={vis}>
          <BigButtonChoice options={SMOKE_OPTIONS} value={data.smokingPolicy} onChange={v => { set("smokingPolicy", v); fwd(4); }} columns={2} />
          <QuestionNav onBack={bk} onSkip={() => fwd(4)} skipLabel="Passer" />
        </QuestionScreen>
      )}
      {q === 4 && (
        <QuestionScreen title="Les chaussures dans le logement ?" visible={vis}>
          <BigButtonChoice options={SHOE_OPTIONS} value={data.shoesPolicy} onChange={v => { set("shoesPolicy", v); fwd(5); }} columns={2} />
          <QuestionNav onBack={bk} onSkip={() => fwd(5)} skipLabel="Passer" />
        </QuestionScreen>
      )}
      {q === 5 && (
        <QuestionScreen title="D'autres règles à ajouter ?" sub="Cliquez sur les suggestions ou ajoutez les vôtres." visible={vis}>
          <ChipChecklist
            items={data.additionalRules || []}
            onChange={v => set("additionalRules", v)}
            suggestions={RULE_SUGGESTIONS}
            placeholder="Ex : Merci de laisser le logement en ordre..."
          />
          <ContinueButton onClick={onNext} label="Étape suivante →" />
          <button type="button" onClick={onNext} style={{ background: "none", border: "none", color: "#9A9A9A", fontSize: 13, cursor: "pointer", fontFamily: C.font, padding: "8px", margin: "0 auto", display: "block" }}>Pas d'autres règles →</button>
          <QuestionNav onBack={bk} />
        </QuestionScreen>
      )}
    </>
  );
}
