"use client";
import { useState, useEffect, useCallback } from "react";
import { t } from "@/app/lib/i18n";
import ContentTab from "@/app/admin/components/ContentTab";
import WizardContainer from "@/app/admin/components/wizard/WizardContainer";

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
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1A1A1A", margin: "0 0 4px" }}>{t("admin.title")}</h1>
          <p style={{ fontSize: 13, color: "#6B6B6B", margin: 0 }}>{t("admin.subtitle")}</p>
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSubmit(e); }}
            placeholder={t("admin.login.passwordPlaceholder")}
            autoFocus
            style={{
              width: "100%", padding: "14px 16px", borderRadius: 12, fontSize: 14,
              border: error ? "2px solid #E53E3E" : "1px solid rgba(0,0,0,0.1)",
              background: "#FAFAF8", fontFamily: "inherit", outline: "none",
              boxSizing: "border-box", transition: "border .2s"
            }}
          />
          {error && <p style={{ color: "#E53E3E", fontSize: 12, marginTop: 6 }}>{t("admin.login.error")}</p>}
          <button onClick={handleSubmit} style={{
            width: "100%", padding: "14px", borderRadius: 12, border: "none",
            background: "#2A6B5A", color: "#fff", fontSize: 14, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit", marginTop: 12,
            boxShadow: "0 3px 12px rgba(42,107,90,0.3)", transition: "opacity .15s"
          }}>
            {t("admin.login.submit")}
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
        <div style={{ fontSize: 12, color: "#6B6B6B", marginTop: 2 }}>{t("admin.stats.conversations")}</div>
      </div>
      <div style={{ padding: "16px", borderRadius: 14, background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#2A6B5A" }}>{totalMessages}</div>
        <div style={{ fontSize: 12, color: "#6B6B6B", marginTop: 2 }}>{t("admin.stats.messages")}</div>
      </div>
      <div style={{ padding: "16px", borderRadius: 14, background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#2A6B5A" }}>
          {topLangs.map(([l]) => LANG_FLAGS[l] || "\u{1F30D}").join(" ")}
        </div>
        <div style={{ fontSize: 12, color: "#6B6B6B", marginTop: 2 }}>{t("admin.stats.topLanguages")}</div>
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
              }}>{t("admin.conversations.delete")}</button>
            ) : (
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#E53E3E" }}>{t("admin.conversations.confirmQuestion")}</span>
                <button onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }} style={{
                  padding: "7px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                  border: "none", background: "#E53E3E", color: "#fff",
                  cursor: "pointer", fontFamily: "inherit"
                }}>{t("admin.conversations.confirmYes")}</button>
                <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); }} style={{
                  padding: "7px 14px", borderRadius: 10, fontSize: 12,
                  border: "1px solid rgba(0,0,0,0.1)", background: "transparent", color: "#6B6B6B",
                  cursor: "pointer", fontFamily: "inherit"
                }}>{t("admin.conversations.cancel")}</button>
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
          placeholder={t("admin.conversations.searchPlaceholder")}
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
          <option value="all">{t("admin.conversations.allLanguages")}</option>
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
        <div style={{ textAlign: "center", padding: 40, color: "#6B6B6B" }}>{t("admin.conversations.loading")}</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#6B6B6B" }}>
          {conversations.length === 0 ? t("admin.conversations.empty") : t("admin.conversations.noMatch")}
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 12, color: "#6B6B6B", marginBottom: 10 }}>
            {filtered.length} {filtered.length > 1 ? t("admin.conversations.countPlural") : t("admin.conversations.countSingle")}{filtered.length !== conversations.length ? ` (${t("admin.conversations.countOf")} ${conversations.length})` : ""}
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



function ResetDataButton({ password, onReset }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  // Only visible on localhost
  if (typeof window !== "undefined" && !["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    return null;
  }

  async function handleReset() {
    setBusy(true);
    try {
      await fetch("/api/content", {
        method: "DELETE",
        headers: { "x-admin-password": password },
      });
      setConfirming(false);
      onReset();
    } catch {
      // silently ignore
    } finally {
      setBusy(false);
    }
  }

  if (confirming) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginRight: 8 }}>
        <span style={{ fontSize: 12, color: "#E53E3E" }}>Supprimer property:default ?</span>
        <button
          onClick={handleReset}
          disabled={busy}
          style={{
            padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
            border: "none", background: "#E53E3E", color: "#fff",
            cursor: busy ? "default" : "pointer", fontFamily: "inherit",
          }}
        >{busy ? "..." : "Oui, réinitialiser"}</button>
        <button
          onClick={() => setConfirming(false)}
          style={{
            padding: "6px 10px", borderRadius: 8, fontSize: 12,
            border: "1px solid rgba(0,0,0,0.1)", background: "transparent",
            color: "#6B6B6B", cursor: "pointer", fontFamily: "inherit",
          }}
        >Annuler</button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      title="Dev only — supprime property:default dans Redis"
      style={{
        padding: "8px 12px", borderRadius: 10, fontSize: 11, fontWeight: 500,
        border: "1px solid rgba(229,62,62,0.3)", background: "rgba(229,62,62,0.05)",
        color: "#C53030", cursor: "pointer", fontFamily: "inherit", marginRight: 8,
        opacity: 0.7,
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = "1"}
      onMouseLeave={e => e.currentTarget.style.opacity = "0.7"}
    >🗑 Réinitialiser</button>
  );
}

function Dashboard({ password, initialTab, onLogout, onRestartWizard }) {
  const [activeTab, setActiveTab] = useState(initialTab || "conversations");
  const [propertyData, setPropertyData]       = useState(null);
  const [contentLoading, setContentLoading]   = useState(false);

  useEffect(() => {
    if (activeTab === "content" && propertyData === null && !contentLoading) {
      setContentLoading(true);
      fetch("/api/content", { headers: { "x-admin-password": password } })
        .then(r => r.json())
        .then(d => { setPropertyData(d.propertyData || {}); setContentLoading(false); })
        .catch(() => { setPropertyData({}); setContentLoading(false); });
    }
  }, [activeTab]);

  async function handleContentSave(updatedData) {
    await fetch("/api/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ propertyData: updatedData }),
    });
    setPropertyData(updatedData);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF8", fontFamily: "'DM Sans', sans-serif" }}>
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
          <span style={{ fontSize: 13, color: "#6B6B6B", marginLeft: 8 }}>{t("admin.headerLabel")}</span>
        </div>
        <button
          onClick={onRestartWizard}
          style={{
            padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 500,
            border: "1px solid rgba(42,107,90,0.3)", background: "rgba(42,107,90,0.05)",
            color: "#2A6B5A", cursor: "pointer", fontFamily: "inherit", marginRight: 8,
          }}
        >🧭 Assistant de configuration</button>
        <ResetDataButton password={password} onReset={onRestartWizard} />
        <button onClick={onLogout} style={{
          padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 500,
          border: "1px solid rgba(0,0,0,0.1)", background: "transparent",
          color: "#6B6B6B", cursor: "pointer", fontFamily: "inherit"
        }}>{t("admin.logout")}</button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, padding: "0 24px", background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        {[
          { id: "conversations", label: t("admin.tabs.conversations"), icon: "\u{1F4AC}" },
          { id: "content", label: t("admin.tabs.content"), icon: "\u{1F4DD}" },
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
          contentLoading || propertyData === null ? (
            <div style={{ textAlign: "center", padding: 60, color: "#6B6B6B", fontSize: 13 }}>
              Chargement du contenu...
            </div>
          ) : (
            <ContentTab propertyData={propertyData} onSave={handleContentSave} />
          )
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [password, setPassword] = useState(null);
  // null = checking, true = show wizard, false = show dashboard
  const [needsOnboarding, setNeedsOnboarding] = useState(null);
  const [initialTab, setInitialTab] = useState("conversations");

  // After login, check whether property:default exists in Redis
  const checkOnboarding = useCallback(async (pwd) => {
    try {
      const res = await fetch("/api/content", { headers: { "x-admin-password": pwd } });
      if (!res.ok) { setNeedsOnboarding(true); return; }
      const data = await res.json();
      setNeedsOnboarding(!data.propertyData);
    } catch {
      setNeedsOnboarding(true); // réseau ou Redis non configuré → afficher le wizard
    }
  }, []);

  function handleLogin(pwd) {
    setPassword(pwd);
    checkOnboarding(pwd);
  }

  // Called when the wizard finishes (activate or skip)
  function handleWizardFinish(savedData, goToSection) {
    setNeedsOnboarding(false);
    if (goToSection) setInitialTab("content");
  }

  if (!password) return <LoginScreen onLogin={handleLogin} />;

  // Checking Redis…
  if (needsOnboarding === null) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#FAFAF8", fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{ fontSize: 13, color: "#6B6B6B" }}>Chargement...</div>
      </div>
    );
  }

  // Show wizard for first-time setup
  if (needsOnboarding) {
    return (
      <WizardContainer
        password={password}
        onFinish={handleWizardFinish}
      />
    );
  }

  // Normal dashboard
  return (
    <Dashboard
      password={password}
      initialTab={initialTab}
      onLogout={() => { setPassword(null); setNeedsOnboarding(null); }}
      onRestartWizard={() => setNeedsOnboarding(true)}
    />
  );
}
