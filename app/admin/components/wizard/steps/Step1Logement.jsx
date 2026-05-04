"use client";
import { useRef, useState } from "react";
import { QuestionScreen, QuestionNav, ContinueButton, BigButtonChoice, BigNumberStepper, BigTextarea, C } from "../WizardUI";
import AddressAutocomplete from "../../AddressAutocomplete";

const PROPERTY_TYPES = ["Studio", "1 chambre", "2 chambres", "3 chambres", "4+ chambres", "Maison", "Villa"];
const isApartment = (t) => ["Studio", "1 chambre", "2 chambres", "3 chambres", "4+ chambres"].includes(t);

const wizardInpStyle = {
  padding: "14px 16px", borderRadius: 14,
  border: "2px solid rgba(0,0,0,0.1)", fontSize: 16,
};

export default function Step1Logement({ data = {}, onChange, onNext, onBack, onSkip }) {
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

  const apt = isApartment(data.propertyType);

  return (
    <>
      {q === 0 && (
        <QuestionScreen title="Quel type de logement proposez-vous ?" visible={vis}>
          <BigButtonChoice
            options={PROPERTY_TYPES}
            value={data.propertyType}
            onChange={v => { set("propertyType", v); fwd(1); }}
            columns={2}
            withOther
          />
          <QuestionNav onBack={hist.current.length > 0 ? bk : onBack} onSkip={() => fwd(1)} />
        </QuestionScreen>
      )}
      {q === 1 && (
        <QuestionScreen title="Quelle est l'adresse du logement ?" sub="Ces informations ne sont jamais montrées publiquement." visible={vis}>
          <AddressAutocomplete
            value={data.address || ""}
            onChange={v => onChange({ ...data, address: v })}
            onSelect={({ street, city, postalCode, country }) =>
              onChange({ ...data, address: street, city, postalCode, country })
            }
            placeholder="Tapez votre adresse..."
            style={wizardInpStyle}
          />
          {data.city && (
            <p style={{ margin: "8px 0 0", fontSize: 13, color: C.green }}>✓ {data.city}</p>
          )}
          <ContinueButton onClick={() => fwd(apt ? 2 : 4)} />
          <QuestionNav onBack={bk} onSkip={() => fwd(apt ? 2 : 4)} />
        </QuestionScreen>
      )}
      {q === 2 && (
        <QuestionScreen title="À quel étage se situe le logement ?" sub="0 = rez-de-chaussée" visible={vis}>
          <BigNumberStepper value={data.floor ?? 0} onChange={v => set("floor", v)} min={0} max={30} />
          <ContinueButton onClick={() => fwd(3)} />
          <QuestionNav onBack={bk} onSkip={() => fwd(3)} />
        </QuestionScreen>
      )}
      {q === 3 && (
        <QuestionScreen title="Y a-t-il un ascenseur ?" visible={vis}>
          <BigButtonChoice
            options={["Oui", "Non"]}
            value={data.hasElevator === true ? "Oui" : data.hasElevator === false ? "Non" : ""}
            onChange={v => { set("hasElevator", v === "Oui"); fwd(4); }}
            columns={2}
          />
          <QuestionNav onBack={bk} onSkip={() => fwd(4)} />
        </QuestionScreen>
      )}
      {q === 4 && (
        <QuestionScreen title="Décrivez votre logement en quelques phrases" sub="Votre concierge utilisera cette description pour se présenter." visible={vis}>
          <p style={{ margin: "0 0 8px", fontSize: 13, color: "#9CA3AF", fontStyle: "italic" }}>
            Ex : Loft design au 3e étage, vue mer, parking privé inclus. Idéal pour un couple ou une petite famille.
          </p>
          <BigTextarea value={data.description} onChange={v => set("description", v)} rows={5} />
          <ContinueButton onClick={() => fwd(5)} />
          <QuestionNav onBack={bk} onSkip={() => fwd(5)} />
        </QuestionScreen>
      )}
      {q === 5 && (
        <QuestionScreen title="Combien de voyageurs pouvez-vous accueillir ?" visible={vis}>
          <BigNumberStepper value={data.maxGuests ?? 4} onChange={v => set("maxGuests", v)} min={1} max={20} />
          <ContinueButton onClick={() => fwd(6)} />
          <QuestionNav onBack={bk} onSkip={() => fwd(6)} />
        </QuestionScreen>
      )}
      {q === 6 && (
        <QuestionScreen title="Détaillez les couchages" visible={vis}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "center" }}>
            <BigNumberStepper value={data.bedrooms ?? 1} onChange={v => set("bedrooms", v)} min={0} max={10} label="Chambre(s)" />
            <BigNumberStepper value={data.beds ?? 1} onChange={v => set("beds", v)} min={0} max={20} label="Lit(s)" />
            <BigNumberStepper value={data.bathrooms ?? 1} onChange={v => set("bathrooms", v)} min={0} max={10} label="Salle(s) de bain" />
          </div>
          <ContinueButton onClick={onNext} label="Étape suivante →" />
          <QuestionNav onBack={bk} onSkip={onNext} />
        </QuestionScreen>
      )}
    </>
  );
}
