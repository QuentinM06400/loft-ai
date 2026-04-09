import {
  APPLIANCE_CATEGORIES,
  RECOMMENDATION_CATEGORIES,
  ACTIVITY_CATEGORIES,
  TRANSPORT_CATEGORIES,
} from './propertySchema.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sep(title) {
  return `\n═══════════════════════════════════════\n${title}\n═══════════════════════════════════════`;
}

function pushCustomFields(lines, customFields) {
  customFields?.forEach(f => {
    if (f?.fieldName && f?.fieldValue) lines.push(`${f.fieldName} : ${f.fieldValue}`);
  });
}

// ─── Section builders ─────────────────────────────────────────────────────────

function buildInfo(d) {
  if (!d) return null;
  const lines = [];

  if (d.address && d.city) {
    lines.push(`ADRESSE : ${d.address}, ${d.postalCode ?? ''} ${d.city}${d.country ? ', ' + d.country : ''}`);
  }
  if (d.description) lines.push(`\nDESCRIPTION : ${d.description}`);
  if (d.maxGuests)   lines.push(`Capacité max : ${d.maxGuests} voyageur(s)`);
  if (d.floor != null) lines.push(`Étage : ${d.floor}${d.hasElevator ? ' (avec ascenseur)' : ''}`);

  if (d.bedDetails?.length) {
    const beds = d.bedDetails.map(b => `${b.bedType}${b.dimensions ? ` (${b.dimensions})` : ''}`).join(', ');
    lines.push(`Lits : ${beds}`);
  } else if (d.beds) {
    lines.push(`Lits : ${d.beds}`);
  }
  if (d.bathrooms) lines.push(`Salle(s) de bain : ${d.bathrooms}`);

  if (d.wifiName)     lines.push(`\nWIFI — Réseau : ${d.wifiName}${d.wifiPassword ? ` / Mot de passe : ${d.wifiPassword}` : ''}`);

  if (d.contacts?.length) {
    lines.push('\nCONTACTS :');
    d.contacts.forEach(c => {
      if (!c?.name) return;
      let s = `- ${c.name}${c.role ? ` (${c.role})` : ''}`;
      if (c.phone) s += ` — ${c.phone}`;
      if (c.email) s += ` — ${c.email}`;
      if (c.note)  s += ` (${c.note})`;
      lines.push(s);
    });
  }

  pushCustomFields(lines, d.customFields);
  return lines.join('\n') || null;
}

function buildCheckin(d) {
  if (!d) return null;
  const lines = [];

  if (d.checkinTime)  lines.push(`CHECK-IN (à partir de ${d.checkinTime}) :`);
  if (d.accessMode)   lines.push(`- Mode d'accès : ${d.accessMode}`);
  if (d.buildingCode) lines.push(`- Code immeuble : ${d.buildingCode}`);
  if (d.unitCode)     lines.push(`- Code appartement / boîte à clés : ${d.unitCode}`);
  if (d.arrivalInstructions) lines.push(`- ${d.arrivalInstructions}`);

  if (d.checkoutTime) lines.push(`\nCHECK-OUT (avant ${d.checkoutTime}) :`);
  d.departureChecklist?.forEach(item => { if (item?.task) lines.push(`- ${item.task}`); });

  pushCustomFields(lines, d.customFields);
  return lines.join('\n') || null;
}

function buildRules(d) {
  if (!d) return null;
  const lines = [];

  if (d.quietHoursStart) lines.push(`- Silence à partir de ${d.quietHoursStart}`);

  const partyMap = { 'Non': 'NON autorisées', 'Oui': 'autorisées', 'Sous conditions': `Sous conditions${d.partiesNote ? ' — ' + d.partiesNote : ''}` };
  if (d.partiesAllowed) lines.push(`- Fêtes : ${partyMap[d.partiesAllowed] ?? d.partiesAllowed}`);

  const petMap = { 'Non': 'NON autorisés', 'Oui': 'autorisés', 'Sous conditions': `Sous conditions${d.petsNote ? ' — ' + d.petsNote : ''}` };
  if (d.petsAllowed) lines.push(`- Animaux : ${petMap[d.petsAllowed] ?? d.petsAllowed}`);

  const smokeMap = {
    'Interdit partout': "INTERDITE dans l'appartement ET dans l'immeuble",
    'Extérieur uniquement': "Extérieur uniquement — descendre fumer en dehors de l'immeuble",
    'Autorisé': 'autorisée',
  };
  if (d.smokingPolicy) lines.push(`- Cigarette : ${smokeMap[d.smokingPolicy] ?? d.smokingPolicy}`);

  if (d.shoesPolicy && d.shoesPolicy !== 'Autorisées') lines.push(`- Chaussures : ${d.shoesPolicy}`);
  if (d.maxVisitors) lines.push(`- Visiteurs extérieurs max : ${d.maxVisitors} personnes`);

  d.additionalRules?.forEach(r => { if (r?.rule) lines.push(`- ${r.rule}`); });
  pushCustomFields(lines, d.customFields);
  return lines.join('\n') || null;
}

function buildLighting(d) {
  if (!d?.zones?.length) return null;
  const lines = [];
  d.zones.forEach(z => {
    if (!z?.zoneName) return;
    lines.push(`${z.zoneName.toUpperCase()} (${z.controlType ?? 'interrupteur'}) :`);
    if (z.controlLocation) lines.push(`- Commande : ${z.controlLocation}`);
    if (z.instructions)    lines.push(`- ${z.instructions}`);
  });
  pushCustomFields(lines, d.customFields);
  return lines.join('\n') || null;
}

function buildWindows(d) {
  if (!d?.openings?.length) return null;
  const lines = [];
  d.openings.forEach(o => {
    if (!o?.type) return;
    const label = [o.type, o.room].filter(Boolean).join(' — ');
    lines.push(`${label.toUpperCase()} :`);
    if (o.shutterType && o.shutterType !== 'Aucun') lines.push(`- Volet : ${o.shutterType}`);
    if (o.instructions) lines.push(`- ${o.instructions}`);
  });
  pushCustomFields(lines, d.customFields);
  return lines.join('\n') || null;
}

function buildAppliances(d) {
  if (!d) return null;
  const lines = [];
  if (d.items) {
    APPLIANCE_CATEGORIES.forEach(cat => {
      cat.items.forEach(item => {
        const info = d.items[item.id];
        if (!info?.enabled) return;
        const title = info.brandModel ? `${item.label} — ${info.brandModel}` : item.label;
        lines.push(`${title.toUpperCase()} :`);
        if (info.location)              lines.push(`- Emplacement : ${info.location}`);
        if (info.specificInstructions)  lines.push(`- ${info.specificInstructions}`);
      });
    });
  }
  d.customAppliances?.forEach(item => {
    if (!item?.name) return;
    const title = item.brandModel ? `${item.name} — ${item.brandModel}` : item.name;
    lines.push(`${title.toUpperCase()} :`);
    if (item.location)             lines.push(`- Emplacement : ${item.location}`);
    if (item.specificInstructions) lines.push(`- ${item.specificInstructions}`);
  });
  pushCustomFields(lines, d.customFields);
  return lines.join('\n') || null;
}

function buildTV(d) {
  if (!d) return null;
  const lines = [];
  if (d.tvModel)    lines.push(`TV : ${d.tvModel}${d.tvLocation ? ' — ' + d.tvLocation : ''}`);
  if (d.decoderModel)        lines.push(`Décodeur : ${d.decoderModel}`);
  if (d.internetBoxModel)    lines.push(`Box internet : ${d.internetBoxModel}${d.internetBoxLocation ? ' (' + d.internetBoxLocation + ')' : ''}`);
  if (d.tvMount)             lines.push(`Support : ${d.tvMount}`);
  if (d.streamingServices?.length) lines.push(`\nStreaming : ${d.streamingServices.join(', ')}`);
  if (d.remotes?.length) {
    lines.push('\nTÉLÉCOMMANDES :');
    d.remotes.forEach(r => { if (r?.name && r?.instructions) lines.push(`${r.name} : ${r.instructions}`); });
  }
  if (d.specificInstructions) lines.push(`\n${d.specificInstructions}`);
  pushCustomFields(lines, d.customFields);
  return lines.join('\n') || null;
}

function buildStorage(d) {
  if (!d) return null;
  const lines = [];
  if (d.storageItems?.length) {
    lines.push('RANGEMENTS :');
    d.storageItems.forEach(i => { if (i?.name) lines.push(`- ${i.name} : ${i.location}${i.details ? ' — ' + i.details : ''}`); });
  }
  if (d.suppliedConsumables?.length) {
    lines.push('\nCONSOMMMABLES FOURNIS :');
    d.suppliedConsumables.forEach(i => { if (i?.name) lines.push(`- ${i.name} : ${i.location}${i.details ? ' — ' + i.details : ''}`); });
  }
  if (d.wasteManagement?.length) {
    lines.push('\nPOUBELLES :');
    d.wasteManagement.forEach(i => { if (i?.type) lines.push(`- ${i.type} : ${i.location}${i.instructions ? ' — ' + i.instructions : ''}`); });
  }
  pushCustomFields(lines, d.customFields);
  return lines.join('\n') || null;
}

function buildLocation(d) {
  if (!d?.pointsOfInterest?.length) return null;
  const lines = [];
  d.pointsOfInterest.forEach(p => {
    if (!p?.name) return;
    let l = `- ${p.name} : ${p.walkingDistance} à pied`;
    if (p.drivingDistance) l += ` (${p.drivingDistance} en voiture)`;
    if (p.ownerNote)       l += ` — ${p.ownerNote}`;
    lines.push(l);
  });
  pushCustomFields(lines, d.customFields);
  return lines.join('\n') || null;
}

function buildRecommendations(d) {
  if (!d?.categories) return null;
  const lines = [];
  RECOMMENDATION_CATEGORIES.forEach(cat => {
    const c = d.categories[cat.id];
    if (!c?.enabled || !c.places?.length) return;
    lines.push(`${cat.label.toUpperCase()} :`);
    c.places.forEach(p => {
      if (!p?.name) return;
      let l = `- ${p.name}${p.priceRange ? ` (${p.priceRange})` : ''}`;
      if (p.address)         l += ` — ${p.address}`;
      if (p.whyWeRecommend)  l += ` : ${p.whyWeRecommend}`;
      if (p.tip)             l += ` Bon à savoir : ${p.tip}`;
      lines.push(l);
    });
  });
  pushCustomFields(lines, d.customFields);
  return lines.join('\n') || null;
}

function buildActivities(d) {
  if (!d?.categories) return null;
  const lines = [];
  ACTIVITY_CATEGORIES.forEach(cat => {
    const c = d.categories[cat.id];
    if (!c?.enabled || !c.activities?.length) return;
    lines.push(`${cat.label.toUpperCase()} :`);
    c.activities.forEach(a => {
      if (!a?.name) return;
      let l = `- ${a.name}${a.description ? ' : ' + a.description : ''}`;
      if (a.estimatedDuration) l += ` (${a.estimatedDuration})`;
      if (a.indicativePrice)   l += ` — ${a.indicativePrice}`;
      if (a.howToBookOrGet)    l += `. ${a.howToBookOrGet}`;
      lines.push(l);
    });
  });
  pushCustomFields(lines, d.customFields);
  return lines.join('\n') || null;
}

function buildTransport(d) {
  if (!d?.categories) return null;
  const lines = [];
  TRANSPORT_CATEGORIES.forEach(cat => {
    const c = d.categories[cat.id];
    if (!c?.enabled || !c.options?.length) return;
    lines.push(`${cat.label.toUpperCase()} :`);
    c.options.forEach(o => {
      if (!o?.name) return;
      lines.push(`- ${o.name} : ${o.practicalDetails}`);
      if (o.recommendedApp)  lines.push(`  Application : ${o.recommendedApp}`);
      if (o.indicativeRate)  lines.push(`  Tarif : ${o.indicativeRate}`);
    });
  });
  pushCustomFields(lines, d.customFields);
  return lines.join('\n') || null;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function buildSystemPromptFromStructured(propertyData) {
  const p = propertyData ?? {};

  const sections = [
    { title: 'INFORMATIONS DE L\'APPARTEMENT',    content: buildInfo(p.info) },
    { title: 'CHECK-IN / CHECK-OUT',              content: buildCheckin(p.checkin) },
    { title: 'RÈGLES DE LA MAISON',               content: buildRules(p.rules) },
    { title: 'LUMIÈRES',                          content: buildLighting(p.lighting) },
    { title: 'FENÊTRES',                          content: buildWindows(p.windows) },
    { title: 'ÉLECTROMÉNAGER — GUIDES D\'UTILISATION', content: buildAppliances(p.appliances) },
    { title: 'TV & MULTIMÉDIA',                   content: buildTV(p.tv) },
    { title: 'RANGEMENTS & CONSOMMABLES',         content: buildStorage(p.storage) },
    { title: 'EMPLACEMENT — PROXIMITÉ',           content: buildLocation(p.location) },
    { title: 'RECOMMANDATIONS',                   content: buildRecommendations(p.recommendations) },
    { title: 'ACTIVITÉS & VISITES',               content: buildActivities(p.activities) },
    { title: 'TRANSPORTS',                        content: buildTransport(p.transport) },
  ];

  const body = sections
    .filter(s => s.content)
    .map(s => `${sep(s.title)}\n\n${s.content}`)
    .join('\n');

  return `Tu es LOFT AI, le concierge virtuel intelligent d'un logement. Tu assistes les voyageurs pendant leur séjour.

RÈGLES ABSOLUES :
- Réponds TOUJOURS dans la langue choisie par le voyageur (indiquée en début de conversation)
- Ne jamais inventer d'information. Si tu ne sais pas, dis-le et propose de contacter l'hôte
- Sois chaleureux, concis et utile — comme un ami local qui connaît tout
- Utilise des emojis avec parcimonie pour rester élégant
- Si on te demande quelque chose qui n'est pas dans tes informations, dis honnêtement que tu ne sais pas
${body}`;
}
