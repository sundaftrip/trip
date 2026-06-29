"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  CheckCheck,
  MessageCircle,
  MoreVertical,
  Paperclip,
  Phone,
  Plane,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import {
  buildLeadRecommendation,
  extractLeadFacts,
  type AiOpsInquiry,
  type AiOpsLeadFacts,
  type AiOpsRecommendation,
  type AiOpsTour,
} from "@/lib/ai-ops";

type ChatMessage = {
  id: string;
  sender: "client" | "sundaf";
  text: string;
  time: string;
};

type PrototypeSignal = AiOpsRecommendation & {
  facts: AiOpsLeadFacts;
};

const CLIENT_NAME = "Ferdi";

const DEMO_TOURS: AiOpsTour[] = [
  {
    id: "demo-rusia-aurora",
    title: "Open Trip Rusia Aurora Murmansk",
    slug: "open-trip-aurora-rusia",
    country: "Rusia",
    cityHighlight: "Moscow, Murmansk, Teriberka",
    price: 32900000,
    promoPrice: 29900000,
    seatsLeft: 6,
    tripDate: new Date("2026-12-18T09:00:00+07:00"),
    duration: "8 hari",
  },
  {
    id: "demo-rusia-classic",
    title: "Tour Rusia dari Indonesia",
    slug: "tour-rusia-dari-indonesia",
    country: "Rusia",
    cityHighlight: "Moscow, St Petersburg",
    price: 27900000,
    promoPrice: null,
    seatsLeft: 9,
    tripDate: new Date("2026-10-21T09:00:00+07:00"),
    duration: "7 hari",
  },
  {
    id: "demo-asia-tengah",
    title: "Custom Trip Asia Tengah",
    slug: "destinations/kazakhstan",
    country: "Kazakhstan",
    cityHighlight: "Almaty, Tashkent, Samarkand",
    price: 25500000,
    promoPrice: null,
    seatsLeft: 4,
    tripDate: new Date("2026-11-08T09:00:00+07:00"),
    duration: "8 hari",
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome",
    sender: "sundaf",
    time: "09.41",
    text: "Halo Kak, saya Sundaf Trip. Mau konsultasi trip, visa, atau custom itinerary?",
  },
];

const QUICK_MESSAGES = [
  "Saya mau Rusia aurora.",
  "2 pax bulan Desember, budget sekitar 30 juta per orang.",
  "Ada seat? Kalau cocok bisa DP hari ini?",
  "Bantu visa Rusia juga, paspor berlaku sampai Mei 2028.",
];

const EMPTY_FACTS: AiOpsLeadFacts = {
  intent: "Belum ada intent",
  destination: "",
  travelDate: "",
  pax: "",
  budget: "",
  passportValidity: "",
  asks: [],
  missingFields: [],
  confidence: "low",
};

const TERMINAL_RESOLUTIONS = new Set<AiOpsRecommendation["resolution"]>([
  "ready_to_invoice",
  "handoff_admin",
]);

function clockLabel() {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(new Date()).replace(":", ".");
}

function inferDestination(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes("visa")) return lower.includes("rusia") ? "Visa Rusia" : "Visa perjalanan";
  if (lower.includes("aurora") || lower.includes("murmansk") || lower.includes("rusia")) return "Open Trip Rusia Aurora";
  if (lower.includes("asia tengah") || lower.includes("kazakhstan") || lower.includes("uzbekistan")) return "Asia Tengah";
  if (lower.includes("custom") || lower.includes("keluarga")) return "Custom Trip";
  return "Konsultasi Trip";
}

function inferTravelDate(text: string) {
  const match = text.match(/\b(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember|2026|2027)\b/gi);
  return match ? match.join(" ") : "";
}

function makeInquiry(text: string): AiOpsInquiry {
  const now = new Date();
  return {
    id: `proto-${now.getTime()}`,
    name: CLIENT_NAME,
    whatsapp: "081234567890",
    email: null,
    destination: inferDestination(text),
    travelDate: inferTravelDate(text),
    message: text,
    source: "wa-prototype",
    status: "NEW",
    createdAt: now,
    updatedAt: now,
  };
}

function makeClientReply(recommendation: AiOpsRecommendation, isFollowUp: boolean) {
  if (!isFollowUp) return recommendation.replyDraft;
  return recommendation.replyDraft.replace(/^Halo Kak .*?Sundaf Trip\.\n\n/, "Siap Kak, saya update catatan.\n\n");
}

function priorityTone(priority: AiOpsRecommendation["priority"]) {
  if (priority === "hot") return "border-red-200 bg-red-50 text-red-700";
  if (priority === "warm") return "border-amber-200 bg-amber-50 text-amber-700";
  if (priority === "stale") return "border-orange-200 bg-orange-50 text-orange-700";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

export default function WhatsAppClientPrototype() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [lastSignal, setLastSignal] = useState<PrototypeSignal | null>(null);
  const messageCounter = useRef(0);

  const leadSummary = useMemo(() => {
    if (!lastSignal) {
      return {
        intent: "Belum ada intent",
        priority: "normal" as AiOpsRecommendation["priority"],
        resolution: "collecting" as AiOpsRecommendation["resolution"],
        resolutionLabel: "Belum mulai",
        nextAction: "Menunggu pesan pertama dari calon client.",
        matchedTours: [],
      };
    }
    return lastSignal;
  }, [lastSignal]);

  const facts = lastSignal?.facts ?? EMPTY_FACTS;
  const isTerminal = lastSignal ? TERMINAL_RESOLUTIONS.has(lastSignal.resolution) : false;

  function resetChat() {
    setMessages(INITIAL_MESSAGES);
    setInput("");
    setIsTyping(false);
    setLastSignal(null);
  }

  function sendMessage(value?: string) {
    const text = (value ?? input).trim();
    if (!text || isTyping || isTerminal) return;
    messageCounter.current += 1;
    const clientId = messageCounter.current;

    const clientMessage: ChatMessage = {
      id: `client-${clientId}`,
      sender: "client",
      text,
      time: clockLabel(),
    };

    const previousClientMessages = messages.filter((message) => message.sender === "client").map((message) => message.text);
    const conversationText = [...previousClientMessages, text].join("\n");
    const factsForConversation = extractLeadFacts(conversationText);
    const recommendation = buildLeadRecommendation(makeInquiry(conversationText), DEMO_TOURS);
    const signal: PrototypeSignal = { ...recommendation, facts: factsForConversation };
    const isFollowUp = previousClientMessages.length > 0;

    setMessages((current) => [...current, clientMessage]);
    setInput("");
    setIsTyping(true);

    window.setTimeout(() => {
      messageCounter.current += 1;
      const sundafId = messageCounter.current;
      setLastSignal(signal);
      setMessages((current) => [
        ...current,
        {
          id: `sundaf-${sundafId}`,
          sender: "sundaf",
          text: makeClientReply(recommendation, isFollowUp),
          time: clockLabel(),
        },
      ]);
      setIsTyping(false);
    }, 650);
  }

  return (
    <main className="min-h-screen bg-[#edf2f1] text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-3 py-1 text-xs font-black uppercase text-teal-700 shadow-sm">
              <Sparkles size={14} />
              Sundaf Halo AI Prototype
            </div>
            <h1 className="mt-3 text-2xl font-black tracking-normal text-[#222831] sm:text-3xl">
              Simulasi WhatsApp calon client
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Kamu berperan sebagai calon client. Sundaf sekarang mengingat konteks chat bertahap, bukan cuma membaca pesan terakhir.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/ai-ops"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Bot size={16} />
              AI Ops
            </Link>
            <button
              type="button"
              onClick={resetChat}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#222831] px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-black"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </header>

        <div className="grid flex-1 gap-5 lg:grid-cols-[minmax(340px,440px)_minmax(320px,1fr)] lg:items-stretch">
          <section className="mx-auto flex w-full max-w-[440px] flex-col rounded-[28px] border-[10px] border-[#111827] bg-[#111827] shadow-2xl">
            <div className="flex h-[720px] max-h-[calc(100vh-150px)] min-h-[620px] flex-col overflow-hidden rounded-[18px] bg-[#efeae2]">
              <div className="flex h-16 shrink-0 items-center gap-3 bg-[#075e54] px-3 text-white">
                <button type="button" title="Kembali" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10">
                  <ArrowLeft size={20} />
                </button>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <Plane size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black">Sundaf Trip</p>
                  <p className="truncate text-xs text-white/75">{isTyping ? "mengetik..." : "online"}</p>
                </div>
                <button type="button" title="Telepon" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10">
                  <Phone size={18} />
                </button>
                <button type="button" title="Menu" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10">
                  <MoreVertical size={19} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-4">
                <div className="mx-auto mb-4 w-fit rounded-lg bg-[#fff3c4] px-3 py-2 text-center text-[11px] font-semibold leading-relaxed text-slate-700 shadow-sm">
                  Prototype lokal. Belum terhubung ke WhatsApp Business API.
                </div>

                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "client" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[82%] rounded-lg px-3 py-2 text-sm leading-relaxed shadow-sm ${
                          message.sender === "client"
                            ? "bg-[#dcf8c6] text-slate-900"
                            : "bg-white text-slate-900"
                        }`}
                      >
                        <p className="whitespace-pre-line text-left">{message.text}</p>
                        <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-500">
                          <span>{message.time}</span>
                          {message.sender === "client" && <CheckCheck size={14} className="text-sky-500" />}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-1 rounded-lg bg-white px-3 py-3 shadow-sm">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:120ms]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:240ms]" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="shrink-0 border-t border-black/5 bg-[#f0f2f5] p-3">
                <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
                  {QUICK_MESSAGES.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => sendMessage(item)}
                      disabled={isTyping || isTerminal}
                      className="shrink-0 rounded-full border border-teal-200 bg-white px-3 py-1.5 text-left text-xs font-bold text-teal-800 shadow-sm transition hover:bg-teal-50 disabled:opacity-50"
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <form
                  className="flex items-end gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    sendMessage();
                  }}
                >
                  <button type="button" title="Lampiran" className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-black/5">
                    <Paperclip size={20} />
                  </button>
                  <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Ketik sebagai calon client"
                    rows={1}
                    disabled={isTerminal}
                    className="max-h-28 min-h-10 flex-1 resize-none rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  />
                  <button
                    type="submit"
                    title="Kirim"
                    disabled={!input.trim() || isTyping || isTerminal}
                    className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#128c7e] text-white transition hover:bg-[#0f766d] disabled:bg-slate-300"
                  >
                    <Send size={18} />
                  </button>
                </form>
                {isTerminal && (
                  <div className="mt-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-bold text-green-800">
                    Selesai. Admin mengambil alih. Tekan Reset untuk simulasi baru.
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                  <UserRound size={21} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-slate-500">Client View</p>
                  <h2 className="text-lg font-black text-[#222831]">Calon client: {CLIENT_NAME}</h2>
                </div>
              </div>
              <div className="mt-5 space-y-3 text-sm">
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs font-black uppercase text-slate-500">Intent</p>
                  <p className="mt-1 font-bold text-slate-900">{leadSummary.intent}</p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className={isTerminal ? "text-green-600" : "text-slate-400"} />
                    <p className="text-xs font-black uppercase text-slate-500">Penyelesaian</p>
                  </div>
                  <p className="mt-1 font-bold text-slate-900">{leadSummary.resolutionLabel}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-slate-200 p-3">
                    <p className="text-xs font-black uppercase text-slate-500">Tujuan</p>
                    <p className="mt-1 font-bold text-slate-900">{facts.destination || "-"}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-3">
                    <p className="text-xs font-black uppercase text-slate-500">Pax</p>
                    <p className="mt-1 font-bold text-slate-900">{facts.pax || "-"}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-3">
                    <p className="text-xs font-black uppercase text-slate-500">Tanggal</p>
                    <p className="mt-1 font-bold text-slate-900">{facts.travelDate || "-"}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-3">
                    <p className="text-xs font-black uppercase text-slate-500">Budget</p>
                    <p className="mt-1 font-bold text-slate-900">{facts.budget || "-"}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs font-black uppercase text-slate-500">Next action</p>
                  <p className="mt-1 leading-relaxed text-slate-700">{leadSummary.nextAction}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className={`w-fit rounded-full border px-3 py-1 text-xs font-black ${priorityTone(leadSummary.priority)}`}>
                    Priority: {leadSummary.priority.toUpperCase()}
                  </div>
                  <div className="w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-700">
                    Confidence: {facts.confidence.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                  <ShieldCheck size={21} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-slate-500">Backstage</p>
                  <h2 className="text-lg font-black text-[#222831]">AI Ops Signal</h2>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                  <p className="text-xs font-black uppercase text-slate-500">Yang masih kurang</p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {!lastSignal ? "Belum mulai" : facts.missingFields.length ? facts.missingFields.join(", ") : "Tidak ada"}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                  <p className="text-xs font-black uppercase text-slate-500">Sinyal pertanyaan</p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {facts.asks.length ? facts.asks.join(", ") : "Belum ada"}
                  </p>
                </div>
                {leadSummary.matchedTours.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm leading-relaxed text-slate-500">
                    Belum ada paket yang dipilih engine. Kirim pesan tentang Rusia, aurora, visa, atau Asia Tengah.
                  </p>
                ) : (
                  leadSummary.matchedTours.map((tour) => (
                    <a
                      key={tour.id}
                      href={tour.href}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-lg border border-slate-200 p-3 text-sm transition hover:bg-slate-50"
                    >
                      <p className="font-black text-slate-900">{tour.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{tour.tripDateLabel} - {tour.priceLabel}</p>
                      <p className="mt-1 text-xs font-bold text-teal-700">{tour.seatsLabel}</p>
                    </a>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-[#222831] p-5 text-white shadow-sm xl:col-span-2">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 text-[#00ADB5]">
                  <MessageCircle size={21} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-white/55">V1 Boundary</p>
                  <h2 className="text-lg font-black">Belum auto-send ke WhatsApp asli</h2>
                </div>
              </div>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/75">
                Halaman ini mensimulasikan pengalaman calon client dan keputusan engine. Untuk live, perlu WhatsApp Business Cloud API, webhook inbound message, token Meta, dan aturan eskalasi ke admin manusia.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
