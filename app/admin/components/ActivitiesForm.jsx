"use client";
import { CategoryListForm } from "./CategoryListForm";
import { ACTIVITY_CATEGORIES } from "@/app/lib/propertySchema";

const ICONS = {
  onFoot: "🚶", byBoat: "⛵", excursions: "🗺️",
  sportsAndWellness: "🏋️", cultureAndMuseums: "🏛️",
  familyAndKids: "👨‍👩‍👧", other: "➕",
};

const activityFields = [
  { id: "name",              label: "Nom",                    type: "text",     required: true, placeholder: "Ex : Balade sur la Croisette" },
  { id: "description",      label: "Description",            type: "textarea", required: true, placeholder: "Ce que l'activité propose, ambiance..." },
  { id: "estimatedDuration", label: "Durée estimée",         type: "text",     placeholder: "Ex : 2h, demi-journée" },
  { id: "indicativePrice",   label: "Prix indicatif",        type: "text",     placeholder: "Ex : Gratuit, 15€/pers" },
  { id: "howToBookOrGet",    label: "Comment y aller / réserver", type: "text", placeholder: "App, site, adresse de départ..." },
];

export default function ActivitiesForm({ data = {}, onChange }) {
  const cats = data.categories || {};
  const setCats = (updated) => onChange({ ...data, categories: updated });
  const customFields = data.customFields || [];
  const setCustomFields = (cf) => onChange({ ...data, customFields: cf });

  return (
    <CategoryListForm
      categories={ACTIVITY_CATEGORIES}
      data={cats}
      onChange={setCats}
      customFields={customFields}
      onCustomFieldsChange={setCustomFields}
      itemsKey="activities"
      itemFields={activityFields}
      itemAddLabel="+ Ajouter une activité"
      categoryIcons={ICONS}
    />
  );
}
