import React from "react";
import { useCurrentFrame, interpolate, staticFile, Img } from "remotion";
import { FadeIn } from "../components/FadeIn";
import { TypeWriter } from "../components/TypeWriter";
import { theme } from "../theme";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const projects = [
  { name: "Tbilisi Residential", status: "active", elements: 360, progress: 0.72, c30: 802, c40: 38 },
  { name: "Rustavi Warehouse", status: "active", elements: 161, progress: 0.45, c30: 340, c40: 120 },
  { name: "Batumi Hotel", status: "active", elements: 420, progress: 0.28, c30: 510, c40: 85 },
];

const costData = [
  { label: "Tbilisi\nResidential", estimated: 420, actual: 395 },
  { label: "Rustavi\nWarehouse", estimated: 280, actual: 265 },
  { label: "Batumi\nHotel", estimated: 510, actual: 490 },
  { label: "Kutaisi\nIndustrial", estimated: 340, actual: 391 },
  { label: "Zugdidi\nSchool", estimated: 195, actual: 188 },
];

const engineers = [
  { name: "Nika", panels: 127, avgTime: 3.8, autoApprove: 72, avatar: "N" },
  { name: "Dato", panels: 98, avgTime: 5.2, autoApprove: 61, avatar: "D" },
  { name: "Giorgi", panels: 84, avgTime: 4.5, autoApprove: 68, avatar: "G" },
];

const maxBarValue = 520;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function KpiCard({
  label,
  value,
  suffix,
  color,
  startFrame,
  pulseFrame,
}: {
  label: string;
  value: number;
  suffix: string;
  color: string;
  startFrame: number;
  pulseFrame?: number;
}) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [startFrame, startFrame + 15], [0, 1], clamp);
  const countUp = Math.floor(interpolate(frame, [startFrame + 5, startFrame + 35], [0, value], clamp));
  const isPulsing = pulseFrame !== undefined && frame >= pulseFrame && frame < pulseFrame + 20;
  const pulseScale = isPulsing
    ? interpolate(frame, [pulseFrame, pulseFrame + 10, pulseFrame + 20], [1, 1.05, 1], clamp)
    : 1;
  const pulseBorder = isPulsing ? color : theme.borderSubtle;

  return (
    <div
      style={{
        opacity,
        transform: `scale(${pulseScale}) translateY(${(1 - opacity) * 10}px)`,
        background: theme.bgElevated,
        border: `2px solid ${pulseBorder}`,
        borderRadius: 16,
        padding: "20px 24px",
        flex: 1,
        transition: "border-color 0.3s",
      }}
    >
      <div style={{ fontSize: 18, color: theme.textTertiary, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontSize: 40, fontWeight: 700, fontFamily: theme.fontMono, color }}>{countUp.toLocaleString()}</span>
        <span style={{ fontSize: 22, color: theme.textTertiary }}>{suffix}</span>
      </div>
    </div>
  );
}

function MiniDonut({
  segments,
  size,
  startFrame,
}: {
  segments: { value: number; color: string; label: string }[];
  size: number;
  startFrame: number;
}) {
  const frame = useCurrentFrame();
  const reveal = interpolate(frame, [startFrame, startFrame + 30], [0, 1], clamp);
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const r = size / 2 - 12;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  return (
    <div style={{ opacity: interpolate(frame, [startFrame, startFrame + 10], [0, 1], clamp) }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={theme.borderSubtle} strokeWidth={14} />
        {segments.map((seg) => {
          const segLen = (seg.value / total) * circumference * reveal;
          const dash = `${segLen} ${circumference}`;
          const rotation = -90 + (offset / total) * 360;
          offset += seg.value;
          return (
            <circle
              key={seg.label}
              cx={size / 2} cy={size / 2} r={r}
              fill="none" stroke={seg.color} strokeWidth={14}
              strokeDasharray={dash}
              strokeLinecap="round"
              transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
            />
          );
        })}
        <text x={size / 2} y={size / 2 - 6} textAnchor="middle" fill={theme.textPrimary} fontSize={24} fontWeight={700} fontFamily={theme.fontMono}>
          {Math.round(total).toLocaleString()}
        </text>
        <text x={size / 2} y={size / 2 + 18} textAnchor="middle" fill={theme.textTertiary} fontSize={14}>
          m³ total
        </text>
      </svg>
    </div>
  );
}

function ProgressRing({
  pct,
  size,
  color,
  label,
  startFrame,
}: {
  pct: number;
  size: number;
  color: string;
  label: string;
  startFrame: number;
}) {
  const frame = useCurrentFrame();
  const r = size / 2 - 8;
  const circumference = 2 * Math.PI * r;
  const progress = interpolate(frame, [startFrame, startFrame + 25], [0, pct / 100], clamp);
  const strokeDash = progress * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={theme.borderSubtle} strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${strokeDash} ${circumference}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x={size / 2} y={size / 2 + 1} textAnchor="middle" fill={theme.textPrimary} fontSize={18} fontWeight={700} fontFamily={theme.fontMono}>
        {Math.round(progress * 100)}%
      </text>
      <text x={size / 2} y={size / 2 + 18} textAnchor="middle" fill={theme.textTertiary} fontSize={11}>
        {label}
      </text>
    </svg>
  );
}

function ThinkingIndicator({ startFrame, doneFrame, thinkingText, doneText }: {
  startFrame: number; doneFrame: number; thinkingText: string; doneText: string;
}) {
  const frame = useCurrentFrame();
  if (frame < startFrame) return null;
  const done = frame >= doneFrame;
  const opacity = interpolate(frame, [startFrame, startFrame + 8], [0, 1], clamp);
  return (
    <div style={{ opacity, display: "flex", justifyContent: "flex-start", marginBottom: 20 }}>
      <div style={{
        background: theme.bgElevated, border: `1px solid ${theme.borderSubtle}`,
        borderRadius: 16, padding: "10px 24px", fontFamily: theme.fontMono,
        fontSize: 22, color: done ? theme.green : theme.textTertiary,
      }}>
        {done ? `✓ ${doneText}` : `⚙ ${thinkingText}`}
      </div>
    </div>
  );
}

function UserBubble({ text, startFrame }: { text: string; startFrame: number }) {
  const frame = useCurrentFrame();
  if (frame < startFrame) return null;
  const opacity = interpolate(frame, [startFrame, startFrame + 8], [0, 1], clamp);
  return (
    <div style={{ opacity, display: "flex", justifyContent: "flex-end", marginBottom: 28 }}>
      <div style={{
        background: theme.accent, color: "#FFF", borderRadius: "32px 32px 8px 32px",
        padding: "18px 32px", maxWidth: 1600, fontSize: 28, lineHeight: 1.5,
      }}>
        <TypeWriter text={text} startFrame={startFrame} charsPerFrame={1.2} style={{ color: "#FFF", fontSize: 28 }} />
      </div>
    </div>
  );
}

function AnimatedRow({ children, startFrame, style }: {
  children: React.ReactNode; startFrame: number; style?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [startFrame, startFrame + 12], [0, 1], clamp);
  const tx = interpolate(frame, [startFrame, startFrame + 12], [16, 0], clamp);
  return <div style={{ opacity, transform: `translateX(${tx}px)`, ...style }}>{children}</div>;
}

/* ------------------------------------------------------------------ */
/*  Main Scene                                                         */
/* ------------------------------------------------------------------ */

export const RunTheBusiness: React.FC = () => {
  const frame = useCurrentFrame();

  const sceneOpacity = interpolate(frame, [0, 20], [0, 1], clamp);
  const closingFadeOut = interpolate(frame, [2580, 2640], [1, 0], clamp);
  const chatDim = interpolate(frame, [2380, 2410], [1, 0.2], clamp);
  const closingOverlayOpacity = interpolate(frame, [2380, 2420], [0, 1], clamp);

  // Scroll the chat content — spread across the full 88s
  const scrollY = interpolate(
    frame,
    [0, 700, 730, 1350, 1380, 1900, 1930, 2380],
    [0, 0, -650, -650, -1400, -1400, -2100, -2100],
    clamp,
  );

  // Sidebar KPI pulse frames (when related question is asked)
  const concretePulse = 420;  // Q1 response arrives
  const costPulse = 1100;      // Q2 response arrives
  const teamPulse = 1650;      // Q3 response arrives

  // Sidebar project progress animations
  const sidebarReveal = interpolate(frame, [0, 30], [0, 1], clamp);

  return (
    <div
      style={{
        width: 3840, height: 2160, background: theme.bgApp, fontFamily: theme.fontUi,
        display: "flex", flexDirection: "column", opacity: sceneOpacity * closingFadeOut,
        position: "relative", overflow: "hidden",
      }}
    >
      {/* ──── Top Bar ──── */}
      <div style={{
        height: 88, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px", borderBottom: `1px solid ${theme.borderDefault}`,
        flexShrink: 0, zIndex: 10, background: theme.bgSidebar,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Img src={staticFile("assets/logo.png")} style={{ width: 48, height: 48 }} />
          <span style={{ fontSize: 26, color: theme.textPrimary, fontWeight: 600 }}>Buildable</span>
          <span style={{ color: theme.borderStrong, margin: "0 12px" }}>|</span>
          <span style={{ fontSize: 24, color: theme.textSecondary }}>Intelligence</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            background: theme.accentGlow, color: theme.accent, fontSize: 20,
            fontFamily: theme.fontMono, padding: "6px 18px", borderRadius: 24, fontWeight: 500,
            border: `1px solid ${theme.accentDim}`,
          }}>
            Claude Sonnet
          </div>
          <div style={{
            background: theme.greenDim, color: theme.green, fontSize: 20,
            fontFamily: theme.fontMono, padding: "6px 18px", borderRadius: 24, fontWeight: 500,
            border: `1px solid rgba(52,211,153,0.3)`,
          }}>
            3 Active Projects
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* ──── Left Sidebar — Live Dashboard ──── */}
        <div style={{
          width: 560, borderRight: `1px solid ${theme.borderDefault}`, background: theme.bgSidebar,
          display: "flex", flexDirection: "column", padding: "0", flexShrink: 0,
          opacity: sidebarReveal,
        }}>
          {/* KPI Cards */}
          <div style={{ display: "flex", gap: 12, padding: "24px 24px 16px" }}>
            <KpiCard label="Concrete" value={1895} suffix="m³" color={theme.accent} startFrame={15} pulseFrame={concretePulse} />
            <KpiCard label="Elements" value={941} suffix="pcs" color={theme.violet} startFrame={20} pulseFrame={teamPulse} />
          </div>
          <div style={{ display: "flex", gap: 12, padding: "0 24px 20px" }}>
            <KpiCard label="Engineers" value={3} suffix="active" color={theme.green} startFrame={25} pulseFrame={teamPulse} />
            <KpiCard label="Avg Cost" value={97} suffix="₾/m²" color={theme.amber} startFrame={30} pulseFrame={costPulse} />
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: theme.borderDefault, margin: "0 24px" }} />

          {/* Active Projects List */}
          <div style={{ padding: "20px 24px" }}>
            <div style={{ fontSize: 16, color: theme.textTertiary, textTransform: "uppercase", letterSpacing: 2, marginBottom: 16 }}>
              Active Projects
            </div>
            {projects.map((p, i) => {
              const rowStart = 35 + i * 12;
              const rowOp = interpolate(frame, [rowStart, rowStart + 12], [0, 1], clamp);
              const progressWidth = interpolate(frame, [rowStart + 10, rowStart + 35], [0, p.progress * 100], clamp);
              return (
                <div key={p.name} style={{ opacity: rowOp, marginBottom: 16, transform: `translateX(${(1 - rowOp) * -12}px)` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 4, background: theme.green }} />
                      <span style={{ fontSize: 20, color: theme.textPrimary }}>{p.name}</span>
                    </div>
                    <span style={{ fontSize: 18, fontFamily: theme.fontMono, color: theme.textTertiary }}>
                      {p.elements} el.
                    </span>
                  </div>
                  <div style={{ height: 6, background: theme.bgActive, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${progressWidth}%`, background: theme.accent, borderRadius: 3 }} />
                  </div>
                  <div style={{ fontSize: 16, color: theme.textGhost, marginTop: 3, textAlign: "right", fontFamily: theme.fontMono }}>
                    {Math.round(progressWidth)}%
                  </div>
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: theme.borderDefault, margin: "0 24px" }} />

          {/* Concrete Mix Donut */}
          <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontSize: 16, color: theme.textTertiary, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12, alignSelf: "flex-start" }}>
              Concrete Grade Mix
            </div>
            <MiniDonut
              size={160}
              startFrame={50}
              segments={[
                { value: 1652, color: theme.accent, label: "C30/37" },
                { value: 243, color: theme.violet, label: "C40/50" },
              ]}
            />
            <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: theme.accent }} />
                <span style={{ fontSize: 16, color: theme.textTertiary }}>C30/37</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: theme.violet }} />
                <span style={{ fontSize: 16, color: theme.textTertiary }}>C40/50</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: theme.borderDefault, margin: "0 24px" }} />

          {/* Team Utilization Rings */}
          <div style={{ padding: "20px 24px" }}>
            <div style={{ fontSize: 16, color: theme.textTertiary, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>
              Team Auto-Approve
            </div>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              {engineers.map((eng, i) => (
                <div key={eng.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <ProgressRing
                    pct={eng.autoApprove}
                    size={72}
                    color={eng.autoApprove >= 70 ? theme.green : eng.autoApprove >= 65 ? theme.amber : theme.accent}
                    label=""
                    startFrame={60 + i * 8}
                  />
                  <span style={{ fontSize: 16, color: theme.textSecondary }}>{eng.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ──── Main Chat Area ──── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
          <div
            style={{
              flex: 1, overflow: "hidden", position: "relative",
            }}
          >
            <div
              style={{
                transform: `translateY(${scrollY}px)`,
                maxWidth: 2600, margin: "0 auto", padding: "36px 56px",
                opacity: chatDim,
              }}
            >
              {/* ═══════ Q1: Concrete Requirements ═══════ */}
              <div style={{ marginBottom: 40 }}>
                <UserBubble
                  text="How much concrete do we need for all active projects this quarter?"
                  startFrame={90}
                />
                <ThinkingIndicator startFrame={215} doneFrame={255} thinkingText="Aggregating project data..." doneText="Analysis complete" />

                {frame >= 260 && (
                  <div style={{
                    borderLeft: `4px solid ${theme.accentDim}`, padding: "20px 28px", marginBottom: 20,
                    opacity: interpolate(frame, [260, 270], [0, 1], clamp),
                  }}>
                    <div style={{ fontSize: 20, color: theme.textTertiary, textTransform: "uppercase", letterSpacing: 2, marginBottom: 20 }}>
                      Active Projects — Q2 2026 Concrete Requirements
                    </div>

                    {/* Table */}
                    {frame >= 265 && (
                      <div style={{ display: "grid", gridTemplateColumns: "440px 180px 180px 180px", marginBottom: 8 }}>
                        {["Project", "C30/37", "C40/50", "Total"].map((h, i) => (
                          <div key={h} style={{ fontSize: 20, color: theme.textTertiary, fontFamily: theme.fontMono, textAlign: i === 0 ? "left" : "right", paddingBottom: 10, borderBottom: `1px solid ${theme.borderSubtle}` }}>{h}</div>
                        ))}
                      </div>
                    )}
                    {projects.map((row, idx) => (
                      <AnimatedRow key={row.name} startFrame={275 + idx * 25}>
                        <div style={{ display: "grid", gridTemplateColumns: "440px 180px 180px 180px", padding: "10px 0", borderBottom: idx === projects.length - 1 ? `1px solid ${theme.borderSubtle}` : "none" }}>
                          <div style={{ fontSize: 24, color: theme.textPrimary }}>{row.name}</div>
                          <div style={{ fontSize: 24, color: theme.textSecondary, fontFamily: theme.fontMono, textAlign: "right" }}>{row.c30} m³</div>
                          <div style={{ fontSize: 24, color: theme.textSecondary, fontFamily: theme.fontMono, textAlign: "right" }}>{row.c40} m³</div>
                          <div style={{ fontSize: 24, color: theme.textSecondary, fontFamily: theme.fontMono, textAlign: "right" }}>{row.c30 + row.c40} m³</div>
                        </div>
                      </AnimatedRow>
                    ))}

                    {/* Total */}
                    {frame >= 350 && (
                      <AnimatedRow startFrame={350}>
                        <div style={{ display: "grid", gridTemplateColumns: "440px 180px 180px 180px", padding: "10px 0" }}>
                          <div style={{ fontSize: 24, color: theme.textPrimary, fontWeight: 600 }}>Total</div>
                          <div style={{ fontSize: 24, color: theme.textPrimary, fontFamily: theme.fontMono, fontWeight: 600, textAlign: "right" }}>1,652 m³</div>
                          <div style={{ fontSize: 24, color: theme.textPrimary, fontFamily: theme.fontMono, fontWeight: 600, textAlign: "right" }}>243 m³</div>
                          <div style={{ fontSize: 24, color: theme.textPrimary, fontFamily: theme.fontMono, fontWeight: 600, textAlign: "right" }}>1,895 m³</div>
                        </div>
                      </AnimatedRow>
                    )}

                    {/* Horizontal volume bars */}
                    {frame >= 365 && (
                      <div style={{ marginTop: 24, opacity: interpolate(frame, [365, 378], [0, 1], clamp) }}>
                        {projects.map((p, idx) => {
                          const barStart = 370 + idx * 10;
                          const barScale = interpolate(frame, [barStart, barStart + 18], [0, 1], clamp);
                          const maxTotal = 1895;
                          const barW = 1400;
                          const c30w = (p.c30 / maxTotal) * barW;
                          const c40w = (p.c40 / maxTotal) * barW;
                          return (
                            <div key={p.name} style={{ marginBottom: 10 }}>
                              <div style={{ fontSize: 18, color: theme.textTertiary, marginBottom: 4 }}>{p.name}</div>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ display: "flex", height: 22, borderRadius: 4, overflow: "hidden", transformOrigin: "left", transform: `scaleX(${barScale})` }}>
                                  <div style={{ width: c30w, background: theme.accent }} />
                                  <div style={{ width: c40w, background: theme.violet }} />
                                </div>
                                <span style={{ fontSize: 20, fontFamily: theme.fontMono, color: theme.textTertiary, opacity: barScale }}>{p.c30 + p.c40} m³</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Recommendation */}
                    <FadeIn startFrame={400} duration={18} slideY={10} style={{ marginTop: 20 }}>
                      <div style={{
                        fontSize: 26, color: theme.textSecondary, lineHeight: 1.6,
                        background: theme.greenDim, border: `1px solid rgba(52,211,153,0.2)`,
                        borderRadius: 12, padding: "16px 24px",
                      }}>
                        Bulk ordering at <span style={{ color: theme.green, fontWeight: 600 }}>1,900 m³</span> qualifies for <span style={{ color: theme.green, fontWeight: 600 }}>8% volume discount</span> — saving approximately <span style={{ color: theme.green, fontWeight: 600 }}>45,600 ₾</span>.
                      </div>
                    </FadeIn>
                  </div>
                )}
              </div>

              {/* ═══════ Q2: Cost vs Actual ═══════ */}
              <div style={{ marginBottom: 40 }}>
                <UserBubble text="Compare our cost estimates vs actual costs on completed projects." startFrame={730} />
                <ThinkingIndicator startFrame={865} doneFrame={900} thinkingText="Comparing project financials..." doneText="Comparison ready" />

                {frame >= 905 && (
                  <div style={{
                    borderLeft: `4px solid ${theme.accentDim}`, padding: "20px 28px", marginBottom: 20,
                    opacity: interpolate(frame, [905, 915], [0, 1], clamp),
                  }}>
                    {/* Legend */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                      <div style={{ fontSize: 20, color: theme.textTertiary, textTransform: "uppercase", letterSpacing: 2 }}>
                        Estimated vs Actual Cost (K ₾)
                      </div>
                      <div style={{ display: "flex", gap: 24 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 14, height: 14, background: theme.accent, borderRadius: 3 }} />
                          <span style={{ fontSize: 18, color: theme.textTertiary }}>Estimated</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 14, height: 14, background: theme.green, borderRadius: 3 }} />
                          <span style={{ fontSize: 18, color: theme.textTertiary }}>Actual</span>
                        </div>
                      </div>
                    </div>

                    {/* Chart */}
                    <div style={{ position: "relative", width: 2000, height: 420, marginBottom: 50 }}>
                      {/* Grid lines + labels */}
                      {[0, 130, 260, 390, 520].map((val, i) => (
                        <React.Fragment key={val}>
                          <div style={{ position: "absolute", bottom: (val / maxBarValue) * 420, left: 0, right: 0, height: 1, background: i === 0 ? theme.borderDefault : theme.borderSubtle }} />
                          {i > 0 && (
                            <div style={{ position: "absolute", bottom: (val / maxBarValue) * 420 - 8, left: -50, fontSize: 16, color: theme.textGhost, fontFamily: theme.fontMono }}>
                              {val}
                            </div>
                          )}
                        </React.Fragment>
                      ))}

                      {costData.map((d, idx) => {
                        const groupStart = 915 + idx * 12;
                        const estH = interpolate(frame, [groupStart, groupStart + 18], [0, (d.estimated / maxBarValue) * 420], clamp);
                        const actH = interpolate(frame, [groupStart + 6, groupStart + 24], [0, (d.actual / maxBarValue) * 420], clamp);
                        const overBudget = d.actual > d.estimated;
                        const groupX = idx * (2000 / 5) + (2000 / 5 - 120) / 2;
                        return (
                          <React.Fragment key={idx}>
                            <div style={{ position: "absolute", bottom: 0, left: groupX, width: 52, height: estH, background: theme.accent, borderRadius: "5px 5px 0 0" }} />
                            <div style={{ position: "absolute", bottom: 0, left: groupX + 60, width: 52, height: actH, background: overBudget ? theme.error : theme.green, borderRadius: "5px 5px 0 0" }} />
                            {/* Value labels on top of bars */}
                            {estH > 20 && <div style={{ position: "absolute", bottom: estH + 4, left: groupX, width: 52, textAlign: "center", fontSize: 16, fontFamily: theme.fontMono, color: theme.textTertiary }}>{d.estimated}</div>}
                            {actH > 20 && <div style={{ position: "absolute", bottom: actH + 4, left: groupX + 60, width: 52, textAlign: "center", fontSize: 16, fontFamily: theme.fontMono, color: overBudget ? theme.error : theme.textTertiary }}>{d.actual}</div>}
                            <div style={{ position: "absolute", bottom: -44, left: groupX - 10, width: 132, textAlign: "center", fontSize: 19, color: theme.textSecondary, whiteSpace: "pre-line", lineHeight: 1.2 }}>{d.label}</div>
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Variance indicator for Kutaisi */}
                    <FadeIn startFrame={990} duration={15} slideY={8}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 12, marginBottom: 16,
                        background: "rgba(248,113,113,0.08)", border: `1px solid rgba(248,113,113,0.2)`,
                        borderRadius: 12, padding: "14px 20px",
                      }}>
                        <div style={{ width: 36, height: 36, borderRadius: 18, background: "rgba(248,113,113,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: theme.error, fontWeight: 700 }}>!</div>
                        <div style={{ fontSize: 24, color: theme.textSecondary, lineHeight: 1.5 }}>
                          <strong style={{ color: theme.error }}>Kutaisi Industrial</strong> exceeded estimate by <strong style={{ color: theme.error }}>15%</strong> — rebar underestimated by 22% due to seismic reinforcement.
                        </div>
                      </div>
                    </FadeIn>
                    <FadeIn startFrame={1020} duration={15} slideY={8}>
                      <div style={{ fontSize: 24, color: theme.textSecondary, lineHeight: 1.5 }}>
                        Recommendation: update seismic rebar ratios from <span style={{ color: theme.green, fontWeight: 600, fontFamily: theme.fontMono }}>85 → 105 kg/m³</span> for zone III.
                      </div>
                    </FadeIn>
                  </div>
                )}
              </div>

              {/* ═══════ Q3: Engineer Productivity ═══════ */}
              <div style={{ marginBottom: 40 }}>
                <UserBubble text="Which engineer is most productive this month?" startFrame={1380} />
                <ThinkingIndicator startFrame={1495} doneFrame={1530} thinkingText="Analyzing performance data..." doneText="Report ready" />

                {frame >= 1535 && (
                  <div style={{
                    borderLeft: `4px solid ${theme.accentDim}`, padding: "20px 28px", marginBottom: 20,
                    opacity: interpolate(frame, [1535, 1545], [0, 1], clamp),
                  }}>
                    <div style={{ fontSize: 20, color: theme.textTertiary, textTransform: "uppercase", letterSpacing: 2, marginBottom: 20 }}>
                      Engineer Performance — March 2026
                    </div>

                    {/* Engineer Cards */}
                    <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
                      {engineers.map((eng, idx) => {
                        const cardStart = 1540 + idx * 12;
                        const cardOp = interpolate(frame, [cardStart, cardStart + 15], [0, 1], clamp);
                        const panelBar = interpolate(frame, [cardStart + 8, cardStart + 28], [0, (eng.panels / 127) * 100], clamp);
                        const ringColor = eng.autoApprove >= 70 ? theme.green : eng.autoApprove >= 65 ? theme.amber : theme.accent;
                        const isTop = eng.panels === 127;
                        return (
                          <div key={eng.name} style={{
                            opacity: cardOp, transform: `translateY(${(1 - cardOp) * 10}px)`,
                            background: isTop ? "rgba(52,211,153,0.05)" : theme.bgElevated,
                            border: `2px solid ${isTop ? "rgba(52,211,153,0.2)" : theme.borderSubtle}`,
                            borderRadius: 16, padding: "28px 32px", flex: 1,
                            display: "flex", flexDirection: "column", gap: 16,
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{
                                  width: 44, height: 44, borderRadius: 22,
                                  background: isTop ? theme.green : theme.bgActive,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: 22, fontWeight: 700, color: isTop ? "#FFF" : theme.textSecondary,
                                }}>{eng.avatar}</div>
                                <span style={{ fontSize: 26, color: theme.textPrimary, fontWeight: 600 }}>{eng.name}</span>
                              </div>
                              {isTop && (
                                <div style={{ fontSize: 18, color: theme.green, fontFamily: theme.fontMono, background: theme.greenDim, padding: "4px 12px", borderRadius: 8 }}>TOP</div>
                              )}
                            </div>

                            {/* Panels bar */}
                            <div>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                <span style={{ fontSize: 18, color: theme.textTertiary }}>Panels detailed</span>
                                <span style={{ fontSize: 22, fontFamily: theme.fontMono, color: theme.textPrimary, fontWeight: 600 }}>{eng.panels}</span>
                              </div>
                              <div style={{ height: 10, background: theme.bgActive, borderRadius: 5, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${panelBar}%`, background: ringColor, borderRadius: 5 }} />
                              </div>
                            </div>

                            {/* Stats row */}
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <div>
                                <div style={{ fontSize: 16, color: theme.textTertiary }}>Avg Time</div>
                                <div style={{ fontSize: 22, fontFamily: theme.fontMono, color: theme.textPrimary }}>{eng.avgTime} min</div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: 16, color: theme.textTertiary }}>Auto-Approve</div>
                                <div style={{ fontSize: 22, fontFamily: theme.fontMono, color: ringColor, fontWeight: 600 }}>{eng.autoApprove}%</div>
                              </div>
                            </div>

                            {/* Auto-approve ring */}
                            <div style={{ display: "flex", justifyContent: "center" }}>
                              <ProgressRing pct={eng.autoApprove} size={80} color={ringColor} label="approve" startFrame={cardStart + 10} />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <FadeIn startFrame={1610} duration={18} slideY={8}>
                      <div style={{ fontSize: 24, color: theme.textSecondary, lineHeight: 1.6 }}>
                        Nika&apos;s higher auto-approve rate correlates with consistent use of standard edge profiles. Dato&apos;s corrections are primarily dimension adjustments — suggest <span style={{ color: theme.textPrimary, fontWeight: 500 }}>standardizing dimension templates</span>.
                      </div>
                    </FadeIn>
                  </div>
                )}
              </div>

              {/* ═══════ Q4: Capacity Planning ═══════ */}
              <div style={{ marginBottom: 40 }}>
                <UserBubble text="Can we take on the Zugdidi school project? We quoted 45 days." startFrame={1930} />
                <ThinkingIndicator startFrame={2045} doneFrame={2080} thinkingText="Calculating team capacity..." doneText="Analysis complete" />

                {frame >= 2085 && (
                  <div style={{
                    borderLeft: `4px solid ${theme.accentDim}`, padding: "20px 28px", marginBottom: 20,
                    opacity: interpolate(frame, [2085, 2095], [0, 1], clamp),
                  }}>
                    {/* Key metrics cards */}
                    <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                      {[
                        { label: "Team Capacity", value: "38 panels/day", icon: "⚡" },
                        { label: "Zugdidi Scope", value: "340 elements", icon: "🏗" },
                        { label: "Detailing Time", value: "9 work days", icon: "📅" },
                      ].map((card, i) => (
                        <FadeIn key={card.label} startFrame={2088 + i * 8} duration={12} slideY={6}>
                          <div style={{
                            background: theme.bgElevated, border: `1px solid ${theme.borderSubtle}`,
                            borderRadius: 12, padding: "16px 20px", width: 280,
                          }}>
                            <div style={{ fontSize: 16, color: theme.textTertiary, marginBottom: 6 }}>{card.icon} {card.label}</div>
                            <div style={{ fontSize: 26, fontFamily: theme.fontMono, color: theme.textPrimary, fontWeight: 600 }}>{card.value}</div>
                          </div>
                        </FadeIn>
                      ))}
                    </div>

                    <FadeIn startFrame={2120} duration={12} slideY={6}>
                      <div style={{ fontSize: 24, color: theme.textSecondary, lineHeight: 1.6, marginBottom: 12 }}>
                        Team is <span style={{ color: theme.amber, fontWeight: 600 }}>60% allocated</span> to Batumi Hotel (completion: <span style={{ color: theme.textPrimary, fontWeight: 600 }}>April 18</span>). Realistic Zugdidi start: <span style={{ color: theme.textPrimary, fontWeight: 600 }}>April 21</span>.
                      </div>
                    </FadeIn>

                    {/* Gantt Timeline */}
                    {frame >= 2135 && (() => {
                      const totalDays = 44;
                      const tlW = 1800;
                      const dayToX = (day: number) => (day / totalDays) * tlW;
                      const markers = [
                        { label: "Apr 1", day: 0 }, { label: "Apr 10", day: 9 },
                        { label: "Apr 18", day: 17 }, { label: "Apr 21", day: 20 },
                        { label: "May 2", day: 31 }, { label: "May 15", day: 44 },
                      ];
                      const batumiScale = interpolate(frame, [2140, 2165], [0, 1], clamp);
                      const zugdidiScale = interpolate(frame, [2155, 2180], [0, 1], clamp);
                      const bufferOp = interpolate(frame, [2170, 2185], [0, 1], clamp);
                      return (
                        <div style={{ marginTop: 16, width: tlW, position: "relative", height: 200, opacity: interpolate(frame, [2135, 2145], [0, 1], clamp) }}>
                          {/* Timeline axis */}
                          <div style={{ position: "absolute", top: 28, left: 0, right: 0, height: 1, background: theme.borderDefault }} />
                          {markers.map((m) => (
                            <React.Fragment key={m.label}>
                              <div style={{ position: "absolute", left: dayToX(m.day), top: 22, width: 1, height: 12, background: theme.textGhost }} />
                              <div style={{ position: "absolute", left: dayToX(m.day), top: 0, fontSize: 17, color: theme.textTertiary, transform: "translateX(-50%)", fontFamily: theme.fontMono }}>{m.label}</div>
                            </React.Fragment>
                          ))}
                          {/* Batumi */}
                          <div style={{
                            position: "absolute", top: 56, left: dayToX(0), width: dayToX(17), height: 44,
                            background: theme.accent, borderRadius: 8, transform: `scaleX(${batumiScale})`,
                            transformOrigin: "left", display: "flex", alignItems: "center", paddingLeft: 14,
                          }}>
                            <span style={{ color: "#FFF", fontSize: 20, fontWeight: 500, opacity: batumiScale }}>Batumi Hotel</span>
                          </div>
                          {/* Zugdidi */}
                          <div style={{
                            position: "absolute", top: 112, left: dayToX(20), width: dayToX(31) - dayToX(20), height: 44,
                            background: theme.green, borderRadius: 8, transform: `scaleX(${zugdidiScale})`,
                            transformOrigin: "left", display: "flex", alignItems: "center", paddingLeft: 14,
                          }}>
                            <span style={{ color: "#FFF", fontSize: 20, fontWeight: 500, opacity: zugdidiScale }}>Zugdidi School</span>
                          </div>
                          {/* Buffer */}
                          <div style={{
                            position: "absolute", top: 112, left: dayToX(31), width: dayToX(44) - dayToX(31), height: 44,
                            border: `2px dashed ${theme.amber}`, borderRadius: 8, opacity: bufferOp,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <span style={{ color: theme.amber, fontSize: 18, fontFamily: theme.fontMono }}>13d buffer</span>
                          </div>
                          {/* Deadline marker */}
                          <div style={{
                            position: "absolute", top: 50, left: dayToX(44), width: 2, height: 112,
                            background: theme.error, opacity: bufferOp * 0.6,
                          }} />
                          <div style={{
                            position: "absolute", top: 168, left: dayToX(44), transform: "translateX(-50%)",
                            fontSize: 16, color: theme.error, fontFamily: theme.fontMono, opacity: bufferOp,
                          }}>DEADLINE</div>
                        </div>
                      );
                    })()}

                    {/* Recommendation pill */}
                    <FadeIn startFrame={2190} duration={12} slideY={6} style={{ marginTop: 28 }}>
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 10,
                        background: theme.greenDim, color: theme.green, fontSize: 26, fontWeight: 600,
                        padding: "14px 28px", borderRadius: 16, border: `1px solid rgba(52,211,153,0.3)`,
                      }}>
                        <span style={{ fontSize: 28 }}>✓</span> Recommendation: Accept the project
                      </div>
                    </FadeIn>
                  </div>
                )}
              </div>
            </div>

            {/* ──── Closing Overlay ──── */}
            {frame >= 2380 && (
              <div style={{
                position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", opacity: closingOverlayOpacity,
                zIndex: 20, background: `rgba(10,10,12,0.85)`,
              }}>
                <FadeIn startFrame={2410} duration={18} slideY={14}>
                  <div style={{ fontSize: 48, color: theme.textPrimary, fontWeight: 300, textAlign: "center", maxWidth: 2000, lineHeight: 1.5 }}>
                    Every project, every panel, every correction — all connected.
                  </div>
                </FadeIn>
                <FadeIn startFrame={2440} duration={18} slideY={14}>
                  <div style={{ fontSize: 34, color: theme.textSecondary, textAlign: "center", maxWidth: 2000, marginTop: 20, lineHeight: 1.5 }}>
                    Your AI analyst doesn&apos;t forget, doesn&apos;t guess, and gets smarter every quarter.
                  </div>
                </FadeIn>
              </div>
            )}
          </div>

          {/* ──── Bottom Input Bar ──── */}
          <div style={{
            height: 80, display: "flex", alignItems: "center", padding: "0 48px",
            borderTop: `1px solid ${theme.borderDefault}`, flexShrink: 0, background: theme.bgApp,
          }}>
            <div style={{
              flex: 1, height: 52, background: theme.bgElevated, border: `1px solid ${theme.borderDefault}`,
              borderRadius: 24, display: "flex", alignItems: "center", padding: "0 24px", justifyContent: "space-between",
            }}>
              <span style={{ fontSize: 24, color: theme.textGhost }}>Ask about your projects...</span>
              <span style={{ fontSize: 26, color: theme.accent, fontWeight: 700 }}>↑</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
