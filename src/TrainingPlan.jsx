import { useState } from "react";
const races = [
  { date: "5 Jul 2026", name: "Tittesworth 50k", dist: "50km", vert: "1,537m", weeks: 0, color: "#4ade80" },
  { date: "26 Sep 2026", name: "5 Valleys Ultra", dist: "58km", vert: "2,303m", weeks: 12, color: "#facc15" },
  { date: "17 Oct 2026", name: "UTYD 50k", dist: "50km", vert: "mod (self-nav)", weeks: 15, color: "#fb923c" },
  { date: "9 Jan 2027", name: "Spine Sprint South", dist: "74km", vert: "~2,400m winter", weeks: 27, color: "#f87171" },
  { date: "8 May 2027", name: "The Lap", dist: "75km", vert: "2,600m", weeks: 43, color: "#c084fc" },
];
const phases = [
  {
    id: 0,
    label: "PHASE 1",
    title: "Tittesworth Prep",
    dates: "Now → 5 Jul",
    weeks: "~3 weeks",
    race: "Tittesworth 50k",
    color: "#4ade80",
    focus: "Survive & learn",
    description: "You don't have time to build fitness — you have time to sharpen what you have and avoid mistakes on race day.",
    weekly: [
      { label: "Weekly mileage", value: "40–50km" },
      { label: "Long run", value: "20–25km w/ vert" },
      { label: "Key sessions", value: "2× vert days on Billinge / Winter Hill" },
      { label: "Taper", value: "Week before: cut volume 40%, keep intensity" },
    ],
    locations: [
      "Winter Hill / West Pennine Moors (30 min drive) — your main vert training ground",
      "Billinge Hill — quick local hit, you're already using it",
      "Roaches / Tittesworth recce if you can fit one in — race-specific trail feel",
    ],
    keyTips: [
      "Practice power-hiking uphills efficiently — walk the climbs, run everything else",
      "Eat and drink earlier than you think you need to",
      "Mandatory kit: foil blanket, waterproof, whistle — carry it in training",
      "Sort your drop bag / vest setup before race week",
    ],
  },
  {
    id: 1,
    label: "PHASE 2",
    title: "Build for 5 Valleys",
    dates: "8 Jul → 20 Sep",
    weeks: "~11 weeks",
    race: "5 Valleys Ultra",
    color: "#facc15",
    focus: "Elevation & back-to-backs",
    description: "5 Valleys is the hardest race-per-km in your calendar. 2,303m over 58km through technical Lakeland terrain. This phase builds your vertical engine.",
    weekly: [
      { label: "Weekly mileage", value: "55–70km, building" },
      { label: "Long run", value: "25–35km, targeting 800m+ vert" },
      { label: "Back-to-backs", value: "Sat/Sun long efforts every 2–3 weeks" },
      { label: "Vert target", value: "1,000–1,500m+ per week in training" },
    ],
    locations: [
      "Lake District (Langdale, Coniston, Ambleside) — race-specific terrain, 1.5 hrs",
      "Forest of Bowland — accessible from Burscough, solid hill training",
      "Winter Hill / Rivington — for weekday vert sessions",
      "5 Valleys course recce — aim for at least one section pre-race",
    ],
    keyTips: [
      "Run the Coniston / Langdale fells as your long run base — matches 5V terrain exactly",
      "Practice running tired: back-to-back weekends simulate race fatigue",
      "Nutrition: train your gut for 6–8hr efforts, test gels vs real food",
      "Technical descents: practice controlled fast descending — this is where time is made",
    ],
  },
  {
    id: 2,
    label: "PHASE 3",
    title: "UTYD & Navigation",
    dates: "Post 5V → 17 Oct",
    weeks: "~3 weeks",
    race: "UTYD 50k",
    color: "#fb923c",
    focus: "Recovery + navigation skills",
    description: "Only 3 weeks after 5 Valleys — this is a recovery-race, not a target race. But UTYD's self-navigation requirement means you can't just cruise in.",
    weekly: [
      { label: "Weekly mileage", value: "40–50km (recovery pace)" },
      { label: "Long run", value: "18–22km, easy effort" },
      { label: "Nav practice", value: "2× map & compass sessions on dales terrain" },
      { label: "Key session", value: "Yorkshire Dales recce with map only, no GPS" },
    ],
    locations: [
      "Yorkshire Dales (Malham, Grassington, Buckden) — course terrain, 1.5 hrs",
      "Buy OS OL2 + OL30 maps — mandatory kit, practice using them",
    ],
    keyTips: [
      "Book a navigation skills day — Spine Sprint also requires this, double investment",
      "UTYD has no waymarkers and few marshals — know your checkpoints before the start",
      "Race it conservatively: you're 3 weeks post-5V, and Spine prep starts immediately after",
      "Study the GPX and draw your own route lines on paper — builds spatial memory",
    ],
  },
  {
    id: 3,
    label: "PHASE 4",
    title: "Spine Sprint Prep",
    dates: "Oct → Jan 9",
    weeks: "~12 weeks",
    race: "Spine Sprint South",
    color: "#f87171",
    focus: "Night running, winter kit, self-sufficiency",
    description: "The biggest skills leap in your calendar. 74km non-stop, Edale to Hebden Bridge, January, Pennine Way. Cold, dark, brutal. Fitness is necessary but not sufficient.",
    weekly: [
      { label: "Weekly mileage", value: "60–75km, with night sessions" },
      { label: "Long run", value: "30–35km, some overnight" },
      { label: "Night runs", value: "At least 1× per week after Nov — mandatory" },
      { label: "Key block", value: "One 50km+ overnight training effort in Dec" },
    ],
    locations: [
      "Kinder Scout / Dark Peak (Edale area) — race terrain, 1.5 hrs from Burscough",
      "Pennine Way south section — recce Edale to Crowden and Crowden to Hebden",
      "Winter Hill night runs — accessible weekday option",
      "Consider: Spine Race training weekend (official Spine event)",
    ],
    keyTips: [
      "Full kit mandatory: test every item in field conditions before January",
      "Sleep management: practice sleep deprivation in training — short sharp nap strategy",
      "Bivvy setup: know how to deploy your emergency kit in darkness with cold hands",
      "Weather: train in January conditions — wind, rain, bog. Don't avoid bad weather days",
      "Poles: start using them now if you haven't — game-changer on the Pennines",
      "Foot care: waterproof socks (SealSkinz etc), Gurney Goo, blister protocol — essential",
      "Qualifying: Spine Sprint requires a 30-mile completed event — Tittesworth covers this",
    ],
  },
  {
    id: 4,
    label: "PHASE 5",
    title: "The Lap Build",
    dates: "Jan → May 8",
    weeks: "~17 weeks",
    race: "The Lap",
    color: "#c084fc",
    focus: "Distance, consistency, finishing strong",
    description: "After the Spine Sprint, The Lap will feel almost civilised — it's fully signposted, low-level, and a celebration run. Use this block to nail 50-mile pacing and enjoy it.",
    weekly: [
      { label: "Weekly mileage", value: "60–80km building to March, taper April" },
      { label: "Long run", value: "30–40km, Windermere / Lakeland terrain" },
      { label: "Back-to-backs", value: "Feb–Mar weekend blocks 25+25km" },
      { label: "Taper", value: "3 weeks out: drop to 50%, 1 week out: 30%" },
    ],
    locations: [
      "Lake Windermere circuit sections — recce both shores pre-race",
      "Low Cunsey Farm to Newby Bridge and back — race start/finish area",
      "Grizedale Forest / Claife Heights — matches race terrain perfectly",
    ],
    keyTips: [
      "The Lap is your reward run — go in with a time target and execute a smart first half",
      "6 feed stations — plan your food drops in advance, don't rely on just eating at CPs",
      "Halfway shoe bag service — use it to change socks, minimise blister risk",
      "After the Spine, your night running and self-sufficiency will make 75km in daylight feel manageable",
      "Pacing: first 37km should feel easy. Most people blow up on Claife Heights if they go out hard",
    ],
  },
];
const trainingGaps = [
  { gap: "Elevation", detail: "Burscough is ~33m ASL. You need 500–1,500m per week in training. Get to Winter Hill, Bowland, or the Lakes every weekend.", urgency: "high" },
  { gap: "Back-to-back long runs", detail: "Saturday + Sunday long efforts simulate multi-hour race fatigue far better than one big run per week.", urgency: "high" },
  { gap: "Navigation", detail: "UTYD and Spine Sprint both require map & compass competence. Book a navigation skills day in September.", urgency: "med" },
  { gap: "Night running", detail: "Spine Sprint will involve running through the night in January. Start adding night sessions from November at the latest.", urgency: "med" },
  { gap: "Winter kit", detail: "Spine Sprint kit list is expedition-level. Every item needs field testing before January — not just in your hallway.", urgency: "med" },
  { gap: "Cadence on climbs", detail: "Currently drops to ~55spm on steep terrain. Work on maintaining 65–70spm uphill — more efficient, less muscle fatigue.", urgency: "low" },
];
export default function TrainingPlan() {
  const [activePhase, setActivePhase] = useState(0);
  const phase = phases[activePhase];
  return (
    <div style={{ background: "#0f1117", minHeight: "100vh", color: "#e2e8f0", fontFamily: "'Inter', system-ui, sans-serif", maxWidth: 680, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ padding: "32px 24px 20px", borderBottom: "1px solid #1e2433" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#64748b", textTransform: "uppercase", marginBottom: 8 }}>Burscough → The Lap</div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#f8fafc", lineHeight: 1.2 }}>Race Training Plan</h1>
        <div style={{ marginTop: 8, fontSize: 13, color: "#94a3b8" }}>Jun 2026 – May 2027 · 5 races · 11 months</div>
      </div>
      {/* Race timeline */}
      <div style={{ padding: "20px 24px 0" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.12em", color: "#475569", textTransform: "uppercase", marginBottom: 14 }}>Race Calendar</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {races.map((r, i) => (
            <div key={i} onClick={() => setActivePhase(i)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 8, background: activePhase === i ? "#1a1f2e" : "transparent", cursor: "pointer", border: activePhase === i ? `1px solid ${r.color}33` : "1px solid transparent", transition: "all 0.15s" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: r.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: activePhase === i ? "#f1f5f9" : "#cbd5e1" }}>{r.name}</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{r.date} · {r.dist} · {r.vert}</div>
              </div>
              {activePhase === i && <div style={{ fontSize: 11, color: r.color }}>▶</div>}
            </div>
          ))}
        </div>
      </div>
      {/* Phase detail */}
      <div style={{ padding: "24px 24px 0" }}>
        <div style={{ background: "#141824", border: `1px solid ${phase.color}33`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "16px 18px", borderBottom: `1px solid ${phase.color}22`, background: `${phase.color}08` }}>
            <div style={{ fontSize: 10, letterSpacing: "0.15em", color: phase.color, textTransform: "uppercase", marginBottom: 4 }}>{phase.label} · {phase.dates}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc" }}>{phase.title}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Focus: {phase.focus}</div>
          </div>

          <div style={{ padding: "16px 18px" }}>
            <p style={{ margin: "0 0 18px", fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{phase.description}</p>
            {/* Weekly structure */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.12em", color: "#475569", textTransform: "uppercase", marginBottom: 10 }}>Weekly Structure</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {phase.weekly.map((w, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, fontSize: 13 }}>
                    <div style={{ color: "#64748b", minWidth: 130, flexShrink: 0 }}>{w.label}</div>
                    <div style={{ color: "#cbd5e1", fontWeight: 500 }}>{w.value}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Locations */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.12em", color: "#475569", textTransform: "uppercase", marginBottom: 10 }}>Training Locations from Burscough</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {phase.locations.map((l, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>
                    <span style={{ color: phase.color, flexShrink: 0, marginTop: 1 }}>→</span>
                    <span>{l}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Key tips */}
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.12em", color: "#475569", textTransform: "uppercase", marginBottom: 10 }}>Key Tips for This Phase</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {phase.keyTips.map((t, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>
                    <span style={{ color: phase.color, flexShrink: 0, fontWeight: 700, marginTop: 1 }}>·</span>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Training gaps */}
      <div style={{ padding: "28px 24px 0" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.12em", color: "#475569", textTransform: "uppercase", marginBottom: 14 }}>Gaps to Close (Based on Your Strava)</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {trainingGaps.map((g, i) => {
            const urgencyColor = g.urgency === "high" ? "#f87171" : g.urgency === "med" ? "#fb923c" : "#facc15";
            const urgencyLabel = g.urgency === "high" ? "Priority" : g.urgency === "med" ? "Important" : "Nice to have";
            return (
              <div key={i} style={{ background: "#141824", borderRadius: 8, padding: "12px 14px", border: "1px solid #1e2433" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{g.gap}</div>
                  <div style={{ fontSize: 10, color: urgencyColor, background: `${urgencyColor}15`, padding: "2px 7px", borderRadius: 20, letterSpacing: "0.08em" }}>{urgencyLabel}</div>
                </div>
                <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{g.detail}</div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Footer note */}
      <div style={{ padding: "24px 24px 40px" }}>
        <div style={{ background: "#141824", borderRadius: 8, padding: "14px 16px", border: "1px solid #1e2433" }}>
          <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.6 }}>
            <span style={{ color: "#64748b", fontWeight: 600 }}>Note on Spine Sprint entry: </span>
            You'll need a completed 30-mile event to qualify. Tittesworth ticks that box. Entries for Spine Sprint South 2027 open later this year — don't sleep on it.
          </div>
        </div>
      </div>
    </div>
  );
}
