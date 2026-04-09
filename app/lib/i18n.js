export const fr = {
  admin: {
    title:    'LOFT AI Admin',
    subtitle: 'Espace de gestion',
    headerLabel: 'Admin',
    logout:   'Déconnexion',

    login: {
      passwordPlaceholder: 'Mot de passe',
      submit:  'Connexion',
      error:   'Mot de passe incorrect',
    },

    tabs: {
      conversations: 'Conversations',
      content:       'Contenu',
    },

    stats: {
      conversations: 'Conversations',
      messages:      'Messages guests',
      topLanguages:  'Top langues',
    },

    conversations: {
      loading:         'Chargement...',
      empty:           'Aucune conversation enregistrée pour le moment',
      noMatch:         'Aucune conversation ne correspond aux filtres',
      searchPlaceholder: 'Rechercher dans les messages...',
      allLanguages:    'Toutes les langues',
      delete:          'Supprimer',
      confirmQuestion: 'Confirmer ?',
      confirmYes:      'Oui, supprimer',
      cancel:          'Annuler',
      min:             'min',
      msg:             'msg',
      countSingle:     'conversation',
      countPlural:     'conversations',
      countOf:         'sur',
    },

    content: {
      loading:          'Chargement du contenu...',
      progressTitle:    'Sections personnalisées',
      customisedBadge:  'Contenu personnalisé — différent des valeurs par défaut',
      hintLabel:        'Contenu attendu : ',
      reset:            'Réinitialiser',
      save:             'Sauvegarder',
      saving:           'Sauvegarde...',
      savedOk:          '✓ Sauvegardé — les nouvelles conversations utiliseront ce contenu',
      savedError:       'Erreur lors de la sauvegarde',
      completionHint:   'Modifiez et sauvegardez une section pour la marquer comme personnalisée.',
    },

    groups: {
      essential:    'ESSENTIEL',
      apartment:    "L'APPARTEMENT",
      neighborhood: 'LE QUARTIER',
    },
  },

  // ── Schema field labels ──────────────────────────────────────────────────────

  schema: {
    sections: {
      info:            'Informations appartement',
      checkin:         'Check-in / Check-out',
      rules:           'Règles de la maison',
      lighting:        'Lumières',
      windows:         'Fenêtres & Volets',
      appliances:      'Électroménager & Appareils',
      tv:              'TV & Multimédia',
      storage:         'Rangements & Consommables',
      location:        'Emplacement & Proximité',
      recommendations: 'Recommandations',
      activities:      'Activités & Visites',
      transport:       'Transports',
    },

    common: {
      customFields: 'Informations supplémentaires',
      fieldName:    'Champ',
      fieldValue:   'Valeur',
      addField:     'Ajouter un champ',
      add:          'Ajouter',
      remove:       'Supprimer',
      enabled:      'Activé',
      disabled:     'Désactivé',
    },

    info: {
      propertyType: 'Type de logement',
      address:      'Adresse',
      city:         'Ville',
      postalCode:   'Code postal',
      country:      'Pays',
      floor:        'Étage',
      hasElevator:  'Ascenseur',
      description:  'Description',
      maxGuests:    'Capacité maximale',
      bedrooms:     'Chambres',
      beds:         'Lits',
      bedDetails:   'Détail des lits',
      roomName:     'Pièce / chambre',
      bedType:      'Type de lit',
      dimensions:   'Dimensions',
      bathrooms:    'Salles de bain',
      wifiName:     'Nom du réseau WiFi',
      wifiPassword: 'Mot de passe WiFi',
      contacts:     'Contacts',
      name:         'Nom',
      role:         'Rôle',
      phone:        'Téléphone',
      email:        'Email',
      note:         'Note',
    },

    checkin: {
      checkinTime:          "Heure d'arrivée",
      checkoutTime:         'Heure de départ',
      accessMode:           "Mode d'accès",
      buildingCode:         'Code immeuble',
      unitCode:             'Code appartement / boîte à clés',
      arrivalInstructions:  "Instructions d'arrivée",
      departureChecklist:   'Check-list de départ',
      task:                 'Tâche',
    },

    rules: {
      quietHoursStart: 'Début du silence',
      partiesAllowed:  'Fêtes autorisées',
      partiesNote:     'Précision sur les fêtes',
      petsAllowed:     'Animaux acceptés',
      petsNote:        'Précision sur les animaux',
      smokingPolicy:   'Politique tabac',
      shoesPolicy:     'Politique chaussures',
      maxVisitors:     'Visiteurs extérieurs max.',
      additionalRules: 'Règles supplémentaires',
      rule:            'Règle',
    },

    lighting: {
      zones:           'Zones lumineuses',
      zoneName:        'Nom de la zone',
      controlType:     'Type de commande',
      controlLocation: 'Emplacement de la commande',
      instructions:    'Instructions',
    },

    windows: {
      openings:     'Ouvertures',
      type:         'Type',
      room:         'Pièce',
      shutterType:  'Type de volet',
      instructions: 'Instructions',
    },

    appliances: {
      items:                'Appareils',
      brandModel:           'Marque / Modèle',
      location:             'Emplacement',
      specificInstructions: 'Instructions spécifiques',
      customAppliances:     'Appareils supplémentaires',
      name:                 "Nom de l'appareil",
    },

    tv: {
      tvModel:              'Modèle TV',
      tvLocation:           'Emplacement TV',
      decoderModel:         'Modèle décodeur',
      internetBoxModel:     'Modèle box internet',
      internetBoxLocation:  'Emplacement box internet',
      tvMount:              'Support mural',
      remotes:              'Télécommandes',
      remoteName:           'Nom',
      remoteInstructions:   'Instructions',
      streamingServices:    'Services de streaming',
      specificInstructions: 'Instructions spécifiques',
    },

    storage: {
      storageItems:        'Rangements',
      suppliedConsumables: 'Consommables fournis',
      wasteManagement:     'Gestion des déchets',
      name:                'Nom',
      location:            'Emplacement',
      details:             'Détails',
      type:                'Type de déchet',
      instructions:        'Instructions',
    },

    location: {
      autoGenerated:     'Généré automatiquement',
      pointsOfInterest:  "Points d'intérêt",
      poiName:           'Lieu',
      category:          'Catégorie',
      walkingDistance:   'Distance à pied',
      drivingDistance:   'Distance en voiture',
      ownerNote:         'Note du propriétaire',
    },

    recommendations: {
      categories:       'Catégories',
      places:           'Adresses',
      name:             'Nom',
      address:          'Adresse',
      whyWeRecommend:   'Pourquoi on recommande',
      priceRange:       'Gamme de prix',
      tip:              'Bon à savoir',
    },

    activities: {
      categories:        'Catégories',
      activities:        'Activités',
      name:              'Nom',
      description:       'Description',
      estimatedDuration: 'Durée estimée',
      indicativePrice:   'Prix indicatif',
      howToBookOrGet:    'Comment y aller / réserver',
    },

    transport: {
      categories:      'Catégories',
      options:         'Options',
      name:            'Nom',
      practicalDetails:'Informations pratiques',
      recommendedApp:  'Application recommandée',
      indicativeRate:  'Tarif indicatif',
    },
  },

  // ── Section hints ────────────────────────────────────────────────────────────

  hints: {
    info:            'Adresse, description du logement, capacité, code WiFi, contact d\'urgence',
    checkin:         "Horaires, procédure d'arrivée, consignes de départ, remise des clés",
    rules:           'Bruit, animaux, tabac, capacité maximale, règles spécifiques',
    lighting:        'Emplacement des interrupteurs, fonctionnement des éclairages par zone',
    windows:         'Volets, fenêtres, velux — comment les ouvrir, fermer et verrouiller',
    appliances:      'Mode d\'emploi des appareils principaux (four, plaque, lave-linge, clim...)',
    tv:              'Télévision, télécommandes, streaming, décodeur, comment changer de source',
    storage:         'Rangements disponibles, produits d\'entretien, consommables, poubelles',
    location:        'Distances à pied aux points d\'intérêt clés : gare, plage, commerces',
    recommendations: 'Vos restaurants, bars et adresses préférés à proximité',
    activities:      'Visites, balades, excursions recommandées dans la région',
    transport:       'Bus, train, taxi, VTC — lignes, tarifs et applications utiles',
  },

  // ── Select options ───────────────────────────────────────────────────────────

  options: {
    propertyType:   ['Studio','T1','T2','T3','T4+','Maison','Villa','Autre'],
    bedType:        ['Simple','Double','Queen','King','Canapé-lit','Superposé'],
    contactRole:    ["Propriétaire","Gestionnaire","Contact d'urgence","Ménage","Maintenance","Autre"],
    accessMode:     ['Accueil en personne','Boîte à clés','Serrure connectée','Digicode','Autre'],
    partiesAllowed: ['Oui','Non','Sous conditions'],
    petsAllowed:    ['Oui','Non','Sous conditions'],
    smokingPolicy:  ['Interdit partout','Extérieur uniquement','Autorisé'],
    shoesPolicy:    ['Autorisées','À retirer à l\'entrée','Pas de règle'],
    shutterType:    ['Roulant électrique','Roulant manuel','Battant','Aucun'],
    poiCategory:    ['Transport','Commerce','Santé','Plage','Culture','Sport','Autre'],
    priceRange:     ['€','€€','€€€','€€€€'],
    streamingServices: ['Netflix','Prime Video','Disney+','YouTube','Apple TV+','Autre'],
  },

  // ── Appliance labels ─────────────────────────────────────────────────────────

  appliances: {
    categories: {
      kitchen:      'Cuisine',
      smallKitchen: 'Petite cuisine',
      maintenance:  'Entretien',
      comfort:      'Confort',
      bathroom:     'Salle de bain',
    },
    items: {
      oven: 'Four', cooktop: 'Plaque de cuisson', hood: 'Hotte',
      fridge: 'Réfrigérateur', freezer: 'Congélateur',
      dishwasher: 'Lave-vaisselle', microwave: 'Micro-ondes',
      coffeeMachine: 'Machine à café', kettle: 'Bouilloire',
      toaster: 'Grille-pain', blender: 'Mixeur', foodProcessor: 'Robot culinaire',
      washingMachine: 'Machine à laver', dryer: 'Sèche-linge',
      vacuum: 'Aspirateur', iron: 'Fer à repasser', robotVacuum: 'Robot aspirateur',
      airConditioning: 'Climatisation', heating: 'Chauffage',
      waterHeater: 'Chauffe-eau', fan: 'Ventilateur', airPurifier: "Purificateur d'air",
      hairDryer: 'Sèche-cheveux', towelWarmer: 'Sèche-serviettes',
    },
  },

  // ── Category labels ──────────────────────────────────────────────────────────

  recommendationCategories: {
    restaurants: 'Restaurants', barsAndCafes: 'Bars & Cafés',
    beaches: 'Plages', shopping: 'Shopping', markets: 'Marchés',
    nightlife: 'Vie nocturne', other: 'Autres adresses',
  },
  activityCategories: {
    onFoot: 'À pied', byBoat: 'En bateau', excursions: 'Excursions',
    sportsAndWellness: 'Sport & Bien-être', cultureAndMuseums: 'Culture & Musées',
    familyAndKids: 'Famille & Enfants', other: 'Autres activités',
  },
  transportCategories: {
    publicTransport: 'Transports en commun', train: 'Train',
    taxiAndRideshare: 'Taxi & VTC', carRental: 'Location de voiture',
    bicycle: 'Vélo', other: 'Autres',
  },

  // ── Wizard (future) ──────────────────────────────────────────────────────────

  wizard: {
    welcome: {
      title:    'Bienvenue sur LOFT AI !',
      subtitle: 'Configurons ensemble votre concierge virtuel',
      start:    'Commencer la configuration',
      skip:     'Passer (configurer plus tard)',
    },
    steps: {
      info: 'Les bases', contacts: 'Vos contacts', checkin: 'Arrivée & départ',
      rules: 'Règles', appliances: 'Équipements', recommendations: 'Vos recommandations', done: 'Terminé !',
    },
    nav: {
      next: 'Continuer', back: 'Retour', save: 'Sauvegarder', skip: 'Passer cette étape',
    },
    done: {
      title:    'Votre concierge est prêt !',
      subtitle: 'Les voyageurs peuvent maintenant obtenir toutes les informations dont ils ont besoin.',
      viewConversations: 'Voir les conversations',
      editContent:       'Modifier le contenu',
    },
  },
};

// ── t() function ─────────────────────────────────────────────────────────────

export function t(key, ...args) {
  const parts = key.split('.');
  let val = fr;
  for (const part of parts) {
    if (val == null) return key;
    val = val[part];
  }
  if (val == null)           return key;
  if (typeof val === 'function') return val(...args);
  return val;
}
