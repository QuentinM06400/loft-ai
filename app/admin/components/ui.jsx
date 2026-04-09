"use client";
import { useState } from "react";

// ── Base styles ────────────────────────────────────────────────────────────────

export const S = {
  input: {
    width: "100%", padding: "12px 14px", borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.12)", background: "#FAFAF8",
    fontFamily: "inherit", fontSize: 14, outline: "none",
    boxSizing: "border-box", transition: "border .15s, box-shadow .15s",
    color: "#1A1A1A",
  },
  focus: {
    borderColor: "#2A6B5A", boxShadow: "0 0 0 3px rgba(42,107,90,0.08)",
  },
  label: {
    fontSize: 13, fontWeight: 500, color: "#1A1A1A",
    display: "block", marginBottom: 6,
  },
  card: {
    background: "#F7F7F5", borderRadius: 10, padding: "14px 16px",
    border: "1px solid rgba(0,0,0,0.06)",
  },
  addBtn: {
    padding: "10px 16px", borderRadius: 10,
    border: "2px dashed rgba(42,107,90,0.3)",
    background: "transparent", color: "#2A6B5A",
    fontSize: 13, fontWeight: 500, cursor: "pointer",
    fontFamily: "inherit", width: "100%", transition: "background .15s",
  },
};

// ── FormField ──────────────────────────────────────────────────────────────────

export function FormField({ label, required, children, style }) {
  return (
    <div style={style}>
      <label style={S.label}>
        {label}
        {required
          ? <span style={{ color: "#E53E3E", marginLeft: 3 }}>*</span>
          : <span style={{ color: "#9A9A9A", fontSize: 11, fontWeight: 400, marginLeft: 5 }}>(optionnel)</span>}
      </label>
      {children}
    </div>
  );
}

// ── Input ──────────────────────────────────────────────────────────────────────

export function Input({ value, onChange, placeholder, type = "text", disabled, style: extra }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value ?? ""}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...S.input, ...(focused ? S.focus : {}), ...(disabled ? { opacity: 0.5 } : {}), ...extra }}
    />
  );
}

// ── Textarea ───────────────────────────────────────────────────────────────────

export function Textarea({ value, onChange, placeholder, rows = 3 }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      value={value ?? ""}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...S.input, resize: "vertical", lineHeight: 1.6, ...(focused ? S.focus : {}) }}
    />
  );
}

// ── SelectField ────────────────────────────────────────────────────────────────

export function SelectField({ value, onChange, options, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      value={value ?? ""}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...S.input, cursor: "pointer", ...(focused ? S.focus : {}) }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// ── TimeField ──────────────────────────────────────────────────────────────────

export function TimeField({ value, onChange }) {
  const times = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      times.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  const [focused, setFocused] = useState(false);
  return (
    <select
      value={value ?? ""}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...S.input, cursor: "pointer", ...(focused ? S.focus : {}) }}
    >
      <option value="">--:--</option>
      {times.map(t => <option key={t} value={t}>{t}</option>)}
    </select>
  );
}

// ── PhoneField ─────────────────────────────────────────────────────────────────

const COUNTRY_CODES = [
  { code: "+33",  flag: "🇫🇷" }, { code: "+34",  flag: "🇪🇸" },
  { code: "+44",  flag: "🇬🇧" }, { code: "+49",  flag: "🇩🇪" },
  { code: "+39",  flag: "🇮🇹" }, { code: "+1",   flag: "🇺🇸" },
  { code: "+41",  flag: "🇨🇭" }, { code: "+32",  flag: "🇧🇪" },
  { code: "+352", flag: "🇱🇺" }, { code: "+377", flag: "🇲🇨" },
  { code: "+31",  flag: "🇳🇱" }, { code: "+46",  flag: "🇸🇪" },
  { code: "+47",  flag: "🇳🇴" }, { code: "+45",  flag: "🇩🇰" },
  { code: "+351", flag: "🇵🇹" }, { code: "+81",  flag: "🇯🇵" },
  { code: "+86",  flag: "🇨🇳" }, { code: "+7",   flag: "🇷🇺" },
];

function parsePhone(v = "") {
  const sorted = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
  for (const c of sorted) {
    if (v.startsWith(c.code)) return { country: c.code, number: v.slice(c.code.length) };
  }
  return { country: "+33", number: v };
}

export function PhoneField({ value, onChange }) {
  const { country, number } = parsePhone(value);
  const update = (c, n) => onChange(c + n);
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <select
        value={country}
        onChange={e => update(e.target.value, number)}
        style={{ ...S.input, width: 110, flexShrink: 0, cursor: "pointer" }}
      >
        {COUNTRY_CODES.map(c => (
          <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
        ))}
      </select>
      <input
        type="tel"
        value={number}
        onChange={e => update(country, e.target.value)}
        placeholder="6 12 34 56 78"
        style={{ ...S.input, flex: 1 }}
      />
    </div>
  );
}

// ── ToggleSwitch ───────────────────────────────────────────────────────────────

export function ToggleSwitch({ value, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
        background: value ? "#2A6B5A" : "rgba(0,0,0,0.14)",
        position: "relative", transition: "background .2s", flexShrink: 0,
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: "50%", background: "#fff",
        position: "absolute", top: 3, left: value ? 23 : 3,
        transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
      }} />
    </button>
  );
}

// ── BooleanField ───────────────────────────────────────────────────────────────

export function BooleanField({ value, onChange, labelOn = "Oui", labelOff = "Non" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <ToggleSwitch value={!!value} onChange={onChange} />
      <span style={{ fontSize: 13, color: "#1A1A1A" }}>{value ? labelOn : labelOff}</span>
    </div>
  );
}

// ── GroupDivider ───────────────────────────────────────────────────────────────

export function GroupDivider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0" }}>
      <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.08)" }} />
      <span style={{
        fontSize: 10, fontWeight: 700, color: "#9A9A9A",
        textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap",
      }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.08)" }} />
    </div>
  );
}

// ── Grid helpers ───────────────────────────────────────────────────────────────

export function Grid2({ children, gap = 12 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap }}>
      {children}
    </div>
  );
}

export function Grid3({ children, gap = 12 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap }}>
      {children}
    </div>
  );
}

// ── RepeatableBlock ────────────────────────────────────────────────────────────

export function RepeatableBlock({ items = [], onChange, fields, addLabel = "+ Ajouter", header }) {
  const newItem = () => {
    const item = {};
    fields.forEach(f => { item[f.id] = f.type === "boolean" ? false : ""; });
    return item;
  };

  const add = () => onChange([...items, newItem()]);
  const remove = i => onChange(items.filter((_, idx) => idx !== i));
  const update = (i, fid, val) =>
    onChange(items.map((item, idx) => idx === i ? { ...item, [fid]: val } : item));

  const renderField = (item, i, field) => {
    const val = item[field.id];
    if (field.type === "textarea") return (
      <Textarea value={val} onChange={v => update(i, field.id, v)} placeholder={field.placeholder} />
    );
    if (field.type === "select") return (
      <SelectField value={val} onChange={v => update(i, field.id, v)} options={field.options} />
    );
    if (field.type === "phone") return (
      <PhoneField value={val} onChange={v => update(i, field.id, v)} />
    );
    if (field.type === "boolean") return (
      <BooleanField value={val} onChange={v => update(i, field.id, v)} />
    );
    return (
      <Input value={val} onChange={v => update(i, field.id, v)} placeholder={field.placeholder} />
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item, i) => (
        <div key={i} style={{ ...S.card, position: "relative" }}>
          <button
            type="button"
            onClick={() => remove(i)}
            style={{
              position: "absolute", top: 10, right: 10, width: 26, height: 26,
              borderRadius: 7, border: "none", background: "rgba(229,62,62,0.08)",
              color: "#E53E3E", cursor: "pointer", fontSize: 13, lineHeight: 1,
            }}
            title="Supprimer"
          >✕</button>
          {header && (
            <div style={{ fontSize: 12, fontWeight: 600, color: "#2A6B5A", marginBottom: 10, paddingRight: 30 }}>
              {header(item, i)}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingRight: header ? 0 : 28 }}>
            {fields.map(field => (
              <div key={field.id}>
                <label style={{ ...S.label, fontSize: 12, color: "#6B6B6B", marginBottom: 4 }}>
                  {field.label}
                  {field.required && <span style={{ color: "#E53E3E", marginLeft: 2 }}>*</span>}
                </label>
                {renderField(item, i, field)}
              </div>
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        style={S.addBtn}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(42,107,90,0.04)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        {addLabel}
      </button>
    </div>
  );
}

// ── CustomFieldsBlock ──────────────────────────────────────────────────────────

export function CustomFieldsBlock({ value = [], onChange }) {
  return (
    <div>
      <GroupDivider label="Informations supplémentaires" />
      <div style={{ marginTop: 10 }}>
        <RepeatableBlock
          items={value}
          onChange={onChange}
          addLabel="+ Ajouter un champ personnalisé"
          fields={[
            { id: "fieldName",  label: "Champ",  type: "text", required: true },
            { id: "fieldValue", label: "Valeur", type: "text", required: true },
          ]}
        />
      </div>
    </div>
  );
}

// ── ToggleExpandItem (for appliances / categories) ─────────────────────────────

export function ToggleExpandItem({ label, icon, enabled, onToggle, children }) {
  return (
    <div style={{
      borderRadius: 10, border: `1px solid ${enabled ? "rgba(42,107,90,0.2)" : "rgba(0,0,0,0.08)"}`,
      overflow: "hidden", transition: "border .2s",
    }}>
      <div
        style={{
          display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
          background: enabled ? "rgba(42,107,90,0.04)" : "#fff", cursor: "pointer",
          transition: "background .2s",
        }}
        onClick={onToggle}
      >
        {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
        <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: "#1A1A1A" }}>{label}</span>
        <ToggleSwitch value={enabled} onChange={() => {}} />
      </div>
      {enabled && (
        <div style={{ padding: "0 16px 14px", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 14 }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────────

export function Toast({ message, type = "ok" }) {
  if (!message) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      padding: "12px 20px", borderRadius: 12,
      background: type === "ok" ? "#2A6B5A" : "#E53E3E",
      color: "#fff", fontSize: 13, fontWeight: 500,
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      display: "flex", alignItems: "center", gap: 8,
      animation: "slideUp .25s ease",
    }}>
      <span>{type === "ok" ? "✓" : "✕"}</span>
      {message}
    </div>
  );
}
