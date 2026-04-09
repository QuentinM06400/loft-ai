"use client";
import { useState } from "react";
import { QA, ButtonChoice, WizardTextInput, WizardSection, StepNav, QuestionNav, WizardPhoneField, C } from "../WizardUI";

const ROLES = ["Propriétaire", "Gestionnaire", "Contact d'urgence", "Autre"];

function ContactForm({ contact = {}, onChange, onRemove }) {
  const set = (k, v) => onChange({ ...contact, [k]: v });
  const isOtherRole = contact.role === "Autre";

  return (
    <div style={{
      background: "#F7F7F5", borderRadius: 12, padding: "16px",
      border: "1px solid rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: 10,
      position: "relative",
    }}>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          style={{
            position: "absolute", top: 10, right: 10, width: 26, height: 26,
            borderRadius: 6, border: "none", background: "rgba(229,62,62,0.08)",
            color: "#E53E3E", cursor: "pointer", fontSize: 13,
          }}
        >✕</button>
      )}
      <WizardTextInput
        value={contact.name}
        onChange={v => set("name", v)}
        placeholder="Nom complet"
      />
      {/* Role chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {ROLES.map(r => (
          <button
            key={r}
            type="button"
            onClick={() => set("role", r)}
            style={{
              padding: "8px 14px", minHeight: 40, borderRadius: 20, fontFamily: C.font,
              border: contact.role === r ? `2px solid ${C.green}` : "2px solid rgba(0,0,0,0.1)",
              background: contact.role === r ? "rgba(42,107,90,0.08)" : "#fff",
              color: contact.role === r ? C.green : "#1A1A1A",
              fontSize: 13, fontWeight: contact.role === r ? 600 : 400, cursor: "pointer",
              transition: "all .15s",
            }}
          >{r}</button>
        ))}
      </div>
      {/* "Autre" role: show text field for custom function */}
      {isOtherRole && (
        <WizardTextInput
          value={contact.roleOther || ""}
          onChange={v => set("roleOther", v)}
          placeholder="Précisez la fonction (ex : Femme de ménage, Voisin de confiance...)"
          autoFocus
        />
      )}
      <WizardPhoneField value={contact.phone} onChange={v => set("phone", v)} />
      <WizardTextInput
        value={contact.email}
        onChange={v => set("email", v)}
        placeholder="Email (optionnel)"
        type="email"
      />
    </div>
  );
}

export default function Step6Contacts({ data = {}, onChange, onNext, onBack, onSkip }) {
  const contacts = data.contacts || [{}];
  const setContacts = (c) => onChange({ ...data, contacts: c });
  const setContact = (i, c) => setContacts(contacts.map((x, idx) => idx === i ? c : x));
  const [addMore, setAddMore] = useState(contacts.length > 1 ? "Oui" : null);

  return (
    <WizardSection>

      {/* 6.1 Contact principal */}
      <QA index={0} question="Qui est le contact principal pour les voyageurs ?">
        <ContactForm
          contact={contacts[0] || {}}
          onChange={c => setContact(0, c)}
        />
      </QA>

      {/* 6.2 Contacts supplémentaires */}
      <QA index={1} question="Souhaitez-vous ajouter d'autres contacts ?" sub="Gestionnaire, contact d'urgence, service ménage...">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <ButtonChoice
            options={["Oui", "Non, c'est suffisant"]}
            value={addMore}
            onChange={v => {
              setAddMore(v);
              if (v === "Oui" && contacts.length === 1) setContacts([...contacts, {}]);
            }}
            columns={2}
          />
          {addMore === "Oui" && contacts.slice(1).map((c, i) => (
            <ContactForm
              key={i + 1}
              contact={c}
              onChange={newC => setContact(i + 1, newC)}
              onRemove={() => setContacts(contacts.filter((_, idx) => idx !== i + 1))}
            />
          ))}
          {addMore === "Oui" && (
            <button
              type="button"
              onClick={() => setContacts([...contacts, {}])}
              style={{
                padding: "10px", borderRadius: 10, border: "2px dashed rgba(42,107,90,0.3)",
                background: "rgba(42,107,90,0.02)", color: C.green, fontSize: 13, fontWeight: 500,
                cursor: "pointer", fontFamily: C.font,
              }}
            >+ Ajouter un autre contact</button>
          )}
        </div>
      </QA>

      {/* 6.3 WiFi */}
      <QA index={2} question="Quel est le réseau WiFi du logement ?" sub="Vos voyageurs pourront demander le code WiFi à votre concierge.">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <WizardTextInput
            value={data.wifiName}
            onChange={v => onChange({ ...data, wifiName: v })}
            placeholder="Nom du réseau WiFi"
          />
          <WizardTextInput
            value={data.wifiPassword}
            onChange={v => onChange({ ...data, wifiPassword: v })}
            placeholder="Mot de passe WiFi"
          />
          <p style={{ margin: 0, fontSize: 12, color: "#9A9A9A" }}>
            Vous n'avez pas le code sous la main ? Laissez vide et complétez-le plus tard depuis votre espace admin.
          </p>
        </div>
      </QA>

      <StepNav onNext={onNext} nextLabel="Voir le récapitulatif →" />
      <QuestionNav onBack={onBack} onSkip={onSkip || onNext} skipLabel="Passer" />
    </WizardSection>
  );
}
