"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/app/lib/i18n";
import ContentTab from "@/app/admin/components/ContentTab";
import WizardContainer from "@/app/admin/components/wizard/WizardContainer";

const G    = "#2A6B5A";
const FONT = "'DM Sans', sans-serif";

const LANG_FLAGS = {
  fr: "\u{1F1EB}\u{1F1F7}", en: "\u{1F1EC}\u{1F1E7}", es: "\u{1F1EA}\u{1F1F8}",
  de: "\u{1F1E9}\u{1F1EA}", it: "\u{1F1EE}\u{1F1F9}", pt: "\u{1F1F5}\u{1F1F9}",
  nl: "\u{1F1F3}\u{1F1F1}", ru: "\u{1F1F7}\u{1F1FA}", zh: "\u{1F1E8}\u{1F1F3}",
  ja: "\u{1F1EF}\u{1F1F5}", ar: "\u{1F1F8}\u{1F1E6}", ko: "\u{1F1F0}\u{1F1F7}",
  other: "\u{1F30D}", unknown: "❓"
};

// ─── LoginScreen ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [hostId, setHostId]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!hostId.trim() || !password.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostId: hostId.trim(), password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onLogin(data.hostId);
      } else {
        setError(data.error || "Identifiants invalides");
        setTimeout(() => setError(""), 3000);
      }
    } catch {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  const inp = {
    width: "100%", padding: "12px 14px", borderRadius: 12, fontSize: 13,
    border: "1px solid rgba(0,0,0,0.1)", background: "#FAFAF8",
    fontFamily: FONT, outline: "none", boxSizing: "border-box",
    color: "#1A1A1A", transition: "border .15s", marginBottom: 10,
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAF8", fontFamily: FONT }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ width: "100%", maxWidth: 380, padding: 32, borderRadius: 20, background: "#fff", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: G, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff", fontWeight: 800, marginBottom: 12, boxShadow: "0 4px 16px rgba(42,107,90,0.3)" }}>L</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1A1A1A", margin: "0 0 4px" }}>LOFT AI</h1>
          <p style={{ fontSize: 13, color: "#6B6B6B", margin: 0 }}>Espace hôte</p>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={hostId}
            onChange={e => setHostId(e.target.value)}
            placeholder="Identifiant (ex: cannes-loft)"
            autoFocus
            style={{ ...inp, borderColor: error ? "#E53E3E" : "rgba(0,0,0,0.1)" }}
            onFocus={e  => (e.target.style.borderColor = G)}
            onBlur={e   => (e.target.style.borderColor = error ? "#E53E3E" : "rgba(0,0,0,0.1)")}
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Mot de passe"
            style={{ ...inp, borderColor: error ? "#E53E3E" : "rgba(0,0,0,0.1)" }}
            onFocus={e  => (e.target.style.borderColor = G)}
            onBlur={e   => (e.target.style.borderColor = error ? "#E53E3E" : "rgba(0,0,0,0.1)")}
          />
          {error && <p style={{ color: "#E53E3E", fontSize: 12, margin: "-4px 0 10px" }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: loading ? "rgba(0,0,0,0.1)" : G, color: loading ? "#999" : "#fff", fontSize: 14, fontWeight: 600, cursor: loading ? "default" : "pointer", fontFamily: FONT, boxShadow: loading ? "none" : "0 3px 12px rgba(42,107,90,0.3)", transition: "all .15s" }}
          >{loading ? "Connexion..." : "Se connecter"}</button>
        </form>
      </div>
    </div>
  );
}

// ─── ChoiceScreen (superadmin uniquement) ─────────────────────────────────────
function ChoiceScreen({ onDashboard, onSuperAdmin, onLogout }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#FAFAF8", fontFamily: FONT, padding: 24 }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ width: 56, height: 56, borderRadius: 16, background: G, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff", fontWeight: 800, marginBottom: 20, boxShadow: "0 4px 16px rgba(42,107,90,0.3)" }}>L</div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1A1A1A", margin: "0 0 8px", textAlign: "center" }}>Bonjour, Quentin</h1>
      <p style={{ fontSize: 14, color: "#6B6B6B", margin: "0 0 36px", textAlign: "center" }}>Que souhaitez-vous faire ?</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", maxWidth: 420 }}>
        <button
          onClick={onDashboard}
          style={{ padding: "20px 24px", borderRadius: 16, border: `2px solid ${G}`, background: "#fff", cursor: "pointer", fontFamily: FONT, textAlign: "left", display: "flex", alignItems: "center", gap: 16, boxShadow: "0 4px 20px rgba(42,107,90,0.12)", transition: "all .15s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(42,107,90,0.04)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}
        >
          <span style={{ fontSize: 26 }}>🏠</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: G, marginBottom: 3 }}>Accéder à mon dashboard</div>
            <div style={{ fontSize: 12, color: "#6B6B6B" }}>Consulter les conversations, modifier le contenu</div>
          </div>
          <span style={{ marginLeft: "auto", fontSize: 18, color: G }}>→</span>
        </button>

        <button
          onClick={onSuperAdmin}
          style={{ padding: "20px 24px", borderRadius: 16, border: "2px solid rgba(0,0,0,0.1)", background: "#fff", cursor: "pointer", fontFamily: FONT, textAlign: "left", display: "flex", alignItems: "center", gap: 16, transition: "all .15s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#FAFAF8"; e.currentTarget.style.borderColor = "rgba(0,0,0,0.18)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)"; }}
        >
          <span style={{ fontSize: 26 }}>⚙️</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#1A1A1A", marginBottom: 3 }}>Gérer les comptes hôtes</div>
            <div style={{ fontSize: 12, color: "#6B6B6B" }}>Créer, modifier ou supprimer des comptes</div>
          </div>
          <span style={{ marginLeft: "auto", fontSize: 18, color: "#6B6B6B" }}>→</span>
        </button>
      </div>

      <button
        onClick={onLogout}
        style={{ marginTop: 32, fontSize: 12, color: "#9A9A9A", background: "none", border: "none", cursor: "pointer", fontFamily: FONT }}
      >Se déconnecter</button>
    </div>
  );
}

// ─── StatsBar ─────────────────────────────────────────────────────────────────
function StatsBar({ conversations }) {
  const total        = conversations.length;
  const totalMessages = conversations.reduce((sum, c) => sum + (c.messageCount || 0), 0);
  const langCount    = {};
  conversations.forEach(c => { const l = c.language || "unknown"; langCount[l] = (langCount[l] || 0) + 1; });
  const topLangs = Object.entries(langCount).sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
      {[
        { val: total,        label: t("admin.stats.conversations") },
        { val: totalMessages, label: t("admin.stats.messages") },
        { val: topLangs.map(([l]) => LANG_FLAGS[l] || "\u{1F30D}").join(" ") || "—", label: t("admin.stats.topLanguages"), small: true },
      ].map((s, i) => (
        <div key={i} style={{ padding: 16, borderRadius: 14, background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: s.small ? 16 : 24, fontWeight: 700, color: G }}>{s.val}</div>
          <div style={{ fontSize: 12, color: "#6B6B6B", marginTop: 2 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── ConversationCard ─────────────────────────────────────────────────────────
function ConversationCard({ conv, onDelete, onExpand, isExpanded }) {
  const date    = new Date(conv.startedAt);
  const dateStr = date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const duration = conv.endedAt && conv.startedAt ? Math.round((new Date(conv.endedAt) - new Date(conv.startedAt)) / 60000) : null;
  const firstUserMsg = conv.messages?.find(m => m.role === "user" && !m.content.startsWith("The guest selected language"));
  const preview  = firstUserMsg?.content?.substring(0, 80) || "...";
  const flag     = LANG_FLAGS[conv.language] || "\u{1F30D}";
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div style={{ borderRadius: 14, background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden", marginBottom: 10 }}>
      <div
        onClick={() => onExpand(conv.id)}
        style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}
        onMouseEnter={e => (e.currentTarget.style.background = "#F7F7F5")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        <div style={{ fontSize: 22 }}>{flag}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1A1A" }}>{dateStr}</span>
            <span style={{ fontSize: 12, color: "#6B6B6B" }}>{timeStr}</span>
            {duration !== null && <span style={{ fontSize: 11, color: G, background: "rgba(42,107,90,0.08)", padding: "2px 8px", borderRadius: 10 }}>{duration} min</span>}
            <span style={{ fontSize: 11, color: "#6B6B6B", background: "rgba(0,0,0,0.04)", padding: "2px 8px", borderRadius: 10 }}>{conv.messageCount || 0} msg</span>
          </div>
          <div style={{ fontSize: 13, color: "#6B6B6B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{preview}</div>
        </div>
        <span style={{ fontSize: 16, color: "#6B6B6B", transform: isExpanded ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s" }}>▼</span>
      </div>

      {isExpanded && (
        <div style={{ padding: "0 16px 14px", borderTop: "1px solid rgba(0,0,0,0.04)" }}>
          <div style={{ maxHeight: 400, overflowY: "auto", padding: "12px 0" }}>
            {conv.messages?.filter(m => !m.content.startsWith("The guest selected language")).map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 8 }}>
                <div style={{ maxWidth: "80%", padding: "10px 14px", borderRadius: 14, fontSize: 13, lineHeight: 1.5, background: msg.role === "user" ? G : "#F0F0EE", color: msg.role === "user" ? "#fff" : "#1A1A1A" }}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 8, borderTop: "1px solid rgba(0,0,0,0.04)" }}>
            {conv.deviceInfo && conv.deviceInfo !== "unknown" && (
              <span style={{ fontSize: 11, color: "#6B6B6B", alignSelf: "center", marginRight: "auto" }}>{conv.deviceInfo}</span>
            )}
            {!confirmDelete ? (
              <button onClick={e => { e.stopPropagation(); setConfirmDelete(true); }} style={{ padding: "7px 14px", borderRadius: 10, fontSize: 12, fontWeight: 500, border: "1px solid #E53E3E", background: "transparent", color: "#E53E3E", cursor: "pointer", fontFamily: FONT }}>{t("admin.conversations.delete")}</button>
            ) : (
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#E53E3E" }}>{t("admin.conversations.confirmQuestion")}</span>
                <button onClick={e => { e.stopPropagation(); onDelete(conv.id); }} style={{ padding: "7px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600, border: "none", background: "#E53E3E", color: "#fff", cursor: "pointer", fontFamily: FONT }}>{t("admin.conversations.confirmYes")}</button>
                <button onClick={e => { e.stopPropagation(); setConfirmDelete(false); }} style={{ padding: "7px 14px", borderRadius: 10, fontSize: 12, border: "1px solid rgba(0,0,0,0.1)", background: "transparent", color: "#6B6B6B", cursor: "pointer", fontFamily: FONT }}>{t("admin.conversations.cancel")}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ConversationsTab ─────────────────────────────────────────────────────────
function ConversationsTab() {
  const [conversations, setConversations] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [langFilter, setLangFilter] = useState("all");
  const [dateFrom,   setDateFrom]   = useState("");
  const [dateTo,     setDateTo]     = useState("");
  const [expandedId, setExpandedId] = useState(null);

  async function fetchConversations() {
    setLoading(true);
    try {
      const res  = await fetch("/api/conversations");
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch {
      console.error("Erreur chargement conversations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchConversations(); }, []);

  async function handleDelete(id) {
    try {
      await fetch(`/api/conversations?id=${id}`, { method: "DELETE" });
      setConversations(prev => prev.filter(c => c.id !== id));
      setExpandedId(null);
    } catch {
      console.error("Erreur suppression");
    }
  }

  const allLangs = [...new Set(conversations.map(c => c.language || "unknown"))];
  const filtered = conversations.filter(c => {
    if (langFilter !== "all" && c.language !== langFilter) return false;
    if (dateFrom && new Date(c.startedAt) < new Date(dateFrom)) return false;
    if (dateTo) { const to = new Date(dateTo); to.setDate(to.getDate() + 1); if (new Date(c.startedAt) > to) return false; }
    if (search) { const s = search.toLowerCase(); if (!c.messages?.some(m => m.content.toLowerCase().includes(s))) return false; }
    return true;
  });

  const inp = { padding: "10px 14px", borderRadius: 10, fontSize: 13, border: "1px solid rgba(0,0,0,0.08)", background: "#FAFAF8", fontFamily: FONT, outline: "none" };

  return (
    <div>
      <StatsBar conversations={conversations} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16, padding: "14px 16px", borderRadius: 14, background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("admin.conversations.searchPlaceholder")} style={{ ...inp, flex: "1 1 200px" }} />
        <select value={langFilter} onChange={e => setLangFilter(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
          <option value="all">{t("admin.conversations.allLanguages")}</option>
          {allLangs.map(l => <option key={l} value={l}>{LANG_FLAGS[l] || "\u{1F30D}"} {l}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={inp} />
        <input type="date" value={dateTo}   onChange={e => setDateTo(e.target.value)}   style={inp} />
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#6B6B6B" }}>{t("admin.conversations.loading")}</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#6B6B6B" }}>
          {conversations.length === 0 ? t("admin.conversations.empty") : t("admin.conversations.noMatch")}
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 12, color: "#6B6B6B", marginBottom: 10 }}>
            {filtered.length} {filtered.length > 1 ? t("admin.conversations.countPlural") : t("admin.conversations.countSingle")}
            {filtered.length !== conversations.length ? ` (${t("admin.conversations.countOf")} ${conversations.length})` : ""}
          </div>
          {filtered.map(conv => (
            <ConversationCard key={conv.id} conv={conv} onDelete={handleDelete}
              onExpand={id => setExpandedId(expandedId === id ? null : id)}
              isExpanded={expandedId === conv.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ResetDataButton ──────────────────────────────────────────────────────────
function ResetDataButton({ onReset }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  if (typeof window !== "undefined" && !["localhost", "127.0.0.1"].includes(window.location.hostname)) return null;

  async function handleReset() {
    setBusy(true);
    try {
      await fetch("/api/content", { method: "DELETE" });
      setConfirming(false);
      onReset();
    } catch {} finally { setBusy(false); }
  }

  if (confirming) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginRight: 8 }}>
        <span style={{ fontSize: 12, color: "#E53E3E" }}>Supprimer les données ?</span>
        <button onClick={handleReset} disabled={busy} style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: "#E53E3E", color: "#fff", cursor: busy ? "default" : "pointer", fontFamily: FONT }}>{busy ? "..." : "Oui"}</button>
        <button onClick={() => setConfirming(false)} style={{ padding: "6px 10px", borderRadius: 8, fontSize: 12, border: "1px solid rgba(0,0,0,0.1)", background: "transparent", color: "#6B6B6B", cursor: "pointer", fontFamily: FONT }}>Annuler</button>
      </div>
    );
  }

  return (
    <button onClick={() => setConfirming(true)} style={{ padding: "8px 12px", borderRadius: 10, fontSize: 11, fontWeight: 500, border: "1px solid rgba(229,62,62,0.3)", background: "rgba(229,62,62,0.05)", color: "#C53030", cursor: "pointer", fontFamily: FONT, marginRight: 8, opacity: 0.7 }}
      onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
      onMouseLeave={e => (e.currentTarget.style.opacity = "0.7")}
    >🗑 Réinitialiser</button>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function deepMerge(base, override) {
  const result = { ...base };
  for (const key of Object.keys(override || {})) {
    const ov = override[key];
    const bv = base?.[key];
    if (ov !== null && ov !== undefined && typeof ov === "object" && !Array.isArray(ov) && typeof bv === "object" && bv !== null) {
      result[key] = deepMerge(bv, ov);
    } else if (ov !== null && ov !== undefined) {
      result[key] = ov;
    }
  }
  return result;
}

function Dashboard({ hostId, initialTab, onLogout, onRestartWizard, initialPropertyData }) {
  const [activeTab,      setActiveTab]      = useState(initialTab || "conversations");
  const [propertyData,   setPropertyData]   = useState(initialPropertyData ?? null);
  const [contentKey,     setContentKey]     = useState(0);
  const [contentLoading, setContentLoading] = useState(false);
  const [fetchError,     setFetchError]     = useState(false);
  const contentFetchRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (activeTab !== "content") {
      contentFetchRef.current = false;
      return;
    }
    if (propertyData !== null || contentFetchRef.current) return;
    contentFetchRef.current = true;
    setContentLoading(true);
    setFetchError(false);
    fetch("/api/content", { credentials: "include" })
      .then(r => {
        if (!r.ok) {
          console.error("[content] fetch status:", r.status);
          throw new Error("http_" + r.status);
        }
        return r.json();
      })
      .then(d => { setPropertyData(d.propertyData || {}); setContentLoading(false); })
      .catch(() => { setFetchError(true); setContentLoading(false); });
  }, [activeTab, propertyData]);

  async function handleContentSave(updatedData) {
    await fetch("/api/content", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyData: updatedData }),
    });
    setPropertyData(updatedData);
  }

  async function handleImport(importedData) {
    const merged = deepMerge(propertyData || {}, importedData);
    await fetch("/api/content", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyData: merged }),
    });
    setPropertyData(merged);
    setContentKey(k => k + 1);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF8", fontFamily: FONT }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(0,0,0,0.06)", background: "#fff", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: G, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#fff", fontWeight: 700 }}>L</div>
        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#1A1A1A" }}>LOFT AI</span>
          <span style={{ fontSize: 13, color: "#6B6B6B", marginLeft: 8 }}>{t("admin.headerLabel")}</span>
        </div>

        {hostId === "cannes-loft" && (
          <button
            onClick={() => router.push("/admin/superadmin")}
            style={{ padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 500, border: "1px solid rgba(0,0,0,0.1)", background: "transparent", color: "#6B6B6B", cursor: "pointer", fontFamily: FONT, marginRight: 4 }}
          >⚙️ Super-admin</button>
        )}

        {hostId === "cannes-loft" && (
          <button onClick={onRestartWizard} style={{ padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 500, border: `1px solid rgba(42,107,90,0.3)`, background: "rgba(42,107,90,0.05)", color: G, cursor: "pointer", fontFamily: FONT, marginRight: 8 }}>
            🧭 Assistant de configuration
          </button>
        )}
        <ResetDataButton onReset={onRestartWizard} />
        <button onClick={onLogout} style={{ padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 500, border: "1px solid rgba(0,0,0,0.1)", background: "transparent", color: "#6B6B6B", cursor: "pointer", fontFamily: FONT }}>
          {t("admin.logout")}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, padding: "0 24px", background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        {[
          { id: "conversations", label: t("admin.tabs.conversations"), icon: "💬" },
          { id: "content",       label: t("admin.tabs.content"),       icon: "📝" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: "14px 20px", fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400, color: activeTab === tab.id ? G : "#6B6B6B", background: "transparent", border: "none", cursor: "pointer", borderBottom: activeTab === tab.id ? `2px solid ${G}` : "2px solid transparent", fontFamily: FONT, transition: "all .15s" }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 20px" }}>
        {activeTab === "conversations" && <ConversationsTab />}
        {activeTab === "content" && (
          contentLoading ? (
            <div style={{ textAlign: "center", padding: 60, color: "#6B6B6B", fontSize: 13 }}>Chargement du contenu...</div>
          ) : fetchError ? (
            <div style={{ textAlign: "center", padding: 60, color: "#E53E3E", fontSize: 13 }}>Impossible de charger le contenu. Vérifiez votre session.</div>
          ) : (
            <ContentTab key={contentKey} propertyData={propertyData || {}} onSave={handleContentSave} onImport={handleImport} />
          )
        )}
      </div>
    </div>
  );
}

// ─── AdminPage ────────────────────────────────────────────────────────────────
// uiState: 'loading' | 'login' | 'choice' | 'wizard' | 'dashboard'
export default function AdminPage() {
  const [uiState,       setUiState]       = useState("loading");
  const [hostId,        setHostId]        = useState(null);
  const [initialTab,    setInitialTab]    = useState("conversations");
  const [propertyData,  setPropertyData]  = useState(null);

  // Check existing session on mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        if (data.hostId) {
          setHostId(data.hostId);
          checkOnboarding();
        } else {
          setUiState("login");
        }
      })
      .catch(() => setUiState("login"));
  }, []);

  async function checkOnboarding() {
    try {
      const res  = await fetch("/api/content", { credentials: "include" });
      if (!res.ok) { setUiState("wizard"); return; }
      const data = await res.json();
      if (data.propertyData) {
        setPropertyData(data.propertyData);
        setUiState("dashboard");
      } else {
        setUiState("wizard");
      }
    } catch {
      setUiState("wizard");
    }
  }

  async function handleLogin(id) {
    setHostId(id);
    if (id === "cannes-loft") {
      setUiState("choice");
    } else {
      await checkOnboarding();
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setHostId(null);
    setUiState("login");
  }

  function handleWizardFinish(savedData) {
    if (savedData) setPropertyData(savedData);
    setInitialTab("content");
    setUiState("dashboard");
  }

  async function handleWizardImport(data) {
    const merged = deepMerge(propertyData || {}, data);
    await fetch("/api/content", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyData: merged }),
    });
    setPropertyData(merged);
  }

  if (uiState === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAF8", fontFamily: FONT }}>
        <div style={{ fontSize: 13, color: "#6B6B6B" }}>Chargement...</div>
      </div>
    );
  }

  if (uiState === "login")  return <LoginScreen onLogin={handleLogin} />;

  if (uiState === "choice") return (
    <ChoiceScreen
      onDashboard={async () => { await checkOnboarding(); }}
      onSuperAdmin={() => { window.location.href = "/admin/superadmin"; }}
      onLogout={handleLogout}
    />
  );

  if (uiState === "wizard") return (
    <WizardContainer
      password="session"
      onFinish={handleWizardFinish}
      onImportData={handleWizardImport}
    />
  );

  return (
    <Dashboard
      hostId={hostId}
      initialTab={initialTab}
      initialPropertyData={propertyData}
      onLogout={handleLogout}
      onRestartWizard={() => { setPropertyData(null); setUiState("wizard"); }}
    />
  );
}
