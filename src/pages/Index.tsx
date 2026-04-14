import { startTransition, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import CredentialCard from "@/components/CredentialCard";
import CredentialEditor from "@/components/CredentialEditor";
import { DEFAULT_CREDENTIAL_STATE, SCALE_MAP, type CredentialState } from "@/lib/credential";

const buildPresetState = (patch: Partial<CredentialState>): CredentialState => ({
  ...DEFAULT_CREDENTIAL_STATE,
  ...patch,
  matriculaStyle: {
    ...DEFAULT_CREDENTIAL_STATE.matriculaStyle,
    ...patch.matriculaStyle,
  },
  nombreStyle: {
    ...DEFAULT_CREDENTIAL_STATE.nombreStyle,
    ...patch.nombreStyle,
  },
  logoStyle: {
    ...DEFAULT_CREDENTIAL_STATE.logoStyle,
    ...patch.logoStyle,
  },
  topDividerStyle: {
    ...DEFAULT_CREDENTIAL_STATE.topDividerStyle,
    ...patch.topDividerStyle,
  },
  bottomDividerStyle: {
    ...DEFAULT_CREDENTIAL_STATE.bottomDividerStyle,
    ...patch.bottomDividerStyle,
  },
  matriculaLabelStyle: {
    ...DEFAULT_CREDENTIAL_STATE.matriculaLabelStyle,
    ...patch.matriculaLabelStyle,
  },
  logoConfig: {
    ...DEFAULT_CREDENTIAL_STATE.logoConfig,
    ...patch.logoConfig,
  },
  palette: {
    ...DEFAULT_CREDENTIAL_STATE.palette,
    ...patch.palette,
  },
  surface: {
    ...DEFAULT_CREDENTIAL_STATE.surface,
    ...patch.surface,
  },
});

const PRESETS = {
  classic: buildPresetState({}),
  minimal: buildPresetState({
    bgColor: "graphite",
    borderStyle: "single",
    fontFamily: "Inter",
    logoPosition: "left",
    palette: {
      backgroundColor: "#111827",
      textColor: "#f9fafb",
      accentColor: "#22c55e",
      dividerColor: "#f9fafb",
      borderColor: "#f9fafb",
    },
    logoConfig: {
      text: "ACADEMIA",
      splitMode: "joined",
      segmentWeights: [600],
      accentMode: "none",
      textCase: "uppercase",
    },
    logoStyle: {
      fontSize: 24,
      letterSpacing: 1,
      strokePx: 12,
      distanceToMatricula: 18,
      paddingX: 2,
      paddingY: 0,
      gap: 10,
      segmentGap: 4,
      opacity: 100,
    },
    nombreStyle: {
      fontSize: 14,
      fontWeight: 500,
      letterSpacing: 1.5,
      paddingX: 0,
      paddingY: 0,
    },
    surface: {
      radius: 18,
      padding: 18,
      shadow: 22,
    },
  }),
  impact: buildPresetState({
    bgColor: "burgundy",
    borderStyle: "thick",
    logoPosition: "top",
    palette: {
      backgroundColor: "#4b162b",
      textColor: "#fdf2f8",
      accentColor: "#f59e0b",
      dividerColor: "#fdf2f8",
      borderColor: "#ffe4e6",
    },
    logoConfig: {
      text: "INSTITUTO",
      manualText: "INS / TI / TU / TO",
      splitMode: "manual",
      segmentWeights: [800, 800, 800, 800],
      accentMode: "alternate",
      textCase: "uppercase",
    },
    logoStyle: {
      fontSize: 32,
      letterSpacing: 3,
      strokePx: 18,
      distanceToMatricula: 22,
      paddingX: 0,
      paddingY: 0,
      gap: 10,
      segmentGap: 10,
      opacity: 100,
    },
    matriculaStyle: {
      fontSize: 80,
      fontWeight: 300,
      letterSpacing: 4,
      paddingX: 8,
      paddingY: 18,
    },
    surface: {
      radius: 28,
      padding: 20,
      shadow: 36,
    },
  }),
};

const PRESET_OPTIONS = [
  { id: "classic", label: "Clasico" },
  { id: "minimal", label: "Minimal" },
  { id: "impact", label: "Impacto" },
];

const Index = () => {
  const [state, setState] = useState<CredentialState>(PRESETS.classic);
  const [isExporting, setIsExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const previewMetrics = [
    { label: "Resolucion", value: state.exportSize.toUpperCase() },
    { label: "Logo", value: state.logoConfig.type === "image" ? "Imagen" : "Texto" },
    { label: "Fuente", value: state.fontFamily },
  ];

  const handleDownload = async () => {
    if (!exportRef.current) return;

    setIsExporting(true);

    try {
      const pixelRatio = SCALE_MAP[state.exportSize] || 2;
      const dataUrl = await toPng(exportRef.current, {
        pixelRatio,
        backgroundColor:
          !state.showBackground || state.bgColor === "transparent"
            ? "rgba(0, 0, 0, 0)"
            : undefined,
      });

      const link = document.createElement("a");
      link.download = `credencial-${state.matricula || "personalizada"}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("PNG generado correctamente");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo generar la imagen");
    } finally {
      setIsExporting(false);
    }
  };

  const handleApplyPreset = (presetId: string) => {
    const nextState = PRESETS[presetId as keyof typeof PRESETS];
    if (!nextState) return;

    startTransition(() => {
      setState(nextState);
    });
  };

  const handleReset = () => {
    startTransition(() => {
      setState(PRESETS.classic);
    });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(148,163,184,0.18),transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      <header className="border-b border-slate-200/80 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Credential Studio</h1>
          <div className="grid grid-cols-3 gap-2">
            {previewMetrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-center shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">{metric.label}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{metric.value}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[390px_minmax(0,1fr)] lg:px-8">
        <aside className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-1">
          <CredentialEditor
            value={state}
            onChange={setState}
            onDownload={handleDownload}
            onReset={handleReset}
            onApplyPreset={handleApplyPreset}
            isExporting={isExporting}
            presets={PRESET_OPTIONS}
          />
        </aside>

        <section>
          <div className="rounded-[32px] border border-slate-200 bg-white/70 p-5 shadow-[0_32px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-lg font-semibold text-slate-950">Vista previa</h2>
              <div className="rounded-2xl bg-slate-950 px-4 py-3 text-white">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-300">Exportara</p>
                <p className="mt-1 text-sm font-semibold">{state.exportSize.toUpperCase()}</p>
              </div>
            </div>

            <div className="mt-6 overflow-auto rounded-[28px] bg-[linear-gradient(135deg,rgba(15,23,42,0.04),rgba(99,102,241,0.04))] p-4 sm:p-8">
              <div className="mx-auto flex min-w-[592px] justify-center">
                <CredentialCard ref={exportRef} state={state} />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
