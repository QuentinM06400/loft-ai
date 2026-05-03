import { NextResponse } from "next/server";

function stripHtml(html) {
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<head[\s\S]*?<\/head>/gi, "");
  text = text.replace(/<[^>]+>/g, " ");
  text = text.replace(/\s+/g, " ").trim();
  return text.slice(0, 8000);
}

const SYSTEM_PROMPT = `Tu es un extracteur de données d'annonces de location courte durée.
Analyse le texte fourni et extrais uniquement les informations présentes.
Réponds UNIQUEMENT avec un JSON valide, sans texte avant ou après,
sans balises markdown.`;

const USER_PROMPT_TEMPLATE = `Extrais les informations de cette annonce et retourne ce JSON exact
(utilise null pour les champs absents) :
{
  "info": {
    "propertyType": null,
    "street": null,
    "city": null,
    "postalCode": null,
    "country": null,
    "floor": null,
    "hasElevator": null,
    "description": null,
    "maxGuests": null,
    "bedrooms": null,
    "beds": null,
    "bathrooms": null
  },
  "checkin": {
    "checkinTime": null,
    "checkoutTime": null
  },
  "rules": {
    "petsAllowed": null,
    "smokingPolicy": null,
    "partiesAllowed": null
  },
  "appliances": {
    "items": {},
    "tvWizard": {
      "equipment": [],
      "streamingAccess": {}
    }
  }
}

Pour propertyType, utilise : Appartement, Maison, Studio, Loft ou Villa.
Pour petsAllowed et partiesAllowed : 'Oui' ou 'Non'.
Pour smokingPolicy : 'Interdit', 'Balcon uniquement' ou 'Autorisé'.
Pour les équipements (appliances.items), ajoute uniquement les ids
présents dans cette liste si mentionnés dans l'annonce :
oven, cooktop, hood, fridge, freezer, dishwasher, microwave,
coffeeMachine, kettle, toaster, blender, foodProcessor,
washingMachine, dryer, vacuum, iron, robotVacuum,
airConditioning, heating, waterHeater, fan, airPurifier,
hairDryer, towelWarmer
Format : { [id]: { "enabled": true, "brandModel": "", "location": "", "specificInstructions": "" } }
Pour streamingAccess, ajoute uniquement les services mentionnés :
Netflix, Disney+, Amazon Prime Video, Apple TV+, Canal+, Spotify
Format : { [service]: { "accessible": "Oui", "instructions": "" } }

Texte de l'annonce :
[TEXTE]`;

export async function POST(req) {
  try {
    const { url, text } = await req.json();

    let extractedText = text || "";

    if (url && !text) {
      try {
        const res = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Accept": "text/html,application/xhtml+xml",
            "Accept-Language": "fr-FR,fr;q=0.9",
          },
        });

        if (res.status >= 400) {
          return NextResponse.json({ blocked: true });
        }

        const html = await res.text();
        if (!html) {
          return NextResponse.json({ blocked: true });
        }

        extractedText = stripHtml(html);
        if (!extractedText) {
          return NextResponse.json({ blocked: true });
        }
      } catch {
        return NextResponse.json({ blocked: true });
      }
    }

    if (!extractedText) {
      return NextResponse.json({ success: false, error: "Aucun texte fourni" });
    }

    const userPrompt = USER_PROMPT_TEMPLATE.replace("[TEXTE]", extractedText);

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ success: false, error: `Anthropic error: ${res.status} ${err}` });
    }

    const message = await res.json();
    const raw = message.content
      .map(i => i.text || '')
      .join('')
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    const data = JSON.parse(raw);

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
