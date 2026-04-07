import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

// Password admin (à terme, mettre dans les variables d'environnement Vercel)
const ADMIN_PASSWORD = "LoftAI#Cannes2025!";

function checkAuth(request) {
  const authHeader = request.headers.get("x-admin-password");
  return authHeader === ADMIN_PASSWORD;
}

// GET — Récupérer toutes les conversations (admin only)
export async function GET(request) {
  if (!checkAuth(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const keys = await redis.keys("conv:*");
    if (!keys || keys.length === 0) {
      return Response.json({ conversations: [] });
    }

    const conversations = [];
    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        conversations.push(typeof data === "string" ? JSON.parse(data) : data);
      }
    }

    // Trier par date décroissante
    conversations.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));

    return Response.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return Response.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}

// POST — Sauvegarder une conversation
export async function POST(request) {
  try {
    const body = await request.json();
    const { id, messages, language, startedAt, endedAt, deviceInfo } = body;

    if (!id || !messages) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const conversation = {
      id,
      messages,
      language: language || "unknown",
      startedAt: startedAt || new Date().toISOString(),
      endedAt: endedAt || new Date().toISOString(),
      messageCount: messages.filter((m) => m.role === "user").length,
      deviceInfo: deviceInfo || "unknown",
    };

    // Stocker avec expiration de 90 jours (RGPD — durée limitée)
    await redis.set(`conv:${id}`, JSON.stringify(conversation), { ex: 90 * 24 * 60 * 60 });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error saving conversation:", error);
    return Response.json({ error: "Failed to save conversation" }, { status: 500 });
  }
}

// DELETE — Supprimer une conversation (admin only)
export async function DELETE(request) {
  if (!checkAuth(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "Missing conversation id" }, { status: 400 });
    }

    await redis.del(`conv:${id}`);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return Response.json({ error: "Failed to delete conversation" }, { status: 500 });
  }
}
