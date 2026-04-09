"use client";
import { useRef, useState } from "react";
import { QuestionScreen, QuestionNav, ContinueButton, BigButtonChoice, BigTimeChoice, BigTextInput, ChipChecklist, C } from "../WizardUI";

const QUIET_TIMES   = ["21:00", "22:00", "23:00", "Pas de restriction"];
const PARTY_OPTIONS = ["Oui", "Non", "Sous conditions"];
const PET_OPTIONS   = ["Oui", "Non", "Sous conditions"];
const SMOKE_OPTIONS = ["Interdit partout", "Extérieur uniquement", "Autorisé"];
const SHOE_OPTIONS  = ["Autorisées", "À retirer à l'entrée", "Pas de règle particulière"];
const RULE_SUGGESTIONS = ["Ne pas claquer les portes", "Respecter les parties communes", "Ne pas déplacer les meubles", "Nombre de visiteurs limité"];

export default function Step3Regles({ data = {}, onChange, onNext, onBack, onSkip }) {
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

  return (
    <>
      {q === 0 && (
        <QuestionScreen title="À partir de quelle heure demandez-vous le silence ?" visible={vis}>
          <BigTimeChoice options={QUIET_TIMES} value={data.quietHoursStart} onChange={v => { set("quietHoursStart", v); fwd(1); }} />
          <QuestionNav onBack={bk} onSkip={() => fwd(1)} />
        </QuestionScreen>
      )}
      {q === 1 && (
        <QuestionScreen title="Les fêtes sont-elles autorisées ?" visible={vis}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <BigButtonChoice options={PARTY_OPTIONS} value={data.partiesAllowed} onChange={v => {
              set("partiesAllowed", v);
              if (v !== "Sous conditions") fwd(2);
            }} columns={3} />
            {data.partiesAllowed === "Sous conditions" && (
              <>
                <BigTextInput value={data.partiesNote} onChange={v => set("partiesNote", v)} placeholder="Précisez les conditions..." autoFocus />
                <ContinueButton onClick={() => fwd(2)} />
              </>
            )}
          </div>
          <QuestionNav onBack={bk} onSkip={() => fwd(2)} />
        </QuestionScreen>
      )}
      {q === 2 && (
        <QuestionScreen title="Les animaux sont-ils acceptés ?" visible={vis}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <BigButtonChoice options={PET_OPTIONS} value={data.petsAllowed} onChange={v => {
              set("petsAllowed", v);
              if (v !== "Sous conditions") fwd(3);
            }} columns={3} />
            {data.petsAllowed === "Sous conditions" && (
              <>
                <BigTextInput value={data.petsNote} onChange={v => set("petsNote", v)} placeholder="Ex : Petits chiens uniquement, dépôt de garantie supplémentaire" autoFocus />
                <ContinueButton onClick={() => fwd(3)} />
              </>
            )}
          </div>
          <QuestionNav onBack={bk} onSkip={() => fwd(3)} />
        </QuestionScreen>
      )}
      {q === 3 && (
        <QuestionScreen title="Quelle est votre politique sur le tabac ?" visible={vis}>
          <BigButtonChoice options={SMOKE_OPTIONS} value={data.smokingPolicy} onChange={v => { set("smokingPolicy", v); fwd(4); }} columns={2} />
          <QuestionNav onBack={bk} onSkip={() => fwd(4)} />
        </QuestionScreen>
      )}
      {q === 4 && (
        <QuestionScreen title="Les chaussures dans le logement ?" visible={vis}>
          <BigButtonChoice options={SHOE_OPTIONS} value={data.shoesPolicy} onChange={v => { set("shoesPolicy", v); fwd(5); }} columns={2} />
          <QuestionNav onBack={bk} onSkip={() => fwd(5)} />
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
