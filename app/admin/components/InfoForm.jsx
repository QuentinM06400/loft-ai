"use client";
import {
  FormField, Input, Textarea, SelectField, PhoneField, BooleanField,
  RepeatableBlock, CustomFieldsBlock, GroupDivider, Grid2, Grid3,
} from "./ui";

const PROPERTY_TYPES = ["Studio", "T1", "T2", "T3", "T4+", "Maison", "Villa", "Autre"];
const BED_TYPES = ["Simple", "Double", "Queen", "King", "Canapé-lit", "Superposé"];
const CONTACT_ROLES = ["Propriétaire", "Gestionnaire", "Contact d'urgence", "Ménage", "Maintenance", "Autre"];

export default function InfoForm({ data = {}, onChange }) {
  const set = (key, val) => onChange({ ...data, [key]: val });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Le logement */}
      <GroupDivider label="Le logement" />
      <FormField label="Type de logement">
        <SelectField
          value={data.propertyType}
          onChange={v => set("propertyType", v)}
          options={PROPERTY_TYPES}
          placeholder="Choisir..."
        />
      </FormField>
      <FormField label="Adresse" required>
        <Input
          value={data.address}
          onChange={v => set("address", v)}
          placeholder="14 Boulevard de Strasbourg"
        />
      </FormField>
      <Grid3>
        <FormField label="Ville" required>
          <Input value={data.city} onChange={v => set("city", v)} placeholder="Cannes" />
        </FormField>
        <FormField label="Code postal" required>
          <Input value={data.postalCode} onChange={v => set("postalCode", v)} placeholder="06400" />
        </FormField>
        <FormField label="Pays">
          <Input value={data.country} onChange={v => set("country", v)} placeholder="France" />
        </FormField>
      </Grid3>
      <Grid2>
        <FormField label="Étage">
          <Input value={data.floor} onChange={v => set("floor", v)} type="number" placeholder="Ex : 2" />
        </FormField>
        <FormField label="Ascenseur">
          <BooleanField value={data.hasElevator} onChange={v => set("hasElevator", v)} />
        </FormField>
      </Grid2>
      <FormField label="Description" required>
        <Textarea
          value={data.description}
          onChange={v => set("description", v)}
          placeholder="Décrivez le logement pour les voyageurs..."
          rows={4}
        />
      </FormField>
      <FormField label="Capacité maximale" required>
        <Input
          value={data.maxGuests}
          onChange={v => set("maxGuests", v)}
          type="number"
          placeholder="4"
          style={{ maxWidth: 120 }}
        />
      </FormField>

      {/* Couchages */}
      <GroupDivider label="Couchages" />
      <Grid3>
        <FormField label="Chambres">
          <Input value={data.bedrooms} onChange={v => set("bedrooms", v)} type="number" placeholder="1" />
        </FormField>
        <FormField label="Lits">
          <Input value={data.beds} onChange={v => set("beds", v)} type="number" placeholder="2" />
        </FormField>
        <FormField label="Salles de bain">
          <Input value={data.bathrooms} onChange={v => set("bathrooms", v)} type="number" placeholder="1" />
        </FormField>
      </Grid3>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#1A1A1A", marginBottom: 8 }}>Détail des lits</div>
        <RepeatableBlock
          items={data.bedDetails || []}
          onChange={v => set("bedDetails", v)}
          addLabel="+ Ajouter un lit"
          header={(item) => item.roomName || "Nouveau lit"}
          fields={[
            { id: "roomName", label: "Pièce / chambre", type: "text", required: true, placeholder: "Ex : Chambre principale" },
            { id: "bedType",  label: "Type de lit",     type: "select", options: BED_TYPES, required: true },
            { id: "dimensions", label: "Dimensions",    type: "text",   placeholder: "Ex : 160x200cm" },
          ]}
        />
      </div>

      {/* WiFi */}
      <GroupDivider label="WiFi" />
      <Grid2>
        <FormField label="Nom du réseau WiFi">
          <Input value={data.wifiName} onChange={v => set("wifiName", v)} placeholder="LOFT_CANNES_5G" />
        </FormField>
        <FormField label="Mot de passe WiFi">
          <div style={{ display: "flex", gap: 8 }}>
            <Input
              value={data.wifiPassword}
              onChange={v => set("wifiPassword", v)}
              placeholder="••••••••"
              style={{ flex: 1 }}
            />
            {data.wifiPassword && (
              <button
                type="button"
                title="Copier"
                onClick={() => navigator.clipboard.writeText(data.wifiPassword)}
                style={{
                  padding: "0 14px", borderRadius: 10,
                  border: "1px solid rgba(0,0,0,0.12)", background: "#fff",
                  cursor: "pointer", fontSize: 16, flexShrink: 0,
                }}
              >📋</button>
            )}
          </div>
        </FormField>
      </Grid2>

      {/* Contacts */}
      <GroupDivider label="Contacts" />
      <RepeatableBlock
        items={data.contacts || []}
        onChange={v => set("contacts", v)}
        addLabel="+ Ajouter un contact"
        header={(item) => item.name || "Nouveau contact"}
        fields={[
          { id: "name",  label: "Nom",       type: "text",   required: true, placeholder: "Quentin" },
          { id: "role",  label: "Rôle",      type: "select", options: CONTACT_ROLES, required: true },
          { id: "phone", label: "Téléphone", type: "phone" },
          { id: "email", label: "Email",      type: "text",  placeholder: "contact@example.com" },
          { id: "note",  label: "Note",       type: "text",  placeholder: "Ex : Hôte et propriétaire" },
        ]}
      />

      {/* Custom fields */}
      <CustomFieldsBlock value={data.customFields || []} onChange={v => set("customFields", v)} />
    </div>
  );
}
