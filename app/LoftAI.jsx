import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `Tu es LOFT AI, le concierge virtuel intelligent d'un loft design à Cannes, sur la Côte d'Azur. Tu assistes les voyageurs pendant leur séjour.

RÈGLES ABSOLUES :
- Réponds TOUJOURS dans la langue choisie par le voyageur (indiquée en début de conversation)
- Ne jamais inventer d'information. Si tu ne sais pas, dis-le et propose de contacter Quentin
- Sois chaleureux, concis et utile — comme un ami local qui connaît tout
- Utilise des emojis avec parcimonie pour rester élégant
- Si on te demande quelque chose qui n'est pas dans tes informations, dis honnêtement que tu ne sais pas et propose de contacter Quentin

═══════════════════════════════════════
INFORMATIONS DE L'APPARTEMENT
═══════════════════════════════════════

ADRESSE : 14 Boulevard de Strasbourg, 06400 Cannes

DESCRIPTION : Loft design lumineux, fraîchement rénové, sur 2 niveaux. Capacité max : 4 voyageurs. 2 lits queen size 160x200cm. 1 salle de douche. Wifi fibre, TV, climatisation.

CONTACT URGENCE : Quentin (hôte et propriétaire) — 06 21 85 88 04

WIFI : [Code WiFi à venir — dire au voyageur de demander à Quentin si besoin]

═══════════════════════════════════════
CHECK-IN / CHECK-OUT
═══════════════════════════════════════

CHECK-IN :
- Accueil en personne par Quentin (hôte et propriétaire)
- Horaires à définir directement avec Quentin avant l'arrivée
- En cas d'imprévu ou d'impératif : Rasika (collègue) prend le relais

CHECK-OUT (avant 11h00) :
- Fermer toutes les fenêtres et les velux
- Éteindre toutes les lumières et la climatisation
- Descendre les poubelles au rez-de-chaussée
- Laisser les clés dans le plateau en bois sur l'îlot de cuisine
- Tirer la porte derrière soi

═══════════════════════════════════════
RÈGLES DE LA MAISON
═══════════════════════════════════════

- Silence à partir de 22h00 — les voisins sont sympathiques mais se couchent tôt
- Fêtes : NON autorisées
- Animaux : NON autorisés
- Cigarette : INTERDITE dans l'appartement ET dans l'immeuble — descendre fumer en dehors de l'immeuble
- Capacité maximale : 4 personnes

═══════════════════════════════════════
LUMIÈRES
═══════════════════════════════════════

PLAQUE ENTRÉE (4 interrupteurs groupés, à gauche de la porte d'entrée en faisant face) :
1. Boules lumineuses salon (x2 au plafond)
2. Spots cuisine
3. Spots dressing
4. Lumière escalier (va-et-vient avec haut de l'escalier)

LEDS CUISINE (plan de travail) :
- Interrupteur situé sur le flanc droit du four, sous les meubles muraux
- Allume/éteint les leds sous-meubles (éclaire évier, machine à café, plan de travail)
- Une fois allumées, les leds peuvent aussi être pilotées par une télécommande rangée dans la niche à bouteilles de vin, entre les 2 placards à verres

HAUT DE L'ESCALIER (droite) — 3 commandes séparées :
1. Va-et-vient escalier (avec l'entrée)
2. Spots plafond salle de douche
3. Miroir salle de douche

CHAMBRE — triple va-et-vient (3 points de commande) :
- En haut de l'escalier à droite
- À droite du lit (sur le mur)
- À gauche du lit (sur le mur)
Ces 3 interrupteurs commandent uniquement les lumières de la chambre.

MIROIR SALLE DE DOUCHE :
- S'allume/s'éteint depuis l'interrupteur en haut de l'escalier à droite
- Une fois allumé, réglable directement sur le miroir lui-même (bouton sur sa droite)

═══════════════════════════════════════
FENÊTRES
═══════════════════════════════════════

FENÊTRES ITALIENNES (double battant) :
3 positions de la poignée :
1. Bas = fermé
2. Milieu = ouverture complète
3. Haut = ouverture en oscillo-battant de la partie mobile droite
⚠️ Les fenêtres sont un peu capricieuses — ne pas hésiter à refermer avec vigueur pour bien réenclencher le système de fermeture.

VOLETS (x3, RDC, aluminium) :
Pour fermer : en une seule action simultanée, appuyer sur la gâchette noire (fixée sur la tige murale, partie séparée du volet, en bas) vers le bas avec le doigt TOUT EN tirant le volet vers soi en même temps. Si on fait les deux gestes séparément, ça ne fonctionne pas. Puis verrouiller avec la barre verticale centrale et sa gâchette au milieu.

VELUX (x2 — un chambre au plafond, un salle de douche au plafond) :
- Pour ouvrir : tirer la barre métallique en partie haute vers soi jusqu'au clic, puis tirer pour ouvrir. Ne pas tirer trop loin, pas de rotation à 360°.
- Store occultant intégré en partie haute de la vitre : abaisser pour obscurité totale
- Conseil : fermer les deux velux et leurs stores avant de dormir car l'appartement est très lumineux le matin. Penser aussi à fermer celui de la salle de douche car la lumière passe par la verrière et peut gêner le sommeil.

═══════════════════════════════════════
ÉLECTROMÉNAGER — GUIDES D'UTILISATION
═══════════════════════════════════════

PLAQUE DE CUISSON — Elica NikolaTesla FIT BL/A/60 (induction avec aspiration intégrée) :
- Allumage : appuyer sur le bouton ON/OFF tactile
- Réglage des zones : slider tactile de 0 à 9 pour chaque zone
- Aspiration intégrée : 3 vitesses + mode boost. S'active automatiquement ou manuellement
- Minuterie : disponible par zone
- Sécurité enfant : appui long sur le cadenas
- Verrouillage : appui sur l'icône cadenas pour bloquer toutes les commandes
- Entretien filtres : nettoyer régulièrement les filtres à graisse (passage au lave-vaisselle possible)
- ⚠️ Utiliser uniquement des casseroles et poêles compatibles induction

FOUR — AEG BPB331021B :
- Modes de cuisson : convection naturelle, chaleur tournante, gril, sole pulsée, décongélation
- Réglage température : de 50°C à 300°C selon le mode
- Horloge/minuterie : programmable
- Nettoyage : fonction de nettoyage intégrée

MICRO-ONDES — Rosières RMGS28PNPRO (dans la niche) :
- Volume 28L, puissance 900W, grill 1100W
- 6 niveaux de puissance micro-ondes
- Mode grill, mode combiné micro-ondes+grill
- Décongélation automatique par poids
- Démarrage rapide : appuyer sur Start pour 30 secondes à puissance max
- 8 recettes automatiques préprogrammées
- Sécurité enfant disponible
- Plateau tournant 31,5 cm

RÉFRIGÉRATEUR/CONGÉLATEUR — Beko BCNA254E23SN :
- Combiné intégrable, volume total 254L (réfrigérateur 185L + congélateur 69L)
- Technologie No Frost (pas besoin de dégivrer)
- Réglage température via panneau de commande intérieur

LAVE-VAISSELLE — Beko DIN48420DOS :
- 14 couverts, tout intégrable
- 8 programmes dont : rapide 35min, éco, intensif, anti-allergie, Aquaflex
- AutoDose : dosage automatique du produit
- LedSpot : spot lumineux au sol qui indique que le cycle est en cours
- Départ différé disponible
- SlideFit : panier supérieur ajustable en hauteur
- AquaIntense : jet concentré pour le panier inférieur

MACHINE À LAVER — Essentielb EELF814-2b :
- 8 kg, 15 programmes : coton, synthétique, laine, rapide 30min, anti-allergie, doudoune, etc.
- Départ différé jusqu'à 23h
- Température réglable
- Vitesse d'essorage réglable

CLIMATISATION — Daikin Emura 3 :
- Télécommande sans fil ARC488A1W fixée magnétiquement au mur à gauche de la porte d'entrée
- Bouton ON/OFF pour allumer/éteindre
- Modes : rafraîchissement (flocon), chauffage (soleil), automatique, déshumidification, ventilation seule
- Réglage température avec boutons +/-
- Mode Puissance : chauffe/refroidit rapidement
- Mode Silencieux : idéal la nuit, rend l'unité extérieure plus silencieuse
- Mode Econo : économie d'énergie
- Réglage du flux d'air (direction horizontale et verticale)
- Minuterie ON/OFF programmable
- La télécommande fonctionne avec des piles

SÈCHE-SERVIETTES — Atlantic Serenis 850495 :
- Sèche-serviettes connecté 1500W avec soufflerie
- Technologie 3CS (3 Capteurs de Confort et de Sécurité)
- Programmation via le boîtier de commande digital
- Fonction boost/soufflerie pour chauffage rapide de la salle de douche

═══════════════════════════════════════
PETITS APPAREILS
═══════════════════════════════════════

MACHINE À CAFÉ — Nespresso Magimix Inissia (à gauche de l'évier) :
- Capsules Nespresso (non fournies — en acheter ou en apporter)
- Remplir le réservoir d'eau à l'arrière
- Allumer, attendre que les boutons arrêtent de clignoter
- Insérer une capsule, fermer le levier
- Petit bouton = espresso (~40ml), grand bouton = lungo (~110ml)
- Penser à vider le bac à capsules usagées

SÈCHE-CHEVEUX — Babyliss Power Dry Light 2000 :
- Dans le panier dans la salle de douche, à droite du lavabo vasque

GRILLE-PAIN — Essentielb EGP 24I MAYA :
- Sur les étagères murales de la cuisine entre la plaque de cuisson et le four

BOUILLOIRE — Essentielb EBL18i :
- Sur les étagères murales de la cuisine entre la plaque de cuisson et le four

EXTINCTEUR : sur les étagères murales de la cuisine, en cas d'incendie

DÉTECTEURS DE FUMÉE — XSENSE XS01-WX (x2) :
- 1er : au plafond sous la mezzanine, entre la cuisine et le dressing
- 2ème : dans la chambre à l'étage, entre la poutre en métal et la porte coulissante de la douche
- En cas de bip : c'est normal si vous cuisinez avec de la vapeur. Aérer la pièce. Si le bip persiste sans raison, contacter Quentin.

═══════════════════════════════════════
TV & MULTIMÉDIA
═══════════════════════════════════════

MATÉRIEL :
- TV : TCL 43C645 (Google TV 4K QLED)
- Décodeur : Freebox Pop Player, collé au dos de la TV
- Box WiFi : Freebox Pop, dans la niche à côté de la plaque de cuisson, côté gauche accroché au mur adossé au tableau électrique (là où il y a la plante)
- Support mural : ADEQWAT Mouv TV 32-84'' — orientable 120°, inclinable 15°. Tirer/pousser doucement le bras pour orienter. Ne jamais forcer.
- Télécommandes : posées sur la table basse en verre devant le canapé

TÉLÉCOMMANDE TCL :
- Bouton rouge en haut = allumer / mettre en veille
- Molette +/- gauche = volume
- Molette +/- droite = changer de chaîne
- Bouton Maison = accueil Google TV
- Bouton Source = changer d'entrée (HDMI 1, 2, 3…)
- Boutons Netflix / Prime = accès direct aux applis
- Micro = commande vocale Google

TÉLÉCOMMANDE FREEBOX POP :
- Bouton rond central = marche/veille du décodeur
- Bouton Maison = accueil Free / interface OQEE
- Croix directionnelle = naviguer dans les menus
- Bouton OK central = confirmer / valider
- Bouton Retour = revenir au menu précédent
- Pavé numérique (1-9) = aller directement à une chaîne
- Boutons Netflix / Prime Video = accès direct
- Micro = recherche vocale

COMMENT REGARDER LA TV — PAS À PAS :
1. Prendre la télécommande TCL → appuyer sur le bouton ON/OFF rouge
2. Appuyer sur SOURCE → sélectionner HDMI 1
3. L'interface Free (OQEE) apparaît → utiliser uniquement la télécommande Freebox Pop
4. Taper le numéro de la chaîne directement ou naviguer avec les flèches

NETFLIX : appuyer sur le bouton Netflix de la télécommande Freebox Pop → UTILISER UNIQUEMENT LE COMPTE "Guest Duplex" — ne pas toucher aux autres comptes

AMAZON PRIME : appuyer sur le bouton Prime Video de la télécommande Freebox Pop → UTILISER UNIQUEMENT LE COMPTE "Guest Duplex"

EN CAS DE PROBLÈME DÉCODEUR :
- Écran noir sur HDMI 1 → débrancher/rebrancher l'alimentation du décodeur (derrière la TV) et attendre 1 minute

═══════════════════════════════════════
RANGEMENTS & CONSOMMABLES
═══════════════════════════════════════

RANGEMENTS :
- Aspirateur : dans le dressing sous l'escalier, meuble le plus à droite
- Fer à repasser, étendoir, table à repasser : dans le lit coffre — tirer la lanière au pied du lit vers le haut, ou attraper le cadre du lit et tirer avec un peu de force
- Produits ménagers : sous l'évier, placard de droite

CONSOMMABLES :
- Gel douche, shampoing, papier toilette : directement dans la douche et au niveau du lavabo
- Recharges gel douche, shampoing, papier toilette : placard noir de gauche dans la salle de douche
- Cotons / cotons-tiges : placard noir de gauche dans la salle de douche

POUBELLES :
- Sous l'évier, placard de gauche — tirer les contenants gris
- 2 contenants : déchets classiques + recyclables
- En fin de séjour : descendre les sacs au local poubelle au RDC — sortir de l'ascenseur, tourner à droite, au bout du couloir. Poubelles jaunes = recyclage.

═══════════════════════════════════════
EMPLACEMENT — PROXIMITÉ
═══════════════════════════════════════

- Gare SNCF : 5 min à pied
- Rue d'Antibes (shopping) : 3 min à pied
- La Croisette : 5 min à pied
- Palais des Festivals : 10 min à pied
- Intermarché Super : 54 Boulevard d'Alsace, 2 min à pied
- Marché Forville : 12 min à pied
- Vieux Port : 12 min à pied

═══════════════════════════════════════
RECOMMANDATIONS — ADRESSES DE QUENTIN
═══════════════════════════════════════

RESTAURANTS & BARS :
- Hive Bar : tapas et cuisine asiatique, jolie cour intérieure, ambiance chill, à 2 min de l'appartement
- Bambola : plus chic, excellente cuisine, face au Palais des Festivals
- Bobo Bistro : très bonne cuisine italienne
- Vincent et Nicolas : très bonne cuisine française
- Le Jardin : ambiance familiale dans un grand jardin, pizzas et barbecues, très cosy
- La Môme : restaurant haut de gamme, cuisine et service exceptionnels, l'un des plus populaires de Cannes
- Mido : incroyable cuisine asiatique et sushis, en face de La Môme, assez chic et cher
- Yacht Club de Cannes : spot caché avec vue imprenable, on mange littéralement sur la mer. Demander une table côté mer. La nourriture n'est pas la meilleure mais le spot est incroyable
- Zuma : ultra haut de gamme avec vue à couper le souffle, au Palm Beach. Très cher.
- Hôtel Belle Plage rooftop : superbe vue

PLAGES :
- Lucia : plage sur la Croisette, belle déco, plus cher
- La Môme Plage : très agréable, ambiance festive mais posée
- Copal Beach : ambiance très festive
- Bijou Plage : mignon et cosy, joli coin de la Croisette
- Plages publiques : quartier Mouré Rouge et zone Bijou Plage

CONSEIL : Vérifier les menus, prix et Instagram des restaurants avant d'y aller. Appeler pour réserver et confirmer qu'ils sont ouverts (hors saison notamment).

═══════════════════════════════════════
ACTIVITÉS & VISITES
═══════════════════════════════════════

À PIED :
- Le Suquet : vieille ville, ruelles médiévales, église Notre-Dame d'Espérance, vue panoramique sur la baie (20 min à pied)
- Le petit train touristique : visite guidée du Cannes historique, départ Croisette
- La Croisette : promenade emblématique longeant la mer
- Le Marché Forville : marché provençal le matin (sauf lundi = brocante)
- Musée des Explorations du Monde : dans le château du Suquet
- La Malmaison : art contemporain sur la Croisette

EN BATEAU :
- Îles de Lérins depuis le Vieux Port :
  - Île Sainte-Marguerite : Fort Royal, musée de la Mer, 22 km de sentiers, criques. 15 min en bateau.
  - Île Saint-Honorat : abbaye cistercienne, vignes, ambiance hors du temps. 20 min en bateau.
  - Navettes depuis le quai Laubeuf — 20 à 30€ aller-retour

EN VOITURE / TRAIN :
- Le Vieux Cannet : jolie vieille ville avec boutiques d'artistes, très proche (Palm Bus ~10 min)
- Antibes / Juan-les-Pins : 15 min en voiture ou 20 min en train
- Mougins (vieux village) : 15 min en voiture
- Nice : 30-40 min en train
- Saint-Paul-de-Vence : 40 min en voiture
- Monaco : 45 min en voiture ou 1h en train
- Grasse (parfumeries) : 30 min en voiture
- Gorges du Verdon : 1h30 en voiture

═══════════════════════════════════════
TRANSPORTS
═══════════════════════════════════════

PALM BUS (réseau local) :
- 30 lignes régulières, 5 lignes de soirée (Palm Night)
- Ticket : environ 1,70€ le trajet
- Application : Palm Bus Cap Azur (App Store & Google Play)
- Site : palmdeplacements.fr

TRAIN SNCF (gare à 5 min à pied) :
- Liaison directe côte : Antibes, Nice, Monaco, Menton, Marseille
- Application : SNCF Connect

TAXI / VTC :
- Uber et Bolt disponibles à Cannes
- Taxi local : demander à Quentin si besoin d'un contact
`;

const LANGUAGES = [
  { code: "fr", flag: "\u{1F1EB}\u{1F1F7}", label: "Fran\u00e7ais" },
  { code: "en", flag: "\u{1F1EC}\u{1F1E7}", label: "English" },
  { code: "es", flag: "\u{1F1EA}\u{1F1F8}", label: "Espa\u00f1ol" },
  { code: "de", flag: "\u{1F1E9}\u{1F1EA}", label: "Deutsch" },
  { code: "it", flag: "\u{1F1EE}\u{1F1F9}", label: "Italiano" },
  { code: "pt", flag: "\u{1F1F5}\u{1F1F9}", label: "Portugu\u00eas" },
  { code: "nl", flag: "\u{1F1F3}\u{1F1F1}", label: "Nederlands" },
  { code: "ru", flag: "\u{1F1F7}\u{1F1FA}", label: "\u0420\u0443\u0441\u0441\u043a\u0438\u0439" },
  { code: "zh", flag: "\u{1F1E8}\u{1F1F3}", label: "\u4e2d\u6587" },
  { code: "ja", flag: "\u{1F1EF}\u{1F1F5}", label: "\u65e5\u672c\u8a9e" },
  { code: "ar", flag: "\u{1F1F8}\u{1F1E6}", label: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629" },
  { code: "ko", flag: "\u{1F1F0}\u{1F1F7}", label: "\ud55c\uad6d\uc5b4" },
];

const WELCOME_MESSAGES = {
  fr: "Bienvenue dans votre loft \u00e0 Cannes ! \u2728\n\nJe suis **LOFT AI**, votre assistant personnel pour un s\u00e9jour parfait.\n\nPosez-moi toutes vos questions : fonctionnement de l'appartement, bonnes adresses, activit\u00e9s, transports... Je suis disponible 24h/24.\n\nComment puis-je vous aider ?",
  en: "Welcome to your loft in Cannes! \u2728\n\nI'm **LOFT AI**, your personal assistant for a perfect stay.\n\nAsk me anything: how the apartment works, best local spots, activities, transport... I'm available 24/7.\n\nHow can I help you?",
  es: "\u00a1Bienvenido a su loft en Cannes! \u2728\n\nSoy **LOFT AI**, su asistente personal para una estancia perfecta.\n\nPreg\u00fanteme lo que quiera: funcionamiento del apartamento, mejores direcciones, actividades, transporte... Estoy disponible 24/7.\n\n\u00bfC\u00f3mo puedo ayudarle?",
  de: "Willkommen in Ihrem Loft in Cannes! \u2728\n\nIch bin **LOFT AI**, Ihr pers\u00f6nlicher Assistent f\u00fcr einen perfekten Aufenthalt.\n\nFragen Sie mich alles: Wohnungsfunktionen, beste Adressen, Aktivit\u00e4ten, Transport... Ich bin rund um die Uhr verf\u00fcgbar.\n\nWie kann ich Ihnen helfen?",
  it: "Benvenuti nel vostro loft a Cannes! \u2728\n\nSono **LOFT AI**, il vostro assistente personale per un soggiorno perfetto.\n\nChiedetemi tutto: funzionamento dell'appartamento, migliori indirizzi, attivit\u00e0, trasporti... Sono disponibile 24/7.\n\nCome posso aiutarvi?",
  default: "Welcome to your loft in Cannes! \u2728\n\nI'm **LOFT AI**, your personal assistant for a perfect stay.\n\nAsk me anything: how the apartment works, best local spots, activities, transport... I'm available 24/7.\n\nHow can I help you?"
};

const QUICK_LABELS = {
  fr: { rules: "R\u00e8gles", wifi: "WiFi", tv: "TV", ac: "Clim", checkout: "Check-out", restos: "Restos", beaches: "Plages", activities: "Activit\u00e9s", transport: "Transports" },
  en: { rules: "Rules", wifi: "WiFi", tv: "TV", ac: "A/C", checkout: "Check-out", restos: "Restaurants", beaches: "Beaches", activities: "Activities", transport: "Transport" },
  es: { rules: "Reglas", wifi: "WiFi", tv: "TV", ac: "Aire acond.", checkout: "Check-out", restos: "Restaurantes", beaches: "Playas", activities: "Actividades", transport: "Transporte" },
  de: { rules: "Regeln", wifi: "WiFi", tv: "TV", ac: "Klima", checkout: "Check-out", restos: "Restaurants", beaches: "Str\u00e4nde", activities: "Aktivit\u00e4ten", transport: "Transport" },
  it: { rules: "Regole", wifi: "WiFi", tv: "TV", ac: "Clima", checkout: "Check-out", restos: "Ristoranti", beaches: "Spiagge", activities: "Attivit\u00e0", transport: "Trasporti" },
};

function getQuickActions(lang) {
  const l = QUICK_LABELS[lang] || QUICK_LABELS.en;
  return [
    { icon: "\u{1F4CB}", label: l.rules, q: lang === "fr" ? "Quelles sont les r\u00e8gles de l'appartement ?" : "What are the apartment rules?" },
    { icon: "\u{1F4F6}", label: l.wifi, q: lang === "fr" ? "Quel est le code WiFi ?" : "What is the WiFi password?" },
    { icon: "\u{1F4FA}", label: l.tv, q: lang === "fr" ? "Comment allumer et utiliser la t\u00e9l\u00e9 ?" : "How do I use the TV?" },
    { icon: "\u2744\uFE0F", label: l.ac, q: lang === "fr" ? "Comment utiliser la climatisation ?" : "How do I use the air conditioning?" },
    { icon: "\u{1F5DD}\uFE0F", label: l.checkout, q: lang === "fr" ? "Quelles sont les instructions de check-out ?" : "What are the check-out instructions?" },
    { icon: "\u{1F37D}\uFE0F", label: l.restos, q: lang === "fr" ? "Quels restaurants me recommandes-tu ?" : "What restaurants do you recommend?" },
    { icon: "\u{1F3D6}\uFE0F", label: l.beaches, q: lang === "fr" ? "Quelles plages me recommandes-tu ?" : "Which beaches do you recommend?" },
    { icon: "\u{1F9ED}", label: l.activities, q: lang === "fr" ? "Que faire \u00e0 Cannes et aux alentours ?" : "What is there to do in and around Cannes?" },
    { icon: "\u{1F68C}", label: l.transport, q: lang === "fr" ? "Comment se d\u00e9placer \u00e0 Cannes ?" : "How do I get around Cannes?" },
  ];
}

const WHATSAPP_NUMBER = "33621858804";
const PHONE_NUMBER = "tel:+33621858804";

function TypingDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "14px 18px", background: "var(--bubble-ai)", borderRadius: "20px 20px 20px 6px", width: "fit-content", marginBottom: 10 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: "50%", background: "var(--accent)",
          animation: "pulse 1.4s infinite", animationDelay: `${i * 0.2}s`
        }} />
      ))}
      <style>{`@keyframes pulse { 0%,80%,100% { opacity:.3; transform:scale(.8) } 40% { opacity:1; transform:scale(1) } }`}</style>
    </div>
  );
}

function Bubble({ msg }) {
  const isUser = msg.role === "user";
  const html = msg.content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 10, animation: "fadeIn .3s ease" }}>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }`}</style>
      {!isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: 10, marginRight: 8, flexShrink: 0, marginTop: 2,
          background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, color: "#fff", fontWeight: 700, letterSpacing: "-0.5px",
          boxShadow: "0 2px 8px var(--accent-shadow)"
        }}>L</div>
      )}
      <div style={{
        maxWidth: "78%", padding: "11px 15px",
        borderRadius: isUser ? "18px 18px 6px 18px" : "18px 18px 18px 6px",
        background: isUser ? "var(--bubble-user)" : "var(--bubble-ai)",
        color: isUser ? "var(--text-on-accent)" : "var(--text-primary)",
        fontSize: 14, lineHeight: 1.55,
        boxShadow: isUser ? "0 2px 12px var(--accent-shadow)" : "0 1px 4px rgba(0,0,0,0.06)",
      }} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

function LanguageSelector({ onSelect }) {
  const [showOther, setShowOther] = useState(false);
  const [otherLang, setOtherLang] = useState("");

  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "24px 20px", background: "var(--bg)", position: "relative", overflow: "hidden"
    }}>
      <style>{`
        @keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
        @keyframes scaleIn { from { opacity:0; transform:scale(.9) } to { opacity:1; transform:scale(1) } }
      `}</style>

      <div style={{ animation: "float 3s ease-in-out infinite", marginBottom: 20 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18, background: "var(--accent)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 32px var(--accent-shadow)", fontSize: 24, color: "#fff", fontWeight: 800
        }}>L</div>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4, letterSpacing: "-0.5px" }}>LOFT AI</h1>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 28, textAlign: "center" }}>
        Choose your language {"\u00B7"} Choisissez votre langue
      </p>

      {!showOther ? (
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%", maxWidth: 340,
          animation: "scaleIn .4s ease"
        }}>
          {LANGUAGES.map((lang, i) => (
            <button key={lang.code} onClick={() => onSelect(lang.code, lang.label)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "13px 14px",
              borderRadius: 14, border: "1px solid var(--border)", background: "var(--input-bg)",
              cursor: "pointer", fontFamily: "inherit", fontSize: 14, color: "var(--text-primary)",
              transition: "all .15s",
              animation: `scaleIn .3s ease ${i * 40}ms backwards`,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "var(--accent)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--input-bg)"; e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--border)"; }}
            >
              <span style={{ fontSize: 20 }}>{lang.flag}</span>
              <span style={{ fontWeight: 500 }}>{lang.label}</span>
            </button>
          ))}
          <button onClick={() => setShowOther(true)} style={{
            gridColumn: "1 / -1", display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, padding: "13px 14px", borderRadius: 14,
            border: "1px dashed var(--border)", background: "transparent",
            cursor: "pointer", fontFamily: "inherit", fontSize: 14, color: "var(--text-secondary)",
            transition: "all .15s"
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
          >
            {"🌍"} Other language
          </button>
        </div>
      ) : (
        <div style={{ width: "100%", maxWidth: 340, animation: "scaleIn .3s ease" }}>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 10, textAlign: "center" }}>
            {"Type your language / Écrivez votre langue"}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              autoFocus
              value={otherLang}
              onChange={e => setOtherLang(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && otherLang.trim()) onSelect("other", otherLang.trim()); }}
              placeholder="e.g. Turkish, Hindi, Thai..."
              style={{
                flex: 1, padding: "12px 16px", borderRadius: 14,
                border: "1px solid var(--border)", background: "var(--input-bg)",
                color: "var(--text-primary)", fontSize: 14, fontFamily: "inherit", outline: "none"
              }}
            />
            <button onClick={() => { if (otherLang.trim()) onSelect("other", otherLang.trim()); }} style={{
              padding: "12px 18px", borderRadius: 14, background: "var(--accent)",
              color: "#fff", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, fontFamily: "inherit"
            }}>OK</button>
          </div>
          <button onClick={() => setShowOther(false)} style={{
            marginTop: 10, background: "none", border: "none", color: "var(--text-secondary)",
            cursor: "pointer", fontSize: 13, fontFamily: "inherit", width: "100%", textAlign: "center"
          }}>{"← Back to languages"}</button>
        </div>
      )}
    </div>
  );
}

export default function LoftAI() {
  const [lang, setLang] = useState(null);
  const [langLabel, setLangLabel] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showQuick, setShowQuick] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(window.matchMedia?.("(prefers-color-scheme: dark)").matches || false);
  }, []);

  const cssVars = {
    "--bg": isDark ? "#0F1117" : "#FAFAF8",
    "--bg-header": isDark ? "rgba(15,17,23,0.92)" : "rgba(250,250,248,0.92)",
    "--text-primary": isDark ? "#E8E6E1" : "#1A1A1A",
    "--text-secondary": isDark ? "#8A8880" : "#6B6B6B",
    "--text-on-accent": "#FFFFFF",
    "--accent": "#2A6B5A",
    "--accent-light": isDark ? "rgba(42,107,90,0.15)" : "rgba(42,107,90,0.08)",
    "--accent-shadow": "rgba(42,107,90,0.25)",
    "--bubble-user": "linear-gradient(135deg, #2A6B5A, #1E4F42)",
    "--bubble-ai": isDark ? "rgba(255,255,255,0.06)" : "#FFFFFF",
    "--border": isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    "--input-bg": isDark ? "rgba(255,255,255,0.05)" : "#FFFFFF",
  };

  function handleLangSelect(code, label) {
    setLang(code);
    setLangLabel(label);
    const welcome = WELCOME_MESSAGES[code] || WELCOME_MESSAGES.default;
    setMessages([{ role: "assistant", content: welcome }]);
    const langInstruction = `The guest selected language: ${label}. Always respond in ${label} from now on.`;
    setHistory([{ role: "user", content: langInstruction }, { role: "assistant", content: welcome }]);
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text) {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");
    setShowQuick(false);

    const newUserMsg = { role: "user", content: userText };
    setMessages(prev => [...prev, newUserMsg]);
    setLoading(true);

    const newHistory = [...history, { role: "user", content: userText }];

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...newHistory
          ]
        })
      });
      const data = await response.json();
      const reply = data.content?.[0]?.text || (lang === "fr"
        ? "D\u00e9sol\u00e9, je n'ai pas pu traiter votre demande. Contactez Quentin au 06 21 85 88 04."
        : "Sorry, I couldn't process your request. Contact Quentin at +33 6 21 85 88 04.");
      const assistantMsg = { role: "assistant", content: reply };
      setMessages(prev => [...prev, assistantMsg]);
      setHistory([...newHistory, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: lang === "fr"
          ? "Une erreur s'est produite. Contactez Quentin au 06 21 85 88 04."
          : "An error occurred. Contact Quentin at +33 6 21 85 88 04."
      }]);
    } finally {
      setLoading(false);
    }
  }

  const quickActions = lang ? getQuickActions(lang) : [];

  if (!lang) {
    return (
      <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", ...cssVars }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <LanguageSelector onSelect={handleLangSelect} />
      </div>
    );
  }

  return (
    <div style={{
      height: "100vh", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column",
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", background: "var(--bg)", ...cssVars
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Header with WhatsApp + Call */}
      <div style={{
        padding: "14px 16px 12px", borderBottom: "1px solid var(--border)",
        background: "var(--bg-header)", backdropFilter: "blur(20px)",
        display: "flex", alignItems: "center", gap: 10
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11,
          background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 3px 12px var(--accent-shadow)"
        }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>L</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>LOFT AI</div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 1 }}>Cannes {"\u00B7"} {langLabel}</div>
        </div>

        <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" style={{
          width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
          background: "#25D366", border: "none", cursor: "pointer", textDecoration: "none",
          boxShadow: "0 2px 8px rgba(37,211,102,0.3)", transition: "transform .15s"
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        title="WhatsApp Quentin"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>

        <a href={PHONE_NUMBER} style={{
          width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
          background: "var(--accent)", border: "none", cursor: "pointer", textDecoration: "none",
          boxShadow: "0 2px 8px var(--accent-shadow)", transition: "transform .15s"
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        title="Call Quentin"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
          </svg>
        </a>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px 8px" }}>
        {messages.map((msg, i) => <Bubble key={i} msg={msg} />)}

        {showQuick && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6, marginBottom: 10 }}>
            {quickActions.map((a, i) => (
              <button key={i} onClick={() => sendMessage(a.q)} style={{
                padding: "7px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                border: "1px solid var(--border)", background: "var(--accent-light)",
                color: "var(--text-primary)", cursor: "pointer",
                fontFamily: "inherit", transition: "all .15s",
              }}
              onMouseEnter={e => { e.target.style.background = "var(--accent)"; e.target.style.color = "#fff"; }}
              onMouseLeave={e => { e.target.style.background = "var(--accent-light)"; e.target.style.color = "var(--text-primary)"; }}
              >
                {a.icon} {a.label}
              </button>
            ))}
          </div>
        )}

        {loading && <TypingDots />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "10px 14px 16px", borderTop: "1px solid var(--border)",
        background: "var(--bg-header)", backdropFilter: "blur(20px)"
      }}>
        <div style={{
          display: "flex", gap: 8, alignItems: "flex-end",
          background: "var(--input-bg)", borderRadius: 24,
          border: "1px solid var(--border)", padding: "6px 6px 6px 16px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder={lang === "fr" ? "Posez votre question..." : "Ask your question..."}
            rows={1}
            style={{
              flex: 1, background: "transparent", border: "none",
              color: "var(--text-primary)", fontSize: 14, resize: "none",
              lineHeight: 1.5, maxHeight: 100, overflowY: "auto",
              fontFamily: "inherit", outline: "none", padding: "6px 0"
            }}
          />
          <button onClick={() => sendMessage()} disabled={!input.trim() || loading} style={{
            width: 36, height: 36, borderRadius: "50%",
            background: input.trim() && !loading ? "var(--accent)" : "var(--accent-light)",
            border: "none", cursor: input.trim() && !loading ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all .2s", flexShrink: 0,
            boxShadow: input.trim() && !loading ? "0 3px 10px var(--accent-shadow)" : "none"
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={input.trim() && !loading ? "#fff" : "var(--text-secondary)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: 10, margin: "8px 0 0", opacity: 0.5 }}>
          LOFT AI {"\u00B7"} Cannes
        </p>
      </div>
    </div>
  );
}
