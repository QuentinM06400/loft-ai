"use client";
import { CategoryListForm } from "./CategoryListForm";
import { TRANSPORT_CATEGORIES } from "@/app/lib/propertySchema";

const ICONS = {
  publicTransport: "🚌", train: "🚆", taxiAndRideshare: "🚕",
  carRental: "🚗", bicycle: "🚲", other: "➕",
};

const transportFields = [
  { id: "name",             label: "Nom / Ligne",          type: "text",     required: true, placeholder: "Ex : Bus 200, Navette aéroport..." },
  { id: "practicalDetails", label: "Informations pratiques", type: "textarea", required: true, placeholder: "Arrêt, fréquence, itinéraire, tarifs..." },
  { id: "recommendedApp",   label: "Application recommandée", type: "text",   placeholder: "Ex : Uber, Citymapper, SNCF Connect" },
  { id: "indicativeRate",   label: "Tarif indicatif",      type: "text",     placeholder: "Ex : 2,50€ le trajet, ~25€ l'aéroport" },
];

export default function TransportForm({ data = {}, onChange }) {
  const cats = data.categories || {};
  const setCats = (updated) => onChange({ ...data, categories: updated });
  const customFields = data.customFields || [];
  const setCustomFields = (cf) => onChange({ ...data, customFields: cf });

  return (
    <CategoryListForm
      categories={TRANSPORT_CATEGORIES}
      data={cats}
      onChange={setCats}
      customFields={customFields}
      onCustomFieldsChange={setCustomFields}
      itemsKey="options"
      itemFields={transportFields}
      itemAddLabel="+ Ajouter une option"
      categoryIcons={ICONS}
    />
  );
}
