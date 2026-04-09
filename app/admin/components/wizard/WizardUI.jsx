"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ── Design tokens ──────────────────────────────────────────────────────────────
export const C = {
  green:   "#2A6B5A",
  greenBg: "rgba(42,107,90,0.09)",
  border:  "2px solid rgba(0,0,0,0.1)",
  radius:  14,
  font:    "'DM Sans', sans-serif",
};

// ── CSS keyframes ──────────────────────────────────────────────────────────────
export function WizardStyles() {
  return (
    <style>{`
      @keyframes wFadeIn  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      @keyframes wFadeOut { from { opacity:1; } to { opacity:0; } }
      .wVisible  { animation: wFadeIn  .35s ease both; }
      .wHidden   { animation: wFadeOut .25s ease both; }
    `}</style>
  );
}

// ── Question flow hook ────────────────────────────────────────────────────────
// Returns { q, visible, next(skipTo?), back(), goTo(n) }
export function useQuestionFlow({ count, onStepNext, onStepBack }) {
  const [q, setQ]             = useState(0);
  const [visible, setVisible] = useState(true);

  const goTo = useCallback((nextQ) => {
    setVisible(false);
    setTimeout(() => {
      setQ(nextQ);
      setVisible(true);
      window.scrollTo({ top: 0, behavior: "instant" });
    }, 400);
  }, []);

  const next = useCallback((skipTo) => {
    const target = skipTo !== undefined ? skipTo : q + 1;
    if (target >= count) { onStepNext?.(); } else { goTo(target); }
  }, [q, count, onStepNext, goTo]);

  const back = useCallback(() => {
    if (q === 0) { onStepBack?.(); } else { goTo(q - 1); }
  }, [q, onStepBack, goTo]);

  return { q, visible, next, back, goTo };
}

// ── Question screen wrapper ────────────────────────────────────────────────────
export function QuestionScreen({ title, sub, children, visible, footer }) {
  return (
    <div className={visible ? "wVisible" : "wHidden"} style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "calc(100vh - 120px)",
      padding: "20px 20px 120px",
    }}>
      <div style={{ maxWidth: 560, width: "100%" }}>
        <h2 style={{
          fontSize: 22, fontWeight: 700, color: "#1A1A1A",
          marginBottom: sub ? 10 : 28, textAlign: "center", lineHeight: 1.4,
        }}>{title}</h2>
        {sub && <p style={{
          fontSize: 14, color: "#6B6B6B", textAlign: "center",
          marginBottom: 28, lineHeight: 1.6,
        }}>{sub}</p>}
        {children}
        {footer && <div style={{ marginTop: 16 }}>{footer}</div>}
      </div>
    </div>
  );
}

// ── Bottom navigation (back + skip, fixed) ────────────────────────────────────
export function QuestionNav({ onBack, onSkip, skipLabel = "Passer →" }) {
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      padding: "12px 24px", background: "#FAFAF8",
      borderTop: "1px solid rgba(0,0,0,0.06)",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      zIndex: 10,
    }}>
      {onBack
        ? <button type="button" onClick={onBack} style={navBtn}>← Retour</button>
        : <span />}
      {onSkip
        ? <button type="button" onClick={onSkip} style={navBtn}>{skipLabel}</button>
        : <span />}
    </div>
  );
}
const navBtn = {
  background: "none", border: "none", color: "#9A9A9A", fontSize: 13,
  cursor: "pointer", fontFamily: C.font, padding: "6px 10px",
};

// ── Continuer button ───────────────────────────────────────────────────────────
export function ContinueButton({ onClick, label = "Continuer →", disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%", height: 52, marginTop: 20, borderRadius: C.radius,
        border: "none",
        background: disabled ? "rgba(42,107,90,0.25)" : C.green,
        color: "#fff", fontSize: 16, fontWeight: 600,
        cursor: disabled ? "default" : "pointer", fontFamily: C.font,
        boxShadow: disabled ? "none" : "0 4px 16px rgba(42,107,90,0.28)",
        transition: "all .15s",
      }}
    >{label}</button>
  );
}

// ── BigButtonChoice (single-select, auto-advance) ─────────────────────────────
export function BigButtonChoice({ options, value, onChange, onAutoAdvance, columns = 2, withOther = false }) {
  const [otherVal, setOtherVal] = useState(value && !options.includes(value) ? value : "");
  const [showOther, setShowOther] = useState(value && !options.includes(value));

  const handleClick = (opt) => {
    if (opt === "__other__") { setShowOther(true); return; }
    onChange(opt);
    if (onAutoAdvance) setTimeout(onAutoAdvance, 350);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 10 }}>
        {options.map(opt => (
          <button key={opt} type="button" onClick={() => handleClick(opt)} style={{
            minHeight: 52, padding: "12px 16px", borderRadius: C.radius,
            border: value === opt ? `2px solid ${C.green}` : C.border,
            background: value === opt ? C.green : "#fff",
            color: value === opt ? "#fff" : "#1A1A1A",
            fontSize: 15, fontWeight: value === opt ? 600 : 400,
            cursor: "pointer", fontFamily: C.font, transition: "all .15s",
            boxShadow: value === opt ? "0 3px 12px rgba(42,107,90,0.25)" : "none",
          }}>{opt}</button>
        ))}
        {withOther && (
          <button type="button" onClick={() => handleClick("__other__")} style={{
            minHeight: 52, padding: "12px 16px", borderRadius: C.radius,
            border: showOther ? `2px solid ${C.green}` : C.border,
            background: showOther ? C.greenBg : "#fff",
            color: showOther ? C.green : "#6B6B6B",
            fontSize: 15, cursor: "pointer", fontFamily: C.font, transition: "all .15s",
          }}>Autre</button>
        )}
      </div>
      {showOther && (
        <div style={{ display: "flex", gap: 8 }}>
          <input
            autoFocus
            value={otherVal}
            onChange={e => { setOtherVal(e.target.value); onChange(e.target.value); }}
            placeholder="Précisez..."
            onKeyDown={e => { if (e.key === "Enter" && otherVal.trim() && onAutoAdvance) { e.preventDefault(); onAutoAdvance(); }}}
            style={inputStyle}
          />
        </div>
      )}
    </div>
  );
}

// ── MultiButtonChoice (multi-select) ──────────────────────────────────────────
export function MultiButtonChoice({ options, value = [], onChange, columns = 2, withOther = false }) {
  const [otherVal, setOtherVal] = useState("");
  const toggle = (opt) => {
    const next = value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt];
    onChange(next);
  };
  const hasOther = value.some(v => !options.includes(v));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 10 }}>
        {options.map(opt => {
          const sel = value.includes(opt);
          return (
            <button key={opt} type="button" onClick={() => toggle(opt)} style={{
              minHeight: 52, padding: "12px 16px", borderRadius: C.radius,
              border: sel ? `2px solid ${C.green}` : C.border,
              background: sel ? C.green : "#fff",
              color: sel ? "#fff" : "#1A1A1A",
              fontSize: 15, fontWeight: sel ? 600 : 400,
              cursor: "pointer", fontFamily: C.font, transition: "all .15s",
              boxShadow: sel ? "0 3px 12px rgba(42,107,90,0.25)" : "none",
            }}>{sel ? "✓ " : ""}{opt}</button>
          );
        })}
        {withOther && (
          <button type="button" onClick={() => {
            if (!hasOther) { setOtherVal(""); } else {
              onChange(value.filter(v => options.includes(v)));
            }
          }} style={{
            minHeight: 52, padding: "12px 16px", borderRadius: C.radius,
            border: hasOther ? `2px solid ${C.green}` : C.border,
            background: hasOther ? C.greenBg : "#fff",
            color: hasOther ? C.green : "#6B6B6B",
            fontSize: 15, cursor: "pointer", fontFamily: C.font,
          }}>Autre</button>
        )}
      </div>
      {(withOther && !hasOther && value.length > 0) || (withOther && hasOther) ? (
        !hasOther ? null : (
          <input
            value={value.find(v => !options.includes(v)) || ""}
            onChange={e => {
              const cleaned = value.filter(v => options.includes(v));
              if (e.target.value) onChange([...cleaned, e.target.value]);
              else onChange(cleaned);
            }}
            placeholder="Précisez..."
            style={inputStyle}
          />
        )
      ) : null}
    </div>
  );
}

// ── BigNumberStepper ───────────────────────────────────────────────────────────
export function BigNumberStepper({ value = 0, onChange, min = 0, max = 20, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      {label && <span style={{ fontSize: 15, color: "#6B6B6B", fontWeight: 500 }}>{label}</span>}
      <div style={{ display: "flex", alignItems: "center", gap: 0, border: C.border, borderRadius: C.radius, overflow: "hidden", background: "#fff" }}>
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}
          style={{ width: 64, height: 64, border: "none", background: "transparent", fontSize: 24, cursor: value <= min ? "default" : "pointer", color: value <= min ? "#CCC" : "#1A1A1A", fontFamily: C.font }}>−</button>
        <div style={{ width: 80, height: 64, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "#1A1A1A", borderLeft: C.border, borderRight: C.border }}>{value}</div>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}
          style={{ width: 64, height: 64, border: "none", background: "transparent", fontSize: 24, cursor: value >= max ? "default" : "pointer", color: value >= max ? "#CCC" : "#1A1A1A", fontFamily: C.font }}>+</button>
      </div>
    </div>
  );
}

// ── BigTimeChoice ──────────────────────────────────────────────────────────────
export function BigTimeChoice({ options, value, onChange, onAutoAdvance }) {
  const [showCustom, setShowCustom] = useState(value && !options.includes(value) && value !== "Flexible");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
        {options.map(t => {
          const sel = value === t;
          return (
            <button key={t} type="button" onClick={() => {
              if (t === "Autre") { setShowCustom(true); onChange(""); return; }
              setShowCustom(false);
              onChange(t);
              if (onAutoAdvance) setTimeout(onAutoAdvance, 350);
            }} style={{
              minHeight: 52, padding: "12px 24px", borderRadius: C.radius,
              border: sel ? `2px solid ${C.green}` : C.border,
              background: sel ? C.green : "#fff",
              color: sel ? "#fff" : "#1A1A1A",
              fontSize: 16, fontWeight: sel ? 700 : 400,
              cursor: "pointer", fontFamily: C.font, transition: "all .15s",
              boxShadow: sel ? "0 3px 12px rgba(42,107,90,0.25)" : "none",
            }}>{t}</button>
          );
        })}
        <button type="button" onClick={() => { setShowCustom(true); onChange(""); }} style={{
          minHeight: 52, padding: "12px 24px", borderRadius: C.radius,
          border: showCustom ? `2px solid ${C.green}` : C.border,
          background: showCustom ? C.greenBg : "#fff",
          color: showCustom ? C.green : "#6B6B6B",
          fontSize: 16, cursor: "pointer", fontFamily: C.font,
        }}>Autre</button>
      </div>
      {showCustom && (
        <input
          type="time"
          value={value && !options.includes(value) ? value : ""}
          onChange={e => onChange(e.target.value)}
          autoFocus
          style={{ ...inputStyle, maxWidth: 180, margin: "0 auto" }}
        />
      )}
    </div>
  );
}

// ── BigTextInput ───────────────────────────────────────────────────────────────
export function BigTextInput({ value, onChange, placeholder, type = "text", autoFocus, onEnter }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value ?? ""}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onKeyDown={e => { if (e.key === "Enter" && onEnter) { e.preventDefault(); onEnter(); }}}
      style={{
        ...inputStyle,
        fontSize: 16,
        border: focused ? `2px solid ${C.green}` : C.border,
        boxShadow: focused ? "0 0 0 3px rgba(42,107,90,0.08)" : "none",
      }}
    />
  );
}

// ── BigTextarea ────────────────────────────────────────────────────────────────
export function BigTextarea({ value, onChange, placeholder, rows = 5 }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      value={value ?? ""}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputStyle,
        fontSize: 15, resize: "vertical", lineHeight: 1.6,
        border: focused ? `2px solid ${C.green}` : C.border,
        boxShadow: focused ? "0 0 0 3px rgba(42,107,90,0.08)" : "none",
      }}
    />
  );
}

// ── Shared input style ─────────────────────────────────────────────────────────
const inputStyle = {
  width: "100%", padding: "14px 16px", borderRadius: C.radius,
  border: C.border, background: "#fff",
  fontFamily: C.font, fontSize: 15, outline: "none",
  boxSizing: "border-box", transition: "border .15s, box-shadow .15s", color: "#1A1A1A",
};

// ── ChipChecklist (suggestions as chips + custom input) ───────────────────────
export function ChipChecklist({ items = [], onChange, suggestions = [], placeholder = "Ajouter...", emptyLabel }) {
  const [input, setInput] = useState("");

  const add = (text) => {
    const t = text.trim();
    if (!t || items.some(i => (i.task || i) === t)) return;
    onChange([...items, { task: t }]);
    setInput("");
  };
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const isAdded = (s) => items.some(i => (i.task || i) === s);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Suggestion chips */}
      {suggestions.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {suggestions.map(s => {
            const added = isAdded(s);
            return (
              <button key={s} type="button" onClick={() => added ? remove(items.findIndex(i => (i.task || i) === s)) : add(s)} style={{
                padding: "8px 14px", minHeight: 40, borderRadius: 20, fontFamily: C.font,
                border: added ? `2px solid ${C.green}` : "2px solid rgba(0,0,0,0.1)",
                background: added ? C.green : "#fff",
                color: added ? "#fff" : "#1A1A1A",
                fontSize: 13, fontWeight: added ? 600 : 400, cursor: "pointer",
                transition: "all .15s",
              }}>{added ? "✓ " : "+ "}{s}</button>
            );
          })}
        </div>
      )}

      {/* Added items list */}
      {items.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {items.map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "11px 14px",
              background: "#fff", borderRadius: 10, border: "1px solid rgba(0,0,0,0.08)",
            }}>
              <span style={{ fontSize: 16 }}>✅</span>
              <span style={{ flex: 1, fontSize: 14, color: "#1A1A1A" }}>{item.task || item}</span>
              {!suggestions.includes(item.task || item) && (
                <button type="button" onClick={() => remove(i)} style={{
                  width: 24, height: 24, borderRadius: 6, border: "none",
                  background: "rgba(229,62,62,0.08)", color: "#E53E3E", cursor: "pointer", fontSize: 13,
                }}>✕</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Custom input */}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(input); }}}
          placeholder={placeholder}
          style={{ ...inputStyle, fontSize: 14, flex: 1 }}
        />
        <button type="button" onClick={() => add(input)} disabled={!input.trim()} style={{
          padding: "0 18px", height: 52, borderRadius: C.radius, border: "none",
          background: input.trim() ? C.green : "rgba(0,0,0,0.08)",
          color: "#fff", fontSize: 14, fontWeight: 600,
          cursor: input.trim() ? "pointer" : "default", fontFamily: C.font, flexShrink: 0,
        }}>Ajouter</button>
      </div>
      {emptyLabel && items.length === 0 && !input && (
        <p style={{ margin: 0, fontSize: 12, color: "#9A9A9A", textAlign: "center" }}>{emptyLabel}</p>
      )}
    </div>
  );
}

// ── ToggleGrid (for appliances / categories) ───────────────────────────────────
export function ToggleGrid({ items, value = {}, onChange, columns = 3 }) {
  const toggle = (id) => {
    const cur = value[id];
    // If already has details (brandModel etc.), just toggle enabled — don't wipe details
    if (cur && (cur.brandModel || cur.location)) {
      onChange({ ...value, [id]: { ...cur, enabled: !cur.enabled } });
    } else {
      onChange({ ...value, [id]: { ...(cur || {}), enabled: !cur?.enabled } });
    }
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 10 }}>
      {items.map(item => {
        const enabled = value[item.id]?.enabled;
        return (
          <button key={item.id} type="button" onClick={() => toggle(item.id)} style={{
            minHeight: 52, padding: "12px 14px", borderRadius: C.radius,
            border: enabled ? `2px solid ${C.green}` : C.border,
            background: enabled ? C.green : "#fff",
            color: enabled ? "#fff" : "#1A1A1A",
            fontSize: 14, fontWeight: enabled ? 600 : 400,
            cursor: "pointer", fontFamily: C.font, textAlign: "left",
            display: "flex", alignItems: "center", gap: 8, transition: "all .15s",
            boxShadow: enabled ? "0 2px 10px rgba(42,107,90,0.2)" : "none",
          }}>
            <span>{enabled ? "✓" : ""}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── InfoNote ───────────────────────────────────────────────────────────────────
export function InfoNote({ children }) {
  return (
    <div style={{
      padding: "10px 14px", borderRadius: 10,
      background: "rgba(42,107,90,0.06)", border: "1px solid rgba(42,107,90,0.15)",
      fontSize: 12, color: "#2A6B5A", lineHeight: 1.5, textAlign: "left",
    }}>🔒 {children}</div>
  );
}

// ── TextButton (skip-style ghost button) ──────────────────────────────────────
export function TextButton({ onClick, children }) {
  return (
    <button type="button" onClick={onClick} style={{
      background: "none", border: "none", color: "#9A9A9A", fontSize: 14,
      cursor: "pointer", fontFamily: C.font, padding: "8px",
      textDecoration: "underline", textDecorationColor: "rgba(0,0,0,0.2)",
      display: "block", margin: "8px auto 0",
    }}>{children}</button>
  );
}

// ── Google Places address input ────────────────────────────────────────────────
export function AddressInput({ value = {}, onChange }) {
  const inputRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY;

  useEffect(() => {
    if (!apiKey) return;
    if (window.google?.maps?.places) { setLoaded(true); return; }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
    return () => { if (!window.google) script.remove(); };
  }, [apiKey]);

  useEffect(() => {
    if (!loaded || !inputRef.current || !window.google?.maps?.places) return;
    const ac = new window.google.maps.places.Autocomplete(inputRef.current, { types: ["address"] });
    ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      const comp = place.address_components || [];
      const get = (type) => comp.find(c => c.types.includes(type))?.long_name || "";
      const streetNum  = get("street_number");
      const streetName = get("route");
      const address    = [streetNum, streetName].filter(Boolean).join(" ") || place.formatted_address;
      onChange({
        ...value,
        address,
        city:       get("locality") || get("postal_town"),
        postalCode: get("postal_code"),
        country:    get("country"),
      });
    });
  }, [loaded]);

  // Fallback: manual fields if no API key
  if (!apiKey) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <BigTextInput value={value.address} onChange={v => onChange({ ...value, address: v })} placeholder="Numéro et nom de rue" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 130px", gap: 8 }}>
          <BigTextInput value={value.city} onChange={v => onChange({ ...value, city: v })} placeholder="Ville" />
          <BigTextInput value={value.postalCode} onChange={v => onChange({ ...value, postalCode: v })} placeholder="Code postal" />
        </div>
        <BigTextInput value={value.country ?? "France"} onChange={v => onChange({ ...value, country: v })} placeholder="Pays" />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <input
        ref={inputRef}
        defaultValue={value.address || ""}
        placeholder="Tapez votre adresse..."
        style={{ ...inputStyle, fontSize: 16 }}
      />
      {(value.city || value.postalCode) && (
        <p style={{ margin: 0, fontSize: 12, color: C.green }}>
          ✓ {[value.city, value.postalCode, value.country].filter(Boolean).join(", ")}
        </p>
      )}
    </div>
  );
}

// ── PhoneField (re-exported from ui.jsx for wizard use) ───────────────────────
const COUNTRY_CODES = [
  { code: "+33", flag: "🇫🇷" }, { code: "+34", flag: "🇪🇸" },
  { code: "+44", flag: "🇬🇧" }, { code: "+49", flag: "🇩🇪" },
  { code: "+39", flag: "🇮🇹" }, { code: "+1",  flag: "🇺🇸" },
  { code: "+41", flag: "🇨🇭" }, { code: "+32", flag: "🇧🇪" },
  { code: "+352",flag: "🇱🇺" }, { code: "+377",flag: "🇲🇨" },
  { code: "+31", flag: "🇳🇱" }, { code: "+46", flag: "🇸🇪" },
];

function parsePhone(v = "") {
  const sorted = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
  for (const c of sorted) {
    if (v.startsWith(c.code)) return { country: c.code, number: v.slice(c.code.length) };
  }
  return { country: "+33", number: v };
}

export function WizardPhoneField({ value, onChange }) {
  const { country, number } = parsePhone(value);
  const update = (c, n) => onChange(c + n);
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <select value={country} onChange={e => update(e.target.value, number)}
        style={{ ...inputStyle, width: 110, flexShrink: 0, cursor: "pointer" }}>
        {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
      </select>
      <input type="tel" value={number} onChange={e => update(country, e.target.value)}
        placeholder="6 12 34 56 78"
        style={{ ...inputStyle, flex: 1 }} />
    </div>
  );
}

// ── Compatibility aliases (step files use these names) ────────────────────────
export const ButtonChoice    = BigButtonChoice;
export const NumberStepper   = BigNumberStepper;
export const WizardTextInput = BigTextInput;
export const WizardTextarea  = BigTextarea;
export const TimeChoice      = BigTimeChoice;
export const ChecklistBuilder = ChipChecklist;

// ── WizardSection (container for a step's questions) ─────────────────────────
export function WizardSection({ children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {children}
    </div>
  );
}

// ── QA (Question + Answer block) ─────────────────────────────────────────────
export function QA({ question, sub, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "#1A1A1A", lineHeight: 1.4 }}>
          {question}
        </p>
        {sub && (
          <p style={{ margin: 0, fontSize: 13, color: "#6B6B6B", lineHeight: 1.5 }}>{sub}</p>
        )}
      </div>
      {children}
    </div>
  );
}

// ── QuestionBubble (just the question/sub text, no children wrapper) ──────────
export function QuestionBubble({ question, sub }) {
  return (
    <div>
      <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "#1A1A1A", lineHeight: 1.4 }}>
        {question}
      </p>
      {sub && (
        <p style={{ margin: 0, fontSize: 13, color: "#6B6B6B", lineHeight: 1.5 }}>{sub}</p>
      )}
    </div>
  );
}

// ── StepNav (bottom navigation for each wizard step) ─────────────────────────
export function StepNav({ onNext, onSkip, nextLabel = "Continuer →", skipLabel = "Passer cette étape →" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 8 }}>
      {onNext && (
        <button
          type="button"
          onClick={onNext}
          style={{
            width: "100%", height: 52, borderRadius: C.radius, border: "none",
            background: C.green, color: "#fff", fontSize: 15, fontWeight: 600,
            cursor: "pointer", fontFamily: C.font,
            boxShadow: "0 4px 16px rgba(42,107,90,0.28)", transition: "opacity .15s",
          }}
        >{nextLabel}</button>
      )}
      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          style={{
            background: "none", border: "none", color: "#9A9A9A", fontSize: 13,
            cursor: "pointer", fontFamily: C.font, padding: "8px",
            textDecoration: "underline", textDecorationColor: "rgba(0,0,0,0.2)",
            display: "block", margin: "0 auto",
          }}
        >{skipLabel}</button>
      )}
    </div>
  );
}
