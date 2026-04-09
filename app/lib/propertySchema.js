// Helper constructors
const f   = (id, type, label, opts = {}) => ({ id, type, label, required: false, ...opts });
const fReq = (id, type, label, opts = {}) => ({ id, type, label, required: true,  ...opts });
const sel  = (id, label, options, opts = {}) => f(id, 'select', label, { options, ...opts });
const rep  = (id, label, fields,  opts = {}) => f(id, 'repeatable', label, { fields, ...opts });

const CUSTOM_FIELDS = rep('customFields', 'Informations supplémentaires', [
  fReq('fieldName',  'text', 'Champ'),
  fReq('fieldValue', 'text', 'Valeur'),
]);

// ─── Appliances ───────────────────────────────────────────────────────────────

export const APPLIANCE_SUBFIELDS = [
  f('brandModel',            'text',     'Marque / Modèle'),
  f('location',              'text',     'Emplacement'),
  f('specificInstructions',  'textarea', 'Instructions spécifiques'),
];

export const APPLIANCE_CATEGORIES = [
  { id: 'kitchen',      label: 'Cuisine',        items: [
    { id: 'oven',          label: 'Four' },
    { id: 'cooktop',       label: 'Plaque de cuisson' },
    { id: 'hood',          label: 'Hotte' },
    { id: 'fridge',        label: 'Réfrigérateur' },
    { id: 'freezer',       label: 'Congélateur' },
    { id: 'dishwasher',    label: 'Lave-vaisselle' },
    { id: 'microwave',     label: 'Micro-ondes' },
  ]},
  { id: 'smallKitchen', label: 'Petite cuisine', items: [
    { id: 'coffeeMachine', label: 'Machine à café' },
    { id: 'kettle',        label: 'Bouilloire' },
    { id: 'toaster',       label: 'Grille-pain' },
    { id: 'blender',       label: 'Mixeur' },
    { id: 'foodProcessor', label: 'Robot culinaire' },
  ]},
  { id: 'maintenance',  label: 'Entretien',      items: [
    { id: 'washingMachine', label: 'Machine à laver' },
    { id: 'dryer',          label: 'Sèche-linge' },
    { id: 'vacuum',         label: 'Aspirateur' },
    { id: 'iron',           label: 'Fer à repasser' },
    { id: 'robotVacuum',    label: 'Robot aspirateur' },
  ]},
  { id: 'comfort',      label: 'Confort',        items: [
    { id: 'airConditioning', label: 'Climatisation' },
    { id: 'heating',         label: 'Chauffage' },
    { id: 'waterHeater',     label: 'Chauffe-eau' },
    { id: 'fan',             label: 'Ventilateur' },
    { id: 'airPurifier',     label: "Purificateur d'air" },
  ]},
  { id: 'bathroom',     label: 'Salle de bain',  items: [
    { id: 'hairDryer',    label: 'Sèche-cheveux' },
    { id: 'towelWarmer',  label: 'Sèche-serviettes' },
  ]},
];

// ─── Recommendation / Activity / Transport categories ─────────────────────────

export const RECOMMENDATION_CATEGORIES = [
  { id: 'restaurants',  label: 'Restaurants' },
  { id: 'barsAndCafes', label: 'Bars & Cafés' },
  { id: 'beaches',      label: 'Plages' },
  { id: 'shopping',     label: 'Shopping' },
  { id: 'markets',      label: 'Marchés' },
  { id: 'nightlife',    label: 'Vie nocturne' },
  { id: 'other',        label: 'Autres adresses' },
];

export const ACTIVITY_CATEGORIES = [
  { id: 'onFoot',           label: 'À pied' },
  { id: 'byBoat',           label: 'En bateau' },
  { id: 'excursions',       label: 'Excursions' },
  { id: 'sportsAndWellness',label: 'Sport & Bien-être' },
  { id: 'cultureAndMuseums',label: 'Culture & Musées' },
  { id: 'familyAndKids',    label: 'Famille & Enfants' },
  { id: 'other',            label: 'Autres activités' },
];

export const TRANSPORT_CATEGORIES = [
  { id: 'publicTransport',  label: 'Transports en commun' },
  { id: 'train',            label: 'Train' },
  { id: 'taxiAndRideshare', label: 'Taxi & VTC' },
  { id: 'carRental',        label: 'Location de voiture' },
  { id: 'bicycle',          label: 'Vélo' },
  { id: 'other',            label: 'Autres' },
];

// ─── Schema ───────────────────────────────────────────────────────────────────

export const PROPERTY_SCHEMA = {
  sections: [
    {
      id: 'info', label: 'Informations appartement', icon: '🏠', group: 'essential',
      fields: [
        sel('propertyType', 'Type de logement', ['Studio','T1','T2','T3','T4+','Maison','Villa','Autre']),
        fReq('address',     'text',     'Adresse'),
        fReq('city',        'text',     'Ville'),
        fReq('postalCode',  'text',     'Code postal'),
        f('country',        'text',     'Pays',              { default: 'France' }),
        f('floor',          'number',   'Étage'),
        f('hasElevator',    'boolean',  'Ascenseur'),
        fReq('description', 'textarea', 'Description'),
        fReq('maxGuests',   'number',   'Capacité maximale'),
        f('bedrooms',       'number',   'Chambres'),
        f('beds',           'number',   'Lits'),
        rep('bedDetails', 'Détail des lits', [
          fReq('roomName', 'text',   'Pièce / chambre'),
          sel('bedType',   'Type de lit', ['Simple','Double','Queen','King','Canapé-lit','Superposé'], { required: true }),
          f('dimensions',  'text',   'Dimensions'),
        ]),
        f('bathrooms', 'number', 'Salles de bain'),
        f('wifiName',  'text',   'Nom du réseau WiFi'),
        f('wifiPassword','text', 'Mot de passe WiFi'),
        rep('contacts', 'Contacts', [
          fReq('name',  'text',  'Nom'),
          sel('role',   'Rôle',  ["Propriétaire","Gestionnaire","Contact d'urgence","Ménage","Maintenance","Autre"], { required: true }),
          f('phone',    'phone', 'Téléphone', { defaultCountry: '+33' }),
          f('email',    'text',  'Email'),
          f('note',     'text',  'Note'),
        ]),
        CUSTOM_FIELDS,
      ],
    },
    {
      id: 'checkin', label: 'Check-in / Check-out', icon: '🔑', group: 'essential',
      fields: [
        f('checkinTime',  'time', "Heure d'arrivée",  { default: '15:00' }),
        f('checkoutTime', 'time', 'Heure de départ',  { default: '11:00' }),
        sel('accessMode', "Mode d'accès", ['Accueil en personne','Boîte à clés','Serrure connectée','Digicode','Autre']),
        f('buildingCode', 'text', 'Code immeuble'),
        f('unitCode',     'text', 'Code appartement / boîte à clés'),
        f('arrivalInstructions', 'textarea', "Instructions d'arrivée"),
        rep('departureChecklist', 'Check-list de départ', [fReq('task', 'text', 'Tâche')]),
        CUSTOM_FIELDS,
      ],
    },
    {
      id: 'rules', label: 'Règles de la maison', icon: '📋', group: 'essential',
      fields: [
        f('quietHoursStart', 'time',  'Début du silence',     { default: '22:00' }),
        sel('partiesAllowed','Fêtes autorisées',  ['Oui','Non','Sous conditions'], { default: 'Non' }),
        f('partiesNote',     'text',  'Précision sur les fêtes'),
        sel('petsAllowed',   'Animaux acceptés',  ['Oui','Non','Sous conditions'], { default: 'Non' }),
        f('petsNote',        'text',  'Précision sur les animaux'),
        sel('smokingPolicy', 'Politique tabac',   ['Interdit partout','Extérieur uniquement','Autorisé'], { default: 'Interdit partout' }),
        sel('shoesPolicy',   'Politique chaussures', ['Autorisées','À retirer à l\'entrée','Pas de règle'], { default: 'Autorisées' }),
        f('maxVisitors',     'number','Visiteurs extérieurs max.'),
        rep('additionalRules', 'Règles supplémentaires', [fReq('rule', 'text', 'Règle')]),
        CUSTOM_FIELDS,
      ],
    },
    {
      id: 'lighting', label: 'Lumières', icon: '💡', group: 'apartment',
      fields: [
        rep('zones', 'Zones lumineuses', [
          fReq('zoneName',       'text',     'Nom de la zone'),
          sel('controlType',     'Type de commande', ['Interrupteur','Télécommande','Variateur','Connecté','Autre'], { required: true }),
          fReq('controlLocation','text',     'Emplacement de la commande'),
          f('instructions',      'textarea', 'Instructions'),
        ]),
        CUSTOM_FIELDS,
      ],
    },
    {
      id: 'windows', label: 'Fenêtres & Volets', icon: '🪟', group: 'apartment',
      fields: [
        rep('openings', 'Ouvertures', [
          sel('type',        'Type',          ['Fenêtre simple','Fenêtre double battant','Baie vitrée','Velux','Porte-fenêtre','Autre'], { required: true }),
          fReq('room',       'text',          'Pièce'),
          sel('shutterType', 'Type de volet', ['Roulant électrique','Roulant manuel','Battant','Aucun']),
          f('instructions',  'textarea',      'Instructions'),
        ]),
        CUSTOM_FIELDS,
      ],
    },
    {
      id: 'appliances', label: 'Électroménager & Appareils', icon: '🍳', group: 'apartment',
      fields: [
        { id: 'items', type: 'toggle-list', label: 'Appareils', categories: APPLIANCE_CATEGORIES, itemSubfields: APPLIANCE_SUBFIELDS },
        rep('customAppliances', 'Appareils supplémentaires', [
          fReq('name',                'text',     "Nom de l'appareil"),
          f('brandModel',             'text',     'Marque / Modèle'),
          f('location',               'text',     'Emplacement'),
          f('specificInstructions',   'textarea', 'Instructions spécifiques'),
        ]),
        CUSTOM_FIELDS,
      ],
    },
    {
      id: 'tv', label: 'TV & Multimédia', icon: '📺', group: 'apartment',
      fields: [
        f('tvModel',             'text',         'Modèle TV'),
        f('tvLocation',          'text',         'Emplacement TV'),
        f('decoderModel',        'text',         'Modèle décodeur'),
        f('internetBoxModel',    'text',         'Modèle box internet'),
        f('internetBoxLocation', 'text',         'Emplacement box internet'),
        f('tvMount',             'text',         'Support mural'),
        rep('remotes', 'Télécommandes', [
          fReq('name',         'text', 'Nom'),
          fReq('instructions', 'text', 'Instructions'),
        ]),
        { id: 'streamingServices', type: 'multi-select', label: 'Services de streaming',
          options: ['Netflix','Prime Video','Disney+','YouTube','Apple TV+','Autre'] },
        f('specificInstructions', 'textarea', 'Instructions spécifiques'),
        CUSTOM_FIELDS,
      ],
    },
    {
      id: 'storage', label: 'Rangements & Consommables', icon: '🗂️', group: 'apartment',
      fields: [
        rep('storageItems', 'Rangements', [
          fReq('name',     'text',     'Nom'),
          fReq('location', 'text',     'Emplacement'),
          f('details',     'textarea', 'Détails'),
        ]),
        rep('suppliedConsumables', 'Consommables fournis', [
          fReq('name',     'text',     'Nom'),
          fReq('location', 'text',     'Emplacement'),
          f('details',     'textarea', 'Détails'),
        ]),
        rep('wasteManagement', 'Gestion des déchets', [
          fReq('type',         'text', 'Type de déchet'),
          fReq('location',     'text', 'Emplacement'),
          f('instructions',    'text', 'Instructions'),
        ]),
        CUSTOM_FIELDS,
      ],
    },
    {
      id: 'location', label: 'Emplacement & Proximité', icon: '📍', group: 'neighborhood',
      fields: [
        f('autoGenerated', 'boolean', 'Généré automatiquement'),
        rep('pointsOfInterest', "Points d'intérêt", [
          fReq('name',            'text', 'Lieu'),
          sel('category',         'Catégorie', ['Transport','Commerce','Santé','Plage','Culture','Sport','Autre'], { required: true }),
          fReq('walkingDistance', 'text', 'Distance à pied'),
          f('drivingDistance',    'text', 'Distance en voiture'),
          f('ownerNote',          'text', 'Note du propriétaire'),
        ]),
        CUSTOM_FIELDS,
      ],
    },
    {
      id: 'recommendations', label: 'Recommandations', icon: '⭐', group: 'neighborhood',
      fields: [
        { id: 'categories', type: 'toggle-list', label: 'Catégories',
          items: RECOMMENDATION_CATEGORIES,
          itemSubfields: [
            rep('places', 'Adresses', [
              fReq('name',            'text',     'Nom'),
              f('address',            'text',     'Adresse'),
              fReq('whyWeRecommend',  'textarea', 'Pourquoi on recommande'),
              sel('priceRange',       'Gamme de prix', ['€','€€','€€€','€€€€']),
              f('tip',                'text',     'Bon à savoir'),
            ]),
          ],
        },
        CUSTOM_FIELDS,
      ],
    },
    {
      id: 'activities', label: 'Activités & Visites', icon: '🎭', group: 'neighborhood',
      fields: [
        { id: 'categories', type: 'toggle-list', label: 'Catégories',
          items: ACTIVITY_CATEGORIES,
          itemSubfields: [
            rep('activities', 'Activités', [
              fReq('name',             'text',     'Nom'),
              fReq('description',      'textarea', 'Description'),
              f('estimatedDuration',   'text',     'Durée estimée'),
              f('indicativePrice',     'text',     'Prix indicatif'),
              f('howToBookOrGet',      'text',     'Comment y aller / réserver'),
            ]),
          ],
        },
        CUSTOM_FIELDS,
      ],
    },
    {
      id: 'transport', label: 'Transports', icon: '🚌', group: 'neighborhood',
      fields: [
        { id: 'categories', type: 'toggle-list', label: 'Catégories',
          items: TRANSPORT_CATEGORIES,
          itemSubfields: [
            rep('options', 'Options', [
              fReq('name',             'text',     'Nom'),
              fReq('practicalDetails', 'textarea', 'Informations pratiques'),
              f('recommendedApp',      'text',     'Application recommandée'),
              f('indicativeRate',      'text',     'Tarif indicatif'),
            ]),
          ],
        },
        CUSTOM_FIELDS,
      ],
    },
  ],
};

export const SCHEMA_GROUPS = {
  essential:    { label: 'ESSENTIEL',       icon: '📋' },
  apartment:    { label: "L'APPARTEMENT",   icon: '🏠' },
  neighborhood: { label: 'LE QUARTIER',     icon: '🗺️' },
};
