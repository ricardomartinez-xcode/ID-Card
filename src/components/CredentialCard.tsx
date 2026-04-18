import { forwardRef } from "react";
import cardBackground from "@/assets/card-background.jpg";
import {
  BG_COLORS,
  type CredentialState,
  type DividerStyle,
  getLogoSegments,
} from "@/lib/credential";

interface CredentialCardProps {
  state: CredentialState;
  scale?: number;
}

const BASE_WIDTH = 560;
const BASE_HEIGHT = 360;

const renderDivider = (
  style: DividerStyle,
  color: string,
  scale: number,
) => {
  const opacity = style.opacity / 100;
  const baseColor = color.startsWith("#") ? color : "#ffffff";
  const strokeColor = `${baseColor}${baseColor.length === 7 ? Math.round(opacity * 255).toString(16).padStart(2, "0") : ""}`;
  const shadowColor = `rgba(255,255,255,${Math.max(opacity - 0.18, 0.12)})`;
  const highlightColor = `rgba(255,255,255,${Math.min(opacity + 0.18, 1)})`;
  const strokeWidth = Math.max(style.thickness * scale, 1);
  const layered =
    style.lineType === "double" ||
    style.lineType === "groove" ||
    style.lineType === "ridge";
  const height = layered ? strokeWidth * 3 : strokeWidth + 2;
  const centerY = height / 2;
  const topY = strokeWidth / 2;
  const bottomY = height - strokeWidth / 2;
  const dashArray =
    style.lineType === "dashed"
      ? `${6 * scale} ${4 * scale}`
      : style.lineType === "dotted"
        ? `${strokeWidth} ${4 * scale}`
        : undefined;

  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <svg
        aria-hidden="true"
        style={{ width: `${style.width}%`, height }}
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
      >
        {style.lineType === "double" ? (
          <>
            <line x1="0" y1={topY} x2="100" y2={topY} stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="0" y1={bottomY} x2="100" y2={bottomY} stroke={strokeColor} strokeWidth={strokeWidth} />
          </>
        ) : style.lineType === "groove" ? (
          <>
            <line x1="0" y1={topY} x2="100" y2={topY} stroke={shadowColor} strokeWidth={strokeWidth} />
            <line x1="0" y1={bottomY} x2="100" y2={bottomY} stroke={highlightColor} strokeWidth={strokeWidth} />
          </>
        ) : style.lineType === "ridge" ? (
          <>
            <line x1="0" y1={topY} x2="100" y2={topY} stroke={highlightColor} strokeWidth={strokeWidth} />
            <line x1="0" y1={bottomY} x2="100" y2={bottomY} stroke={shadowColor} strokeWidth={strokeWidth} />
          </>
        ) : (
          <line
            x1="0"
            y1={centerY}
            x2="100"
            y2={centerY}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={dashArray}
            strokeLinecap={style.lineType === "dotted" ? "round" : "square"}
          />
        )}
      </svg>
    </div>
  );
};

const renderBorders = (
  borderStyle: CredentialState["borderStyle"],
  borderColor: string,
  radius: number,
  scale: number,
) => {
  if (borderStyle === "none") return null;

  const normalizedColor = borderColor ?? "#ffffff";

  if (borderStyle === "single") {
    return (
      <div
        style={{
          position: "absolute",
          inset: 10 * scale,
          border: `${2 * scale}px solid ${normalizedColor}`,
          borderRadius: (radius - 4) * scale,
          opacity: 0.85,
        }}
      />
    );
  }

  if (borderStyle === "thick") {
    return (
      <div
        style={{
          position: "absolute",
          inset: 8 * scale,
          border: `${4 * scale}px solid ${normalizedColor}`,
          borderRadius: (radius - 6) * scale,
          opacity: 0.92,
        }}
      />
    );
  }

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 8 * scale,
          border: `${2 * scale}px solid ${normalizedColor}`,
          borderRadius: (radius - 6) * scale,
          opacity: 0.94,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 15 * scale,
          border: `${1.5 * scale}px solid ${normalizedColor}`,
          borderRadius: (radius - 12) * scale,
          opacity: 0.55,
        }}
      />
    </>
  );
};

const CredentialCard = forwardRef<HTMLDivElement, CredentialCardProps>(
  ({ state, scale = 1 }, ref) => {
    const {
      matricula,
      nombre,
      showBackground,
      bgColor,
      borderStyle,
      logoPosition,
      fontFamily,
      matriculaStyle,
      nombreStyle,
      logoStyle,
      topDividerStyle,
      bottomDividerStyle,
      matriculaLabelStyle,
      logoConfig,
      palette,
      surface,
    } = state;

    const logoSegments = getLogoSegments(logoConfig);
    const isHorizontalLayout = logoPosition === "left";
    const fontFam = `'${fontFamily}', sans-serif`;
    const cardShadow = `0 ${surface.shadow * 0.9 * scale}px ${surface.shadow * 1.9 * scale}px rgba(15, 23, 42, 0.24)`;
    const cardInset = borderStyle === "none" ? 10 : borderStyle === "thick" ? 18 : 16;
    const logoStrokeWidth = Math.max(logoStyle.strokePx, 0) * 0.08 * scale;
    const logoOpacity = logoStyle.opacity / 100;

    const logoNode =
      logoConfig.type === "image" && logoConfig.imageUrl ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: `${logoStyle.paddingY * scale}px ${logoStyle.paddingX * scale}px`,
            opacity: logoOpacity,
          }}
        >
          <img
            src={logoConfig.imageUrl}
            alt="Logo personalizado"
            style={{
              width: logoConfig.imageWidth * scale,
              height: logoConfig.imageHeight * scale,
              objectFit: "contain",
              filter: "drop-shadow(0 6px 12px rgba(15, 23, 42, 0.18))",
            }}
          />
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: logoSegments.length > 1 ? logoStyle.segmentGap * scale : 0,
            padding: `${logoStyle.paddingY * scale}px ${logoStyle.paddingX * scale}px`,
            fontFamily: fontFam,
            fontSize: logoStyle.fontSize * scale,
            letterSpacing: logoStyle.letterSpacing * scale,
            lineHeight: 1,
            textAlign: "center",
            opacity: logoOpacity,
            textTransform: logoConfig.textCase === "uppercase" ? "uppercase" : "none",
          }}
        >
          {(logoSegments.length ? logoSegments : ["LOGO"]).map((segment, index) => {
            const isLast = index === logoSegments.length - 1;
            const useAccent =
              logoConfig.accentMode === "alternate"
                ? index % 2 === 1
                : logoConfig.accentMode === "last"
                  ? isLast && logoSegments.length > 1
                  : false;
            const resolvedWeight = logoConfig.segmentWeights[index] ?? logoStyle.fontWeight;

            return (
              <span
                key={`${segment}-${index}`}
                style={{
                  color: useAccent ? palette.accentColor : palette.textColor,
                  fontWeight: resolvedWeight,
                  fontVariationSettings: `'wght' ${resolvedWeight}`,
                  WebkitTextStrokeWidth: `${Math.max(logoStrokeWidth, 0)}px`,
                  WebkitTextStrokeColor:
                    logoStrokeWidth > 0 ? "rgba(15, 23, 42, 0.12)" : "transparent",
                  textShadow:
                    logoStrokeWidth > 0
                      ? `0 ${Math.max(1, logoStrokeWidth * 0.6)}px ${Math.max(
                          1,
                          logoStrokeWidth * 3,
                        )}px rgba(15, 23, 42, 0.14)`
                      : "none",
                  fontSynthesis: "none",
                }}
              >
                {segment}
              </span>
            );
          })}
        </div>
      );

    const logoWrapper = (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom:
            logoPosition === "top" ? (logoStyle.gap + logoStyle.distanceToMatricula) * scale : 0,
          marginTop:
            logoPosition === "bottom" ? (logoStyle.gap + logoStyle.distanceToMatricula) * scale : 0,
          marginRight:
            logoPosition === "left" ? (logoStyle.gap + logoStyle.distanceToMatricula) * scale : 0,
          alignSelf: logoPosition === "left" ? "stretch" : "center",
        }}
      >
        {logoNode}
      </div>
    );

    const mainContent = (
      <>
        <div
          style={{
            fontFamily: fontFam,
            fontSize: matriculaLabelStyle.fontSize * scale,
            fontWeight: matriculaLabelStyle.fontWeight,
            color: palette.textColor,
            opacity: matriculaLabelStyle.opacity / 100,
            letterSpacing: matriculaLabelStyle.letterSpacing * scale,
            textTransform: "uppercase",
            marginBottom: 6 * scale,
          }}
        >
          Matricula
        </div>

        <div style={{ marginBottom: 4 * scale, width: "100%" }}>
          {renderDivider(topDividerStyle, palette.dividerColor, scale)}
        </div>

        <div
          style={{
            fontFamily: fontFam,
            fontSize: matriculaStyle.fontSize * scale,
            fontWeight: matriculaStyle.fontWeight,
            color: palette.textColor,
            lineHeight: 1.08,
            letterSpacing: matriculaStyle.letterSpacing * scale,
            maxWidth: "94%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            padding: `${matriculaStyle.paddingY * scale}px ${matriculaStyle.paddingX * scale}px`,
          }}
        >
          {matricula || "000000"}
        </div>

        <div style={{ marginTop: 8 * scale, marginBottom: 10 * scale, width: "100%" }}>
          {renderDivider(bottomDividerStyle, palette.dividerColor, scale)}
        </div>

        <div
          style={{
            fontFamily: fontFam,
            fontSize: nombreStyle.fontSize * scale,
            fontWeight: nombreStyle.fontWeight,
            color: palette.textColor,
            letterSpacing: nombreStyle.letterSpacing * scale,
            textTransform: "uppercase",
            textAlign: "center",
            maxWidth: "88%",
            padding: `${nombreStyle.paddingY * scale}px ${nombreStyle.paddingX * scale}px`,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {nombre || "Nombre completo"}
        </div>
      </>
    );

    return (
      <div
        ref={ref}
        style={{
          width: BASE_WIDTH * scale,
          height: BASE_HEIGHT * scale,
          position: "relative",
          borderRadius: surface.radius * scale,
          overflow: "hidden",
          boxShadow: cardShadow,
          background: showBackground ? palette.backgroundColor : "transparent",
        }}
      >
        {showBackground ? (
          bgColor === "fabric" ? (
            <>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: "#0d2b5a",
                  backgroundImage: `url(${cardBackground})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  filter: "contrast(1.08) saturate(0.92) brightness(0.82)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(4, 17, 40, 0.14), rgba(4, 17, 40, 0.22))",
                }}
              />
            </>
          ) : bgColor === "transparent" ? (
            <div style={{ position: "absolute", inset: 0, background: "transparent" }} />
          ) : (
            <>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: palette.backgroundColor || BG_COLORS[bgColor],
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.1), transparent 35%), radial-gradient(circle at right top, rgba(255,255,255,0.08), transparent 30%)",
                }}
              />
            </>
          )
        ) : (
          <div style={{ position: "absolute", inset: 0, background: "transparent" }} />
        )}

        {renderBorders(borderStyle, palette.borderColor, surface.radius, scale)}

        <div
          style={{
            position: "absolute",
            inset: cardInset * scale,
            display: "flex",
            flexDirection: isHorizontalLayout ? "row" : "column",
            alignItems: "center",
            justifyContent: "center",
            padding: `${surface.padding * scale}px ${Math.max(
              surface.padding * scale,
              24 * scale,
            )}px`,
          }}
        >
          {logoPosition === "top" && logoWrapper}

          {isHorizontalLayout ? (
            <>
              {logoWrapper}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: 1,
                }}
              >
                {mainContent}
              </div>
            </>
          ) : (
            mainContent
          )}

          {logoPosition === "bottom" && logoWrapper}
        </div>
      </div>
    );
  },
);

CredentialCard.displayName = "CredentialCard";

export default CredentialCard;
