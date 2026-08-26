"use client";

import * as Dialog from "@radix-ui/react-dialog";
import {
  AlertTriangle,
  ExternalLink,
  Flag,
  MessageCircle,
  Reply,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";
import Script from "next/script";
import {
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  VISA_DISCUSSION_REPORT_LABELS,
  VISA_DISCUSSION_REPORT_REASONS,
  VISA_DISCUSSION_TOPIC_LABELS,
  VISA_DISCUSSION_TOPICS,
  type VisaDiscussionPublicState,
  type VisaDiscussionReportReasonInput,
  type VisaDiscussionThread,
} from "@/lib/visa-discussion-public";
import { VISA_DISCUSSION_TURNSTILE_ACTION } from "@/lib/turnstile-verification";
import styles from "./VisaIntelligence.module.css";

type TurnstileOptions = {
  sitekey: string;
  action: string;
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
};

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: TurnstileOptions) => string;
      remove: (widgetId: string) => void;
    };
  }
}

type Props = {
  state: VisaDiscussionPublicState;
  countries: string[];
};

type ReplyTarget = { id: string; label: string };
type ReportTarget = { id: string; label: string };

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function displayDate(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? dateFormatter.format(date)
    : "Tanggal tidak tersedia";
}

function TurnstileWidget({
  ready,
  siteKey,
  resetKey,
  onToken,
}: {
  ready: boolean;
  siteKey: string;
  resetKey: number;
  onToken: (token: string) => void;
}) {
  const holderRef = useRef<HTMLDivElement>(null);
  const onTokenRef = useRef(onToken);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!ready || !siteKey || !holderRef.current || !window.turnstile) return;
    const widgetId = window.turnstile.render(holderRef.current, {
      sitekey: siteKey,
      action: VISA_DISCUSSION_TURNSTILE_ACTION,
      callback: (token) => onTokenRef.current(token),
      "expired-callback": () => onTokenRef.current(""),
      "error-callback": () => onTokenRef.current(""),
    });
    return () => window.turnstile?.remove(widgetId);
  }, [ready, resetKey, siteKey]);

  return (
    <div
      ref={holderRef}
      className={styles.turnstileWidget}
      aria-label="Pemeriksaan anti-spam"
    />
  );
}

export default function VisaDiscussion({ state, countries }: Props) {
  const { threads, writesEnabled, siteKey, availability } = state;
  const [turnstileReady, setTurnstileReady] = useState(false);
  const [formChallengeKey, setFormChallengeKey] = useState(0);
  const [formToken, setFormToken] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [countryName, setCountryName] = useState("");
  const [topic, setTopic] = useState("");
  const [caseContext, setCaseContext] = useState("");
  const [title, setTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const errorRef = useRef<HTMLParagraphElement>(null);

  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [reportReason, setReportReason] =
    useState<VisaDiscussionReportReasonInput>("MISINFORMATION");
  const [reportDetails, setReportDetails] = useState("");
  const [reportToken, setReportToken] = useState("");
  const [reportChallengeKey, setReportChallengeKey] = useState(0);
  const [reporting, setReporting] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportNotice, setReportNotice] = useState("");

  const replyCount = useMemo(
    () => threads.reduce((total, thread) => total + thread.replies.length, 0),
    [threads],
  );
  const sortedCountries = useMemo(
    () => [...new Set(countries.filter(Boolean))].sort((a, b) => a.localeCompare(b, "id")),
    [countries],
  );

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  function resetChallenge() {
    setFormToken("");
    setFormChallengeKey((value) => value + 1);
  }

  function chooseReply(thread: VisaDiscussionThread) {
    setReplyTarget({
      id: thread.id,
      label: `${thread.authorName} — ${thread.title || thread.countryName}`,
    });
    setMessage("");
    setSourceUrl("");
    setNotice("");
    setError("");
    resetChallenge();
    window.setTimeout(() => {
      document.getElementById("visa-discussion-form")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 0);
  }

  function cancelReply() {
    setReplyTarget(null);
    setMessage("");
    setSourceUrl("");
    setNotice("");
    setError("");
    resetChallenge();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!writesEnabled) return;
    setSubmitting(true);
    setNotice("");
    setError("");

    try {
      const response = await fetch("/api/visa-discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName,
          countryName,
          topic,
          caseContext,
          title,
          sourceUrl,
          message,
          parentId: replyTarget?.id,
          website,
          turnstileToken: formToken,
        }),
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!response.ok) {
        throw new Error(payload?.error || "Kiriman belum dapat diterima.");
      }

      const wasReply = Boolean(replyTarget);
      setAuthorName("");
      setCountryName("");
      setTopic("");
      setCaseContext("");
      setTitle("");
      setSourceUrl("");
      setMessage("");
      setWebsite("");
      setReplyTarget(null);
      resetChallenge();
      setNotice(
        wasReply
          ? "Balasanmu sudah diterima dan sedang ditinjau."
          : "Pertanyaanmu sudah masuk untuk ditinjau sebelum ditampilkan.",
      );
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Kiriman belum dapat diterima.",
      );
      resetChallenge();
    } finally {
      setSubmitting(false);
    }
  }

  function openReport(item: VisaDiscussionThread) {
    setReportTarget({
      id: item.id,
      label: item.title || `Balasan ${item.authorName}`,
    });
    setReportReason("MISINFORMATION");
    setReportDetails("");
    setReportToken("");
    setReportError("");
    setReportNotice("");
    setReportChallengeKey((value) => value + 1);
  }

  function closeReport() {
    if (reporting) return;
    setReportTarget(null);
    setReportToken("");
    setReportError("");
    setReportNotice("");
  }

  async function handleReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reportTarget || !writesEnabled) return;
    setReporting(true);
    setReportError("");
    setReportNotice("");

    try {
      const response = await fetch(
        `/api/visa-discussions/${reportTarget.id}/report`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reason: reportReason,
            details: reportDetails,
            turnstileToken: reportToken,
          }),
        },
      );
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!response.ok) {
        throw new Error(payload?.error || "Laporan belum dapat dikirim.");
      }
      setReportNotice(
        "Laporan terkirim. Identitas pelapor tidak ditampilkan dan moderator akan meninjaunya.",
      );
      setReportToken("");
    } catch (submissionError) {
      setReportError(
        submissionError instanceof Error
          ? submissionError.message
          : "Laporan belum dapat dikirim.",
      );
      setReportToken("");
      setReportChallengeKey((value) => value + 1);
    } finally {
      setReporting(false);
    }
  }

  const previewMessage = availability === "database_required"
    ? "Mode preview aktif. Penyimpanan diskusi belum dihubungkan, jadi kiriman publik masih ditutup."
    : "Mode preview aktif. Kiriman publik baru dibuka setelah perlindungan anti-spam dan moderasi siap.";

  return (
    <div className={styles.discussionGrid}>
      {writesEnabled && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onLoad={() => setTurnstileReady(true)}
          onReady={() => setTurnstileReady(true)}
        />
      )}

      <div className={styles.discussionList}>
        <div className={styles.discussionSafety} role="note">
          <ShieldCheck size={20} aria-hidden="true" />
          <p>
            <strong>Pengalaman komunitas — bukan informasi resmi.</strong>{" "}
            Periksa kembali ke otoritas terkait sebelum mengambil keputusan perjalanan.
          </p>
        </div>
        <div className={styles.discussionMeta} aria-label="Ringkasan percakapan">
          <span>{threads.length} pertanyaan diterbitkan</span>
          <span>{replyCount} balasan diterbitkan</span>
        </div>

        {threads.length > 0 ? (
          threads.map((thread) => (
            <article className={styles.discussionCard} key={thread.id}>
              <div className={styles.commentHeader}>
                <div>
                  <div className={styles.commentBadges}>
                    <span>Pengalaman komunitas</span>
                    {thread.replies.some((reply) => reply.isAdminReply) && (
                      <span className={styles.sundafBadge}>
                        Sudah ditanggapi Sundaf
                      </span>
                    )}
                  </div>
                  <h3>{thread.title || thread.countryName || "Diskusi visa"}</h3>
                  <p>
                    {thread.authorName} · {thread.countryName || "Negara tidak disebutkan"} ·{" "}
                    {thread.topic
                      ? VISA_DISCUSSION_TOPIC_LABELS[thread.topic]
                      : "Topik lainnya"} · {thread.caseContext || "Waktu tidak disebutkan"}
                  </p>
                  <time dateTime={thread.createdAt}>{displayDate(thread.createdAt)}</time>
                </div>
              </div>
              <p className={styles.commentBody}>{thread.message}</p>
              <DiscussionActions
                item={thread}
                writesEnabled={writesEnabled}
                onReply={() => chooseReply(thread)}
                onReport={() => openReport(thread)}
              />

              {thread.replies.length > 0 ? (
                <ol
                  className={styles.replyList}
                  aria-label={`Balasan untuk ${thread.title || thread.authorName}`}
                >
                  {thread.replies.map((reply) => (
                    <li key={reply.id}>
                      <article className={styles.replyCard}>
                        <div className={styles.commentHeader}>
                          <div>
                            <div className={styles.commentBadges}>
                              <span
                                className={reply.isAdminReply ? styles.sundafBadge : undefined}
                              >
                                {reply.isAdminReply ? "Tim Sundaf" : "Pengalaman komunitas"}
                              </span>
                            </div>
                            <h4>{reply.authorName}</h4>
                            <p>Membalas {thread.authorName}</p>
                            <time dateTime={reply.createdAt}>{displayDate(reply.createdAt)}</time>
                          </div>
                        </div>
                        <p className={styles.commentBody}>{reply.message}</p>
                        {reply.sourceUrl && (
                          <a
                            className={styles.commentSource}
                            href={reply.sourceUrl}
                            target="_blank"
                            rel="ugc nofollow noopener noreferrer"
                          >
                            Buka rujukan <ExternalLink size={13} aria-hidden="true" />
                            <span className="sr-only">, membuka tab baru</span>
                          </a>
                        )}
                        <button
                          className={styles.reportButton}
                          type="button"
                          disabled={!writesEnabled}
                          onClick={() => openReport(reply)}
                        >
                          <Flag size={13} aria-hidden="true" /> Laporkan
                        </button>
                      </article>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className={styles.noReplies}>
                  Belum ada balasan. Punya pengalaman relevan atau rujukan yang dapat diperiksa?
                </p>
              )}
            </article>
          ))
        ) : (
          <div className={styles.discussionEmpty}>
            <MessageCircle size={23} aria-hidden="true" />
            <p>
              Belum ada percakapan diterbitkan. Kamu dapat membuka pertanyaan pertama
              dengan konteks yang jelas.
            </p>
          </div>
        )}
      </div>

      <form
        className={styles.discussionForm}
        id="visa-discussion-form"
        onSubmit={handleSubmit}
      >
        <div>
          <p className={styles.eyebrow}>
            {replyTarget ? "Balas dengan informasi" : "Tulis pertanyaan"}
          </p>
          <h3>
            {replyTarget ? "Bagikan konteks yang relevan" : "Ada konteks yang tidak tertulis?"}
          </h3>
          <p>
            Jelaskan apa yang terjadi, kapan, dan bagian mana yang membingungkan.
            Semua kiriman ditinjau sebelum tampil.
          </p>
        </div>

        {!writesEnabled && <p className={styles.previewNotice}>{previewMessage}</p>}

        <div className={styles.privacyWarning} role="note">
          <AlertTriangle size={18} aria-hidden="true" />
          <p>
            Jangan menulis nomor paspor, nomor visa/aplikasi, NIK, kode booking,
            alamat, email, nomor telepon, atau data pembayaran.
          </p>
        </div>

        {replyTarget && (
          <div className={styles.replyTarget}>
            <span>
              Membalas <strong>{replyTarget.label}</strong>
            </span>
            <button type="button" onClick={cancelReply}>Batal</button>
          </div>
        )}

        <label>
          Nama tampilan
          <input
            value={authorName}
            onChange={(event) => setAuthorName(event.target.value)}
            autoComplete="nickname"
            minLength={2}
            maxLength={60}
            placeholder="Contoh: Rina"
            required
          />
        </label>

        {!replyTarget && (
          <>
            <label>
              Negara tujuan
              <input
                value={countryName}
                onChange={(event) => setCountryName(event.target.value)}
                list="visa-discussion-countries"
                minLength={2}
                maxLength={80}
                placeholder="Contoh: Jepang"
                required
              />
              <datalist id="visa-discussion-countries">
                {sortedCountries.map((country) => (
                  <option key={country} value={country} />
                ))}
              </datalist>
            </label>
            <label>
              Topik
              <select value={topic} onChange={(event) => setTopic(event.target.value)} required>
                <option value="">Pilih topik</option>
                {VISA_DISCUSSION_TOPICS.map((value) => (
                  <option key={value} value={value}>
                    {VISA_DISCUSSION_TOPIC_LABELS[value]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Waktu kejadian atau rencana berangkat
              <input
                value={caseContext}
                onChange={(event) => setCaseContext(event.target.value)}
                type="month"
                required
              />
            </label>
            <label>
              Judul pertanyaan
              <span className={styles.characterCount}>{title.length}/120</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                minLength={12}
                maxLength={120}
                placeholder="Contoh: Dokumen tambahan untuk eVisa Jepang"
                required
              />
            </label>
          </>
        )}

        <label>
          Ceritakan situasinya
          <span className={styles.characterCount}>
            {message.length}/{replyTarget ? 1500 : 2000}
          </span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            minLength={replyTarget ? 20 : 40}
            maxLength={replyTarget ? 1500 : 2000}
            placeholder={replyTarget
              ? "Tulis pengalaman atau informasi yang membantu menjawab pertanyaan ini..."
              : "Tuliskan kronologi singkat dan bagian yang ingin kamu pastikan..."}
            required
            rows={7}
          />
        </label>
        <label>
          Tautan rujukan <span className={styles.optionalLabel}>Opsional</span>
          <input
            value={sourceUrl}
            onChange={(event) => setSourceUrl(event.target.value)}
            maxLength={500}
            placeholder="https://..."
            type="url"
          />
        </label>
        <label className={styles.honeypot} aria-hidden="true">
          Website
          <input
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
        </label>

        {writesEnabled && siteKey && (
          <TurnstileWidget
            ready={turnstileReady}
            siteKey={siteKey}
            resetKey={formChallengeKey}
            onToken={setFormToken}
          />
        )}

        <div className={styles.communityRules}>
          <strong>Aturan ringkas</strong>
          <p>
            Bahas masalahnya, bukan menyerang orang. Bedakan pengalaman pribadi dari aturan umum.
            Sertakan sumber bila menyatakan persyaratan. Jangan menawarkan jasa.
          </p>
        </div>

        <div className={styles.formStatus} aria-live="polite">
          {notice && <p className={styles.formNotice}>{notice}</p>}
          {error && (
            <p
              className={styles.formError}
              role="alert"
              ref={errorRef}
              tabIndex={-1}
            >
              {error}
            </p>
          )}
        </div>

        <button type="submit" disabled={submitting || !writesEnabled || !formToken}>
          <Send size={16} aria-hidden="true" />
          {submitting
            ? "Mengirim..."
            : writesEnabled
              ? "Kirim untuk ditinjau"
              : "Kiriman belum dibuka"}
        </button>
      </form>

      <Dialog.Root
        open={Boolean(reportTarget)}
        onOpenChange={(open) => !open && closeReport()}
      >
        <Dialog.Portal>
          <Dialog.Overlay className={styles.dialogOverlay} />
          <Dialog.Content className={styles.reportDialog}>
            <div className={styles.reportDialogHeader}>
              <div>
                <p className={styles.eyebrow}>Moderasi komunitas</p>
                <Dialog.Title>Laporkan konten ini</Dialog.Title>
                <Dialog.Description>{reportTarget?.label}</Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button
                  className={styles.dialogClose}
                  type="button"
                  aria-label="Tutup dialog laporan"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </Dialog.Close>
            </div>

            {reportNotice ? (
              <div className={styles.reportSuccess} role="status">
                <ShieldCheck size={22} aria-hidden="true" />
                <p>{reportNotice}</p>
                <button type="button" onClick={closeReport}>Tutup</button>
              </div>
            ) : (
              <form className={styles.reportForm} onSubmit={handleReport}>
                <p className={styles.reportHint}>
                  Laporkan isi konten, bukan karena kamu berbeda pendapat.
                </p>
                <label>
                  Alasan laporan
                  <select
                    value={reportReason}
                    onChange={(event) => setReportReason(
                      event.target.value as VisaDiscussionReportReasonInput,
                    )}
                  >
                    {VISA_DISCUSSION_REPORT_REASONS.map((reason) => (
                      <option key={reason} value={reason}>
                        {VISA_DISCUSSION_REPORT_LABELS[reason]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Keterangan <span className={styles.optionalLabel}>Opsional</span>
                  <textarea
                    value={reportDetails}
                    onChange={(event) => setReportDetails(event.target.value)}
                    maxLength={300}
                    rows={4}
                    placeholder="Jelaskan bagian yang perlu ditinjau moderator..."
                  />
                </label>
                {writesEnabled && siteKey && (
                  <TurnstileWidget
                    ready={turnstileReady}
                    siteKey={siteKey}
                    resetKey={reportChallengeKey}
                    onToken={setReportToken}
                  />
                )}
                {reportError && (
                  <p className={styles.formError} role="alert">{reportError}</p>
                )}
                <button
                  type="submit"
                  disabled={reporting || !writesEnabled || !reportToken}
                >
                  <Flag size={15} aria-hidden="true" />
                  {reporting ? "Mengirim..." : "Kirim laporan"}
                </button>
              </form>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

function DiscussionActions({
  item,
  writesEnabled,
  onReply,
  onReport,
}: {
  item: VisaDiscussionThread;
  writesEnabled: boolean;
  onReply: () => void;
  onReport: () => void;
}) {
  return (
    <div className={styles.commentActions}>
      {item.sourceUrl && (
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="ugc nofollow noopener noreferrer"
          data-analytics-event="visa_discussion_source_click"
        >
          Buka rujukan <ExternalLink size={13} aria-hidden="true" />
          <span className="sr-only">, membuka tab baru</span>
        </a>
      )}
      <button
        type="button"
        disabled={!writesEnabled || item.isLocked}
        onClick={onReply}
        data-analytics-event="visa_discussion_reply_open"
      >
        <Reply size={14} aria-hidden="true" />
        {item.isLocked ? "Diskusi ditutup" : "Balas dengan informasi"}
      </button>
      <button
        type="button"
        disabled={!writesEnabled}
        onClick={onReport}
        data-analytics-event="visa_discussion_report_open"
      >
        <Flag size={13} aria-hidden="true" /> Laporkan
      </button>
    </div>
  );
}
