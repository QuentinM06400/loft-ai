"use client";
import { CategoryListForm } from "./CategoryListForm";
import { RECOMMENDATION_CATEGORIES } from "@/app/lib/propertySchema";

const ICONS = {
  restaurants: "🍽️", barsAndCafes: "🍸", beaches: "🏖️",
  shopping: "🛍️", markets: "🧺", nightlife: "🌙", other: "➕",
};

const PRICE_RANGES = ["€", "€€", "€€€", "€€€€"];

const placeFields = [
  { id: "name",           label: "Nom du lieu",          type: "text",     required: true, placeholder: "Ex : La Palme d'Or" },
  { id: "address",        label: "Adresse",              type: "text",     placeholder: "Ex : 73 La Croisette, Cannes" },
  { id: "whyWeRecommend", label: "Pourquoi on recommande", type: "textarea", required: true, placeholder: "Ce que vous aimez ici, conseil personnel..." },
  { id: "priceRange",     label: "Gamme de prix",        type: "select",   options: PRICE_RANGES },
  { id: "tip",            label: "Bon à savoir",         type: "text",     placeholder: "Réservation conseillée, menu du midi..." },
];

export default function RecommendationsForm({ data = {}, onChange }) {
  const cats = data.categories || {};
  const setCats = (updated) => onChange({ ...data, categories: updated });
  const customFields = data.customFields || [];
  const setCustomFields = (cf) => onChange({ ...data, customFields: cf });

  return (
    <CategoryListForm
      categories={RECOMMENDATION_CATEGORIES}
      data={cats}
      onChange={setCats}
      customFields={customFields}
      onCustomFieldsChange={setCustomFields}
      itemsKey="places"
      itemFields={placeFields}
      itemAddLabel="+ Ajouter une adresse"
      categoryIcons={ICONS}
    />
  );
}
