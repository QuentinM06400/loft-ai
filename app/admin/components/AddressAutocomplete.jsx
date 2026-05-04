"use client";
import { useEffect, useRef } from "react";

const SCRIPT_ID  = "google-maps-places";
const FOCUS_COLOR = "#2A6B5A";
const BLUR_COLOR  = "rgba(0,0,0,0.12)";

const BASE_STYLE = {
  width: "100%", padding: "10px 12px", borderRadius: 10, boxSizing: "border-box",
  border: `1px solid ${BLUR_COLOR}`, background: "#fff",
  fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: "none", color: "#1A1A1A",
  transition: "border .15s",
};

export default function AddressAutocomplete({ value, onChange, onSelect, placeholder, style }) {
  const inputRef    = useRef(null);
  const onSelectRef = useRef(onSelect);
  useEffect(() => { onSelectRef.current = onSelect; });

  useEffect(() => {
    const KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    if (!KEY || !inputRef.current) return;

    function init() {
      if (!inputRef.current) return;
      const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ["address"],
        componentRestrictions: { country: ["fr", "mc", "be", "ch", "lu"] },
        fields: ["address_components"],
      });
      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        if (!place.address_components) return;
        let streetNumber = "", route = "", locality = "", postalCode = "", country = "";
        for (const c of place.address_components) {
          if      (c.types.includes("street_number")) streetNumber = c.long_name;
          else if (c.types.includes("route"))         route        = c.long_name;
          else if (c.types.includes("locality"))      locality     = c.long_name;
          else if (c.types.includes("postal_code"))   postalCode   = c.long_name;
          else if (c.types.includes("country"))       country      = c.long_name;
        }
        const street = [streetNumber, route].filter(Boolean).join(" ");
        onSelectRef.current?.({ street, city: locality, postalCode, country });
      });
    }

    if (window.google?.maps?.places) {
      init();
      return;
    }

    if (document.getElementById(SCRIPT_ID)) {
      const t = setInterval(() => {
        if (window.google?.maps?.places) { clearInterval(t); init(); }
      }, 100);
      return () => clearInterval(t);
    }

    const src = `https://maps.googleapis.com/maps/api/js?key=${KEY}&libraries=places&language=fr`;
    console.log("[Places] Clé (10 premiers chars):", KEY.slice(0, 10) + "...");
    console.log("[Places] Chargement du script:", src.replace(KEY, KEY.slice(0, 10) + "..."));
    const script    = document.createElement("script");
    script.id       = SCRIPT_ID;
    script.src      = src;
    script.async    = true;
    script.onload   = init;
    script.onerror  = () => console.error("[Places] Échec du chargement du script Google Maps");
    document.head.appendChild(script);
  }, []); // load once

  return (
    <input
      ref={inputRef}
      type="text"
      value={value || ""}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      autoComplete="off"
      style={{ ...BASE_STYLE, ...style }}
      onFocus={e => (e.target.style.borderColor = FOCUS_COLOR)}
      onBlur={e  => (e.target.style.borderColor = BLUR_COLOR)}
    />
  );
}
