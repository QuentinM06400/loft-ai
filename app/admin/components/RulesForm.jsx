"use client";
import {
  FormField, Input, SelectField, TimeField,
  RepeatableBlock, CustomFieldsBlock, GroupDivider, Grid2,
} from "./ui";

const PARTY_OPTIONS    = ["Oui", "Non", "Sous conditions"];
const PETS_OPTIONS     = ["Oui", "Non", "Sous conditions"];
const SMOKING_OPTIONS  = ["Interdit partout", "Extérieur uniquement", "Autorisé"];
const SHOES_OPTIONS    = ["Autorisées", "À retirer à l'entrée", "Pas de règle"];

export default function RulesForm({ data = {}, onChange }) {
  const set = (key, val) => onChange({ ...data, [key]: val });

  const showPartiesNote = data.partiesAllowed === "Sous conditions";
  const showPetsNote    = data.petsAllowed    === "Sous conditions";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Règles principales */}
      <GroupDivider label="Règles principales" />
      <Grid2>
        <FormField label="Début du silence">
          <TimeField value={data.quietHoursStart} onChange={v => set("quietHoursStart", v)} />
        </FormField>
        <FormField label="Visiteurs extérieurs max.">
          <Input value={data.maxVisitors} onChange={v => set("maxVisitors", v)} type="number" placeholder="Ex : 2" />
        </FormField>
      </Grid2>
      <Grid2>
        <FormField label="Fêtes autorisées">
          <SelectField value={data.partiesAllowed} onChange={v => set("partiesAllowed", v)} options={PARTY_OPTIONS} placeholder="Choisir..." />
        </FormField>
        <FormField label="Animaux acceptés">
          <SelectField value={data.petsAllowed} onChange={v => set("petsAllowed", v)} options={PETS_OPTIONS} placeholder="Choisir..." />
        </FormField>
      </Grid2>
      {showPartiesNote && (
        <FormField label="Précision sur les fêtes">
          <Input value={data.partiesNote} onChange={v => set("partiesNote", v)} placeholder="Ex : Pas de musique après 22h" />
        </FormField>
      )}
      {showPetsNote && (
        <FormField label="Précision sur les animaux">
          <Input value={data.petsNote} onChange={v => set("petsNote", v)} placeholder="Ex : Petits chiens uniquement" />
        </FormField>
      )}
      <Grid2>
        <FormField label="Politique tabac">
          <SelectField value={data.smokingPolicy} onChange={v => set("smokingPolicy", v)} options={SMOKING_OPTIONS} placeholder="Choisir..." />
        </FormField>
        <FormField label="Politique chaussures">
          <SelectField value={data.shoesPolicy} onChange={v => set("shoesPolicy", v)} options={SHOES_OPTIONS} placeholder="Choisir..." />
        </FormField>
      </Grid2>

      {/* Règles supplémentaires */}
      <GroupDivider label="Règles supplémentaires" />
      <RepeatableBlock
        items={data.additionalRules || []}
        onChange={v => set("additionalRules", v)}
        addLabel="+ Ajouter une règle"
        fields={[
          { id: "rule", label: "Règle", type: "text", required: true, placeholder: "Ex : Ne pas fumer sur le balcon" },
        ]}
      />

      <CustomFieldsBlock value={data.customFields || []} onChange={v => set("customFields", v)} />
    </div>
  );
}
