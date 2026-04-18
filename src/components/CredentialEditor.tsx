import { type Dispatch, type SetStateAction } from "react";
import { Download, ImagePlus, RotateCcw, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  BG_COLORS,
  EXPORT_SIZES,
  FONT_OPTIONS,
  WEIGHT_OPTIONS,
  type BgColor,
  type CredentialState,
  type LineType,
  getLogoSegments,
} from "@/lib/credential";

interface PresetOption {
  id: string;
  label: string;
}

interface CredentialEditorProps {
  value: CredentialState;
  onChange: Dispatch<SetStateAction<CredentialState>>;
  onDownload: () => void;
  onReset: () => void;
  onApplyPreset: (presetId: string) => void;
  isExporting: boolean;
  presets: PresetOption[];
}

const SliderRow = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit = "px",
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-slate-700">{label}</span>
      <span className="text-xs font-mono text-slate-500">
        {value}
        {unit}
      </span>
    </div>
    <Slider value={[value]} onValueChange={([next]) => onChange(next)} min={min} max={max} step={step} />
  </div>
);

const ColorRow = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="space-y-2">
    <Label className="text-xs font-medium text-slate-700">{label}</Label>
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-11 cursor-pointer rounded-md border border-slate-300 bg-white p-1"
      />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 font-mono text-xs"
      />
    </div>
  </div>
);

const DividerControls = ({
  title,
  style,
  onChange,
}: {
  title: string;
  style: CredentialState["topDividerStyle"];
  onChange: (patch: Partial<CredentialState["topDividerStyle"]>) => void;
}) => (
  <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <p className="text-sm font-semibold text-slate-900">{title}</p>
    <div className="space-y-2">
      <Label className="text-xs font-medium text-slate-700">Tipo</Label>
      <Select value={style.lineType} onValueChange={(next) => onChange({ lineType: next as LineType })}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="solid">Solida</SelectItem>
          <SelectItem value="dashed">Discontinua</SelectItem>
          <SelectItem value="dotted">Punteada</SelectItem>
          <SelectItem value="double">Doble</SelectItem>
          <SelectItem value="groove">Relieve bajo</SelectItem>
          <SelectItem value="ridge">Relieve alto</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <SliderRow label="Ancho" value={style.width} onChange={(value) => onChange({ width: value })} min={10} max={100} step={5} unit="%" />
    <SliderRow label="Grosor" value={style.thickness} onChange={(value) => onChange({ thickness: value })} min={0.5} max={8} step={0.5} />
    <SliderRow label="Opacidad" value={style.opacity} onChange={(value) => onChange({ opacity: value })} min={10} max={100} step={5} unit="%" />
  </div>
);

const BACKGROUND_OPTIONS: Array<{ key: BgColor; label: string }> = [
  { key: "fabric", label: "Textura" },
  { key: "midnight", label: "Azul" },
  { key: "forest", label: "Verde" },
  { key: "burgundy", label: "Vino" },
  { key: "graphite", label: "Grafito" },
  { key: "sand", label: "Arena" },
  { key: "transparent", label: "Sin fondo" },
];

const CredentialEditor = ({
  value,
  onChange,
  onDownload,
  onReset,
  onApplyPreset,
  isExporting,
  presets,
}: CredentialEditorProps) => {
  const updateRoot = <K extends keyof CredentialState>(key: K, nextValue: CredentialState[K]) => {
    onChange((previous) => ({
      ...previous,
      [key]: nextValue,
    }));
  };

  const updateNested = <
    K extends "matriculaStyle" | "nombreStyle" | "logoStyle" | "topDividerStyle" | "bottomDividerStyle" | "matriculaLabelStyle" | "logoConfig" | "palette" | "surface",
  >(
    key: K,
    patch: Partial<CredentialState[K]>,
  ) => {
    onChange((previous) => ({
      ...previous,
      [key]: {
        ...previous[key],
        ...patch,
      },
    }));
  };

  const syncSegmentWeights = (manualText: string, splitMode = value.logoConfig.splitMode) => {
    const segments =
      splitMode === "joined"
        ? [value.logoConfig.text || "LOGO"]
        : manualText
            .split(/[|/-]+/)
            .map((chunk) => chunk.trim())
            .filter(Boolean);

    const nextWeights = Array.from({ length: Math.max(segments.length, 1) }, (_, index) => {
      return value.logoConfig.segmentWeights[index] ?? value.logoStyle.fontWeight;
    });

    return nextWeights;
  };

  const applyBackground = (next: BgColor) => {
    updateRoot("bgColor", next);
    updateRoot("showBackground", next !== "transparent");
    updateNested("palette", {
      backgroundColor: BG_COLORS[next],
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      updateNested("logoConfig", {
        imageUrl: loadEvent.target?.result as string,
        type: "image",
      });
    };
    reader.readAsDataURL(file);
  };

  const logoSegments = getLogoSegments(value.logoConfig);
  const activeLogoSegments =
    value.logoConfig.type === "text"
      ? logoSegments.length
        ? logoSegments
        : [value.logoConfig.text || "LOGO"]
      : [];

  return (
    <div className="space-y-4">
      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Credential Studio</h1>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="icon" onClick={onReset} aria-label="Restaurar">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button type="button" onClick={onDownload} disabled={isExporting} className="gap-2 bg-slate-950 hover:bg-slate-800">
              <Download className="h-4 w-4" />
              {isExporting ? "PNG..." : "PNG"}
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {presets.map((preset) => (
            <Button key={preset.id} type="button" variant="outline" size="sm" onClick={() => onApplyPreset(preset.id)}>
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="base" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-white p-1 shadow-sm">
          <TabsTrigger value="base">Base</TabsTrigger>
          <TabsTrigger value="logo">Logo</TabsTrigger>
          <TabsTrigger value="texto">Texto</TabsTrigger>
          <TabsTrigger value="acabado">Acabado</TabsTrigger>
        </TabsList>

        <TabsContent value="base" className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="matricula">Matricula</Label>
            <Input id="matricula" value={value.matricula} onChange={(event) => updateRoot("matricula", event.target.value)} className="font-mono text-lg" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" value={value.nombre} onChange={(event) => updateRoot("nombre", event.target.value)} />
          </div>

          <div className="space-y-3">
            <Label>Fondo</Label>
            <div className="grid grid-cols-2 gap-2">
              {BACKGROUND_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => applyBackground(option.key)}
                  className={`flex items-center gap-3 rounded-2xl border px-3 py-2 text-left transition ${
                    value.bgColor === option.key || (!value.showBackground && option.key === "transparent")
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-800"
                  }`}
                >
                  <span
                    className="h-7 w-7 rounded-xl border border-black/10"
                    style={{
                      background:
                        option.key === "transparent"
                          ? "repeating-conic-gradient(#cbd5e1 0% 25%, #fff 0% 50%) 0 0 / 10px 10px"
                          : option.key === "fabric"
                            ? "linear-gradient(135deg,#163d73,#0d2b5a)"
                            : BG_COLORS[option.key],
                    }}
                  />
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Fuente</Label>
              <Select value={value.fontFamily} onValueChange={(next) => updateRoot("fontFamily", next)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Logo</Label>
              <Select value={value.logoPosition} onValueChange={(next) => updateRoot("logoPosition", next as CredentialState["logoPosition"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Arriba</SelectItem>
                  <SelectItem value="left">Izquierda</SelectItem>
                  <SelectItem value="bottom">Abajo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="logo" className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant={value.logoConfig.type === "text" ? "default" : "outline"} className="gap-2" onClick={() => updateNested("logoConfig", { type: "text" })}>
              <Type className="h-4 w-4" />
              Texto
            </Button>
            <Button type="button" variant={value.logoConfig.type === "image" ? "default" : "outline"} className="gap-2" onClick={() => updateNested("logoConfig", { type: "image" })}>
              <ImagePlus className="h-4 w-4" />
              Imagen
            </Button>
          </div>

          {value.logoConfig.type === "text" ? (
            <>
              <div className="space-y-2">
                <Label>Texto</Label>
                <Input
                  value={value.logoConfig.text}
                  onChange={(event) => {
                    updateNested("logoConfig", {
                      text: event.target.value,
                      segmentWeights: syncSegmentWeights(value.logoConfig.manualText, value.logoConfig.splitMode),
                    });
                  }}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Separacion</Label>
                  <Select
                    value={value.logoConfig.splitMode}
                    onValueChange={(next) => {
                      updateNested("logoConfig", {
                        splitMode: next as CredentialState["logoConfig"]["splitMode"],
                        segmentWeights: syncSegmentWeights(value.logoConfig.manualText, next as CredentialState["logoConfig"]["splitMode"]),
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="joined">Sin separacion</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Acento</Label>
                  <Select value={value.logoConfig.accentMode} onValueChange={(next) => updateNested("logoConfig", { accentMode: next as CredentialState["logoConfig"]["accentMode"] })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ninguno</SelectItem>
                      <SelectItem value="last">Ultima</SelectItem>
                      <SelectItem value="alternate">Alternado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {value.logoConfig.splitMode === "manual" && (
                <div className="space-y-2">
                  <Label>Bloques</Label>
                  <Textarea
                    value={value.logoConfig.manualText}
                    onChange={(event) => {
                      updateNested("logoConfig", {
                        manualText: event.target.value,
                        segmentWeights: syncSegmentWeights(event.target.value, "manual"),
                      });
                    }}
                    className="min-h-24"
                  />
                </div>
              )}

              <SliderRow
                label="Peso base"
                value={value.logoStyle.fontWeight}
                onChange={(next) => {
                  updateNested("logoStyle", { fontWeight: next });
                  const segmentWeights = activeLogoSegments.map(
                    (_, index) => value.logoConfig.segmentWeights[index] ?? next,
                  );
                  updateNested("logoConfig", { segmentWeights });
                }}
                min={100}
                max={900}
                step={100}
                unit=""
              />

              {activeLogoSegments.map((segment, index) => (
                <div key={`${segment}-${index}`} className="space-y-2">
                  <Label>{`Peso segmento ${index + 1}`}</Label>
                  <Select
                    value={String(value.logoConfig.segmentWeights[index] ?? value.logoStyle.fontWeight)}
                    onValueChange={(next) => {
                      const segmentWeights = [...value.logoConfig.segmentWeights];
                      segmentWeights[index] = Number(next);
                      updateNested("logoConfig", { segmentWeights });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WEIGHT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={String(option.value)}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Archivo</Label>
                <Input type="file" accept="image/*" onChange={handleImageUpload} />
              </div>
              {value.logoConfig.imageUrl && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <img src={value.logoConfig.imageUrl} alt="Logo" className="mx-auto max-h-20 object-contain" />
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <SliderRow label="Ancho" value={value.logoConfig.imageWidth} onChange={(next) => updateNested("logoConfig", { imageWidth: next })} min={40} max={220} step={5} />
                <SliderRow label="Alto" value={value.logoConfig.imageHeight} onChange={(next) => updateNested("logoConfig", { imageHeight: next })} min={20} max={140} step={5} />
              </div>
            </>
          )}

          <SliderRow label="Tamano" value={value.logoStyle.fontSize} onChange={(next) => updateNested("logoStyle", { fontSize: next })} min={10} max={84} step={1} />
          <SliderRow label="Peso base" value={value.logoStyle.fontWeight} onChange={(next) => updateNested("logoStyle", { fontWeight: next })} min={100} max={900} step={100} unit="" />
          <SliderRow label="Separacion con matricula" value={value.logoStyle.distanceToMatricula} onChange={(next) => updateNested("logoStyle", { distanceToMatricula: next })} min={0} max={80} step={2} />
          <SliderRow label="Espacio de separacion" value={value.logoStyle.segmentGap} onChange={(next) => updateNested("logoStyle", { segmentGap: next })} min={0} max={30} step={1} />
          <SliderRow label="Trazo/contorno" value={value.logoStyle.strokePx} onChange={(next) => updateNested("logoStyle", { strokePx: next })} min={0} max={24} step={1} />
        </TabsContent>

        <TabsContent value="texto" className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Matricula</p>
            <SliderRow label="Tamano" value={value.matriculaStyle.fontSize} onChange={(next) => updateNested("matriculaStyle", { fontSize: next })} min={24} max={120} step={2} />
            <SliderRow label="Peso" value={value.matriculaStyle.fontWeight} onChange={(next) => updateNested("matriculaStyle", { fontWeight: next })} min={100} max={900} step={100} unit="" />
            <SliderRow label="Espaciado" value={value.matriculaStyle.letterSpacing} onChange={(next) => updateNested("matriculaStyle", { letterSpacing: next })} min={0} max={16} step={1} />
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Nombre</p>
            <SliderRow label="Tamano" value={value.nombreStyle.fontSize} onChange={(next) => updateNested("nombreStyle", { fontSize: next })} min={8} max={36} step={1} />
            <SliderRow label="Peso" value={value.nombreStyle.fontWeight} onChange={(next) => updateNested("nombreStyle", { fontWeight: next })} min={100} max={900} step={100} unit="" />
            <SliderRow label="Espaciado" value={value.nombreStyle.letterSpacing} onChange={(next) => updateNested("nombreStyle", { letterSpacing: next })} min={0} max={12} step={0.5} />
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Etiqueta</p>
            <SliderRow label="Tamano" value={value.matriculaLabelStyle.fontSize} onChange={(next) => updateNested("matriculaLabelStyle", { fontSize: next })} min={6} max={24} step={1} />
            <SliderRow label="Peso" value={value.matriculaLabelStyle.fontWeight} onChange={(next) => updateNested("matriculaLabelStyle", { fontWeight: next })} min={100} max={900} step={100} unit="" />
            <SliderRow label="Opacidad" value={value.matriculaLabelStyle.opacity} onChange={(next) => updateNested("matriculaLabelStyle", { opacity: next })} min={10} max={100} step={5} unit="%" />
          </div>
        </TabsContent>

        <TabsContent value="acabado" className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Borde</Label>
              <Select value={value.borderStyle} onValueChange={(next) => updateRoot("borderStyle", next as CredentialState["borderStyle"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="double">Doble</SelectItem>
                  <SelectItem value="single">Simple</SelectItem>
                  <SelectItem value="thick">Grueso</SelectItem>
                  <SelectItem value="none">Sin borde</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Salida</Label>
              <Select value={value.exportSize} onValueChange={(next) => updateRoot("exportSize", next)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPORT_SIZES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DividerControls title="Linea superior" style={value.topDividerStyle} onChange={(patch) => updateNested("topDividerStyle", patch)} />
          <DividerControls title="Linea inferior" style={value.bottomDividerStyle} onChange={(patch) => updateNested("bottomDividerStyle", patch)} />

          <div className="grid gap-4 sm:grid-cols-2">
            <ColorRow label="Texto" value={value.palette.textColor} onChange={(next) => updateNested("palette", { textColor: next })} />
            <ColorRow label="Acento" value={value.palette.accentColor} onChange={(next) => updateNested("palette", { accentColor: next })} />
            <ColorRow label="Borde" value={value.palette.borderColor} onChange={(next) => updateNested("palette", { borderColor: next, dividerColor: next })} />
            <ColorRow label="Fondo" value={value.palette.backgroundColor} onChange={(next) => updateNested("palette", { backgroundColor: next })} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CredentialEditor;
