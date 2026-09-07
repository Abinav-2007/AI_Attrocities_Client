import { useState, useRef, useEffect } from "react";

type Tab = "home" | "chat" | "resources" | "sos" | "profile";
type Lang = "en" | "hi";
type ChatMode = "text" | "call";

const tx = (en: string, hi: string, lang: Lang) => (lang === "hi" ? hi : en);

// ─── Color tokens ───────────────────────────────────────────────────────────
const C = {
  blue:        "#1558A8",   // primary — trustworthy deep blue
  blueLight:   "#EBF2FC",
  emerald:     "#1A8C6E",   // secondary — calm green
  emeraldLight:"#E6F5F0",
  amber:       "#C96A0A",   // call / action CTA
  amberLight:  "#FEF3E5",
  danger:      "#B91C1C",
  dangerLight: "#FEE2E2",
  text:        "#0D2137",
  textSub:     "#3D5A6E",
  textMuted:   "#8AA5BB",
  border:      "#D4E1EE",
  bg:          "#EFF3F8",
  surface:     "#FFFFFF",
  surfaceAlt:  "#F5F8FB",
  // dark equivalents
  dBg:         "#0A1929",
  dSurface:    "#0F2540",
  dSurfaceAlt: "#0C1E33",
  dBorder:     "#1A3A58",
  dText:       "#C8DDF0",
  dTextSub:    "#5A85A8",
  dTextMuted:  "#2A4A65",
};

// ─── Icons ──────────────────────────────────────────────────────────────────
const Ic = {
  home:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><polyline points="9 21 9 12 15 12 15 21"/></svg>,
  chat:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  book:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  sos:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  profile:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  lock:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  mic:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  send:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  chevron:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  phone:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.72 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.68 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.64a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  phoneCall:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.72 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.68 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.64a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  video:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
  location: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  scale:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="3" x2="12" y2="21"/><path d="M3 6l9-3 9 3"/><path d="M3 6l5 9H3l5-9z"/><path d="M21 6l-5 9h10l-5-9z"/></svg>,
  heart:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  home2:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  user:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  stop:     <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>,
  bot:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/></svg>,
  shield:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  calendar: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  menu:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  close:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  check:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  externalLink: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  info:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="8"/><line x1="12" y1="12" x2="12" y2="16"/></svg>,
  clock:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  wave:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 12c1-3 3-4 5-4s4 2 6 2 4-1 5-4"/><path d="M2 17c1-2 3-3 5-3s4 2 6 2 4-1 5-3"/></svg>,
};

// ─── Data ────────────────────────────────────────────────────────────────────
type Message = { id: number; from: "bot" | "user"; en: string; hi: string };

const CHAT_INIT: Message[] = [
  { id: 1, from: "bot", en: "Namaste, Priya. How are you feeling today?", hi: "नमस्ते, प्रिया। आज आप कैसा महसूस कर रहे हैं?" },
  { id: 2, from: "bot", en: "Select a response below, type freely, or switch to a voice call check-in above.", hi: "नीचे एक उत्तर चुनें, टाइप करें, या ऊपर वॉइस कॉल चेक-इन पर स्विच करें।" },
];

const SENTIMENTS = [
  { label: "Good",    labelHi: "अच्छा",   color: "#1A8C6E" },
  { label: "Okay",    labelHi: "ठीक है",  color: "#1558A8" },
  { label: "Worried", labelHi: "चिंतित",  color: "#C96A0A" },
  { label: "Sad",     labelHi: "दुखी",   color: "#6D51A6" },
  { label: "Angry",   labelHi: "गुस्सा", color: "#B91C1C" },
];

const CALL_HISTORY = [
  { date: "Thu, 4 Sep 2026", time: "10:14 AM", duration: "4m 32s", sentiment: "Good",    sentimentHi: "अच्छा",  status: "completed" },
  { date: "Thu, 28 Aug 2026", time: "10:02 AM", duration: "3m 15s", sentiment: "Worried", sentimentHi: "चिंतित", status: "completed" },
  { date: "Thu, 21 Aug 2026", time: "—",         duration: "—",       sentiment: "—",       sentimentHi: "—",      status: "missed" },
  { date: "Thu, 14 Aug 2026", time: "10:08 AM", duration: "5m 01s", sentiment: "Okay",    sentimentHi: "ठीक है", status: "completed" },
];

const SCHEMES = [
  {
    icon: Ic.scale, color: C.blue,
    en: "SC/ST Prevention of Atrocities Act",
    hi: "SC/ST अत्याचार निवारण अधिनियम",
    desc: { en: "Provides legal protection and compensation up to ₹8.25 lakh for atrocity victims. Covers special courts, free legal aid, and police accountability.", hi: "पीड़ितों के लिए ₹8.25 लाख तक मुआवजा, विशेष न्यायालय और मुफ्त कानूनी सहायता।" },
    link: "https://socialjustice.gov.in",
    actions: [{ label: "Check Eligibility", labelHi: "पात्रता जाँचें" }, { label: "Download Act PDF", labelHi: "PDF डाउनलोड करें" }],
  },
  {
    icon: Ic.book, color: C.emerald,
    en: "National Legal Services Authority (NALSA)",
    hi: "राष्ट्रीय विधिक सेवा प्राधिकरण",
    desc: { en: "Free legal representation, FIR assistance, Lok Adalat access, and state-appointed lawyers for eligible individuals.", hi: "मुफ्त कानूनी प्रतिनिधित्व, FIR सहायता और पात्र व्यक्तियों के लिए राज्य-नियुक्त वकील।" },
    link: "https://nalsa.gov.in",
    actions: [{ label: "Apply for Legal Aid", labelHi: "सहायता के लिए आवेदन करें" }, { label: "Find Nearest DLSA", labelHi: "नजदीकी DLSA खोजें" }],
  },
  {
    icon: Ic.heart, color: "#6D51A6",
    en: "Psychosocial Rehabilitation Scheme",
    hi: "मनोसामाजिक पुनर्वास योजना",
    desc: { en: "State-funded counseling, trauma therapy, group support sessions, and psychiatric care for atrocity survivors.", hi: "राज्य-वित्त पोषित परामर्श, आघात चिकित्सा और मनोचिकित्सा सहायता।" },
    link: "https://nimhans.ac.in",
    actions: [{ label: "Book Counseling Session", labelHi: "परामर्श बुक करें" }],
  },
  {
    icon: Ic.home2, color: C.amber,
    en: "Shelter & Livelihood Support",
    hi: "आश्रय एवं आजीविका सहायता",
    desc: { en: "Temporary government shelter, daily allowance, and skill-training programs for displaced atrocity victims.", hi: "अस्थाई आश्रय, दैनिक भत्ता और कौशल-प्रशिक्षण कार्यक्रम।" },
    link: "https://tribal.nic.in",
    actions: [{ label: "Apply for Shelter", labelHi: "आश्रय के लिए आवेदन करें" }],
  },
];

const QUICK_DIAL = [
  { label: "Police",       labelHi: "पुलिस",        number: "100",          accent: C.blue },
  { label: "Counselor",   labelHi: "परामर्शदाता",   number: "14566",        accent: C.emerald },
  { label: "Family",       labelHi: "परिवार",        number: "+91 XXXXX",    accent: "#6D51A6" },
  { label: "NHRC",         labelHi: "NHRC",           number: "14433",        accent: C.amber },
];

const NAV_ITEMS = [
  { key: "home" as Tab,      icon: Ic.home,    en: "Home",     hi: "होम",     short: { en: "Home",    hi: "होम" } },
  { key: "chat" as Tab,      icon: Ic.chat,    en: "Chat",     hi: "चैट",     short: { en: "Chat",    hi: "चैट" } },
  { key: "resources" as Tab, icon: Ic.book,    en: "Support & Resources", hi: "सहायता", short: { en: "Support", hi: "सहायता" } },
  { key: "sos" as Tab,       icon: Ic.sos,     en: "Emergency SOS", hi: "SOS",short: { en: "SOS",     hi: "SOS" } },
  { key: "profile" as Tab,   icon: Ic.profile, en: "Profile & Settings", hi: "प्रोफ़ाइल", short: { en: "Profile", hi: "प्रोफ़ाइल" } },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function Toggle({ on, onToggle, color }: { on: boolean; onToggle: () => void; color: string }) {
  return (
    <button onClick={onToggle} style={{
      width: 44, height: 24, borderRadius: 12, position: "relative",
      background: on ? color : "#CBD8E3", border: "none", cursor: "pointer",
      transition: "background 0.2s", flexShrink: 0,
    }}>
      <span style={{
        position: "absolute", top: 2, left: on ? 22 : 2, width: 20, height: 20,
        borderRadius: "50%", background: "#fff",
        boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "left 0.2s",
      }} />
    </button>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState<Lang>("en");
  const [tab, setTab] = useState<Tab>("home");
  const [onboarded, setOnboarded] = useState(false);
  const [consented, setConsented] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>("text");
  const [messages, setMessages] = useState<Message[]>(CHAT_INIT);
  const [inputText, setInputText] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [sosActive, setSosActive] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifFreq, setNotifFreq] = useState("weekly");
  const [monitoring, setMonitoring] = useState(true);
  const [recording, setRecording] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [callPending, setCallPending] = useState(false);
  const [infoModal, setInfoModal] = useState<number | null>(null);
  const [schemeModal, setSchemeModal] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const dm = darkMode;

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { id: Date.now(), from: "user" as const, en: text, hi: text }]);
    setInputText("");
    setTimeout(() => {
      setMessages((m) => [...m, {
        id: Date.now() + 1, from: "bot" as const,
        en: "Thank you for sharing. Your response has been recorded. Your next check-in is Thursday, 11 September at 10:00 AM.",
        hi: "साझा करने के लिए धन्यवाद। आपकी प्रतिक्रिया दर्ज की गई है। अगला चेक-इन 11 सितंबर, गुरुवार को 10:00 AM है।",
      }]);
    }, 900);
  };

  const triggerCall = () => {
    setCallPending(true);
    setTimeout(() => setCallPending(false), 3500);
  };

  // Token helpers
  const bg        = dm ? C.dBg        : C.bg;
  const surface   = dm ? C.dSurface   : C.surface;
  const surfaceAlt= dm ? C.dSurfaceAlt: C.surfaceAlt;
  const border    = dm ? C.dBorder    : C.border;
  const tp        = dm ? C.dText      : C.text;
  const ts        = dm ? C.dTextSub   : C.textSub;
  const tm        = dm ? C.dTextMuted : C.textMuted;
  const blue      = C.blue;
  const emerald   = C.emerald;
  const amber     = C.amber;
  const danger    = C.danger;

  const card = (extra?: React.CSSProperties): React.CSSProperties => ({
    background: surface, border: `1px solid ${border}`,
    borderRadius: 16, boxShadow: "0 1px 6px rgba(21,88,168,0.06)", ...extra,
  });

  // ── ONBOARDING ──────────────────────────────────────────────────────────────
  if (!onboarded) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      background: dm ? `linear-gradient(160deg,${C.dBg},${C.dSurfaceAlt})` : `linear-gradient(160deg,#E8F0FA,#E5F5EF)`,
      fontFamily: "'Nunito','Noto Sans Devanagari',sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 900 }}>
        {/* Lang */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
          <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", border: `1px solid ${border}`, background: surface }}>
            {(["en","hi"] as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                padding: "8px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none",
                background: lang === l ? blue : "transparent", color: lang === l ? "#fff" : ts, transition: "all .15s",
              }}>{l === "en" ? "English" : "हिंदी"}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gap: 32, gridTemplateColumns: "1fr" }}>
          <div id="onboard-grid" style={{ display: "grid", gap: 40, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", alignItems: "center" }}>
            {/* Left */}
            <div>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg,${blue},${emerald})`,
                display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", marginBottom: 24 }}>
                {Ic.shield}
              </div>
              <h1 style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.2, color: tp, marginBottom: 16 }}>
                {tx("We are here\nto support you.", "हम आपकी\nसहायता के लिए\nयहाँ हैं।", lang)}
              </h1>
              <p style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.65, color: ts, marginBottom: 24 }}>
                {tx(
                  "A safe, confidential space to access support, legal resources, and your rights as a survivor.",
                  "सहायता, कानूनी संसाधन और पीड़ित के रूप में अपने अधिकारों तक पहुँचने के लिए एक सुरक्षित, गोपनीय स्थान।",
                  lang
                )}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderRadius: 14, ...card() }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                  background: dm ? C.dBorder : C.blueLight, color: blue, flexShrink: 0 }}>{Ic.lock}</div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: tp }}>{tx("Your data is safe & confidential", "आपका डेटा सुरक्षित और गोपनीय है", lang)}</p>
                  <p style={{ fontSize: 12, fontWeight: 500, color: ts, marginTop: 2 }}>{tx("Never shared without your explicit consent.", "आपकी स्पष्ट सहमति के बिना कभी साझा नहीं किया जाता।", lang)}</p>
                </div>
              </div>
            </div>

            {/* Right — card */}
            <div style={{ ...card({ borderRadius: 24, padding: 32, boxShadow: "0 16px 48px rgba(21,88,168,0.13)" }) }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: tm, marginBottom: 20 }}>
                {tx("Get Started", "शुरू करें", lang)}
              </p>
              <div style={{ padding: "16px 18px", borderRadius: 14, background: surfaceAlt, border: `1px solid ${border}`, marginBottom: 20, cursor: "pointer" }}
                onClick={() => setConsented(!consented)}>
                <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}>
                  <div style={{ marginTop: 1, width: 20, height: 20, borderRadius: 6, border: `2px solid ${consented ? blue : border}`,
                    background: consented ? blue : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s" }}>
                    {consented && <span style={{ color: "#fff" }}>{Ic.check}</span>}
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: tp, lineHeight: 1.55 }}>
                    {tx("I agree to weekly wellness check-ins. I understand I can pause or stop at any time.", "मैं साप्ताहिक चेक-इन के लिए सहमत हूँ। मैं कभी भी रोक सकता/सकती हूँ।", lang)}
                  </p>
                </label>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button onClick={() => consented && setOnboarded(true)} style={{
                  width: "100%", padding: "15px 0", borderRadius: 14, fontSize: 15, fontWeight: 800, border: "none", cursor: consented ? "pointer" : "not-allowed",
                  background: consented ? `linear-gradient(135deg,${blue},${emerald})` : (dm ? C.dBorder : C.border),
                  color: consented ? "#fff" : tm, boxShadow: consented ? `0 6px 20px rgba(21,88,168,0.28)` : "none", transition: "all .15s",
                }}>{tx("Begin Journey", "शुरू करें", lang)}</button>
                <a href="tel:14566" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "13px 0", borderRadius: 14, fontSize: 13, fontWeight: 700, textDecoration: "none",
                  background: danger, color: "#fff", boxShadow: `0 4px 14px rgba(185,28,28,0.26)` }}>
                  {Ic.phone} {tx("Need immediate help? Call 14566", "तत्काल सहायता? 14566 पर कॉल करें", lang)}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── MAIN APP ────────────────────────────────────────────────────────────────
  const pageTitle = NAV_ITEMS.find(n => n.key === tab);

  return (
    <div style={{ display: "flex", height: "100dvh", overflow: "hidden", background: bg, fontFamily: "'Nunito','Noto Sans Devanagari',sans-serif", color: tp }}>

      {/* Mobile overlay */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 30, background: "rgba(0,0,0,0.4)" }} />}

      {/* ── SIDEBAR ──────────────────────────────────────────────────────────── */}
      <aside id="sidebar" style={{
        width: 252, flexShrink: 0, display: "flex", flexDirection: "column", height: "100%",
        background: dm ? C.dSurface : "#FFFFFF", borderRight: `1px solid ${border}`,
        position: "fixed", left: 0, top: 0, zIndex: 40, transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform .22s ease",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 20px 16px", borderBottom: `1px solid ${border}` }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${blue},${emerald})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>{Ic.shield}</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 900, color: blue }}>SupportPath</p>
            <p style={{ fontSize: 11, fontWeight: 500, color: tm }}>{tx("Case ID: SP-2847", "केस ID: SP-2847", lang)}</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: ts, padding: 4 }}>{Ic.close}</button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "12px 10px" }}>
          {NAV_ITEMS.map(item => {
            const active = tab === item.key;
            const isSOS = item.key === "sos";
            const ac = isSOS ? danger : blue;
            return (
              <button key={item.key} onClick={() => { setTab(item.key); setSidebarOpen(false); }}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 12,
                  fontSize: 13, fontWeight: 700, textAlign: "left", border: "none", cursor: "pointer", marginBottom: 2,
                  background: active ? (isSOS ? C.dangerLight : dm ? C.dBorder : C.blueLight) : "transparent",
                  color: active ? ac : ts, transition: "all .12s" }}>
                <span style={{ color: active ? ac : tm, flexShrink: 0 }}>{item.icon}</span>
                {lang === "hi" ? item.hi : item.en}
                {active && <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: ac, flexShrink: 0 }} />}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: "12px 10px 16px", borderTop: `1px solid ${border}` }}>
          <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", border: `1px solid ${border}`, marginBottom: 10 }}>
            {(["en","hi"] as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{ flex: 1, padding: "7px 0", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer",
                background: lang === l ? blue : "transparent", color: lang === l ? "#fff" : ts }}>
                {l === "en" ? "English" : "हिंदी"}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, background: surfaceAlt }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg,${blue},${emerald})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>{Ic.user}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: tp }}>P****a D****</p>
              <p style={{ fontSize: 11, fontWeight: 500, color: tm }}>SP-2847</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ─────────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, marginLeft: 0 }}>

        {/* Top bar */}
        <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", flexShrink: 0,
          background: dm ? "rgba(10,25,41,0.96)" : "rgba(239,243,248,0.96)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${border}` }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", color: ts, display: "flex", alignItems: "center", padding: 4 }}>{Ic.menu}</button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 15, fontWeight: 800, color: tp }}>{lang === "hi" ? pageTitle?.hi : pageTitle?.en}</h1>
            <p style={{ fontSize: 11, fontWeight: 500, color: tm }}>{tx("Sunday, 6 September 2026", "रविवार, 6 सितंबर 2026", lang)}</p>
          </div>
          <button onClick={() => { setSosActive(true); setTab("sos"); }} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 800, color: "#fff", border: "none", cursor: "pointer",
            background: danger, boxShadow: `0 3px 10px rgba(185,28,28,0.28)`, letterSpacing: "0.03em" }}>
            {Ic.sos} SOS
          </button>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>

          {/* ── HOME ── */}
          {tab === "home" && (
            <div style={{ padding: "24px 20px 32px", maxWidth: 960, margin: "0 auto" }}>
              {/* Hero */}
              <div style={{ borderRadius: 24, padding: "28px 28px", marginBottom: 24, background: `linear-gradient(145deg,${blue},${emerald})`, boxShadow: "0 8px 32px rgba(21,88,168,0.24)" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{tx("Sunday, 6 September 2026", "रविवार, 6 सितंबर 2026", lang)}</p>
                    <h2 style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginBottom: 6 }}>{tx("Good morning, Priya", "शुभ प्रभात, प्रिया", lang)}</h2>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.82)" }}>{tx("Next check-in: Thursday, 11 Sep · 10:00 AM", "अगला चेक-इन: 11 सित॰, गुरुवार · 10:00 AM", lang)}</p>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button onClick={() => setTab("chat")} style={{ padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 700, color: "#fff", border: "none", cursor: "pointer", background: "rgba(255,255,255,0.18)", backdropFilter: "blur(6px)" }}>
                      {tx("Chat Check-in", "चैट चेक-इन", lang)}
                    </button>
                    <button onClick={() => { setTab("chat"); setChatMode("call"); }} style={{ padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 700, color: amber, border: "none", cursor: "pointer", background: "#fff" }}>
                      {tx("Voice Call Check-in", "वॉइस चेक-इन", lang)}
                    </button>
                  </div>
                </div>
              </div>

              {/* Voice Call Check-in card */}
              <div style={{ borderRadius: 20, marginBottom: 20, overflow: "hidden", background: surface, border: `2px solid ${amber}`, boxShadow: `0 4px 18px ${amber}22`, display: "flex" }}>
                <div style={{ width: 6, flexShrink: 0, background: amber }} />
                <div style={{ flex: 1, padding: "18px 20px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: C.amberLight, display: "flex", alignItems: "center", justifyContent: "center", color: amber, flexShrink: 0 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.72 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.68 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.64a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: amber, marginBottom: 3 }}>{tx("Voice Call Check-in Available", "वॉइस कॉल चेक-इन उपलब्ध", lang)}</p>
                    <p style={{ fontSize: 12, fontWeight: 500, color: ts, lineHeight: 1.5 }}>{tx("Automated IVR call · Bhashini transcription · Available in Hindi & English", "स्वचालित IVR कॉल · भाषिणी · हिंदी और अंग्रेज़ी में उपलब्ध", lang)}</p>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flexShrink: 0 }}>
                    <a href="tel:14566" style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 12, fontSize: 13, fontWeight: 800, textDecoration: "none", background: amber, color: "#fff", boxShadow: `0 4px 12px ${amber}40` }}>
                      {Ic.phone} {tx("Call Now — 14566", "अभी कॉल करें — 14566", lang)}
                    </a>
                    <button onClick={() => { setChatMode("call"); setTab("chat"); }} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 16px", borderRadius: 12, fontSize: 13, fontWeight: 700, border: `1px solid ${amber}`, cursor: "pointer", background: C.amberLight, color: amber }}>
                      {tx("Trigger Automated Check-in", "स्वचालित चेक-इन शुरू करें", lang)}
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: tm, marginBottom: 14 }}>{tx("Your Overview", "आपका अवलोकन", lang)}</p>
              <div id="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 24 }}>
                {[
                  { label: tx("Text Check-ins", "चैट चेक-इन", lang),   value: "8",           sub: tx("This month", "इस माह", lang),        accent: blue },
                  { label: tx("Call Check-ins", "कॉल चेक-इन", lang),   value: "4",           sub: tx("This month", "इस माह", lang),        accent: amber },
                  { label: tx("Case Status", "केस की स्थिति", lang),    value: tx("Active","सक्रिय",lang), sub: tx("FIR registered","FIR दर्ज",lang), accent: "#6D51A6" },
                  { label: tx("Counselor", "परामर्शदाता", lang),        value: "Dr. Meena",   sub: tx("Assigned","नियुक्त",lang),           accent: emerald },
                ].map((item, i) => (
                  <div key={i} style={{ ...card({ padding: "18px 18px" }) }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: ts, marginBottom: 8 }}>{item.label}</p>
                    <p style={{ fontSize: 22, fontWeight: 900, color: item.accent }}>{item.value}</p>
                    <p style={{ fontSize: 11, fontWeight: 500, color: tm, marginTop: 4 }}>{item.sub}</p>
                  </div>
                ))}
              </div>

              {/* Lower two-col */}
              <div id="lower-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
                {/* Rights */}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: tm, marginBottom: 14 }}>{tx("Know Your Rights", "अपने अधिकार जानें", lang)}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      { icon: Ic.book,  color: blue,    title: tx("SC/ST Act — Illustrated Guide", "SC/ST अधिनियम — चित्र गाइड", lang), sub: tx("Hindi · English · Tamil", "हिंदी · अंग्रेज़ी · तमिल", lang) },
                      { icon: Ic.scale, color: emerald, title: tx("Compensation Eligibility Checker", "मुआवजा पात्रता जाँचक", lang),     sub: tx("Automated self-assessment tool", "स्वचालित मूल्यांकन उपकरण", lang) },
                    ].map((item, i) => (
                      <div key={i} style={{ ...card({ padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }) }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: dm ? C.dBorder : C.blueLight, color: item.color, flexShrink: 0 }}>{item.icon}</div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: tp }}>{item.title}</p>
                          <p style={{ fontSize: 11, fontWeight: 500, color: ts, marginTop: 2 }}>{item.sub}</p>
                        </div>
                        <a href="#" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: blue, textDecoration: "none", padding: "6px 12px", borderRadius: 8, background: dm ? C.dBorder : C.blueLight, flexShrink: 0 }}>
                          {tx("Open", "खोलें", lang)} {Ic.externalLink}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming */}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: tm, marginBottom: 14 }}>{tx("Upcoming", "आगामी", lang)}</p>
                  <div style={{ ...card({ overflow: "hidden" }) }}>
                    {[
                      { label: tx("Wellness Chat Check-in", "भलाई चैट चेक-इन", lang), date: tx("Thu, 11 Sep · 10:00 AM", "गुरु, 11 सित॰ · 10:00 AM", lang), ac: blue },
                      { label: tx("Counseling — Dr. Meena", "परामर्श — Dr. मीना", lang), date: tx("Fri, 12 Sep · 11:30 AM", "शुक्र, 12 सित॰ · 11:30 AM", lang), ac: emerald },
                      { label: tx("Legal Aid Hearing", "विधिक सहायता सुनवाई", lang), date: tx("Mon, 15 Sep · 3:00 PM", "सोम, 15 सित॰ · 3:00 PM", lang), ac: "#6D51A6" },
                    ].map((item, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderTop: i > 0 ? `1px solid ${border}` : "none" }}>
                        <div style={{ width: 3, height: 36, borderRadius: 2, background: item.ac, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: tp }}>{item.label}</p>
                          <p style={{ fontSize: 11, fontWeight: 500, color: ts, marginTop: 2 }}>{item.date}</p>
                        </div>
                        <span style={{ color: tm }}>{Ic.calendar}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── CHAT ── */}
          {tab === "chat" && (
            <div style={{ display: "flex", flexDirection: "column", height: "100%", maxWidth: 900, margin: "0 auto", width: "100%" }}>

              {/* Mode switcher */}
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${border}`, background: surface, flexShrink: 0, display: "flex", gap: 8 }}>
                {([["text", tx("Chat Check-in", "चैट चेक-इन", lang), blue], ["call", tx("Voice Call Check-in", "वॉइस कॉल चेक-इन", lang), amber]] as [ChatMode, string, string][]).map(([mode, label, ac]) => (
                  <button key={mode} onClick={() => setChatMode(mode)} style={{
                    flex: 1, padding: "10px 0", borderRadius: 12, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", transition: "all .15s",
                    background: chatMode === mode ? ac : (dm ? C.dBorder : surfaceAlt),
                    color: chatMode === mode ? "#fff" : ts,
                    boxShadow: chatMode === mode ? `0 4px 12px ${ac}30` : "none",
                  }}>{label}</button>
                ))}
              </div>

              {/* ── TEXT MODE ── */}
              {chatMode === "text" && (<>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: surface, borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg,${blue},${emerald})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>{Ic.bot}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: tp }}>{tx("Wellness Check-in", "भलाई चेक-इन", lang)}</p>
                    <p style={{ fontSize: 11, fontWeight: 500, color: ts }}>{tx("Private & confidential", "निजी और गोपनीय", lang)}</p>
                  </div>
                  <button style={{ fontSize: 11, fontWeight: 600, padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: dm ? C.dBorder : surfaceAlt, color: ts }}>{tx("Skip", "छोड़ें", lang)}</button>
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px", background: surfaceAlt, display: "flex", flexDirection: "column", gap: 16 }}>
                  {messages.map(msg => (
                    <div key={msg.id} style={{ display: "flex", gap: 10, flexDirection: msg.from === "user" ? "row-reverse" : "row" }}>
                      {msg.from === "bot" && (
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg,${blue},${emerald})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>{Ic.bot}</div>
                      )}
                      <div style={{ maxWidth: "72%", padding: "12px 16px", borderRadius: 16, fontSize: 13, fontWeight: 500, lineHeight: 1.55,
                        background: msg.from === "bot" ? surface : `linear-gradient(135deg,${blue},${emerald})`,
                        color: msg.from === "bot" ? tp : "#fff",
                        border: msg.from === "bot" ? `1px solid ${border}` : "none",
                        borderTopLeftRadius: msg.from === "bot" ? 4 : 16,
                        borderTopRightRadius: msg.from === "user" ? 4 : 16,
                      }}>
                        {lang === "hi" ? msg.hi : msg.en}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Sentiments */}
                <div style={{ display: "flex", gap: 8, padding: "10px 16px", background: surface, borderTop: `1px solid ${border}`, overflowX: "auto", flexShrink: 0 }}>
                  {SENTIMENTS.map(s => (
                    <button key={s.label} onClick={() => sendMessage(lang === "hi" ? s.labelHi : s.label)}
                      style={{ flexShrink: 0, padding: "7px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1px solid ${s.color}30`, background: `${s.color}12`, color: s.color }}>
                      {lang === "hi" ? s.labelHi : s.label}
                    </button>
                  ))}
                </div>

                {/* Input */}
                <div style={{ display: "flex", gap: 10, padding: "12px 16px", background: dm ? bg : "#fff", borderTop: `1px solid ${border}`, flexShrink: 0 }}>
                  <button onClick={() => setRecording(!recording)} style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", flexShrink: 0, transition: "all .15s",
                    background: recording ? danger : (dm ? C.dBorder : surfaceAlt), color: recording ? "#fff" : ts }}>
                    {recording ? Ic.stop : Ic.mic}
                  </button>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 14px", borderRadius: 12, background: surfaceAlt, border: `1px solid ${border}` }}>
                    <input type="text" value={inputText} onChange={e => setInputText(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && sendMessage(inputText)}
                      placeholder={tx("Type your response…", "अपना उत्तर टाइप करें…", lang)}
                      style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13, fontWeight: 500, color: tp, padding: "12px 0", fontFamily: "inherit" }} />
                  </div>
                  <button onClick={() => sendMessage(inputText)} style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", flexShrink: 0, background: `linear-gradient(135deg,${blue},${emerald})`, color: "#fff" }}>
                    {Ic.send}
                  </button>
                </div>
              </>)}

              {/* ── CALL MODE ── */}
              {chatMode === "call" && (
                <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px" }}>
                  <div id="call-layout">

                    {/* Left col: trigger + how it works */}
                    <div id="call-left">
                      {/* Trigger card */}
                      <div style={{ borderRadius: 20, padding: 24, marginBottom: 16, background: `linear-gradient(145deg,${amber},#A85508)`, boxShadow: `0 8px 28px ${amber}35` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                          <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
                            {Ic.phoneCall}
                          </div>
                          <div>
                            <p style={{ fontSize: 15, fontWeight: 900, color: "#fff", lineHeight: 1.3 }}>{tx("Automated Voice Call Check-in", "स्वचालित वॉइस कॉल चेक-इन", lang)}</p>
                            <p style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.78)", marginTop: 4, lineHeight: 1.5 }}>{tx("An IVR call asks you wellness questions in your language via Bhashini.", "भाषिणी के माध्यम से IVR कॉल आपसे आपकी भाषा में प्रश्न पूछता है।", lang)}</p>
                          </div>
                        </div>
                        <button onClick={triggerCall} disabled={callPending} style={{
                          width: "100%", padding: "13px 0", borderRadius: 14, fontSize: 14, fontWeight: 800, border: "none",
                          cursor: callPending ? "not-allowed" : "pointer",
                          background: callPending ? "rgba(255,255,255,0.28)" : "#fff",
                          color: callPending ? "rgba(255,255,255,0.65)" : amber,
                          transition: "all .15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        }}>
                          {callPending
                            ? <>{Ic.wave} {tx("Calling +91 XXXXX…", "कॉल हो रही है…", lang)}</>
                            : <>{Ic.phoneCall} {tx("Initiate Automated Call Now", "अभी स्वचालित कॉल शुरू करें", lang)}</>}
                        </button>
                      </div>

                      {/* How it works */}
                      <div style={{ ...card({ padding: "18px 20px" }) }}>
                        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: tm, marginBottom: 14 }}>{tx("How It Works", "यह कैसे काम करता है", lang)}</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                          {[
                            tx("System calls your registered number automatically.", "सिस्टम आपके पंजीकृत नंबर पर स्वचालित रूप से कॉल करता है।", lang),
                            tx("IVR asks 3–5 wellness questions in Hindi or English.", "IVR हिंदी या अंग्रेज़ी में 3–5 प्रश्न पूछता है।", lang),
                            tx("Responses are transcribed and sentiment is recorded.", "उत्तर ट्रांसक्राइब किए जाते हैं और भावना दर्ज की जाती है।", lang),
                            tx("Results appear below and are visible to your counselor.", "परिणाम नीचे दिखाई देते हैं और आपके परामर्शदाता को दृश्यमान होते हैं।", lang),
                          ].map((step, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                              <div style={{ width: 24, height: 24, borderRadius: "50%", background: dm ? C.dBorder : C.amberLight, color: amber, fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                              <p style={{ fontSize: 13, fontWeight: 500, color: ts, lineHeight: 1.55 }}>{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right col: call history */}
                    <div id="call-right">
                      <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: tm, marginBottom: 12 }}>{tx("Call Check-in History", "कॉल चेक-इन इतिहास", lang)}</p>

                      {/* Desktop table — hidden on mobile via CSS */}
                      <div id="call-history-table" style={{ ...card({ overflow: "hidden" }) }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 72px 96px 72px", gap: 0, padding: "10px 18px", borderBottom: `1px solid ${border}`, background: surfaceAlt }}>
                          {[tx("Date & Time","दिनांक",lang), tx("Duration","अवधि",lang), tx("Sentiment","भावना",lang), tx("Status","स्थिति",lang)].map((h, i) => (
                            <p key={i} style={{ fontSize: 10, fontWeight: 700, color: tm, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</p>
                          ))}
                        </div>
                        {CALL_HISTORY.map((row, i) => {
                          const missed = row.status === "missed";
                          const sentColor = row.sentiment === "Good" ? emerald : row.sentiment === "Worried" ? amber : row.sentiment === "Sad" ? "#6D51A6" : blue;
                          return (
                            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 72px 96px 72px", gap: 0, padding: "13px 18px", borderTop: i > 0 ? `1px solid ${border}` : "none", alignItems: "center" }}>
                              <div>
                                <p style={{ fontSize: 13, fontWeight: 700, color: missed ? tm : tp }}>{row.date}</p>
                                <p style={{ fontSize: 11, fontWeight: 500, color: tm, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>{Ic.clock} {row.time}</p>
                              </div>
                              <p style={{ fontSize: 12, fontWeight: 600, color: missed ? tm : ts }}>{row.duration}</p>
                              <div>
                                {row.sentiment !== "—"
                                  ? <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: `${sentColor}15`, color: sentColor, whiteSpace: "nowrap" }}>{lang === "hi" ? row.sentimentHi : row.sentiment}</span>
                                  : <span style={{ fontSize: 12, color: tm }}>—</span>}
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20, display: "inline-block", whiteSpace: "nowrap",
                                background: missed ? (dm ? "#2a0f0f" : C.dangerLight) : (dm ? C.dBorder : C.emeraldLight),
                                color: missed ? danger : emerald }}>
                                {missed ? tx("Missed","छूटा",lang) : tx("Done","पूर्ण",lang)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── RESOURCES ── */}
          {tab === "resources" && (
            <div style={{ padding: "24px 20px 32px", maxWidth: 960, margin: "0 auto" }}>
              <div id="resources-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>

                {/* Support Helplines */}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: tm, marginBottom: 14 }}>{tx("Support Helplines", "सहायता हेल्पलाइन", lang)}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                    {[
                      { name: tx("iCall Counseling", "iCall परामर्श", lang), number: "9152987821", color: blue, lightBg: C.blueLight, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
                      { name: tx("National Helpline", "राष्ट्रीय हेल्पलाइन", lang), number: "14566", color: emerald, lightBg: C.emeraldLight, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
                      { name: tx("NHRC Complaint", "NHRC शिकायत", lang), number: "14433", color: amber, lightBg: C.amberLight, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="3" x2="12" y2="21"/><path d="M3 6l9-3 9 3"/><path d="M3 6l5 9H3l5-9z"/><path d="M21 6l-5 9h10l-5-9z"/></svg> },
                    ].map((h) => (
                      <div key={h.number} style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 6px rgba(21,88,168,0.06)" }}>
                        <div style={{ height: 5, background: h.color }} />
                        <div style={{ padding: "16px 14px" }}>
                          <div style={{ width: 42, height: 42, borderRadius: 12, background: h.lightBg, display: "flex", alignItems: "center", justifyContent: "center", color: h.color, marginBottom: 10 }}>{h.icon}</div>
                          <p style={{ fontSize: 12, fontWeight: 700, color: tp, marginBottom: 4, lineHeight: 1.35 }}>{h.name}</p>
                          <p style={{ fontSize: 18, fontWeight: 900, color: h.color, marginBottom: 12, letterSpacing: "0.02em" }}>{h.number}</p>
                          <a href={`tel:${h.number}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 10, fontSize: 12, fontWeight: 800, textDecoration: "none", background: h.color, color: "#fff" }}>
                            {Ic.phone} {tx("Call", "कॉल", lang)}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Schemes */}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: tm, marginBottom: 14 }}>{tx("Government Schemes", "सरकारी योजनाएँ", lang)}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {SCHEMES.map((s, i) => (
                      <div key={i} style={{ ...card({ overflow: "hidden" }) }}>
                        <button onClick={() => setSchemeModal(i)}
                          style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                          <div style={{ width: 42, height: 42, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: `${s.color}15`, color: s.color, flexShrink: 0 }}>{s.icon}</div>
                          <p style={{ flex: 1, fontSize: 13, fontWeight: 700, color: tp }}>{lang === "hi" ? s.hi : s.en}</p>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 8, background: `${s.color}12`, color: s.color, flexShrink: 0 }}>{tx("Learn More", "अधिक जानें", lang)}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right col: Legal + Counselor */}
                <div id="right-resources" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>

                  {/* Legal Aid */}
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: tm, marginBottom: 14 }}>{tx("Legal Aid", "कानूनी सहायता", lang)}</p>
                    <div style={{ ...card({ overflow: "hidden" }) }}>
                      {[
                        { icon: Ic.user,  label: tx("Adv. Sunita Sharma", "अधि. सुनीता शर्मा", lang), sub: tx("Legal Aid Lawyer — NALSA", "विधिक सहायता वकील — NALSA", lang), num: "+91 98765 43210", color: blue },
                        { icon: Ic.book,  label: tx("FIR Status", "FIR स्थिति", lang),               sub: tx("Registered · Ref #DL2026-1847", "दर्ज · संदर्भ #DL2026-1847", lang), num: "",               color: emerald },
                      ].map((item, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderTop: i > 0 ? `1px solid ${border}` : "none" }}>
                          <div style={{ width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: `${item.color}12`, color: item.color, flexShrink: 0 }}>{item.icon}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: tp }}>{item.label}</p>
                            <p style={{ fontSize: 11, fontWeight: 500, color: ts, marginTop: 2 }}>{item.sub}</p>
                          </div>
                          {item.num && (
                            <a href={`tel:${item.num}`} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, textDecoration: "none", background: dm ? C.dBorder : C.blueLight, color: blue, flexShrink: 0 }}>
                              {Ic.phone} {tx("Call", "कॉल", lang)}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Counselor */}
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: tm, marginBottom: 14 }}>{tx("Counselor Connect", "परामर्शदाता से जुड़ें", lang)}</p>
                    <div style={{ ...card({ padding: "18px" }) }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: dm ? C.dBorder : C.emeraldLight, color: emerald, flexShrink: 0 }}>{Ic.user}</div>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 800, color: tp }}>Dr. Meena Gupta</p>
                          <p style={{ fontSize: 12, fontWeight: 500, color: ts, marginTop: 2 }}>{tx("Trauma & Rehabilitation Specialist", "आघात और पुनर्वास विशेषज्ञ", lang)}</p>
                          <p style={{ fontSize: 11, fontWeight: 700, color: emerald, marginTop: 5, display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: emerald, display: "inline-block" }} />
                            {tx("Available Thu & Fri, 10 AM – 1 PM", "गुरु और शुक्र, 10 AM – 1 PM", lang)}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button style={{ flex: 1, padding: "10px 0", borderRadius: 12, fontSize: 13, fontWeight: 700, color: "#fff", border: "none", cursor: "pointer", background: `linear-gradient(135deg,${blue},${emerald})` }}>
                          {tx("Book Session", "सत्र बुक करें", lang)}
                        </button>
                        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 12, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", background: dm ? C.dBorder : C.blueLight, color: blue }}>
                          {Ic.video} {tx("Video Call", "वीडियो कॉल", lang)}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SOS ── */}
          {tab === "sos" && (
            <div style={{ padding: "24px 20px 32px", maxWidth: 900, margin: "0 auto" }}>
              <div id="sos-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24, alignItems: "start" }}>

                {/* Left */}
                <div>
                  <div style={{ borderRadius: 20, padding: 28, textAlign: "center", marginBottom: 20, background: dm ? "#1a0b0b" : C.dangerLight, border: `1px solid ${dm ? "#3a1212" : "#FECACA"}` }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: ts, marginBottom: 24, lineHeight: 1.55 }}>{tx("One tap sends your location and an alert to authorities.", "एक टैप से आपका स्थान और अलर्ट अधिकारियों को भेजा जाता है।", lang)}</p>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                      <button onClick={() => setSosActive(!sosActive)} style={{
                        width: 168, height: 168, borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer",
                        background: sosActive ? "radial-gradient(circle,#ef5350,#991B1B)" : "radial-gradient(circle,#E53935,#B91C1C)",
                        boxShadow: sosActive ? "0 0 0 12px rgba(185,28,28,0.12), 0 0 0 24px rgba(185,28,28,0.06), 0 12px 36px rgba(185,28,28,0.50)" : "0 8px 28px rgba(185,28,28,0.40)",
                        animation: sosActive ? "pulse 1.5s ease-in-out infinite" : "none",
                      }}>
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        <span style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginTop: 6, letterSpacing: "0.08em" }}>SOS</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.82)", marginTop: 4 }}>{sosActive ? tx("ALERT SENT", "अलर्ट भेजा", lang) : tx("TAP TO ALERT", "टैप करें", lang)}</span>
                      </button>
                    </div>
                    {sosActive && (
                      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 14, background: dm ? "#2a0a0a" : "#FEE2E2", border: `1px solid #FECACA` }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "#FECACA", color: danger, flexShrink: 0 }}>{Ic.location}</div>
                        <div style={{ textAlign: "left" }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "#991B1B" }}>{tx("Live location shared with authorities", "अधिकारियों के साथ लाइव स्थान साझा किया गया", lang)}</p>
                          <p style={{ fontSize: 11, fontWeight: 500, color: "#EF4444", marginTop: 2 }}>{tx("SMS sent · In-app alert dispatched", "SMS भेजा · अलर्ट भेजा गया", lang)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ ...card({ padding: "16px 18px" }) }}>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: danger, marginBottom: 10 }}>{tx("Pre-filled Message", "पूर्व-भरा संदेश", lang)}</p>
                    <p style={{ fontSize: 13, fontWeight: 600, fontStyle: "italic", color: tp, lineHeight: 1.6 }}>
                      {tx(`"I need help at my current location. Please send assistance. — Priya (SP-2847)"`, `"मुझे मेरे स्थान पर मदद चाहिए। कृपया सहायता भेजें। — प्रिया (SP-2847)"`, lang)}
                    </p>
                  </div>
                </div>

                {/* Right — Quick Dial */}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: tm, marginBottom: 14 }}>{tx("Quick Dial", "त्वरित डायल", lang)}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                    {QUICK_DIAL.map(d => (
                      <a key={d.label} href={`tel:${d.number}`} style={{ ...card({ padding: "18px 16px", display: "flex", flexDirection: "column", gap: 12, textDecoration: "none" }) }}>
                        <div style={{ width: 42, height: 42, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: `${d.accent}12`, color: d.accent }}>{Ic.phone}</div>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 800, color: d.accent }}>{lang === "hi" ? d.labelHi : d.label}</p>
                          <p style={{ fontSize: 13, fontWeight: 700, color: tp, marginTop: 2 }}>{d.number}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── PROFILE ── */}
          {tab === "profile" && (
            <div style={{ padding: "24px 20px 32px", maxWidth: 800, margin: "0 auto" }}>
              <div id="profile-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
                {/* Profile banner */}
                <div style={{ borderRadius: 20, padding: "24px 24px", background: `linear-gradient(145deg,${blue},${emerald})`, boxShadow: `0 8px 24px rgba(21,88,168,0.22)`, display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ width: 60, height: 60, borderRadius: 18, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>P****a D****</p>
                    <p style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.78)", marginTop: 3 }}>{tx("Case ID: SP-2847 · Language: English / Hindi", "केस ID: SP-2847 · भाषा: अंग्रेज़ी / हिंदी", lang)}</p>
                  </div>
                </div>

                {/* Settings */}
                <div style={{ ...card({ padding: "20px 22px" }) }}>
                  <p style={{ fontSize: 13, fontWeight: 800, color: tp, marginBottom: 16 }}>{tx("Check-in Frequency", "चेक-इन आवृत्ति", lang)}</p>
                  <div style={{ display: "flex", gap: 10 }}>
                    {[{ val: "daily", en: "Daily", hi: "दैनिक" }, { val: "weekly", en: "Weekly", hi: "साप्ताहिक" }, { val: "biweekly", en: "Bi-weekly", hi: "द्वि-साप्ताहिक" }].map(opt => (
                      <button key={opt.val} onClick={() => setNotifFreq(opt.val)} style={{ flex: 1, padding: "9px 0", borderRadius: 10, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", transition: "all .15s",
                        background: notifFreq === opt.val ? blue : (dm ? C.dBorder : surfaceAlt), color: notifFreq === opt.val ? "#fff" : ts }}>
                        {lang === "hi" ? opt.hi : opt.en}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ ...card({ overflow: "hidden" }) }}>
                  {[
                    { label: tx("Monitoring Active", "निगरानी सक्रिय", lang), sub: tx("Pause or stop anytime — your choice.", "कभी भी रोकें — आपकी इच्छा।", lang), val: monitoring, set: setMonitoring, color: blue },
                    { label: tx("Dark Mode", "डार्क मोड", lang),              sub: tx("Easier on the eyes at night.", "रात में आँखों के लिए।", lang),              val: darkMode,   set: setDarkMode,   color: blue },
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px", borderTop: i > 0 ? `1px solid ${border}` : "none" }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: tp }}>{item.label}</p>
                        <p style={{ fontSize: 12, fontWeight: 500, color: ts, marginTop: 2 }}>{item.sub}</p>
                      </div>
                      <Toggle on={item.val} onToggle={() => item.set(!item.val)} color={item.color} />
                    </div>
                  ))}
                </div>

                <button style={{ width: "100%", padding: "14px 0", borderRadius: 14, fontSize: 13, fontWeight: 700, border: `1px solid ${dm ? "#3a1212" : "#FECACA"}`, cursor: "pointer", background: dm ? "#1a0b0b" : C.dangerLight, color: danger }}>
                  {tx("Pause or Leave Programme", "कार्यक्रम रोकें या छोड़ें", lang)}
                </button>
              </div>
            </div>
          )}
        </main>

        {/* ── MOBILE BOTTOM NAV ── */}
        <nav id="mobile-nav" style={{ flexShrink: 0, background: dm ? "rgba(10,25,41,0.97)" : "rgba(255,255,255,0.97)", backdropFilter: "blur(16px)", borderTop: `1px solid ${border}` }}>
          <div style={{ display: "flex", alignItems: "stretch" }}>
            {NAV_ITEMS.map(item => {
              const active = tab === item.key;
              const isSOS = item.key === "sos";
              const ac = isSOS ? danger : blue;
              return (
                <button key={item.key} onClick={() => setTab(item.key)} style={{
                  flex: "1 1 0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: 3, padding: "10px 2px", background: "none", border: "none", cursor: "pointer", position: "relative",
                  color: active ? ac : tm, minWidth: 0, boxSizing: "border-box",
                }}>
                  <span style={{ position: "absolute", top: 0, left: "22%", right: "22%", height: 2, borderRadius: "0 0 2px 2px", background: active ? ac : "transparent" }} />
                  <span style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", opacity: active ? 1 : 0.45, flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, lineHeight: "12px", textAlign: "center", whiteSpace: "nowrap" }}>{lang === "hi" ? item.short.hi : item.short.en}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* ── SCHEME MODAL ── */}
      {schemeModal !== null && (() => {
        const s = SCHEMES[schemeModal];
        return (
          <div onClick={() => setSchemeModal(null)} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.52)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 520, background: surface, borderRadius: 24, boxShadow: "0 24px 64px rgba(0,0,0,0.22)", overflow: "hidden" }}>
              {/* Header strip */}
              <div style={{ height: 6, background: s.color }} />
              <div style={{ padding: "24px 24px 0" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: `${s.color}15`, color: s.color, flexShrink: 0 }}>{s.icon}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 16, fontWeight: 900, color: tp, lineHeight: 1.35 }}>{lang === "hi" ? s.hi : s.en}</p>
                  </div>
                  <button onClick={() => setSchemeModal(null)} style={{ background: "none", border: "none", cursor: "pointer", color: ts, padding: 4, flexShrink: 0 }}>{Ic.close}</button>
                </div>
                <p style={{ fontSize: 13, fontWeight: 500, color: ts, lineHeight: 1.65, marginBottom: 20 }}>
                  {lang === "hi" ? s.desc.hi : s.desc.en}
                </p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "0 24px 24px" }}>
                {s.actions.map((a, j) => (
                  <a key={j} href={s.link} target="_blank" rel="noreferrer" style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 12, fontSize: 13, fontWeight: 700, textDecoration: "none",
                    background: s.color, color: "#fff", boxShadow: `0 4px 14px ${s.color}30`,
                  }}>
                    {lang === "hi" ? a.labelHi : a.label} {Ic.externalLink}
                  </a>
                ))}
                <button onClick={() => setSchemeModal(null)} style={{ padding: "10px 16px", borderRadius: 12, fontSize: 13, fontWeight: 700, border: `1px solid ${border}`, cursor: "pointer", background: surfaceAlt, color: ts }}>
                  {tx("Close", "बंद करें", lang)}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <style>{`
        @keyframes pulse {
          0%,100%{box-shadow:0 0 0 12px rgba(185,28,28,0.12),0 0 0 24px rgba(185,28,28,0.06),0 12px 36px rgba(185,28,28,0.50)}
          50%{box-shadow:0 0 0 20px rgba(185,28,28,0.07),0 0 0 40px rgba(185,28,28,0.03),0 12px 36px rgba(185,28,28,0.50)}
        }
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:rgba(21,88,168,0.2);border-radius:4px}

        /* Call layout: stacked on mobile, side-by-side on desktop */
        #call-layout{display:flex;flex-direction:column;gap:20px}
        #call-left{display:flex;flex-direction:column;gap:16px}
        #call-right{display:flex;flex-direction:column}
        /* Mobile: show cards, hide table */
        #call-history-table{display:none!important}
        #call-history-cards{display:flex!important}

        @media(min-width:1024px){
          #sidebar{position:relative!important;transform:translateX(0)!important}
          #mobile-nav{display:none!important}
          #stats-grid{grid-template-columns:repeat(4,1fr)!important}
          #lower-grid{grid-template-columns:1fr 1fr!important}
          #resources-grid{grid-template-columns:1fr 340px!important}
          #right-resources{grid-template-columns:1fr!important}
          #sos-grid{grid-template-columns:1fr 1fr!important}
          #profile-grid{grid-template-columns:1fr!important;max-width:600px}
          #onboard-grid{grid-template-columns:1fr 1fr!important}
          /* Call: two-column layout on desktop */
          #call-layout{flex-direction:row!important;align-items:flex-start;gap:24px}
          #call-left{flex:0 0 340px;min-width:0}
          #call-right{flex:1;min-width:0}
          /* Desktop: show table, hide cards */
          #call-history-table{display:block!important}
          #call-history-cards{display:none!important}
        }
      `}</style>
    </div>
  );
}
