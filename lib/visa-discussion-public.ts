export const VISA_DISCUSSION_TOPICS = [
  "DOCUMENTS",
  "APPLICATION",
  "REFUSAL",
  "TRANSIT",
  "EMBASSY_VFS",
  "OTHER",
] as const;

export const VISA_DISCUSSION_REPORT_REASONS = [
  "PERSONAL_DATA",
  "MISINFORMATION",
  "HARASSMENT",
  "SPAM",
  "IMPERSONATION",
  "OTHER",
] as const;

export type VisaDiscussionTopicInput = (typeof VISA_DISCUSSION_TOPICS)[number];
export type VisaDiscussionReportReasonInput =
  (typeof VISA_DISCUSSION_REPORT_REASONS)[number];

export const VISA_DISCUSSION_TOPIC_LABELS: Record<VisaDiscussionTopicInput, string> = {
  DOCUMENTS: "Dokumen",
  APPLICATION: "Proses aplikasi",
  REFUSAL: "Penolakan atau kendala",
  TRANSIT: "Transit",
  EMBASSY_VFS: "Kedutaan atau VFS",
  OTHER: "Lainnya",
};

export const VISA_DISCUSSION_REPORT_LABELS: Record<
  VisaDiscussionReportReasonInput,
  string
> = {
  PERSONAL_DATA: "Memuat data pribadi",
  MISINFORMATION: "Informasi menyesatkan atau berisiko",
  HARASSMENT: "Pelecehan atau serangan pribadi",
  SPAM: "Spam atau promosi",
  IMPERSONATION: "Menyamar sebagai pihak lain",
  OTHER: "Alasan lain",
};

export type VisaDiscussionThread = {
  id: string;
  parentId: string | null;
  authorName: string;
  countryName: string | null;
  topic: VisaDiscussionTopicInput | null;
  caseContext: string | null;
  title: string | null;
  message: string;
  sourceUrl: string | null;
  isAdminReply: boolean;
  isLocked: boolean;
  createdAt: string;
  replies: VisaDiscussionThread[];
};

export type VisaDiscussionPublicState = {
  threads: VisaDiscussionThread[];
  writesEnabled: boolean;
  siteKey: string;
  availability: "ready" | "configuration_required" | "database_required";
};
