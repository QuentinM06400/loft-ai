"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const G    = "#2A6B5A";
const RED  = "#E53E3E";
const FONT = "'DM Sans', sans-serif";

const inp = {
  width: "100%", padding: "11px 14px", borderRadius: 10, fontSize: 13,
  border: "1px solid rgba(0,0,0,0.12)", background: "#FAFAF8",
  fontFamily: FONT, outline: "none", boxSizing: "border-box", color: "#1A1A1A",
  transition: "border .15s", marginBottom: 12,
};

function ModalOverlay({ children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, boxSizing: "border-box" }}
    >
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)", padding: "32px 28px", boxSizing: "border-box" }}>
        {children}
      </div>
    </div>
  );
}

// ─── Modal création ───────────────────────────────────────────────────────────
function CreateHostModal({ onClose, onCreated }) {
  const [form, setForm]   = useState({ hostId: "", name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy]   = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!/^[a-z0-9-]+$/.test(form.hostId)) { setError("L'identifiant ne peut contenir que des lettres minuscules, chiffres et tirets."); return; }
    if (!form.name || !form.email || !form.password) { setError("Tous les champs sont obligatoires."); return; }
    if (form.password !== form.confirm) { setError("Les mots de passe ne correspondent pas."); return; }

    setBusy(true); setError("");
    try {
      const res  = await fetch("/api/hosts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hostId: form.hostId, name: form.name, email: form.email, password: form.password }) });
      const data = await res.json();
      if (res.ok) { onCreated(); onClose(); }
      else setError(data.error || "Erreur lors de la création.");
    } catch { setError("Erreur réseau."); }
    finally { setBusy(false); }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1A1A1A", margin: "0 0 20px" }}>Nouveau compte hôte</h2>
      <form onSubmit={handleSubmit}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#1A1A1A", display: "block", marginBottom: 4 }}>Identifiant *</label>
        <input value={form.hostId} onChange={e => set("hostId", e.target.value.toLowerCase())} placeholder="ex: villa-antibes" style={inp} onFocus={e => (e.target.style.borderColor = G)} onBlur={e => (e.target.style.borderColor = "rgba(0,0,0,0.12)")} />

        <label style={{ fontSize: 12, fontWeight: 600, color: "#1A1A1A", display: "block", marginBottom: 4 }}>Nom *</label>
        <input value={form.name}   onChange={e => set("name",   e.target.value)} placeholder="ex: Villa Antibes — Marie" style={inp} onFocus={e => (e.target.style.borderColor = G)} onBlur={e => (e.target.style.borderColor = "rgba(0,0,0,0.12)")} />

        <label style={{ fontSize: 12, fontWeight: 600, color: "#1A1A1A", display: "block", marginBottom: 4 }}>Email *</label>
        <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="marie@exemple.com" style={inp} onFocus={e => (e.target.style.borderColor = G)} onBlur={e => (e.target.style.borderColor = "rgba(0,0,0,0.12)")} />

        <label style={{ fontSize: 12, fontWeight: 600, color: "#1A1A1A", display: "block", marginBottom: 4 }}>Mot de passe *</label>
        <input type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="Minimum 8 caractères" style={inp} onFocus={e => (e.target.style.borderColor = G)} onBlur={e => (e.target.style.borderColor = "rgba(0,0,0,0.12)")} />

        <label style={{ fontSize: 12, fontWeight: 600, color: "#1A1A1A", display: "block", marginBottom: 4 }}>Confirmation *</label>
        <input type="password" value={form.confirm} onChange={e => set("confirm", e.target.value)} placeholder="Répéter le mot de passe" style={{ ...inp, marginBottom: error ? 6 : 20 }} onFocus={e => (e.target.style.borderColor = G)} onBlur={e => (e.target.style.borderColor = "rgba(0,0,0,0.12)")} />

        {error && <p style={{ color: RED, fontSize: 12, margin: "0 0 14px" }}>{error}</p>}
        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" disabled={busy} style={{ flex: 1, padding: "12px 20px", borderRadius: 12, border: "none", background: busy ? "rgba(0,0,0,0.08)" : G, color: busy ? "#999" : "#fff", fontSize: 14, fontWeight: 600, cursor: busy ? "default" : "pointer", fontFamily: FONT }}>
            {busy ? "Création..." : "Créer le compte"}
          </button>
          <button type="button" onClick={onClose} style={{ padding: "12px 20px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.12)", background: "#fff", color: "#6B6B6B", fontSize: 14, cursor: "pointer", fontFamily: FONT }}>Annuler</button>
        </div>
      </form>
    </ModalOverlay>
  );
}

// ─── Modal édition ────────────────────────────────────────────────────────────
function EditHostModal({ host, onClose, onUpdated }) {
  const [form, setForm]   = useState({ name: host.name || "", email: host.email || "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy]   = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password && form.password !== form.confirm) { setError("Les mots de passe ne correspondent pas."); return; }

    setBusy(true); setError("");
    const body = { hostId: host.hostId, name: form.name, email: form.email };
    if (form.password) body.password = form.password;

    try {
      const res  = await fetch("/api/hosts", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (res.ok) { onUpdated(); onClose(); }
      else setError(data.error || "Erreur lors de la modification.");
    } catch { setError("Erreur réseau."); }
    finally { setBusy(false); }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1A1A1A", margin: "0 0 6px" }}>Modifier le compte</h2>
      <p style={{ fontSize: 13, color: "#6B6B6B", margin: "0 0 20px" }}>hostId : <strong>{host.hostId}</strong></p>
      <form onSubmit={handleSubmit}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#1A1A1A", display: "block", marginBottom: 4 }}>Nom</label>
        <input value={form.name}  onChange={e => set("name",  e.target.value)} style={inp} onFocus={e => (e.target.style.borderColor = G)} onBlur={e => (e.target.style.borderColor = "rgba(0,0,0,0.12)")} />

        <label style={{ fontSize: 12, fontWeight: 600, color: "#1A1A1A", display: "block", marginBottom: 4 }}>Email</label>
        <input type="email" value={form.email} onChange={e => set("email", e.target.value)} style={inp} onFocus={e => (e.target.style.borderColor = G)} onBlur={e => (e.target.style.borderColor = "rgba(0,0,0,0.12)")} />

        <label style={{ fontSize: 12, fontWeight: 600, color: "#1A1A1A", display: "block", marginBottom: 4 }}>Nouveau mot de passe <span style={{ color: "#9A9A9A", fontWeight: 400 }}>(laisser vide pour ne pas changer)</span></label>
        <input type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="Nouveau mot de passe" style={inp} onFocus={e => (e.target.style.borderColor = G)} onBlur={e => (e.target.style.borderColor = "rgba(0,0,0,0.12)")} />
        {form.password && (
          <>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#1A1A1A", display: "block", marginBottom: 4 }}>Confirmer</label>
            <input type="password" value={form.confirm} onChange={e => set("confirm", e.target.value)} style={{ ...inp, marginBottom: error ? 6 : 20 }} onFocus={e => (e.target.style.borderColor = G)} onBlur={e => (e.target.style.borderColor = "rgba(0,0,0,0.12)")} />
          </>
        )}

        {error && <p style={{ color: RED, fontSize: 12, margin: "0 0 14px" }}>{error}</p>}
        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" disabled={busy} style={{ flex: 1, padding: "12px 20px", borderRadius: 12, border: "none", background: busy ? "rgba(0,0,0,0.08)" : G, color: busy ? "#999" : "#fff", fontSize: 14, fontWeight: 600, cursor: busy ? "default" : "pointer", fontFamily: FONT }}>
            {busy ? "Enregistrement..." : "Enregistrer"}
          </button>
          <button type="button" onClick={onClose} style={{ padding: "12px 20px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.12)", background: "#fff", color: "#6B6B6B", fontSize: 14, cursor: "pointer", fontFamily: FONT }}>Annuler</button>
        </div>
      </form>
    </ModalOverlay>
  );
}

// ─── SuperAdmin page ──────────────────────────────────────────────────────────
export default function SuperAdminPage() {
  const router = useRouter();
  const [loading,     setLoading]     = useState(true);
  const [hosts,       setHosts]       = useState([]);
  const [showCreate,  setShowCreate]  = useState(false);
  const [editHost,    setEditHost]    = useState(null);
  const [deleteHostId, setDeleteHostId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        if (data.hostId !== "cannes-loft") { router.replace("/admin"); return; }
        fetchHosts();
      })
      .catch(() => router.replace("/admin"));
  }, []);

  async function fetchHosts() {
    setLoading(true);
    try {
      const res  = await fetch("/api/hosts");
      const data = await res.json();
      setHosts(data.hosts || []);
    } catch {}
    finally { setLoading(false); }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin");
  }

  async function handleDelete(hostId) {
    setBusy(true);
    try {
      await fetch(`/api/hosts?hostId=${hostId}`, { method: "DELETE" });
      setDeleteHostId(null);
      setDeleteConfirm("");
      fetchHosts();
    } catch {}
    finally { setBusy(false); }
  }

  const cell = { padding: "14px 16px", fontSize: 13, color: "#1A1A1A", borderBottom: "1px solid rgba(0,0,0,0.04)" };
  const th   = { padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "#6B6B6B", textTransform: "uppercase", letterSpacing: ".5px", textAlign: "left", background: "#F7F7F5", borderBottom: "1px solid rgba(0,0,0,0.06)" };

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF8", fontFamily: FONT }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(0,0,0,0.06)", background: "#fff", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: G, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#fff", fontWeight: 700 }}>L</div>
        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#1A1A1A" }}>LOFT AI</span>
          <span style={{ fontSize: 13, color: "#6B6B6B", marginLeft: 8 }}>Super Admin</span>
        </div>
        <button onClick={() => router.push("/admin")} style={{ padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 500, border: `1px solid rgba(42,107,90,0.3)`, background: "rgba(42,107,90,0.05)", color: G, cursor: "pointer", fontFamily: FONT, marginRight: 8 }}>
          ← Mon dashboard
        </button>
        <button onClick={handleLogout} style={{ padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 500, border: "1px solid rgba(0,0,0,0.1)", background: "transparent", color: "#6B6B6B", cursor: "pointer", fontFamily: FONT }}>
          Déconnexion
        </button>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1A1A1A", margin: "0 0 4px" }}>Comptes hôtes</h1>
            <p style={{ fontSize: 13, color: "#6B6B6B", margin: 0 }}>{hosts.length} compte{hosts.length > 1 ? "s" : ""} enregistré{hosts.length > 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{ padding: "12px 20px", borderRadius: 12, border: "none", background: G, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT, boxShadow: "0 3px 12px rgba(42,107,90,0.25)" }}
          >+ Nouveau compte hôte</button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#6B6B6B", fontSize: 13 }}>Chargement...</div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Identifiant", "Nom", "Email", "Créé le", "Actions"].map(h => (
                    <th key={h} style={{ ...th, textAlign: h === "Actions" ? "right" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hosts.length === 0 ? (
                  <tr><td colSpan={5} style={{ ...cell, textAlign: "center", color: "#6B6B6B" }}>Aucun compte hôte</td></tr>
                ) : hosts.map((host, i) => (
                  <tr key={host.hostId} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAF8" }}>
                    <td style={cell}>
                      <code style={{ fontSize: 12, background: "rgba(0,0,0,0.04)", padding: "3px 8px", borderRadius: 6, color: G }}>{host.hostId}</code>
                      {host.role === "superadmin" && <span style={{ marginLeft: 6, fontSize: 10, background: "rgba(42,107,90,0.1)", color: G, padding: "2px 7px", borderRadius: 8, fontWeight: 600 }}>ADMIN</span>}
                    </td>
                    <td style={cell}>{host.name}</td>
                    <td style={{ ...cell, color: "#6B6B6B" }}>{host.email}</td>
                    <td style={{ ...cell, color: "#6B6B6B", fontSize: 12 }}>
                      {host.createdAt ? new Date(host.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td style={{ ...cell, textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button
                          onClick={() => window.open(`/h/${host.hostId}`, "_blank")}
                          title="Voir le chat guest"
                          style={{ padding: "6px 10px", borderRadius: 8, fontSize: 13, border: "1px solid rgba(0,0,0,0.1)", background: "transparent", cursor: "pointer", fontFamily: FONT }}
                        >👁</button>
                        <button
                          onClick={() => setEditHost(host)}
                          title="Modifier"
                          style={{ padding: "6px 10px", borderRadius: 8, fontSize: 13, border: "1px solid rgba(0,0,0,0.1)", background: "transparent", cursor: "pointer", fontFamily: FONT }}
                        >✏️</button>
                        {host.hostId !== "cannes-loft" && (
                          <button
                            onClick={() => { setDeleteHostId(host.hostId); setDeleteConfirm(""); }}
                            title="Supprimer"
                            style={{ padding: "6px 10px", borderRadius: 8, fontSize: 13, border: `1px solid rgba(229,62,62,0.3)`, background: "rgba(229,62,62,0.04)", color: RED, cursor: "pointer", fontFamily: FONT }}
                          >🗑</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteHostId && (
        <ModalOverlay onClose={() => setDeleteHostId(null)}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1A1A1A", margin: "0 0 12px" }}>Supprimer ce compte ?</h2>
          <p style={{ fontSize: 13, color: "#6B6B6B", margin: "0 0 8px", lineHeight: 1.6 }}>
            Le compte <strong>{deleteHostId}</strong> et toutes ses données (contenu, propriétés) seront supprimés définitivement.
          </p>
          <p style={{ fontSize: 13, color: "#6B6B6B", margin: "0 0 20px" }}>Tapez <strong>{deleteHostId}</strong> pour confirmer :</p>
          <input
            value={deleteConfirm}
            onChange={e => setDeleteConfirm(e.target.value)}
            placeholder={deleteHostId}
            style={{ ...inp, marginBottom: 20, borderColor: deleteConfirm === deleteHostId ? RED : "rgba(0,0,0,0.12)" }}
          />
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => handleDelete(deleteHostId)}
              disabled={deleteConfirm !== deleteHostId || busy}
              style={{ flex: 1, padding: "12px 20px", borderRadius: 12, border: "none", background: (deleteConfirm !== deleteHostId || busy) ? "rgba(0,0,0,0.08)" : RED, color: (deleteConfirm !== deleteHostId || busy) ? "#999" : "#fff", fontSize: 14, fontWeight: 600, cursor: (deleteConfirm !== deleteHostId || busy) ? "default" : "pointer", fontFamily: FONT }}
            >{busy ? "Suppression..." : "Supprimer définitivement"}</button>
            <button onClick={() => setDeleteHostId(null)} style={{ padding: "12px 20px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.12)", background: "#fff", color: "#6B6B6B", fontSize: 14, cursor: "pointer", fontFamily: FONT }}>Annuler</button>
          </div>
        </ModalOverlay>
      )}

      {showCreate && <CreateHostModal onClose={() => setShowCreate(false)} onCreated={fetchHosts} />}
      {editHost   && <EditHostModal   host={editHost} onClose={() => setEditHost(null)} onUpdated={fetchHosts} />}
    </div>
  );
}
