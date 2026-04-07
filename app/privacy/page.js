export const metadata = {
  title: "Politique de confidentialité - LOFT AI",
  description: "Politique de confidentialité et protection des données personnelles de LOFT AI",
};

export default function PrivacyPage() {
  return (
    <div style={{
      minHeight: "100vh", background: "#FAFAF8", padding: "40px 20px",
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{
        maxWidth: 680, margin: "0 auto", background: "#fff", borderRadius: 20,
        padding: "40px 32px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, background: "#2A6B5A",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, color: "#fff", fontWeight: 800, marginBottom: 12
          }}>L</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1A1A1A", margin: "0 0 4px" }}>Politique de confidentialit{"é"}</h1>
          <p style={{ fontSize: 13, color: "#6B6B6B", margin: 0 }}>LOFT AI — Concierge virtuel</p>
          <p style={{ fontSize: 12, color: "#6B6B6B", marginTop: 4 }}>Derni{"è"}re mise {"à"} jour : avril 2026</p>
        </div>

        <div style={{ fontSize: 14, lineHeight: 1.8, color: "#333" }}>

          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A1A", marginTop: 28, marginBottom: 8 }}>1. Responsable du traitement</h2>
          <p>Le responsable du traitement des donn{"é"}es personnelles collect{"é"}es via LOFT AI est :</p>
          <p><strong>Quentin Moreaux</strong><br/>
          14 Boulevard de Strasbourg, 06400 Cannes, France<br/>
          Contact : +33 6 21 85 88 04</p>

          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A1A", marginTop: 28, marginBottom: 8 }}>2. Nature du service</h2>
          <p>LOFT AI est un <strong>assistant virtuel propuls{"é"} par intelligence artificielle</strong> (mod{"è"}le Claude, d{"é"}velopp{"é"} par Anthropic). Il est mis {"à"} disposition des voyageurs s{"é"}journant dans l{"'"}appartement pour les assister durant leur s{"é"}jour. <strong>Vous interagissez avec une intelligence artificielle, et non avec un {"ê"}tre humain.</strong></p>

          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A1A", marginTop: 28, marginBottom: 8 }}>3. Donn{"é"}es collect{"é"}es</h2>
          <p>Lorsque vous utilisez LOFT AI, les donn{"é"}es suivantes peuvent {"ê"}tre collect{"é"}es :</p>
          <p>{"•"} Le contenu de vos messages {"é"}chang{"é"}s avec l{"'"}assistant<br/>
          {"•"} La langue s{"é"}lectionn{"é"}e<br/>
          {"•"} La date et l{"'"}heure de la conversation<br/>
          {"•"} Le nombre de messages {"é"}chang{"é"}s<br/>
          {"•"} Le type d{"'"}appareil utilis{"é"} (mobile, desktop)</p>
          <p><strong>Aucune donn{"é"}e d{"'"}identit{"é"} personnelle</strong> (nom, email, num{"é"}ro de t{"é"}l{"é"}phone) n{"'"}est collect{"é"}e automatiquement. Si vous communiquez volontairement de telles informations dans vos messages, elles seront incluses dans l{"'"}historique de conversation.</p>

          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A1A", marginTop: 28, marginBottom: 8 }}>4. Finalit{"é"}s du traitement</h2>
          <p>Les donn{"é"}es sont collect{"é"}es exclusivement pour :</p>
          <p>{"•"} Am{"é"}liorer la qualit{"é"} du service et des r{"é"}ponses de l{"'"}assistant<br/>
          {"•"} Identifier les questions fr{"é"}quentes des voyageurs<br/>
          {"•"} Permettre {"à"} l{"'"}h{"ô"}te de mieux comprendre les besoins de ses guests</p>

          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A1A", marginTop: 28, marginBottom: 8 }}>5. Base l{"é"}gale</h2>
          <p>Le traitement est fond{"é"} sur votre <strong>consentement</strong> (article 6.1.a du RGPD), recueilli avant toute utilisation du service via une fen{"ê"}tre de consentement.</p>

          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A1A", marginTop: 28, marginBottom: 8 }}>6. Dur{"é"}e de conservation</h2>
          <p>Les conversations sont conserv{"é"}es pour une dur{"é"}e maximale de <strong>90 jours</strong>, apr{"è"}s quoi elles sont automatiquement supprim{"é"}es.</p>

          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A1A", marginTop: 28, marginBottom: 8 }}>7. Sous-traitants et h{"é"}bergement</h2>
          <p>{"•"} <strong>Anthropic</strong> (San Francisco, USA) : fournisseur du mod{"è"}le d{"'"}intelligence artificielle Claude. Les messages sont transmis {"à"} l{"'"}API Anthropic pour g{"é"}n{"é"}rer les r{"é"}ponses. Anthropic s{"'"}engage {"à"} ne pas utiliser les donn{"é"}es des API pour entra{"î"}ner ses mod{"è"}les.<br/>
          {"•"} <strong>Vercel</strong> (USA) : h{"é"}bergement du site web<br/>
          {"•"} <strong>Upstash</strong> (serveurs Frankfurt, Allemagne — UE) : stockage des conversations</p>
          <p>Les transferts de donn{"é"}es hors UE sont encadr{"é"}s par les clauses contractuelles types (CCT) de la Commission europ{"é"}enne.</p>

          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A1A", marginTop: 28, marginBottom: 8 }}>8. Vos droits</h2>
          <p>Conform{"é"}ment au RGPD, vous disposez des droits suivants :</p>
          <p>{"•"} <strong>Droit d{"'"}acc{"è"}s</strong> : obtenir une copie de vos donn{"é"}es<br/>
          {"•"} <strong>Droit de rectification</strong> : corriger des donn{"é"}es inexactes<br/>
          {"•"} <strong>Droit {"à"} l{"'"}effacement</strong> : demander la suppression de vos donn{"é"}es<br/>
          {"•"} <strong>Droit d{"'"}opposition</strong> : vous opposer au traitement de vos donn{"é"}es<br/>
          {"•"} <strong>Droit de retrait du consentement</strong> : {"à"} tout moment, sans affecter la l{"é"}galit{"é"} du traitement ant{"é"}rieur</p>
          <p>Pour exercer ces droits, contactez Quentin Moreaux au +33 6 21 85 88 04 ou directement via l{"'"}application.</p>

          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A1A", marginTop: 28, marginBottom: 8 }}>9. Transparence IA (AI Act — R{"è"}glement UE 2024/1689)</h2>
          <p>Conform{"é"}ment {"à"} l{"'"}article 50 du R{"è"}glement europ{"é"}en sur l{"'"}Intelligence Artificielle :</p>
          <p>{"•"} LOFT AI est un <strong>syst{"è"}me d{"'"}intelligence artificielle</strong> de cat{"é"}gorie {"\""}risque limit{"é"}{"\""}<br/>
          {"•"} Les r{"é"}ponses sont <strong>g{"é"}n{"é"}r{"é"}es automatiquement</strong> par un mod{"è"}le de langage (Claude, Anthropic)<br/>
          {"•"} L{"'"}assistant peut commettre des erreurs — les informations critiques doivent {"ê"}tre v{"é"}rifi{"é"}es aupr{"è"}s de l{"'"}h{"ô"}te<br/>
          {"•"} Aucune d{"é"}cision ayant un effet juridique n{"'"}est prise par ce syst{"è"}me</p>

          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A1A", marginTop: 28, marginBottom: 8 }}>10. Cookies</h2>
          <p>LOFT AI n{"'"}utilise <strong>aucun cookie</strong> ni traceur publicitaire. Seul un stockage local (localStorage) est utilis{"é"} pour m{"é"}moriser votre consentement.</p>

          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A1A", marginTop: 28, marginBottom: 8 }}>11. R{"é"}clamation</h2>
          <p>Si vous estimez que vos droits ne sont pas respect{"é"}s, vous pouvez adresser une r{"é"}clamation {"à"} la <strong>CNIL</strong> (Commission Nationale de l{"'"}Informatique et des Libert{"é"}s) : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: "#2A6B5A" }}>www.cnil.fr</a></p>

        </div>

        <div style={{ textAlign: "center", marginTop: 36, paddingTop: 20, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <a href="/" style={{ fontSize: 13, color: "#2A6B5A", textDecoration: "none", fontWeight: 500 }}>{"←"} Retour au concierge LOFT AI</a>
        </div>
      </div>
    </div>
  );
}
