"use client";
import {
  FormField, Input, Textarea, SelectField, TimeField,
  RepeatableBlock, CustomFieldsBlock, GroupDivider, Grid2,
} from "./ui";

const ACCESS_MODES = ["Accueil en personne", "Boîte à clés", "Serrure connectée", "Digicode", "Autre"];

export default function CheckinForm({ data = {}, onChange }) {
  const set = (key, val) => onChange({ ...data, [key]: val });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Horaires */}
      <GroupDivider label="Horaires" />
      <Grid2>
        <FormField label="Heure d'arrivée">
          <TimeField value={data.checkinTime} onChange={v => set("checkinTime", v)} />
        </FormField>
        <FormField label="Heure de départ">
          <TimeField value={data.checkoutTime} onChange={v => set("checkoutTime", v)} />
        </FormField>
      </Grid2>

      {/* Accès */}
      <GroupDivider label="Accès" />
      <FormField label="Mode d'accès">
        <SelectField
          value={data.accessMode}
          onChange={v => set("accessMode", v)}
          options={ACCESS_MODES}
          placeholder="Choisir..."
        />
      </FormField>
      <Grid2>
        <FormField label="Code immeuble">
          <Input
            value={data.buildingCode}
            onChange={v => set("buildingCode", v)}
            placeholder="Ex : 1234A"
          />
        </FormField>
        <FormField label="Code appartement / boîte à clés">
          <Input
            value={data.unitCode}
            onChange={v => set("unitCode", v)}
            placeholder="Ex : 5678"
          />
        </FormField>
      </Grid2>
      <FormField label="Instructions d'arrivée">
        <Textarea
          value={data.arrivalInstructions}
          onChange={v => set("arrivalInstructions", v)}
          placeholder="Décrivez la procédure d'arrivée pas à pas..."
          rows={4}
        />
      </FormField>

      {/* Départ */}
      <GroupDivider label="Check-list de départ" />
      <RepeatableBlock
        items={data.departureChecklist || []}
        onChange={v => set("departureChecklist", v)}
        addLabel="+ Ajouter une consigne de départ"
        fields={[
          { id: "task", label: "Tâche", type: "text", required: true, placeholder: "Ex : Fermer toutes les fenêtres" },
        ]}
      />

      {/* Custom fields */}
      <CustomFieldsBlock value={data.customFields || []} onChange={v => set("customFields", v)} />
    </div>
  );
}
