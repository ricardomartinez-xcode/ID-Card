export type BorderStyle = "double" | "single" | "thick" | "none";
export type LogoPosition = "top" | "bottom" | "left";
export type BgColor = "fabric" | "midnight" | "forest" | "burgundy" | "graphite" | "sand" | "transparent";
export type LogoType = "text" | "image";
export type LogoTextMode = "joined" | "manual";
export type AccentMode = "none" | "last" | "alternate";
export type TextCaseMode = "uppercase" | "original";
export type LineType = "solid" | "dashed" | "dotted" | "double" | "groove" | "ridge";

export interface MatriculaStyle {
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  paddingX: number;
  paddingY: number;
}

export interface NombreStyle {
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  paddingX: number;
  paddingY: number;
}

export interface LogoStyle {
  fontSize: number;
  letterSpacing: number;
  gap: number;
  paddingX: number;
  paddingY: number;
  distanceToMatricula: number;
  segmentGap: number;
  strokePx: number;
  opacity: number;
}

export interface MatriculaLabelStyle {
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  opacity: number;
}

export interface DividerStyle {
  width: number;
  thickness: number;
  opacity: number;
  lineType: LineType;
}

export interface SurfaceStyle {
  radius: number;
  padding: number;
  shadow: number;
}

export interface PaletteStyle {
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  dividerColor: string;
  borderColor: string;
}

export interface LogoConfig {
  type: LogoType;
  text: string;
  manualText: string;
  segmentWeights: number[];
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  splitMode: LogoTextMode;
  accentMode: AccentMode;
  textCase: TextCaseMode;
}

export interface CredentialState {
  matricula: string;
  nombre: string;
  showBackground: boolean;
  exportSize: string;
  bgColor: BgColor;
  borderStyle: BorderStyle;
  logoPosition: LogoPosition;
  fontFamily: string;
  matriculaStyle: MatriculaStyle;
  nombreStyle: NombreStyle;
  logoStyle: LogoStyle;
  topDividerStyle: DividerStyle;
  bottomDividerStyle: DividerStyle;
  matriculaLabelStyle: MatriculaLabelStyle;
  logoConfig: LogoConfig;
  palette: PaletteStyle;
  surface: SurfaceStyle;
}

export const BG_COLORS: Record<BgColor, string> = {
  fabric: "#0f2d5c",
  midnight: "#14213d",
  forest: "#163127",
  burgundy: "#4b162b",
  graphite: "#1f2933",
  sand: "#d6c0a8",
  transparent: "transparent",
};

export const FONT_OPTIONS = [
  { value: "Inter", label: "Inter" },
  { value: "Oswald", label: "Oswald" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Roboto", label: "Roboto" },
  { value: "Bebas Neue", label: "Bebas Neue" },
  { value: "Playfair Display", label: "Playfair Display" },
];

export const WEIGHT_OPTIONS = [
  { value: 100, label: "UltraThin" },
  { value: 200, label: "Thin" },
  { value: 300, label: "Light" },
  { value: 400, label: "Regular" },
  { value: 500, label: "Medium" },
  { value: 600, label: "SemiBold" },
  { value: 700, label: "Bold" },
  { value: 800, label: "ExtraBold" },
  { value: 900, label: "Black" },
];

export const EXPORT_SIZES = [
  { value: "1x", label: "Normal (560 x 360)", scale: 1 },
  { value: "2x", label: "Alta (1120 x 720)", scale: 2 },
  { value: "3x", label: "HD (1680 x 1080)", scale: 3 },
  { value: "4x", label: "Ultra (2240 x 1440)", scale: 4 },
];

export const SCALE_MAP: Record<string, number> = Object.fromEntries(
  EXPORT_SIZES.map((item) => [item.value, item.scale]),
);

export const DEFAULT_CREDENTIAL_STATE: CredentialState = {
  matricula: "240001",
  nombre: "Andrea Lopez Rivera",
  showBackground: true,
  exportSize: "2x",
  bgColor: "fabric",
  borderStyle: "double",
  logoPosition: "top",
  fontFamily: "Inter",
  matriculaStyle: {
    fontSize: 74,
    fontWeight: 300,
    letterSpacing: 3,
    paddingX: 10,
    paddingY: 20,
  },
  nombreStyle: {
    fontSize: 16,
    fontWeight: 500,
    letterSpacing: 2.5,
    paddingX: 0,
    paddingY: 2,
  },
  logoStyle: {
    fontSize: 28,
    letterSpacing: 4,
    gap: 8,
    paddingX: 0,
    paddingY: 0,
    distanceToMatricula: 16,
    segmentGap: 8,
    strokePx: 10,
    opacity: 100,
  },
  topDividerStyle: {
    width: 62,
    thickness: 1.5,
    opacity: 65,
    lineType: "solid",
  },
  bottomDividerStyle: {
    width: 62,
    thickness: 1.5,
    opacity: 65,
    lineType: "solid",
  },
  matriculaLabelStyle: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 4,
    opacity: 80,
  },
  logoConfig: {
    type: "text",
    text: "UNIVERSIDAD",
    manualText: "UNI / VER / SI / DAD",
    segmentWeights: [700, 700, 700, 700],
    imageUrl: "",
    imageWidth: 120,
    imageHeight: 70,
    splitMode: "manual",
    accentMode: "last",
    textCase: "uppercase",
  },
  palette: {
    backgroundColor: BG_COLORS.fabric,
    textColor: "#f8fafc",
    accentColor: "#b7e44c",
    dividerColor: "#f8fafc",
    borderColor: "#ffffff",
  },
  surface: {
    radius: 22,
    padding: 18,
    shadow: 28,
  },
};

export const getLogoSegments = (config: LogoConfig) => {
  const baseText = config.text.trim();
  const transformedText =
    config.textCase === "uppercase" ? baseText.toUpperCase() : baseText;

  if (!transformedText) return [];

  if (config.splitMode === "joined") {
    return [transformedText];
  }

  return config.manualText
    .split(/[|/-]+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
};
