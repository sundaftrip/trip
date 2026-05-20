"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Save, RotateCcw, Move, Maximize2 } from "lucide-react";

export interface SundafConfig {
  title: string;
  text: string;
  x: number; // % dari kiri canvas
  y: number; // % dari atas canvas
  w: number; // px
  font: "mono" | "handwritten" | "serif" | "sans";
  highlight: string; // hex atau kosong
  rotate: number; // derajat
}

const DEFAULT_CONFIG: SundafConfig = {
  title: "Mengapa Sundaf",
  text:
    "S — Small group, lebih dekat dan personal.\n" +
    "U — Unforgettable moments di setiap destinasi.\n" +
    "N — Nyaman dari awal sampai akhir.\n" +
    "D — Dedikasi tim 24/7.\n" +
    "A — Autentik, bukan turis biasa.\n" +
    "F — Filosofi: pulang sebagai pribadi baru.",
  x: 70,
  y: 50,
  w: 260,
  font: "mono",
  highlight: "",
  rotate: 0,
};

const FONT_OPTIONS: Array<{ key: SundafConfig["font"]; label: string; sample: string; family: string }> = [
  { key: "mono", label: "Mono", sample: "Mono · Boarding", family: "var(--font-anonymous-pro), ui-monospace, monospace" },
  { key: "handwritten", label: "Handwritten", sample: "Tulisan tangan", family: "var(--font-caveat), cursive" },
  { key: "serif", label: "Serif", sample: "Klasik", family: "Georgia, serif" },
  { key: "sans", label: "Sans", sample: "Modern", family: "var(--font-jost), sans-serif" },
];

const HIGHLIGHT_PRESETS = [
  { key: "", label: "None", color: "transparent" },
  { key: "#fff06a", label: "Kuning", color: "#fff06a" },
  { key: "#ff9a8b", label: "Coral", color: "#ff9a8b" },
  { key: "#86b2ca", label: "Biru", color: "#86b2ca" },
  { key: "#a3e635", label: "Hijau", color: "#a3e635" },
  { key: "#f0abfc", label: "Pink", color: "#f0abfc" },
];

export default function HeroSundafEditor({ initial }: { initial: Partial<SundafConfig> | null }) {
  const [config, setConfig] = useState<SundafConfig>({ ...DEFAULT_CONFIG, ...(initial ?? {}) });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);

  /* === DRAG === */
  const dragState = useRef<{ startX: number; startY: number; startCX: number; startCY: number; rect: DOMRect } | null>(null);

  const onDragStart = useCallback((e: React.PointerEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      startCX: config.x,
      startCY: config.y,
      rect,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [config.x, config.y]);

  const onDragMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.current) return;
    const { startX, startY, startCX, startCY, rect } = dragState.current;
    const dxPct = ((e.clientX - startX) / rect.width) * 100;
    const dyPct = ((e.clientY - startY) / rect.height) * 100;
    setConfig((c) => ({
      ...c,
      x: Math.max(0, Math.min(95, startCX + dxPct)),
      y: Math.max(0, Math.min(95, startCY + dyPct)),
    }));
  }, []);

  const onDragEnd = useCallback((e: React.PointerEvent) => {
    dragState.current = null;
    try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
  }, []);

  /* === RESIZE === */
  const resizeState = useRef<{ startX: number; startW: number } | null>(null);

  const onResizeStart = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    resizeState.current = { startX: e.clientX, startW: config.w };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [config.w]);

  const onResizeMove = useCallback((e: React.PointerEvent) => {
    if (!resizeState.current) return;
    const dx = e.clientX - resizeState.current.startX;
    setConfig((c) => ({ ...c, w: Math.max(160, Math.min(480, resizeState.current!.startW + dx)) }));
  }, []);

  const onResizeEnd = useCallback((e: React.PointerEvent) => {
    resizeState.current = null;
    try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
  }, []);

  /* === SAVE === */
  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hero_sundaf_config: JSON.stringify(config) }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const err = await res.json().catch(() => ({ error: "Gagal simpan" }));
        alert(err.error || "Gagal simpan");
      }
    } finally {
      setSaving(false);
    }
  }

  function resetDefault() {
    if (confirm("Reset ke setting default?")) setConfig(DEFAULT_CONFIG);
  }

  /* === RENDER === */
  const fontFamily = FONT_OPTIONS.find((f) => f.key === config.font)?.family ?? FONT_OPTIONS[0].family;
  const fontSize = config.font === "handwritten" ? 20 : config.font === "serif" ? 14 : 13;
  const stabiloBg = config.highlight
    ? `linear-gradient(180deg, transparent 0 55%, ${config.highlight} 55% 90%, transparent 90%)`
    : "none";

  // Auto-resize textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${ta.scrollHeight}px`;
    }
  }, [config.text]);

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      {/* === CANVAS (Preview) === */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <Move size={12} /> Drag block · <Maximize2 size={12} /> Drag pojok kanan-bawah untuk resize
          </div>
          <div className="text-xs tabular-nums text-gray-500 dark:text-gray-400">
            X: {config.x.toFixed(0)}% · Y: {config.y.toFixed(0)}% · W: {config.w}px · ↻ {config.rotate}°
          </div>
        </div>
        <div
          ref={canvasRef}
          className="relative w-full aspect-[16/10] rounded-xl border border-gray-700 overflow-hidden select-none"
          style={{ background: "linear-gradient(135deg, #0d1b2a 0%, #142a40 100%)" }}
        >
          {/* Mock hero content */}
          <div className="absolute top-6 left-6 right-6">
            <span className="text-[8px] tracking-[0.18em] uppercase text-white/40 block mb-2">Mock hero — geser block ke posisi yang diinginkan</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[0.92] text-white max-w-md opacity-80">
              Saatnya Untuk<br/>Nikmatin Destinasi
            </h1>
          </div>

          {/* Draggable SUNDAF block */}
          <div
            ref={blockRef}
            onPointerDown={onDragStart}
            onPointerMove={onDragMove}
            onPointerUp={onDragEnd}
            onPointerCancel={onDragEnd}
            className="absolute cursor-move ring-2 ring-blue-400/0 hover:ring-blue-400/70 transition-all"
            style={{
              left: `${config.x}%`,
              top: `${config.y}%`,
              transform: `translate(-50%, -50%) rotate(${config.rotate}deg)`,
              width: `${config.w}px`,
              maxWidth: "90%",
              touchAction: "none",
            }}
          >
            <span
              className="text-[10px] tracking-[0.22em] uppercase opacity-60 block mb-2 pointer-events-none"
              style={{ color: "#d8eef8", fontFamily: "var(--font-anonymous-pro), ui-monospace, monospace" }}
            >
              {config.title}
            </span>
            <p
              className="leading-[1.7] whitespace-pre-line pointer-events-none"
              style={{
                color: "#d8eef8",
                fontFamily,
                fontSize: `${fontSize}px`,
                textAlign: "justify",
                textJustify: "inter-word",
                backgroundImage: stabiloBg,
                padding: config.highlight ? "0 4px" : 0,
              }}
            >
              {config.text}
            </p>
            {/* Resize handle */}
            <div
              onPointerDown={onResizeStart}
              onPointerMove={onResizeMove}
              onPointerUp={onResizeEnd}
              onPointerCancel={onResizeEnd}
              className="absolute -right-2 -bottom-2 w-5 h-5 bg-blue-500 hover:bg-blue-400 rounded-full cursor-ew-resize flex items-center justify-center shadow-lg"
              style={{ touchAction: "none" }}
              title="Drag untuk resize"
            >
              <Maximize2 size={10} className="text-white" />
            </div>
          </div>
        </div>

        {/* Quick position presets */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500 dark:text-gray-400">Posisi cepat:</span>
          {[
            { key: "tl", label: "↖", x: 20, y: 25 },
            { key: "tr", label: "↗", x: 80, y: 25 },
            { key: "cr", label: "→", x: 80, y: 50 },
            { key: "br", label: "↘", x: 80, y: 75 },
            { key: "bl", label: "↙", x: 20, y: 75 },
            { key: "c", label: "·", x: 50, y: 50 },
          ].map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setConfig((c) => ({ ...c, x: p.x, y: p.y }))}
              className="w-8 h-8 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* === CONTROLS === */}
      <div className="space-y-5">
        {/* Konten */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Konten</h3>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Judul</label>
            <input
              className="input mt-1"
              value={config.title}
              onChange={(e) => setConfig((c) => ({ ...c, title: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Isi (1 baris per S/U/N/D/A/F)</label>
            <textarea
              ref={textareaRef}
              className="input mt-1 font-mono text-[12px]"
              value={config.text}
              onChange={(e) => setConfig((c) => ({ ...c, text: e.target.value }))}
              style={{ minHeight: "120px" }}
            />
          </div>
        </div>

        {/* Font */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Font</h3>
          <div className="grid grid-cols-2 gap-2">
            {FONT_OPTIONS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setConfig((c) => ({ ...c, font: f.key }))}
                className={`px-3 py-2.5 border rounded-lg text-left transition ${
                  config.font === f.key
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950 ring-2 ring-blue-500/30"
                    : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900"
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">{f.label}</div>
                <div className="text-[13px] mt-0.5" style={{ fontFamily: f.family }}>{f.sample}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Stabilo */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Stabilo (highlight)</h3>
          <div className="grid grid-cols-3 gap-2">
            {HIGHLIGHT_PRESETS.map((h) => (
              <button
                key={h.key || "none"}
                type="button"
                onClick={() => setConfig((c) => ({ ...c, highlight: h.key }))}
                className={`px-2 py-2 border rounded-lg flex flex-col items-center gap-1 transition ${
                  config.highlight === h.key
                    ? "border-blue-500 ring-2 ring-blue-500/30"
                    : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900"
                }`}
              >
                <div className="w-full h-4 rounded" style={{ background: h.color || "#e5e7eb", border: !h.color ? "1px dashed #9ca3af" : "none" }} />
                <span className="text-[10px] text-gray-700 dark:text-gray-300">{h.label}</span>
              </button>
            ))}
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Custom hex</label>
            <input
              className="input mt-1 font-mono text-[12px]"
              placeholder="#fff06a"
              value={config.highlight}
              onChange={(e) => setConfig((c) => ({ ...c, highlight: e.target.value }))}
            />
          </div>
        </div>

        {/* Rotate */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Rotasi</h3>
            <span className="text-xs tabular-nums text-gray-500 dark:text-gray-400">{config.rotate}°</span>
          </div>
          <input
            type="range"
            min={-10}
            max={10}
            step={0.5}
            value={config.rotate}
            onChange={(e) => setConfig((c) => ({ ...c, rotate: parseFloat(e.target.value) }))}
            className="w-full"
          />
        </div>

        {/* Width */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Lebar</h3>
            <span className="text-xs tabular-nums text-gray-500 dark:text-gray-400">{config.w}px</span>
          </div>
          <input
            type="range"
            min={160}
            max={480}
            step={10}
            value={config.w}
            onChange={(e) => setConfig((c) => ({ ...c, w: parseInt(e.target.value, 10) }))}
            className="w-full"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 sticky bottom-4">
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-4 py-2.5 rounded-lg transition"
          >
            <Save size={16} />
            {saving ? "Menyimpan..." : saved ? "✓ Tersimpan" : "Simpan"}
          </button>
          <button
            onClick={resetDefault}
            className="inline-flex items-center justify-center gap-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 px-3 py-2.5 rounded-lg transition"
            title="Reset ke default"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
