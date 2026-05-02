"use client";
import { useState, useEffect } from "react";
import { WizardStyles, C } from "./WizardUI";
import WizardWelcome      from "./WizardWelcome";
import Step1Logement      from "./steps/Step1Logement";
import Step2Acces         from "./steps/Step2Acces";
import Step3Regles        from "./steps/Step3Regles";
import Step4Equipements   from "./steps/Step4Equipements";
import Step5Quartier      from "./steps/Step5Quartier";
import Step6Contacts      from "./steps/Step6Contacts";
import StepPersonality    from "./steps/StepPersonality";
import Step7Recapitulatif from "./steps/Step7Recapitulatif";

const STORAGE_KEY = "loftai_wizard_v1";

const STEPS = [
  { id: "logement",    label: "Logement",      short: "1" },
  { id: "acces",       label: "Accès",         short: "2" },
  { id: "regles",      label: "Règles",        short: "3" },
  { id: "equipements", label: "Équipements",   short: "4" },
  { id: "quartier",    label: "Quartier",      short: "5" },
  { id: "contacts",    label: "Contacts",      short: "6" },
  { id: "personality", label: "Personnalité",  short: "7" },
  { id: "recap",       label: "Récap",         short: "8" },
];

const STEP_TITLES = [
  { title: "Votre logement",     sub: "Les informations de base sur votre appartement" },
  { title: "Arrivée & départ",   sub: "Comment vos voyageurs accèdent à votre logement" },
  { title: "Les règles",         sub: "Aidez vos voyageurs à respecter vos règles" },
  { title: "Les équipements",    sub: "Quels appareils sont disponibles ?" },
  { title: "Votre quartier",     sub: "Ce qu'il y a à faire et à voir autour de chez vous" },
  { title: "Contacts & WiFi",    sub: "Qui contacter en cas de besoin ?" },
  { title: "Personnalité",       sub: "Personnalisez le ton de votre concierge" },
  { title: "Récapitulatif",      sub: "Vérifiez et activez votre concierge" },
];

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ step }) {
  return (
    <div style={{
      background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.06)",
      padding: "10px 20px 12px",
    }}>
      <div style={{ maxWidth: 620, margin: "0 auto" }}>
        <div style={{ fontSize: 13, color: "#6B6B6B", fontWeight: 500, marginBottom: 8 }}>
          Étape {step + 1}/8 — <span style={{ color: "#1A1A1A", fontWeight: 600 }}>{STEP_TITLES[step]?.title}</span>
        </div>
        <div style={{ height: 4, borderRadius: 4, background: "rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 4, background: C.green,
            width: `${(step / 7) * 100}%`,
            transition: "width .4s ease",
          }} />
        </div>
      </div>
    </div>
  );
}

// ── WizardContainer ────────────────────────────────────────────────────────────
export default function WizardContainer({ password, onFinish }) {
  const [showWelcome, setShowWelcome] = useState(true);
  const [step, setStep] = useState(0);
  const [wizardData, setWizardData] = useState({});
  const [saving, setSaving] = useState(false);

  // Restore from sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { step: s, data, welcome } = JSON.parse(stored);
        if (typeof s === "number") setStep(s);
        if (data) setWizardData(data);
        if (welcome === false) setShowWelcome(false);
      }
    } catch {}
  }, []);

  // Save to sessionStorage on every change
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        step, data: wizardData, welcome: showWelcome,
      }));
    } catch {}
  }, [step, wizardData, showWelcome]);

  const goNext = () => {
    setStep(s => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setStep(s => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const setSection = (key, val) => setWizardData(prev => ({ ...prev, [key]: val }));
  const mergeData = (newData) => setWizardData(prev => ({ ...prev, ...newData }));

  // Step data
  const step1Data = { ...(wizardData.info || {}) };
  const step2Data = { ...(wizardData.checkin || {}) };
  const step3Data = { ...(wizardData.rules || {}) };
  const step4Data = { ...(wizardData.appliances || {}) };
  const step5Data = {
    location: wizardData.location || {},
    recommendations: wizardData.recommendations || {},
    activities: wizardData.activities || {},
    transport: wizardData.transport || {},
  };
  const step6Data = {
    contacts: wizardData.info?.contacts || [{}],
    wifiName: wizardData.info?.wifiName || "",
    wifiPassword: wizardData.info?.wifiPassword || "",
  };
  const step7Data = { ...(wizardData.personality || {}) };

  const handleStep5Change = (data) => {
    mergeData({
      location: data.location,
      recommendations: data.recommendations,
      activities: data.activities,
      transport: data.transport,
    });
  };

  const handleStep6Change = (data) => {
    setSection("info", {
      ...(wizardData.info || {}),
      contacts: data.contacts,
      wifiName: data.wifiName,
      wifiPassword: data.wifiPassword,
    });
  };

  // Save to Redis and finish
  async function handleActivate() {
    setSaving(true);
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ propertyData: wizardData }),
      });
      if (res.ok) {
        sessionStorage.removeItem(STORAGE_KEY);
        onFinish(wizardData);
      }
    } catch (err) {
      console.error("Wizard save failed:", err);
    } finally {
      setSaving(false);
    }
  }

  function handleCompleteSection(sectionId) {
    sessionStorage.removeItem(STORAGE_KEY);
    onFinish(wizardData, sectionId);
  }

  function handleImportData(data) {
    setWizardData(prev => ({
      ...prev,
      ...(data.info     ? { info:     { ...(prev.info     || {}), ...data.info     } } : {}),
      ...(data.checkin  ? { checkin:  { ...(prev.checkin  || {}), ...data.checkin  } } : {}),
      ...(data.rules    ? { rules:    { ...(prev.rules    || {}), ...data.rules    } } : {}),
      ...(data.appliances ? { appliances: { ...(prev.appliances || {}), ...data.appliances } } : {}),
    }));
    setShowWelcome(false);
    setStep(0);
  }

  if (showWelcome) {
    return (
      <>
        <WizardStyles />
        <WizardWelcome onManual={() => setShowWelcome(false)} onImportData={handleImportData} />
      </>
    );
  }

  return (
    <>
      <WizardStyles />
      <div style={{
        height: "100vh", background: "#FAFAF8",
        fontFamily: C.font, display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Minimal top bar */}
        <div style={{
          padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "flex-end",
          background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.06)",
          flexShrink: 0,
        }}>
          <button
            type="button"
            onClick={() => { sessionStorage.removeItem(STORAGE_KEY); onFinish(null); }}
            style={{
              padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)",
              background: "transparent", color: "#6B6B6B", fontSize: 12, cursor: "pointer",
              fontFamily: C.font,
            }}
          >Passer la configuration</button>
        </div>

        {/* Progress bar */}
        <ProgressBar step={step} />

        {/* Scrollable step content */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            maxWidth: 620, width: "100%", margin: "0 auto",
            padding: "0 20px 80px", boxSizing: "border-box",
            minHeight: "100%",
          }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", animation: `wizardFadeIn .3s ease` }} key={step}>
            {step === 0 && (
              <Step1Logement
                data={step1Data}
                onChange={d => setSection("info", { ...(wizardData.info || {}), ...d })}
                onNext={goNext}
                onBack={goBack}
                onSkip={goNext}
              />
            )}
            {step === 1 && (
              <Step2Acces
                data={step2Data}
                onChange={d => setSection("checkin", d)}
                onNext={goNext}
                onBack={goBack}
                onSkip={goNext}
              />
            )}
            {step === 2 && (
              <Step3Regles
                data={step3Data}
                onChange={d => setSection("rules", d)}
                onNext={goNext}
                onBack={goBack}
                onSkip={goNext}
              />
            )}
            {step === 3 && (
              <Step4Equipements
                data={step4Data}
                onChange={d => setSection("appliances", d)}
                onNext={goNext}
                onBack={goBack}
                onSkip={goNext}
              />
            )}
            {step === 4 && (
              <Step5Quartier
                data={step5Data}
                onChange={handleStep5Change}
                onNext={goNext}
                onBack={goBack}
                onSkip={goNext}
              />
            )}
            {step === 5 && (
              <Step6Contacts
                data={step6Data}
                onChange={handleStep6Change}
                onNext={goNext}
                onBack={goBack}
                onSkip={goNext}
              />
            )}
            {step === 6 && (
              <StepPersonality
                data={step7Data}
                onChange={d => setSection("personality", d)}
                onNext={goNext}
                onBack={goBack}
                wizardContacts={wizardData.info?.contacts || []}
              />
            )}
            {step === 7 && (
              <Step7Recapitulatif
                propertyData={wizardData}
                onActivate={handleActivate}
                onComplete={handleCompleteSection}
                onBack={goBack}
                saving={saving}
              />
            )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
