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

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  useEffect(() => {
    if (!apiKey) return;

    const loadAndInit = () => {
      if (!window.google?.maps?.places?.PlaceAutocompleteElement) return;

      // Capture the initial value from Redis before replacing the DOM node
      const initialValue = inputRef.current?.value || "";

      const element = new google.maps.places.PlaceAutocompleteElement({
        types: ["address"],
        componentRestrictions: { country: ["fr", "mc", "be", "ch", "lu"] },
      });
      element.style.width = "100%";

      const container = inputRef.current?.parentNode;
      if (container) container.replaceChild(element, inputRef.current);

      // Initialise l'affichage avec la valeur courante (adresse stockée en Redis)
      if (initialValue) element.value = initialValue;

      element.addEventListener("gmp-placeselect", async ({ place }) => {
        await place.fetchFields({ fields: ["addressComponents"] });
        const components = place.addressComponents || [];
        const get = (type) => components.find(c => c.types.includes(type))?.longText || "";
        onSelectRef.current?.({
          street:     `${get("street_number")} ${get("route")}`.trim(),
          city:       get("locality") || get("postal_town"),
          postalCode: get("postal_code"),
          country:    get("country"),
        });
      });
    };

    if (window.google?.maps?.places) {
      loadAndInit();
      return;
    }

    if (document.getElementById(SCRIPT_ID)) return;

    const script    = document.createElement("script");
    script.id       = SCRIPT_ID;
    script.src      = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=fr&v=weekly`;
    script.async    = true;
    script.onload   = loadAndInit;
    script.onerror  = () => console.error("[Places] Échec du chargement");
    console.log("[Places] Clé (10 premiers chars):", apiKey.slice(0, 10) + "...");
    console.log("[Places] Chargement du script:", script.src.replace(apiKey, apiKey.slice(0, 10) + "..."));
    document.head.appendChild(script);
  }, [apiKey]);

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
