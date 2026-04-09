import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const ADMIN_PASSWORD = "LoftAI#Cannes2025!";
const PROPERTY_KEY   = "property:default";
const LEGACY_KEY     = "content:sections";   // rétro-compatibilité

function checkAuth(request) {
  return request.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

// ─── GET ──────────────────────────────────────────────────────────────────────
// Retourne { propertyData, sections, completionRate }
// propertyData = nouveau format JSON structuré (property:default)
// sections     = ancien format texte brut (content:sections) — fallback
export async function GET(request) {
  if (!checkAuth(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [rawProperty, rawSections] = await Promise.all([
      redis.get(PROPERTY_KEY),
      redis.get(LEGACY_KEY),
    ]);

    const propertyData = rawProperty
      ? (typeof rawProperty === "string" ? JSON.parse(rawProperty) : rawProperty)
      : null;

    const sections = rawSections
      ? (typeof rawSections === "string" ? JSON.parse(rawSections) : rawSections)
      : {};

    // Calcul taux de complétion (champs obligatoires du format structuré)
    const completionRate = propertyData
      ? computeCompletionRate(propertyData)
      : null;

    return Response.json({ propertyData, sections, completionRate });
  } catch (error) {
    console.error("Error fetching content:", error);
    return Response.json({ propertyData: null, sections: {}, completionRate: null });
  }
}

// ─── PUT ──────────────────────────────────────────────────────────────────────
// Accepte { propertyData } (nouveau) OU { sections } (ancien, rétro-compat)
export async function PUT(request) {
  if (!checkAuth(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (body.propertyData !== undefined) {
      // Nouveau format structuré
      await redis.set(PROPERTY_KEY, JSON.stringify(body.propertyData));
    } else if (body.sections !== undefined) {
      // Ancien format texte brut — rétro-compatibilité
      await redis.set(LEGACY_KEY, JSON.stringify(body.sections));
    } else {
      return Response.json({ error: "Missing propertyData or sections" }, { status: 400 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error saving content:", error);
    return Response.json({ error: "Failed to save content" }, { status: 500 });
  }
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
// Supprime property:default (reset onboarding — dev uniquement)
export async function DELETE(request) {
  if (!checkAuth(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await redis.del(PROPERTY_KEY);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Failed to delete" }, { status: 500 });
  }
}

// ─── Completion rate ──────────────────────────────────────────────────────────

const REQUIRED_FIELDS = [
  d => d?.info?.address,
  d => d?.info?.city,
  d => d?.info?.description,
  d => d?.info?.maxGuests,
  d => d?.info?.contacts?.length > 0,
  d => d?.checkin?.checkinTime,
  d => d?.checkin?.checkoutTime,
  d => d?.checkin?.accessMode,
  d => d?.rules?.quietHoursStart,
  d => d?.rules?.partiesAllowed,
  d => d?.rules?.smokingPolicy,
];

function computeCompletionRate(propertyData) {
  const filled = REQUIRED_FIELDS.filter(fn => {
    try { return !!fn(propertyData); } catch { return false; }
  }).length;
  return Math.round((filled / REQUIRED_FIELDS.length) * 100);
}
