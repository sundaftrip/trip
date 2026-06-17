import { formatCurrency } from "@/lib/utils";

const JAKARTA_TIME_ZONE = "Asia/Jakarta";
const DEFAULT_DP_AMOUNT = 1_500_000;
const SECOND_PAYMENT_DELAY_DAYS = 7;
const STANDARD_FINAL_LEAD_DAYS = 21;
const MEDIUM_FINAL_LEAD_DAYS = 14;
const CLOSE_FINAL_LEAD_DAYS = 7;
const URGENT_FINAL_LEAD_DAYS = 2;

export interface PaymentPlanStep {
  label: string;
  dueDate: Date;
  dueDateLabel: string;
  amount: number;
  amountLabel: string;
}

export interface TourPaymentPlan {
  title: string;
  intro: string;
  paymentMethodsLabel: string;
  urgencyLabel: string;
  totalAmount: number;
  totalLabel: string;
  finePrint: string;
  steps: PaymentPlanStep[];
}

interface BuildTourPaymentPlanInput {
  totalAmount: number;
  departureDate?: Date | string | null;
  seatsLeft?: number | null;
  paymentPlanConfig?: unknown;
  now?: Date;
}

interface StoredPaymentPlanConfig {
  mode?: unknown;
  title?: unknown;
  intro?: unknown;
  paymentMethodsLabel?: unknown;
  urgencyLabel?: unknown;
  finePrint?: unknown;
  steps?: unknown;
}

function jakartaDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: JAKARTA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
}

function toJakartaDateOnly(date: Date | string) {
  const parsed = typeof date === "string" ? new Date(date) : date;
  const parts = jakartaDateParts(parsed);
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12, 0, 0));
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function daysBetween(start: Date, end: Date) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((end.getTime() - start.getTime()) / msPerDay);
}

function roundToThousand(amount: number) {
  return Math.round(amount / 1000) * 1000;
}

function defaultDpAmount(totalAmount: number) {
  if (totalAmount < 3_000_000) return roundToThousand(totalAmount * 0.35);
  return Math.min(DEFAULT_DP_AMOUNT, roundToThousand(totalAmount * 0.45));
}

function formatPaymentDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: JAKARTA_TIME_ZONE,
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function makeStep(label: string, dueDate: Date, amount: number): PaymentPlanStep {
  const safeAmount = Math.max(0, roundToThousand(amount));
  return {
    label,
    dueDate,
    dueDateLabel: formatPaymentDate(dueDate),
    amount: safeAmount,
    amountLabel: formatCurrency(safeAmount),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function textOrDefault(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function validDate(value: unknown) {
  if (!(value instanceof Date) && typeof value !== "string") return null;

  const date = toJakartaDateOnly(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function storedPaymentPlanConfig(value: unknown): StoredPaymentPlanConfig | null {
  return isRecord(value) ? value : null;
}

function buildManualPaymentPlan(
  input: BuildTourPaymentPlanInput,
  config: StoredPaymentPlanConfig,
  totalAmount: number,
): TourPaymentPlan | null {
  if (!Array.isArray(config.steps)) return null;

  const steps = config.steps.flatMap((rawStep) => {
    if (!isRecord(rawStep)) return [];

    const label = typeof rawStep.label === "string" ? rawStep.label.trim() : "";
    const dueDate = validDate(rawStep.dueDate);
    const amount = Number(rawStep.amount);
    if (!label || !dueDate || !Number.isFinite(amount) || amount < 0) return [];

    return [makeStep(label, dueDate, amount)];
  });

  if (steps.length === 0) return null;

  return {
    title: textOrDefault(config.title, "Booking Seat DP 1 Juta-an"),
    intro: textOrDefault(
      config.intro,
      "Pembayaran aman dan fleksibel. Kamu cukup bayar DP dulu, sisanya dicicil santai sesuai skema pembayaran.",
    ),
    paymentMethodsLabel: textOrDefault(
      config.paymentMethodsLabel,
      "Tersedia bank transfer, QRIS, e-wallet, dan metode lain yang tersedia.",
    ),
    urgencyLabel: textOrDefault(config.urgencyLabel, urgencyLabel(input.seatsLeft)),
    totalAmount,
    totalLabel: formatCurrency(totalAmount),
    finePrint: textOrDefault(config.finePrint, "Jadwal pembayaran disesuaikan oleh tim Sundaf di CMS."),
    steps,
  };
}

function finalLeadDays(daysToDeparture: number) {
  if (daysToDeparture >= 45) return STANDARD_FINAL_LEAD_DAYS;
  if (daysToDeparture >= 21) return MEDIUM_FINAL_LEAD_DAYS;
  if (daysToDeparture >= 10) return CLOSE_FINAL_LEAD_DAYS;
  if (daysToDeparture >= 3) return URGENT_FINAL_LEAD_DAYS;
  return 0;
}

function splitRemainingInHalf(totalAmount: number, dpAmount: number) {
  const remainingAmount = Math.max(0, totalAmount - dpAmount);
  const secondAmount = roundToThousand(remainingAmount / 2);

  return {
    secondAmount,
    finalAmount: remainingAmount - secondAmount,
  };
}

function urgencyLabel(seatsLeft?: number | null) {
  if (typeof seatsLeft === "number" && seatsLeft > 0) {
    return `Sisa ${seatsLeft} traveler lagi - gas sebelum habis 🙂`;
  }

  return "Booking sekarang - tim Sundaf bantu cek seat";
}

export function buildTourPaymentPlan(input: BuildTourPaymentPlanInput): TourPaymentPlan | null {
  const totalAmount = roundToThousand(Number(input.totalAmount));
  if (!Number.isFinite(totalAmount) || totalAmount <= 0) return null;

  const bookingDate = toJakartaDateOnly(input.now ?? new Date());
  const config = storedPaymentPlanConfig(input.paymentPlanConfig);
  if (config?.mode === "hidden") return null;
  if (config?.mode === "manual") return buildManualPaymentPlan(input, config, totalAmount);

  const departureDate = input.departureDate ? toJakartaDateOnly(input.departureDate) : null;
  if (!departureDate) return null;

  const daysToDeparture = daysBetween(bookingDate, departureDate);
  if (daysToDeparture <= 0) return null;

  const dpAmount = Math.min(defaultDpAmount(totalAmount), totalAmount);
  const secondDueDate = addDays(bookingDate, SECOND_PAYMENT_DELAY_DAYS);
  const finalDueDate = addDays(departureDate, -finalLeadDays(daysToDeparture));

  if (daysToDeparture <= 2) {
    return {
      title: "Booking Seat dan Pelunasan",
      intro: "Keberangkatan sudah sangat dekat. Tim Sundaf akan bantu cek seat sebelum pembayaran diproses.",
      paymentMethodsLabel: "Tersedia bank transfer, QRIS, e-wallet, dan metode lain yang tersedia.",
      urgencyLabel: urgencyLabel(input.seatsLeft),
      totalAmount,
      totalLabel: formatCurrency(totalAmount),
      finePrint: "Jadwal mengikuti tanggal booking dan tanggal keberangkatan.",
      steps: [
        makeStep("Pembayaran", bookingDate, totalAmount),
      ],
    };
  }

  if (finalDueDate <= secondDueDate) {
    const finalAmount = totalAmount - dpAmount;
    return {
      title: "Booking Seat DP Ringan",
      intro: "Pembayaran aman dan fleksibel. Kamu cukup amankan seat dulu, sisanya dilunasi sesuai tempo sebelum berangkat.",
      paymentMethodsLabel: "Tersedia bank transfer, QRIS, e-wallet, dan metode lain yang tersedia.",
      urgencyLabel: urgencyLabel(input.seatsLeft),
      totalAmount,
      totalLabel: formatCurrency(totalAmount),
      finePrint: "Jadwal otomatis mengikuti tanggal booking dan tanggal keberangkatan.",
      steps: [
        makeStep("DP1", bookingDate, dpAmount),
        makeStep("Pelunasan", finalDueDate, finalAmount),
      ],
    };
  }

  const { secondAmount, finalAmount } = splitRemainingInHalf(totalAmount, dpAmount);

  return {
    title: "Booking Seat DP 1 Juta-an",
    intro: "Pembayaran aman dan fleksibel. Kamu cukup bayar DP dulu, sisanya dicicil santai sesuai skema pembayaran.",
    paymentMethodsLabel: "Tersedia bank transfer, QRIS, e-wallet, dan metode lain yang tersedia.",
    urgencyLabel: urgencyLabel(input.seatsLeft),
    totalAmount,
    totalLabel: formatCurrency(totalAmount),
    finePrint: "",
    steps: [
      makeStep("DP1", bookingDate, dpAmount),
      makeStep("Cicilan 2", secondDueDate, secondAmount),
      makeStep("Cicilan Terakhir", finalDueDate, finalAmount),
    ],
  };
}
