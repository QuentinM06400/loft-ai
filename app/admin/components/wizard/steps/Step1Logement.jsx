"use client";
import { useRef, useState } from "react";
import { QuestionScreen, QuestionNav, ContinueButton, BigButtonChoice, BigNumberStepper, BigTextarea, C } from "../WizardUI";

const PROPERTY_TYPES = ["Studio", "1 chambre", "2 chambres", "3 chambres", "4+ chambres", "Maison", "Villa"];
const isApartment = (t) => ["Studio", "1 chambre", "2 chambres", "3 chambres", "4+ chambres"].includes(t);

const inpStyle = {
  width: "100%", padding: "14px 16px", borderRadius: 14,
  border: "2px solid rgba(0,0,0,0.1)", background: "#fff",
  fontFamily: "'DM Sans', sans-serif", fontSize: 16, outline: "none",
  boxSizing: "border-box", color: "#1A1A1A", transition: "border .15s",
};

function NominatimAddressInput({ value = {}, onChange }) {
  const [input, setInput] = useState(value.address || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);

  function fetchSuggestions(q) {
    clearTimeout(debounceRef.current);
    if (!q || q.length < 3) { setSuggestions([]); setShowDropdown(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=10&countrycodes=fr`;
        const res = await fetch(url, { headers: { "User-Agent": "loft-ai-wizard" } });
        const data = await res.json();
        const filtered = data.filter(item => item.address?.road).slice(0, 5);
        setSuggestions(filtered);
        setShowDropdown(filtered.length > 0);
      } catch {}
    }, 300);
  }

  function handleSelect(item) {
    const a = item.address || {};
    const street = [a.house_number, a.road].filter(Boolean).join(" ");
    const addr = street || item.display_name.split(",")[0];
    const city = a.city || a.town || a.village || a.municipality || "";
    const postalCode = (a.postcode || "").slice(0, 5);
    // Display: "numéro + rue, Ville"
    setInput([addr, city].filter(Boolean).join(", "));
    setSuggestions([]);
    setShowDropdown(false);
    onChange({ ...value, address: addr, city, postalCode, country: a.country || "France" });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, position: "relative" }}>
      <input
        value={input}
        onChange={e => { setInput(e.target.value); fetchSuggestions(e.target.value); }}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        placeholder="Tapez votre adresse..."
        style={inpStyle}
        autoComplete="off"
      />
      {showDropdown && suggestions.length > 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, background: "#fff",
          border: "1px solid rgba(0,0,0,0.1)", borderRadius: 12, zIndex: 100,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)", overflow: "hidden", marginTop: 4,
        }}>
          {suggestions.map((s, i) => {
            const a = s.address || {};
            const street = [a.house_number, a.road].filter(Boolean).join(" ");
            const city = a.city || a.town || a.village || a.municipality || "";
            const label = [street, city].filter(Boolean).join(", ");
            return (
              <button
                key={i}
                type="button"
                onMouseDown={() => handleSelect(s)}
                style={{
                  display: "block", width: "100%", padding: "12px 16px", textAlign: "left",
                  background: "none", border: "none",
                  borderBottom: i < suggestions.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13, color: "#1A1A1A", lineHeight: 1.4,
                }}
              >
                <span style={{ color: C.green, fontWeight: 500 }}>📍 </span>{label}
              </button>
            );
          })}
        </div>
      )}
      {value.city && (
        <p style={{ margin: 0, fontSize: 12, color: C.green }}>✓ {value.city}</p>
      )}
    </div>
  );
}

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
          <NominatimAddressInput
            value={{ address: data.address, city: data.city, postalCode: data.postalCode, country: data.country }}
            onChange={v => onChange({ ...data, address: v.address, city: v.city, postalCode: v.postalCode, country: v.country })}
          />
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
