"use client";
import { useState } from "react";
import { QA, ButtonChoice, WizardTextInput, WizardSection, StepNav, C } from "../WizardUI";
import { RECOMMENDATION_CATEGORIES, ACTIVITY_CATEGORIES, TRANSPORT_CATEGORIES } from "@/app/lib/propertySchema";

const POI_CATEGORIES = ["Transport", "Commerce", "Santé", "Plage", "Culture", "Sport", "Autre"];

const REC_ICONS = {
  restaurants: "🍽️", barsAndCafes: "🍸", beaches: "🏖️",
  shopping: "🛍️", markets: "🧺", nightlife: "🌙", other: "➕",
};
const ACT_ICONS = {
  onFoot: "🚶", byBoat: "⛵", excursions: "🗺️",
  sportsAndWellness: "🏋️", cultureAndMuseums: "🏛️", familyAndKids: "👨‍👩‍👧", other: "➕",
};
const TRP_ICONS = {
  publicTransport: "🚌", train: "🚆", taxiAndRideshare: "🚕",
  carRental: "🚗", bicycle: "🚲", other: "➕",
};

function SimpleItemList({ items, onChange, addLabel, fields }) {
  const add = () => onChange([...items, {}]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i, k, v) => onChange(items.map((item, idx) => idx === i ? { ...item, [k]: v } : item));

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
          {fields.map(f => (
            <input
              key={f.id}
              value={item[f.id] || ""}
              onChange={e => update(i, f.id, e.target.value)}
              placeholder={f.placeholder}
              style={{
                padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)",
                fontFamily: C.font, fontSize: 13, outline: "none", boxSizing: "border-box",
                width: "100%",
              }}
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
  const [active, setActive] = useState(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {/* Category chips */}
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
                if (!wasEnabled) setActive(cat.id);
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

      {/* Items for active enabled categories */}
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

export default function Step5Quartier({ data = {}, onChange, onNext, onSkip }) {
  const location = data.location || {};
  const recommendations = data.recommendations || {};
  const activities = data.activities || {};
  const transport = data.transport || {};

  const setLocation = v => onChange({ ...data, location: v });
  const setRecommendations = v => onChange({ ...data, recommendations: v });
  const setActivities = v => onChange({ ...data, activities: v });
  const setTransport = v => onChange({ ...data, transport: v });

  const [addPOI, setAddPOI]  = useState(null);
  const [addRec, setAddRec]  = useState(null);
  const [addAct, setAddAct]  = useState(null);
  const [addTrp, setAddTrp]  = useState(null);

  return (
    <WizardSection>
      {/* 5.1 Points d'intérêt */}
      <QA index={0}
        question="Souhaitez-vous ajouter des points d'intérêt à proximité ?"
        sub="Gare, plage, commerces... Votre concierge les mentionnera aux voyageurs. Cette section pourra bientôt être générée automatiquement depuis votre adresse."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <ButtonChoice
            options={["Oui, je les ajoute", "Plus tard"]}
            value={addPOI}
            onChange={v => setAddPOI(v)}
            columns={2}
          />
          {addPOI === "Oui, je les ajoute" && (
            <SimpleItemList
              items={location.pointsOfInterest || []}
              onChange={pts => setLocation({ ...location, pointsOfInterest: pts })}
              addLabel="+ Ajouter un lieu"
              fields={[
                { id: "name",            placeholder: "Nom du lieu (ex : Gare SNCF)" },
                { id: "walkingDistance", placeholder: "Distance à pied (ex : 5 min à pied)" },
              ]}
            />
          )}
        </div>
      </QA>

      {/* 5.2 Recommandations */}
      <QA index={1}
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
                { id: "name",           placeholder: "Nom du lieu" },
                { id: "whyWeRecommend", placeholder: "Ce qu'on y aime..." },
              ]}
            />
          )}
        </div>
      </QA>

      {/* 5.3 Activités */}
      <QA index={2} question="Des activités ou visites à recommander ?">
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
                { id: "name",        placeholder: "Nom de l'activité" },
                { id: "description", placeholder: "En quelques mots..." },
              ]}
            />
          )}
        </div>
      </QA>

      {/* 5.4 Transports */}
      <QA index={3} question="Des informations sur les transports ?">
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

      <StepNav onNext={onNext} onSkip={onSkip} />
    </WizardSection>
  );
}
