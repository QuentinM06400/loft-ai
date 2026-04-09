"use client";
import { useRef, useState } from "react";
import { QuestionScreen, QuestionNav, ContinueButton, BigButtonChoice, BigTextInput, C } from "../WizardUI";

const TONE_OPTIONS = [
  "Hospitalier et convivial",
  "Professionnel et formel",
  "Décontracté et sympa",
];

export default function StepPersonality({ data = {}, onChange, onNext, onBack, wizardContacts = [] }) {
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
    if (p === undefined) { onBack?.(); } else { hist.current = hist.current.slice(0, -1); goTo(p); }
  }

  const namedContacts = wizardContacts.filter(c => c?.name?.trim());
  const contactOptions = namedContacts.map(c => {
    const role = c.roleOther || (c.role && c.role !== "Autre" ? c.role : null);
    return `${c.name}${role ? ` (${role})` : ""}`;
  });

  return (
    <>
      {q === 0 && (
        <QuestionScreen
          title="Quel ton souhaitez-vous donner à votre concierge ?"
          sub="Votre concierge s'adaptera à votre style pour répondre aux voyageurs."
          visible={vis}
        >
          <BigButtonChoice
            options={TONE_OPTIONS}
            value={data.tone}
            onChange={v => { set("tone", v); fwd(1); }}
            columns={1}
            withOther
          />
          <QuestionNav onBack={hist.current.length > 0 ? bk : onBack} onSkip={() => { set("tone", "Hospitalier et convivial"); fwd(1); }} skipLabel="Passer" />
        </QuestionScreen>
      )}
      {q === 1 && (
        <QuestionScreen
          title="En cas de question sans réponse, vers quel contact renvoyer en priorité ?"
          sub={contactOptions.length === 0 ? "Aucun contact renseigné pour l'instant — vous pouvez saisir un nom directement." : "Choisissez parmi les contacts renseignés à l'étape précédente."}
          visible={vis}
        >
          {contactOptions.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <BigButtonChoice
                options={contactOptions}
                value={data.defaultContact}
                onChange={v => { set("defaultContact", v); }}
                columns={1}
              />
              <ContinueButton onClick={onNext} label="Étape suivante →" />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <BigTextInput
                value={data.defaultContact || ""}
                onChange={v => set("defaultContact", v)}
                placeholder="Ex : Jean Dupont, propriétaire"
              />
              <ContinueButton onClick={onNext} label="Étape suivante →" />
            </div>
          )}
          <QuestionNav onBack={bk} onSkip={onNext} skipLabel="Passer" />
        </QuestionScreen>
      )}
    </>
  );
}
