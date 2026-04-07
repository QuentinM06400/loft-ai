"use client";
import { useState, useEffect } from "react";

const LANG_FLAGS = {
  fr: "\u{1F1EB}\u{1F1F7}", en: "\u{1F1EC}\u{1F1E7}", es: "\u{1F1EA}\u{1F1F8}",
  de: "\u{1F1E9}\u{1F1EA}", it: "\u{1F1EE}\u{1F1F9}", pt: "\u{1F1F5}\u{1F1F9}",
  nl: "\u{1F1F3}\u{1F1F1}", ru: "\u{1F1F7}\u{1F1FA}", zh: "\u{1F1E8}\u{1F1F3}",
  ja: "\u{1F1EF}\u{1F1F5}", ar: "\u{1F1F8}\u{1F1E6}", ko: "\u{1F1F0}\u{1F1F7}",
  other: "\u{1F30D}", unknown: "\u2753"
};

function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (password === "LoftAI#Cannes2025!") {
      onLogin(password);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#FAFAF8", fontFamily: "'DM Sans', sans-serif"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{
        width: "100%", maxWidth: 380, padding: 32, borderRadius: 20,
        background: "#fff", boxShadow: "0 4px 24px rgba(0,0,0,0.08)"
      }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: "#2A6B5A",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, color: "#fff", fontWeight: 800, marginBottom: 12,
            boxShadow: "0 4px 16px rgba(42,107,90,0.3)"
          }}>L</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1A1A1A", margin: "0 0 4px" }}>LOFT AI Admin</h1>
          <p style={{ fontSize: 13, color: "#6B6B6B", margin: 0 }}>Espace de gestion</p>
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSubmit(e); }}
            placeholder="Mot de passe"
            autoFocus
            style={{
              width: "100%", padding: "14px 16px", borderRadius: 12, fontSize: 14,
              border: error ? "2px solid #E53E3E" : "1px solid rgba(0,0,0,0.1)",
              background: "#FAFAF8", fontFamily: "inherit", outline: "none",
              boxSizing: "border-box", transition: "border .2s"
            }}
          />
          {error && <p style={{ color: "#E53E3E", fontSize: 12, marginTop: 6 }}>Mot de passe incorrect</p>}
          <button onClick={handleSubmit} style={{
            width: "100%", padding: "14px", borderRadius: 12, border: "none",
            background: "#2A6B5A", color: "#fff", fontSize: 14, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit", marginTop: 12,
            boxShadow: "0 3px 12px rgba(42,107,90,0.3)", transition: "opacity .15s"
          }}>
            Connexion
          </button>
        </div>
      </div>
    </div>
  );
}

function StatsBar({ conversations }) {
  const total = conversations.length;
  const totalMessages = conversations.reduce((sum, c) => sum + (c.messageCount || 0), 0);

  const langCount = {};
  conversations.forEach(c => {
    const l = c.language || "unknown";
    langCount[l] = (langCount[l] || 0) + 1;
  });
  const topLangs = Object.entries(langCount).sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
      <div style={{ padding: "16px", borderRadius: 14, background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#2A6B5A" }}>{total}</div>
        <div style={{ fontSize: 12, color: "#6B6B6B", marginTop: 2 }}>Conversations</div>
      </div>
      <div style={{ padding: "16px", borderRadius: 14, background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#2A6B5A" }}>{totalMessages}</div>
        <div style={{ fontSize: 12, color: "#6B6B6B", marginTop: 2 }}>Messages guests</div>
      </div>
      <div style={{ padding: "16px", borderRadius: 14, background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#2A6B5A" }}>
          {topLangs.map(([l]) => LANG_FLAGS[l] || "\u{1F30D}").join(" ")}
        </div>
        <div style={{ fontSize: 12, color: "#6B6B6B", marginTop: 2 }}>Top langues</div>
      </div>
    </div>
  );
}

function ConversationCard({ conv, onDelete, onExpand, isExpanded }) {
  const date = new Date(conv.startedAt);
  const dateStr = date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const duration = conv.endedAt && conv.startedAt
    ? Math.round((new Date(conv.endedAt) - new Date(conv.startedAt)) / 60000)
    : null;

  const firstUserMsg = conv.messages?.find(m => m.role === "user" && !m.content.startsWith("The guest selected language"));
  const preview = firstUserMsg?.content?.substring(0, 80) || "...";
  const flag = LANG_FLAGS[conv.language] || "\u{1F30D}";

  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div style={{
      borderRadius: 14, background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      overflow: "hidden", marginBottom: 10, transition: "all .2s"
    }}>
      <div
        onClick={() => onExpand(conv.id)}
        style={{
          padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
          transition: "background .15s"
        }}
        onMouseEnter={e => e.currentTarget.style.background = "#F7F7F5"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        <div style={{ fontSize: 22 }}>{flag}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1A1A" }}>{dateStr}</span>
            <span style={{ fontSize: 12, color: "#6B6B6B" }}>{timeStr}</span>
            {duration !== null && <span style={{ fontSize: 11, color: "#2A6B5A", background: "rgba(42,107,90,0.08)", padding: "2px 8px", borderRadius: 10 }}>{duration} min</span>}
            <span style={{ fontSize: 11, color: "#6B6B6B", background: "rgba(0,0,0,0.04)", padding: "2px 8px", borderRadius: 10 }}>{conv.messageCount || 0} msg</span>
          </div>
          <div style={{ fontSize: 13, color: "#6B6B6B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{preview}</div>
        </div>
        <span style={{ fontSize: 16, color: "#6B6B6B", transform: isExpanded ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s" }}>{"\u25BC"}</span>
      </div>

      {isExpanded && (
        <div style={{ padding: "0 16px 14px", borderTop: "1px solid rgba(0,0,0,0.04)" }}>
          <div style={{ maxHeight: 400, overflowY: "auto", padding: "12px 0" }}>
            {conv.messages?.filter(m => !m.content.startsWith("The guest selected language")).map((msg, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                marginBottom: 8
              }}>
                <div style={{
                  maxWidth: "80%", padding: "10px 14px", borderRadius: 14, fontSize: 13, lineHeight: 1.5,
                  background: msg.role === "user" ? "#2A6B5A" : "#F0F0EE",
                  color: msg.role === "user" ? "#fff" : "#1A1A1A"
                }}>
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
              <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }} style={{
                padding: "7px 14px", borderRadius: 10, fontSize: 12, fontWeight: 500,
                border: "1px solid #E53E3E", background: "transparent", color: "#E53E3E",
                cursor: "pointer", fontFamily: "inherit"
              }}>Supprimer</button>
            ) : (
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#E53E3E" }}>Confirmer ?</span>
                <button onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }} style={{
                  padding: "7px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                  border: "none", background: "#E53E3E", color: "#fff",
                  cursor: "pointer", fontFamily: "inherit"
                }}>Oui, supprimer</button>
                <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); }} style={{
                  padding: "7px 14px", borderRadius: 10, fontSize: 12,
                  border: "1px solid rgba(0,0,0,0.1)", background: "transparent", color: "#6B6B6B",
                  cursor: "pointer", fontFamily: "inherit"
                }}>Annuler</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ConversationsTab({ password }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  async function fetchConversations() {
    setLoading(true);
    try {
      const res = await fetch("/api/conversations", {
        headers: { "x-admin-password": password }
      });
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
      await fetch(`/api/conversations?id=${id}`, {
        method: "DELETE",
        headers: { "x-admin-password": password }
      });
      setConversations(prev => prev.filter(c => c.id !== id));
      setExpandedId(null);
    } catch {
      console.error("Erreur suppression");
    }
  }

  // Filtres
  const allLangs = [...new Set(conversations.map(c => c.language || "unknown"))];

  const filtered = conversations.filter(c => {
    if (langFilter !== "all" && c.language !== langFilter) return false;
    if (dateFrom && new Date(c.startedAt) < new Date(dateFrom)) return false;
    if (dateTo) {
      const to = new Date(dateTo);
      to.setDate(to.getDate() + 1);
      if (new Date(c.startedAt) > to) return false;
    }
    if (search) {
      const s = search.toLowerCase();
      const hasMatch = c.messages?.some(m => m.content.toLowerCase().includes(s));
      if (!hasMatch) return false;
    }
    return true;
  });

  return (
    <div>
      <StatsBar conversations={conversations} />

      {/* Filtres */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16, padding: "14px 16px",
        borderRadius: 14, background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
      }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher dans les messages..."
          style={{
            flex: "1 1 200px", padding: "10px 14px", borderRadius: 10, fontSize: 13,
            border: "1px solid rgba(0,0,0,0.08)", background: "#FAFAF8",
            fontFamily: "inherit", outline: "none"
          }}
        />
        <select
          value={langFilter}
          onChange={e => setLangFilter(e.target.value)}
          style={{
            padding: "10px 14px", borderRadius: 10, fontSize: 13,
            border: "1px solid rgba(0,0,0,0.08)", background: "#FAFAF8",
            fontFamily: "inherit", outline: "none", cursor: "pointer"
          }}
        >
          <option value="all">Toutes les langues</option>
          {allLangs.map(l => (
            <option key={l} value={l}>{LANG_FLAGS[l] || "\u{1F30D}"} {l}</option>
          ))}
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          style={{
            padding: "10px 14px", borderRadius: 10, fontSize: 13,
            border: "1px solid rgba(0,0,0,0.08)", background: "#FAFAF8",
            fontFamily: "inherit", outline: "none"
          }}
        />
        <input
          type="date"
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          style={{
            padding: "10px 14px", borderRadius: 10, fontSize: 13,
            border: "1px solid rgba(0,0,0,0.08)", background: "#FAFAF8",
            fontFamily: "inherit", outline: "none"
          }}
        />
      </div>

      {/* Liste */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#6B6B6B" }}>Chargement...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#6B6B6B" }}>
          {conversations.length === 0 ? "Aucune conversation enregistr\u00e9e pour le moment" : "Aucune conversation ne correspond aux filtres"}
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 12, color: "#6B6B6B", marginBottom: 10 }}>
            {filtered.length} conversation{filtered.length > 1 ? "s" : ""}{filtered.length !== conversations.length ? ` (sur ${conversations.length})` : ""}
          </div>
          {filtered.map(conv => (
            <ConversationCard
              key={conv.id}
              conv={conv}
              onDelete={handleDelete}
              onExpand={(id) => setExpandedId(expandedId === id ? null : id)}
              isExpanded={expandedId === conv.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [password, setPassword] = useState(null);
  const [activeTab, setActiveTab] = useState("conversations");

  if (!password) return <LoginScreen onLogin={setPassword} />;

  return (
    <div style={{
      minHeight: "100vh", background: "#FAFAF8",
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        padding: "16px 24px", borderBottom: "1px solid rgba(0,0,0,0.06)",
        background: "#fff", display: "flex", alignItems: "center", gap: 12
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: "#2A6B5A",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, color: "#fff", fontWeight: 700
        }}>L</div>
        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#1A1A1A" }}>LOFT AI</span>
          <span style={{ fontSize: 13, color: "#6B6B6B", marginLeft: 8 }}>Admin</span>
        </div>
        <button onClick={() => setPassword(null)} style={{
          padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 500,
          border: "1px solid rgba(0,0,0,0.1)", background: "transparent",
          color: "#6B6B6B", cursor: "pointer", fontFamily: "inherit"
        }}>D\u00e9connexion</button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, padding: "0 24px", background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        {[
          { id: "conversations", label: "Conversations", icon: "\u{1F4AC}" },
          { id: "content", label: "Contenu", icon: "\u{1F4DD}" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: "14px 20px", fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400,
            color: activeTab === tab.id ? "#2A6B5A" : "#6B6B6B",
            background: "transparent", border: "none", cursor: "pointer",
            borderBottom: activeTab === tab.id ? "2px solid #2A6B5A" : "2px solid transparent",
            fontFamily: "inherit", transition: "all .15s"
          }}>{tab.icon} {tab.label}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 20px" }}>
        {activeTab === "conversations" && <ConversationsTab password={password} />}
        {activeTab === "content" && (
          <div style={{
            textAlign: "center", padding: 60, color: "#6B6B6B",
            background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{"\u{1F6A7}"}</div>
            <p style={{ fontSize: 14 }}>L'onglet Contenu sera disponible prochainement.</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>Modification du WiFi, des recommandations, etc.</p>
          </div>
        )}
      </div>
    </div>
  );
}
