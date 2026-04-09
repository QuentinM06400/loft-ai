"use client";
import { useRef, useState } from "react";
import { QA, ButtonChoice, WizardSection, StepNav, C } from "../WizardUI";
import { RECOMMENDATION_CATEGORIES, ACTIVITY_CATEGORIES, TRANSPORT_CATEGORIES } from "@/app/lib/propertySchema";

const REC_ICONS = {
  restaurants: "🍽️", barsAndCafes: "🍸", beaches: "🏖️",
  shopping: "🛍️", markets: "🧺", commerces: "🏪", nightlife: "🌙", other: "➕",
};
const ACT_ICONS = {
  onFoot: "🚶", byBoat: "⛵", excursions: "🗺️",
  sportsAndWellness: "🏋️", cultureAndMuseums: "🏛️", familyAndKids: "👨‍👩‍👧", other: "➕",
};
const TRP_ICONS = {
  publicTransport: "🚌", train: "🚆", taxiAndRideshare: "🚕",
  carRental: "🚗", bicycle: "🚲", other: "➕",
};

const inpStyle = {
  padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)",
  fontFamily: C.font, fontSize: 13, outline: "none", boxSizing: "border-box", width: "100%",
};

// Nominatim autocomplete for place names
function NominatimPlaceInput({ value, onSelect, placeholder }) {
  const [input, setInput] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);

  function fetchSuggestions(q) {
    clearTimeout(debounceRef.current);
    if (!q || q.length < 3) { setSuggestions([]); setShowDropdown(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=5&countrycodes=fr`;
        const res = await fetch(url, { headers: { "User-Agent": "loft-ai-wizard" } });
        const data = await res.json();
        setSuggestions(data);
        setShowDropdown(data.length > 0);
      } catch {}
    }, 300);
  }

  function handleSelect(item) {
    const a = item.address || {};
    const name = item.name || item.display_name.split(",")[0];
    const street = [a.house_number, a.road].filter(Boolean).join(" ");
    const city = a.city || a.town || a.village || a.municipality || "";
    const shortAddr = [street, city].filter(Boolean).join(", ");
    setInput(name);
    setSuggestions([]);
    setShowDropdown(false);
    onSelect(name, shortAddr);
  }

  return (
    <div style={{ position: "relative" }}>
      <input
        value={input}
        onChange={e => { setInput(e.target.value); onSelect(e.target.value, ""); fetchSuggestions(e.target.value); }}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        placeholder={placeholder}
        style={inpStyle}
        autoComplete="off"
      />
      {showDropdown && suggestions.length > 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, background: "#fff",
          border: "1px solid rgba(0,0,0,0.1)", borderRadius: 10, zIndex: 100,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)", overflow: "hidden", marginTop: 4,
        }}>
          {suggestions.map((s, i) => {
            const a = s.address || {};
            const name = s.name || s.display_name.split(",")[0];
            const street = [a.house_number, a.road].filter(Boolean).join(" ");
            const city = a.city || a.town || a.village || a.municipality || "";
            const shortAddr = [street, city].filter(Boolean).join(", ");
            return (
              <button
                key={i}
                type="button"
                onMouseDown={() => handleSelect(s)}
                style={{
                  display: "block", width: "100%", padding: "10px 14px", textAlign: "left",
                  background: "none", border: "none",
                  borderBottom: i < suggestions.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
                  cursor: "pointer", fontFamily: C.font, fontSize: 13, color: "#1A1A1A", lineHeight: 1.4,
                }}
              >
                <span style={{ color: C.green, fontWeight: 500 }}>📍 {name}</span>
                {shortAddr && <span style={{ color: "#6B6B6B", fontSize: 12 }}> — {shortAddr}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SimpleItemList({ items, onChange, addLabel, fields }) {
  const add = () => onChange([...items, {}]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i, k, v) => onChange(items.map((item, idx) => idx === i ? { ...item, [k]: v } : item));
  const updateMultiple = (i, updates) => onChange(items.map((item, idx) => idx === i ? { ...item, ...updates } : item));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((item, i) => (
        <div key={i} style={{
          background: "#fff", borderRadius: 10, padding: "12px 14px",
          border: "1px solid rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: 8,
          position: "relative",
        }}>
          <button
            type="button"
            onClick={() => remove(i)}
            style={{
              position: "absolute", top: 8, right: 8, width: 24, height: 24,
              borderRadius: 6, border: "none", background: "rgba(229,62,62,0.08)",
              color: "#E53E3E", cursor: "pointer", fontSize: 13,
            }}
          >✕</button>
          {fields.map(f => f.type === "nominatim" ? (
            <NominatimPlaceInput
              key={f.id}
              value={item[f.id] || ""}
              onSelect={(name, address) => updateMultiple(i, { [f.id]: name, address })}
              placeholder={f.placeholder}
            />
          ) : (
            <input
              key={f.id}
              value={item[f.id] || ""}
              onChange={e => update(i, f.id, e.target.value)}
              placeholder={f.placeholder}
              style={inpStyle}
            />
          ))}
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        style={{
          padding: "10px", borderRadius: 10, border: "2px dashed rgba(42,107,90,0.3)",
          background: "rgba(42,107,90,0.02)", color: C.green, fontSize: 13, fontWeight: 500,
          cursor: "pointer", fontFamily: C.font,
        }}
      >{addLabel}</button>
    </div>
  );
}

function CategoryToggleSection({ categories, icons, data, onChange, itemsKey, itemFields, addLabel }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
        {categories.map(cat => {
          const enabled = data[cat.id]?.enabled;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                const wasEnabled = data[cat.id]?.enabled;
                onChange({ ...data, [cat.id]: { ...(data[cat.id] || {}), enabled: !wasEnabled, [itemsKey]: data[cat.id]?.[itemsKey] || [] } });
              }}
              style={{
                padding: "8px 14px", minHeight: 40, borderRadius: 20, fontFamily: C.font,
                border: enabled ? `2px solid ${C.green}` : "2px solid rgba(0,0,0,0.1)",
                background: enabled ? "rgba(42,107,90,0.08)" : "#fff",
                color: enabled ? C.green : "#1A1A1A",
                fontSize: 13, fontWeight: enabled ? 600 : 400, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6, transition: "all .15s",
              }}
            >
              {icons[cat.id]} {cat.label}
              {enabled ? " ✓" : ""}
            </button>
          );
        })}
      </div>
      {categories.filter(cat => data[cat.id]?.enabled).map(cat => (
        <div key={cat.id} style={{
          padding: "12px 14px", background: "#F7F7F5", borderRadius: 10,
          border: "1px solid rgba(42,107,90,0.12)",
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.green, marginBottom: 10 }}>
            {icons[cat.id]} {cat.label}
          </div>
          <SimpleItemList
            items={data[cat.id]?.[itemsKey] || []}
            onChange={items => onChange({ ...data, [cat.id]: { ...data[cat.id], [itemsKey]: items } })}
            addLabel={addLabel}
            fields={itemFields}
          />
        </div>
      ))}
    </div>
  );
}

export default function Step5Quartier({ data = {}, onChange, onNext, onBack, onSkip }) {
  const recommendations = data.recommendations || {};
  const activities = data.activities || {};
  const transport = data.transport || {};

  const setRecommendations = v => onChange({ ...data, recommendations: v });
  const setActivities = v => onChange({ ...data, activities: v });
  const setTransport = v => onChange({ ...data, transport: v });

  const [addRec, setAddRec] = useState(null);
  const [addAct, setAddAct] = useState(null);
  const [addTrp, setAddTrp] = useState(null);

  return (
    <WizardSection>
      {/* Recommandations */}
      <QA index={0}
        question="Avez-vous des recommandations personnelles à partager ?"
        sub="Restaurants, bars, plages... Vos coups de cœur rendront votre concierge unique."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <ButtonChoice
            options={["Oui", "Plus tard"]}
            value={addRec}
            onChange={setAddRec}
            columns={2}
          />
          {addRec === "Oui" && (
            <CategoryToggleSection
              categories={RECOMMENDATION_CATEGORIES}
              icons={REC_ICONS}
              data={recommendations.categories || {}}
              onChange={cats => setRecommendations({ ...recommendations, categories: cats })}
              itemsKey="places"
              addLabel="+ Ajouter une adresse"
              itemFields={[
                { id: "name",           type: "nominatim", placeholder: "Nom du lieu" },
                { id: "whyWeRecommend", placeholder: "Ce qu'on y aime..." },
              ]}
            />
          )}
        </div>
      </QA>

      {/* Activités */}
      <QA index={1} question="Des activités ou visites à recommander ?">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <ButtonChoice
            options={["Oui", "Plus tard"]}
            value={addAct}
            onChange={setAddAct}
            columns={2}
          />
          {addAct === "Oui" && (
            <CategoryToggleSection
              categories={ACTIVITY_CATEGORIES}
              icons={ACT_ICONS}
              data={activities.categories || {}}
              onChange={cats => setActivities({ ...activities, categories: cats })}
              itemsKey="activities"
              addLabel="+ Ajouter une activité"
              itemFields={[
                { id: "name",        type: "nominatim", placeholder: "Nom de l'activité" },
                { id: "description", placeholder: "En quelques mots..." },
              ]}
            />
          )}
        </div>
      </QA>

      {/* Transports */}
      <QA index={2} question="Des informations sur les transports ?">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <ButtonChoice
            options={["Oui", "Plus tard"]}
            value={addTrp}
            onChange={setAddTrp}
            columns={2}
          />
          {addTrp === "Oui" && (
            <CategoryToggleSection
              categories={TRANSPORT_CATEGORIES}
              icons={TRP_ICONS}
              data={transport.categories || {}}
              onChange={cats => setTransport({ ...transport, categories: cats })}
              itemsKey="options"
              addLabel="+ Ajouter une option"
              itemFields={[
                { id: "name",             placeholder: "Nom / Ligne (ex : Bus 200)" },
                { id: "practicalDetails", placeholder: "Infos pratiques (arrêt, tarif...)" },
              ]}
            />
          )}
        </div>
      </QA>

      <StepNav onNext={onNext} nextLabel="Étape suivante →" />
    </WizardSection>
  );
}
