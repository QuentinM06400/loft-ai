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

// Remplace buildLighting + buildWindows — lit p.appliances?.lightingWizard
function buildLightingAndWindows(lw) {
  if (!lw) return null;
  const lines = [];

  // ── Ouvrants / Fenêtres ──────────────────────────────────────────────────
  if (lw.hasOpeningInstructions === 'Oui') {
    lines.push('OUVRANTS :');
    const scopes = lw.openingScopes || [];
    if (scopes.includes('Tous les ouvrants') && lw.openingGeneralInstructions) {
      lines.push(`- ${lw.openingGeneralInstructions}`);
    }
    if (scopes.includes('Des ouvrants spécifiques') && lw.openingSpecificItems?.length) {
      lw.openingSpecificItems.forEach(item => {
        if (!item) return;
        const label = [item.room, item.location].filter(Boolean).join(' — ');
        if (label) lines.push(`- ${label}${item.instructions ? ' : ' + item.instructions : ''}`);
      });
    }
  }

  // ── Fermetures (stores / volets) ─────────────────────────────────────────
  const closureTypes = (lw.closureTypes || []).filter(t => t !== 'Aucun');
  if (closureTypes.length) {
    lines.push(`\nFERMETURES : ${closureTypes.join(', ')}`);
    const storesTypes = lw.storesTypes || [];
    if (storesTypes.length) {
      lines.push(`- Mode : ${storesTypes.join(', ')}`);
      if (storesTypes.includes('Manuels') && lw.storesManualNote)
        lines.push(`- Instructions manuels : ${lw.storesManualNote}`);
      if (storesTypes.includes('Télécommandés') && lw.storesRemoteLocation)
        lines.push(`- Télécommande(s) : ${lw.storesRemoteLocation}`);
    }
    if (lw.closureInstructionType === 'Toutes les fermetures' && lw.closureGeneralInstructions) {
      lines.push(`- ${lw.closureGeneralInstructions}`);
    } else if (lw.closureInstructionType === 'Fermetures spécifiques' && lw.closureSpecificItems?.length) {
      lw.closureSpecificItems.forEach(item => {
        if (!item?.opening) return;
        lines.push(`- ${item.opening}${item.instructions ? ' : ' + item.instructions : ''}`);
      });
    }
  }

  // ── Lumières ─────────────────────────────────────────────────────────────
  const lightingTypes = lw.lightingTypes || [];
  const hasLighting = lightingTypes.some(t => t !== 'Aucune') && lightingTypes.length > 0;
  if (hasLighting && lw.lightingItems?.length) {
    lines.push('\nLUMIÈRES :');
    lw.lightingItems.forEach(item => {
      if (!item) return;
      const label = [item.room, item.light].filter(Boolean).join(' — ');
      if (label) lines.push(`- ${label}${item.instruction ? ' : ' + item.instruction : ''}`);
    });
  }

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

// Remplace buildTV — lit p.appliances?.tvWizard
function buildTvWizard(tv) {
  if (!tv) return null;
  const equipment = tv.equipment || [];
  if (!equipment.length) return null;
  const lines = [];

  // ── TVs ──────────────────────────────────────────────────────────────────
  if (equipment.includes('TV') && tv.tvItems?.length) {
    const count = tv.counts?.TV || tv.tvItems.length;
    tv.tvItems.forEach((item, i) => {
      if (!item) return;
      const label = count > 1 ? `TV ${i + 1}` : 'TV';
      const model = [item.brand, item.model].filter(Boolean).join(' ');
      lines.push(`${label}${model ? ' — ' + model : ''}${item.location ? ' (' + item.location + ')' : ''}`);
      if (item.remote && item.remote !== 'Incluse') lines.push(`  Télécommande : ${item.remote}`);
      if (item.notes) lines.push(`  ${item.notes}`);
    });
  } else if (equipment.includes('TV')) {
    lines.push('TV disponible');
  }

  // ── Box Internet ─────────────────────────────────────────────────────────
  if (equipment.includes('Box Internet')) {
    const parts = [tv.boxOperator, tv.boxLocation].filter(Boolean).join(' — ');
    lines.push(`\nBox Internet${parts ? ' : ' + parts : ''}`);
    if (tv.boxNotes) lines.push(`  ${tv.boxNotes}`);
  }

  // ── Décodeur ─────────────────────────────────────────────────────────────
  if (equipment.includes('Décodeur')) {
    const parts = [tv.decoderBrand, tv.decoderLocation].filter(Boolean).join(' — ');
    lines.push(`\nDécodeur${parts ? ' : ' + parts : ''}`);
    if (tv.decoderTv && tv.decoderTv !== 'Toutes') lines.push(`  Sur : ${tv.decoderTv}`);
    if (tv.decoderNotes) lines.push(`  ${tv.decoderNotes}`);
  }

  // ── Home Cinéma ──────────────────────────────────────────────────────────
  if (equipment.includes('Home Cinéma')) {
    const parts = [tv.hcBrand, tv.hcLocation].filter(Boolean).join(' — ');
    lines.push(`\nHome Cinéma${parts ? ' : ' + parts : ''}`);
    if (tv.hcNotes) lines.push(`  ${tv.hcNotes}`);
  }

  // ── Barre de son ─────────────────────────────────────────────────────────
  if (equipment.includes('Barre de son')) {
    const parts = [tv.soundbarBrand, tv.soundbarLocation].filter(Boolean).join(' — ');
    lines.push(`\nBarre de son${parts ? ' : ' + parts : ''}`);
    if (tv.soundbarTv && tv.soundbarTv !== 'Toutes') lines.push(`  Couplée à : ${tv.soundbarTv}`);
    if (tv.soundbarNotes) lines.push(`  ${tv.soundbarNotes}`);
  }

  // ── Streaming ────────────────────────────────────────────────────────────
  const accessibles = Object.entries(tv.streamingAccess || {})
    .filter(([, v]) => v?.accessible === 'Oui');
  if (accessibles.length) {
    lines.push('\nSTREAMING ACCESSIBLE :');
    accessibles.forEach(([name, v]) => {
      lines.push(`- ${name}${v.instructions ? ' : ' + v.instructions : ''}`);
    });
  }

  // ── Autre ────────────────────────────────────────────────────────────────
  if (equipment.includes('Autre') && tv.autreLabel) {
    const parts = [tv.autreLabel, tv.autreLocation].filter(Boolean).join(' — ');
    lines.push(`\n${parts}`);
    if (tv.autreNotes) lines.push(`  ${tv.autreNotes}`);
  }

  return lines.join('\n') || null;
}

// Remplace buildStorage — lit p.appliances?.storageDetails
function buildStorageWizard(s) {
  if (!s) return null;
  const lines = [];

  if (s.linensProvided === 'Oui')
    lines.push(`Draps et serviettes : fournis${s.linensLocation ? ' — ' + s.linensLocation : ''}`);
  else if (s.linensProvided === 'Non')
    lines.push('Draps et serviettes : non fournis');

  if (s.cleaningProvided === 'Oui')
    lines.push(`Produits ménagers : fournis${s.cleaningLocation ? ' — ' + s.cleaningLocation : ''}`);
  else if (s.cleaningProvided === 'Non')
    lines.push('Produits ménagers : non fournis');

  if (s.recycling) {
    lines.push(`Tri sélectif : ${s.recycling}${s.binLocation ? ' — ' + s.binLocation : ''}`);
  } else if (s.binLocation) {
    lines.push(`Poubelles : ${s.binLocation}`);
  }

  if (s.guestClosets) lines.push(`Rangements réservés aux locataires : ${s.guestClosets}`);

  return lines.join('\n') || null;
}

// Nouvelle fonction — lit p.personality
function buildPersonality(d) {
  if (!d?.tone && !d?.defaultContact) return null;
  const lines = [];
  if (d.tone) lines.push(`Ton souhaité par l'hôte : ${d.tone}`);
  if (d.defaultContact) lines.push(`En cas de question sans réponse, orienter vers : ${d.defaultContact}`);
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

  const lw = p.appliances?.lightingWizard;
  const tv = p.appliances?.tvWizard;
  const storage = p.appliances?.storageDetails;

  const sections = [
    { title: 'TON ET PERSONNALITÉ DU CONCIERGE',       content: buildPersonality(p.personality) },
    { title: 'INFORMATIONS DE L\'APPARTEMENT',         content: buildInfo(p.info) },
    { title: 'CHECK-IN / CHECK-OUT',                   content: buildCheckin(p.checkin) },
    { title: 'RÈGLES DE LA MAISON',                    content: buildRules(p.rules) },
    { title: 'FENÊTRES, FERMETURES & LUMIÈRES',        content: buildLightingAndWindows(lw) },
    { title: 'ÉLECTROMÉNAGER — GUIDES D\'UTILISATION', content: buildAppliances(p.appliances) },
    { title: 'TV & MULTIMÉDIA',                        content: buildTvWizard(tv) },
    { title: 'RANGEMENTS & CONSOMMABLES',              content: buildStorageWizard(storage) },
    { title: 'EMPLACEMENT — PROXIMITÉ',                content: buildLocation(p.location) },
    { title: 'RECOMMANDATIONS',                        content: buildRecommendations(p.recommendations) },
    { title: 'ACTIVITÉS & VISITES',                    content: buildActivities(p.activities) },
    { title: 'TRANSPORTS',                             content: buildTransport(p.transport) },
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
