// Buildable brand theme — mirrors the app's CSS variables
export const theme = {
  // Surfaces
  bgVoid: "#0A0A0C",
  bgApp: "#0F1014",
  bgSidebar: "#141519",
  bgViewport: "#212830",
  bgSurface: "#1A1B21",
  bgElevated: "#1F2028",
  bgHover: "#252630",
  bgActive: "#2A2B36",

  // Borders
  borderFaint: "#1E1F28",
  borderSubtle: "#252630",
  borderDefault: "#2E2F3A",
  borderStrong: "#3A3B48",

  // Text
  textPrimary: "#E8E9ED",
  textSecondary: "#8B8D9A",
  textTertiary: "#565766",
  textGhost: "#3E3F4E",

  // Accents
  accent: "#4F8FF7",
  accentDim: "#3A6FD8",
  accentGlow: "rgba(79, 143, 247, 0.15)",
  accentGlowStrong: "rgba(79, 143, 247, 0.30)",

  green: "#34D399",
  greenDim: "rgba(52, 211, 153, 0.12)",
  amber: "#FBBF24",
  error: "#F87171",

  // 3D accent
  violet: "#9b7aff",

  // Fonts
  fontUi: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  fontMono: "'JetBrains Mono', 'SF Mono', monospace",
} as const;
