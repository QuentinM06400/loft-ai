"use client";
import {
  FormField, Input, Textarea, GroupDivider,
  RepeatableBlock, CustomFieldsBlock, Grid2, ToggleSwitch,
} from "./ui";

const STREAMING_OPTIONS = ["Netflix", "Prime Video", "Disney+", "YouTube", "Apple TV+", "Autre"];

export default function TvForm({ data = {}, onChange }) {
  const set = (key, val) => onChange({ ...data, [key]: val });

  const streaming = data.streamingServices || [];
  const toggleService = (s) => {
    const next = streaming.includes(s) ? streaming.filter(x => x !== s) : [...streaming, s];
    set("streamingServices", next);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Équipement */}
      <GroupDivider label="Équipement" />
      <Grid2>
        <FormField label="Modèle TV">
          <Input value={data.tvModel} onChange={v => set("tvModel", v)} placeholder="Ex : Samsung QLED 55'" />
        </FormField>
        <FormField label="Emplacement TV">
          <Input value={data.tvLocation} onChange={v => set("tvLocation", v)} placeholder="Ex : Salon, face au canapé" />
        </FormField>
      </Grid2>
      <Grid2>
        <FormField label="Modèle box internet">
          <Input value={data.internetBoxModel} onChange={v => set("internetBoxModel", v)} placeholder="Ex : Livebox 5" />
        </FormField>
        <FormField label="Emplacement box internet">
          <Input value={data.internetBoxLocation} onChange={v => set("internetBoxLocation", v)} placeholder="Ex : Meuble TV, en bas à droite" />
        </FormField>
      </Grid2>
      <Grid2>
        <FormField label="Modèle décodeur">
          <Input value={data.decoderModel} onChange={v => set("decoderModel", v)} placeholder="Ex : Canal+ Cube S" />
        </FormField>
        <FormField label="Support mural">
          <Input value={data.tvMount} onChange={v => set("tvMount", v)} placeholder="Ex : Orientable horizontalement" />
        </FormField>
      </Grid2>

      {/* Télécommandes */}
      <GroupDivider label="Télécommandes" />
      <RepeatableBlock
        items={data.remotes || []}
        onChange={v => set("remotes", v)}
        addLabel="+ Ajouter une télécommande"
        header={(item) => item.name || "Nouvelle télécommande"}
        fields={[
          { id: "name",         label: "Nom",          type: "text", required: true, placeholder: "Ex : Télécommande TV" },
          { id: "instructions", label: "Instructions", type: "text", required: true, placeholder: "Ex : Bouton Source pour changer d'entrée" },
        ]}
      />

      {/* Streaming */}
      <GroupDivider label="Services de streaming disponibles" />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {STREAMING_OPTIONS.map(s => {
          const active = streaming.includes(s);
          return (
            <button
              key={s}
              type="button"
              onClick={() => toggleService(s)}
              style={{
                padding: "8px 14px", borderRadius: 20, fontSize: 13, fontWeight: 500,
                border: active ? "2px solid #2A6B5A" : "2px solid rgba(0,0,0,0.1)",
                background: active ? "rgba(42,107,90,0.08)" : "transparent",
                color: active ? "#2A6B5A" : "#6B6B6B", cursor: "pointer",
                fontFamily: "inherit", transition: "all .15s",
              }}
            >
              {active ? "✓ " : ""}{s}
            </button>
          );
        })}
      </div>

      {/* Instructions */}
      <FormField label="Instructions spécifiques">
        <Textarea
          value={data.specificInstructions}
          onChange={v => set("specificInstructions", v)}
          placeholder="Comment changer de source, accéder au streaming, etc."
          rows={3}
        />
      </FormField>

      <CustomFieldsBlock value={data.customFields || []} onChange={v => set("customFields", v)} />
    </div>
  );
}
