/* Shared B2B land-tour profile.
   /partner  → Billy sebagai sosok utama + PDF versi Billy.
   /b2b      → Ferdiansah + pilihan bahasa ID / ENG / RU. */
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Building2, Compass, CheckCircle2, Phone, Mail, Download,
  Hotel, Bus, Utensils, Ticket, UserCheck, Route, MapPin,
} from "lucide-react";
import { lora } from "@/lib/fonts";
import { getProofPhotos } from "@/lib/b2bGallery";

export type B2BLanguage = "id" | "en" | "ru";
type Tri = Record<B2BLanguage, string>;

const HERO = {
  eyebrow: {
    id: "Private B2B Desk",
    en: "Private B2B Desk",
    ru: "Закрытый B2B-отдел",
  },
  title: {
    id: "Operasional land tour yang siap membawa nama travel Anda.",
    en: "Ground operations worthy of your travel brand.",
    ru: "Наземное обслуживание, достойное вашего туристического бренда.",
  },
  intro: {
    id: "Sundaf Trip menangani operasional land tour untuk travel agent dan mitra terpilih. Fokus utama kami saat ini adalah Rusia dan Asia Tengah, mulai dari desain itinerary dan negosiasi vendor hingga kontrol perjalanan di lapangan. Kami sedang membangun kapasitas dan jaringan untuk scale-up ke Skandinavia dan Kanada.",
    en: "Sundaf Trip manages ground operations for travel agencies and selected partners. Our current core markets are Russia and Central Asia, covering itinerary design, supplier negotiation, and on-ground control. We are building the capacity and supplier network to scale into Scandinavia and Canada.",
    ru: "Sundaf Trip организует наземное обслуживание для туристических агентств и избранных партнёров. Сейчас наши основные рынки — Россия и Центральная Азия: от разработки маршрута и переговоров с поставщиками до контроля программы на месте. Параллельно мы развиваем мощности и сеть поставщиков для выхода в Скандинавию и Канаду.",
  },
  privateNote: {
    id: "Halaman ini dibagikan langsung kepada pihak yang sedang menilai kapasitas operasional, rekam jejak, dan kecocokan kerja sama kami.",
    en: "This page is shared directly with parties assessing our operating capacity, track record, and fit for collaboration.",
    ru: "Эта страница предоставляется напрямую партнёрам, которые оценивают наши операционные возможности, опыт и потенциал сотрудничества.",
  },
  proofOne: {
    id: "Untuk Rusia, struktur itinerary, vendor, dan operasional di destinasi kami kendalikan langsung.",
    en: "For Russia, we directly control itinerary structure, suppliers, and destination operations.",
    ru: "По России мы напрямую контролируем структуру маршрута, поставщиков и наземные операции.",
  },
  proofTwo: {
    id: "Nama travel dan relasi klien tetap berada di tangan partner; Sundaf bekerja sebagai tim operasional di belakangnya.",
    en: "The travel brand and client relationship remain with our partner; Sundaf operates behind the scenes.",
    ru: "Бренд агентства и отношения с клиентом остаются у партнёра; Sundaf работает как операционная команда за кулисами.",
  },
};

const POSITIONING = {
  title: {
    id: "Partner memegang klien. Sundaf memegang kendali operasional.",
    en: "You own the client. Sundaf controls the operation.",
    ru: "Вы ведёте клиента. Sundaf контролирует операционную часть.",
  },
  desc: {
    id: "Kami menyusun scope, costing, vendor, dan jalur eskalasi sebelum keberangkatan. Setiap hal yang belum pasti ditandai sejak awal, bukan disamarkan di dalam paket.",
    en: "We define scope, costing, suppliers, and escalation lines before departure. Any unresolved item is flagged early instead of being buried inside the package.",
    ru: "До выезда мы фиксируем объём услуг, расчёт, поставщиков и порядок эскалации. Все неподтверждённые позиции обозначаются заранее и не скрываются внутри пакета.",
  },
};

const COVERAGE: { Icon: LucideIcon; title: Tri; desc: Tri }[] = [
  {
    Icon: Hotel,
    title: { id: "Hotel & rooming", en: "Hotels & rooming", ru: "Отели и размещение" },
    desc: {
      id: "Seleksi lokasi, kategori kamar, rooming list, serta kebutuhan early check-in dan late check-out.",
      en: "Property selection, room categories, rooming lists, and early check-in or late check-out requirements.",
      ru: "Подбор отелей, категорий номеров, rooming list, а также ранний заезд и поздний выезд.",
    },
  },
  {
    Icon: Bus,
    title: { id: "Transport & driver", en: "Transport & drivers", ru: "Транспорт и водители" },
    desc: {
      id: "Jenis kendaraan, kapasitas bagasi, jam kerja sopir, parkir, dan pergerakan antarkota.",
      en: "Vehicle type, luggage capacity, driver hours, parking, and intercity movements.",
      ru: "Тип транспорта, багажная вместимость, рабочее время водителя, парковки и междугородние переезды.",
    },
  },
  {
    Icon: Utensils,
    title: { id: "Meals & dietary", en: "Meals & dietary needs", ru: "Питание и особые требования" },
    desc: {
      id: "Jadwal makan, kapasitas restoran, menu grup, opsi halal, alergi, dan kebutuhan khusus.",
      en: "Meal timing, restaurant capacity, group menus, halal options, allergies, and special requirements.",
      ru: "График питания, вместимость ресторанов, групповое меню, халяль, аллергии и особые требования.",
    },
  },
  {
    Icon: Ticket,
    title: { id: "Admission & reservation", en: "Admissions & reservations", ru: "Билеты и бронирования" },
    desc: {
      id: "Slot kunjungan, tiket atraksi, reservasi grup, dan batas waktu konfirmasi.",
      en: "Timed entries, attraction tickets, group reservations, and confirmation deadlines.",
      ru: "Временные слоты, входные билеты, групповые бронирования и сроки подтверждения.",
    },
  },
  {
    Icon: UserCheck,
    title: { id: "Kontrol di lapangan", en: "On-ground control", ru: "Контроль на месте" },
    desc: {
      id: "PIC operasional, tour leader berbahasa Indonesia, pengecekan harian, dan jalur eskalasi.",
      en: "An operations PIC, Indonesian-speaking tour leader, daily checks, and a clear escalation line.",
      ru: "Операционный координатор, индонезийскоязычный турлидер, ежедневные проверки и понятная эскалация.",
    },
  },
  {
    Icon: Route,
    title: { id: "Itinerary engineering", en: "Itinerary engineering", ru: "Проектирование маршрута" },
    desc: {
      id: "Rute diuji terhadap durasi perjalanan, jam buka, waktu tempuh, musim, dan ritme grup.",
      en: "Routes are tested against travel time, opening hours, seasonality, and group pace.",
      ru: "Маршрут проверяется с учётом времени в пути, часов работы, сезона и темпа группы.",
    },
  },
];

const DESTINATIONS: { region: Tri; detail: Tri }[] = [
  {
    region: { id: "Rusia", en: "Russia", ru: "Россия" },
    detail: {
      id: "Moscow · St. Petersburg · Murmansk · rute regional",
      en: "Moscow · St. Petersburg · Murmansk · regional routes",
      ru: "Москва · Санкт-Петербург · Мурманск · региональные маршруты",
    },
  },
  {
    region: { id: "Asia Tengah", en: "Central Asia", ru: "Центральная Азия" },
    detail: {
      id: "Kazakhstan · Uzbekistan · Kyrgyzstan · Tajikistan",
      en: "Kazakhstan · Uzbekistan · Kyrgyzstan · Tajikistan",
      ru: "Казахстан · Узбекистан · Кыргызстан · Таджикистан",
    },
  },
  {
    region: { id: "Scale-up berikutnya", en: "Next scale-up", ru: "Следующий этап роста" },
    detail: {
      id: "Skandinavia · Kanada — kapasitas dan jaringan operasional sedang dikembangkan",
      en: "Scandinavia · Canada — operating capacity and supplier network in development",
      ru: "Скандинавия · Канада — развиваем операционные мощности и сеть поставщиков",
    },
  },
];

const WHY: Tri[] = [
  {
    id: "Rekam operasional 50+ grup dan 1.500+ traveler yang ditangani langsung oleh tim Sundaf.",
    en: "An operating record of 50+ groups and 1,500+ travelers handled directly by the Sundaf team.",
    ru: "Операционный опыт: более 50 групп и 1 500 путешественников, обслуженных командой Sundaf.",
  },
  {
    id: "Spesialis grup 10–20 pax, dengan kapasitas dan format yang dinilai per permintaan.",
    en: "Specialists in groups of 10–20 passengers, with larger capacities assessed case by case.",
    ru: "Специализация на группах 10–20 человек; больший объём оценивается индивидуально.",
  },
  {
    id: "Quotation memisahkan scope terkonfirmasi, opsi, exclusion, dan syarat pembayaran secara jelas.",
    en: "Quotations clearly separate confirmed scope, options, exclusions, and payment terms.",
    ru: "В расчёте чётко разделены подтверждённые услуги, опции, исключения и условия оплаты.",
  },
  {
    id: "Satu alur kerja dari review brief hingga kontrol keberangkatan, sehingga handoff tetap terbatas.",
    en: "One operating line from brief review to departure control, keeping handoffs limited.",
    ru: "Единая рабочая линия от анализа запроса до контроля выезда с минимумом передач между командами.",
  },
  {
    id: "Koordinasi white-label tersedia berdasarkan scope dan kesepakatan kerja sama.",
    en: "White-label coordination is available by agreed scope and terms.",
    ru: "White-label координация доступна в рамках согласованного объёма и условий.",
  },
];

const STEPS: { n: string; title: Tri; desc: Tri }[] = [
  {
    n: "1",
    title: { id: "Brief operasional", en: "Operating brief", ru: "Операционный бриф" },
    desc: {
      id: "Kirim rute, tanggal, jumlah pax, kelas hotel, pola makan, dan target waktu quotation.",
      en: "Send the route, dates, passenger count, hotel class, meal pattern, and quotation deadline.",
      ru: "Передайте маршрут, даты, размер группы, категорию отелей, формат питания и срок расчёта.",
    },
  },
  {
    n: "2",
    title: { id: "Feasibility review", en: "Feasibility review", ru: "Проверка реализуемости" },
    desc: {
      id: "Kami menguji urutan rute, waktu tempuh, kapasitas, musim, dan titik risiko sebelum costing.",
      en: "We test route order, travel time, capacity, seasonality, and risk points before costing.",
      ru: "До расчёта мы проверяем логику маршрута, время в пути, вместимость, сезонность и риски.",
    },
  },
  {
    n: "3",
    title: { id: "Quotation & terms", en: "Quotation & terms", ru: "Расчёт и условия" },
    desc: {
      id: "Penawaran merinci inclusion, exclusion, opsi, masa berlaku harga, dan termin pembayaran.",
      en: "The proposal details inclusions, exclusions, options, price validity, and payment schedule.",
      ru: "Предложение фиксирует включённые и исключённые услуги, опции, срок цены и график оплаты.",
    },
  },
  {
    n: "4",
    title: { id: "Pre-departure control", en: "Pre-departure control", ru: "Контроль до выезда" },
    desc: {
      id: "Vendor direkonfirmasi, rooming list dikunci, kebutuhan khusus dicatat, dan PIC dipertemukan.",
      en: "Suppliers are reconfirmed, rooming is locked, special needs are logged, and operating PICs are connected.",
      ru: "Поставщики переподтверждаются, rooming list фиксируется, особые требования регистрируются, координаторы знакомятся.",
    },
  },
  {
    n: "5",
    title: { id: "Operation & review", en: "Operation & review", ru: "Операции и разбор" },
    desc: {
      id: "Tim menjalankan program, mengelola eskalasi, lalu menutup perjalanan dengan evaluasi operasional.",
      en: "The team runs the program, manages escalation, and closes the trip with an operating review.",
      ru: "Команда ведёт программу, управляет эскалациями и завершает поездку операционным разбором.",
    },
  },
];

const TX = {
  coverageHead: { id: "Scope yang Kami Kendalikan", en: "Scope Under Our Control", ru: "Зона нашего контроля" },
  destinationsHead: { id: "Pasar & Arah Scale-Up", en: "Markets & Next Scale-Up", ru: "Направления и следующий этап роста" },
  whyHead: { id: "Dasar untuk Memilih Sundaf", en: "Reasons to Select Sundaf", ru: "Основания выбрать Sundaf" },
  stepsHead: { id: "Alur Kerja Sama", en: "Engagement Process", ru: "Процесс сотрудничества" },
  photosHead: { id: "Bukti Operasional", en: "Operating Evidence", ru: "Операционные подтверждения" },
  photosBody: {
    id: "Dokumentasi dari keberangkatan yang ditangani tim Sundaf di Rusia, Asia Tengah, dan destinasi lainnya.",
    en: "Documentation from departures operated by the Sundaf team in Russia, Central Asia, and other destinations.",
    ru: "Документация поездок, проведённых командой Sundaf в России, Центральной Азии и других направлениях.",
  },
  b2bLead: { id: "B2B Lead", en: "B2B Lead", ru: "Руководитель B2B" },
  ctaHead: { id: "Minta Review Operasional", en: "Request an Operating Review", ru: "Запросить операционную оценку" },
  ctaBody: {
    id: "Kirim brief aktual. Kami akan mengonfirmasi kelayakan rute dan data yang masih dibutuhkan sebelum menyusun harga.",
    en: "Send a live brief. We will confirm route feasibility and any missing information before preparing the price.",
    ru: "Отправьте актуальный запрос. До расчёта мы подтвердим реализуемость маршрута и уточним недостающие данные.",
  },
  wa: { id: "Bahas Request via WhatsApp", en: "Discuss a Request on WhatsApp", ru: "Обсудить запрос в WhatsApp" },
  profile: { id: "Unduh Company Profile", en: "Download Company Profile", ru: "Скачать профиль компании" },
};

const FERDIANSAH = {
  initial: "F",
  name: "Ferdiansah",
  role: "Founder",
  photo: "",
  email: "info@sundaftrip.com",
  whatsappUrl: "https://wa.me/6281775202759",
  desc: {
    id: "Memimpin review brief B2B, struktur penawaran, negosiasi vendor, dan quality control sebelum program dijalankan di lapangan.",
    en: "Leads B2B brief reviews, proposal structure, supplier negotiation, and quality control before programs move on the ground.",
    ru: "Руководит анализом B2B-запросов, структурой предложений, переговорами с поставщиками и контролем качества до начала программы.",
  },
};

const FERDIANSAH_USA_PROOF = {
  src: "/partner/ferdiansah-world-nyc.jpg",
  alt: {
    id: "Ferdiansah bersama grup di New York, Amerika Serikat",
    en: "Ferdiansah with a group in New York, United States",
    ru: "Фердиансах с группой в Нью-Йорке, США",
  },
  caption: {
    id: "Dokumentasi Ferdiansah bersama grup di New York, Amerika Serikat.",
    en: "Ferdiansah with a group in New York, United States.",
    ru: "Фердиансах с группой в Нью-Йорке, США.",
  },
};

const BILLY = {
  initial: "B",
  name: "Billy",
  role: "Co-Founder",
  photo: "/partner/billy.jpg",
  email: "sebastianbilly31@gmail.com",
  whatsappUrl: "https://wa.me/79168896471",
  desc: {
    id: "Memimpin pengembangan kemitraan dan hubungan dengan travel agent, dengan pengalaman mendampingi perjalanan grup internasional.",
    en: "Leads partnership development and travel-agent relations, backed by experience accompanying international group journeys.",
    ru: "Развивает партнёрства и отношения с туристическими агентствами, опираясь на опыт сопровождения международных групп.",
  },
};

const LANGUAGE_LABELS: Record<B2BLanguage, string> = { id: "ID", en: "ENG", ru: "RU" };

export default function B2BLandTour({
  withCofounder = false,
  language = "id",
  showLanguageSwitcher = false,
}: {
  withCofounder?: boolean;
  language?: B2BLanguage;
  showLanguageSwitcher?: boolean;
}) {
  const proofPhotos = getProofPhotos();
  const person = withCofounder ? BILLY : FERDIANSAH;
  const pdfHref = withCofounder
    ? "/sundaftrip-company-profile-billy.pdf"
    : "/sundaftrip-company-profile.pdf";
  const t = (value: Tri) => value[language];
  const head = `text-2xl font-bold text-gray-900 dark:text-white ${lora.className}`;

  return (
    <div className="min-h-screen bg-white pt-24 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {showLanguageSwitcher ? (
          <nav className="mb-8 flex justify-end" aria-label="Language">
            <div className="inline-flex overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              {(["id", "en", "ru"] as B2BLanguage[]).map((code) => (
                <Link
                  key={code}
                  href={`/b2b?lang=${code}`}
                  aria-current={language === code ? "page" : undefined}
                  className={`px-3.5 py-2 text-xs font-bold transition ${
                    language === code
                      ? "bg-gray-900 text-white dark:bg-white dark:text-gray-950"
                      : "text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  {LANGUAGE_LABELS[code]}
                </Link>
              ))}
            </div>
          </nav>
        ) : null}

        <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
          {t(HERO.eyebrow)}
        </span>
        <h1 className={`mb-5 text-4xl font-bold leading-tight text-gray-900 dark:text-white lg:text-5xl ${lora.className}`}>
          {t(HERO.title)}
        </h1>
        <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">{t(HERO.intro)}</p>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          {t(HERO.privateNote)}
        </p>

        <div className="mt-8 space-y-3 text-lg font-medium leading-relaxed text-gray-900 dark:text-gray-100 sm:text-xl">
          <p>{t(HERO.proofOne)}</p>
          <p>{t(HERO.proofTwo)}</p>
        </div>

        <div className="mt-8 flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900">
          <Building2 size={18} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="text-sm">
            <p className="font-bold text-gray-900 dark:text-white">{t(POSITIONING.title)}</p>
            <p className="mt-1 leading-relaxed text-gray-600 dark:text-gray-400">{t(POSITIONING.desc)}</p>
          </div>
        </div>

        <h2 className={`mb-5 mt-12 ${head}`}>{t(TX.coverageHead)}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {COVERAGE.map(({ Icon, title, desc }) => (
            <div key={t(title)} className="flex items-start gap-3 rounded-xl border border-gray-200 p-5 dark:border-gray-800">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950">
                <Icon size={17} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{t(title)}</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{t(desc)}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className={`mb-5 mt-12 ${head}`}>{t(TX.destinationsHead)}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {DESTINATIONS.map(({ region, detail }) => (
            <div key={t(region)} className="flex items-start gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <MapPin size={15} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{t(region)}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{t(detail)}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className={`mb-5 mt-12 ${head}`}>{t(TX.whyHead)}</h2>
        <div className="space-y-3">
          {WHY.map((point) => (
            <div key={t(point)} className="flex items-start gap-3">
              <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{t(point)}</p>
            </div>
          ))}
        </div>

        <h2 className={`mb-5 mt-12 ${head}`}>{t(TX.stepsHead)}</h2>
        <div className="space-y-3">
          {STEPS.map(({ n, title, desc }) => (
            <div key={n} className="flex items-start gap-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <div className="b2b-contrast-white flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold !text-white">
                {n}
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{t(title)}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{t(desc)}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className={`mb-1 mt-12 ${head}`}>{t(TX.photosHead)}</h2>
        <p className="mb-5 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{t(TX.photosBody)}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5 lg:grid-cols-5">
          {proofPhotos.map((src, i) => (
            <div
              key={src}
              className="group relative aspect-square overflow-hidden rounded-lg border border-gray-100 bg-gray-100 dark:border-gray-800 dark:bg-gray-900"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${t(TX.photosHead)} ${i + 1}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ))}
        </div>

        <h2 className={`mb-5 mt-12 ${head}`}>{t(TX.b2bLead)}</h2>
        <div>
          <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
            <div className="flex items-center gap-4">
              {person.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={person.photo}
                  alt={person.name}
                  loading="lazy"
                  className="is-round h-20 w-20 shrink-0 object-cover object-top ring-2 ring-blue-600/30 dark:ring-blue-400/30"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                  {person.initial}
                </div>
              )}
              <div>
                <p className={`text-lg font-bold leading-tight text-gray-900 dark:text-white ${lora.className}`}>{person.name}</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">{person.role}</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{t(person.desc)}</p>
          </div>
          {!withCofounder ? (
            <figure className="mt-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={FERDIANSAH_USA_PROOF.src}
                alt={t(FERDIANSAH_USA_PROOF.alt)}
                loading="lazy"
                className="block h-auto w-full rounded-xl border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900"
              />
              <figcaption className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                {t(FERDIANSAH_USA_PROOF.caption)}
              </figcaption>
            </figure>
          ) : null}
        </div>

        <div className="mt-12 rounded-2xl bg-gray-900 p-6 text-center text-white dark:bg-gray-800">
          <h2 className={`mb-2 text-2xl font-bold ${lora.className}`}>{t(TX.ctaHead)}</h2>
          <p className="mb-6 text-sm leading-relaxed text-gray-300">{t(TX.ctaBody)}</p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href={person.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="b2b-contrast-white inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold !text-white transition hover:bg-blue-700"
            >
              <Phone size={16} /> {t(TX.wa)}
            </a>
            <a
              href={pdfHref}
              download
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-600 px-6 py-3 text-sm font-bold text-gray-200 transition hover:bg-gray-800"
            >
              <Download size={16} /> {t(TX.profile)}
            </a>
          </div>
          <div className="mt-5 flex flex-col justify-center gap-x-6 gap-y-1 text-xs text-gray-400 sm:flex-row">
            <span className="inline-flex items-center gap-1.5"><Mail size={12} /> {person.email}</span>
            <span className="inline-flex items-center gap-1.5"><Compass size={12} /> CV Sundaf Holiday Group · NIB 1601260060842</span>
          </div>
        </div>
      </div>
    </div>
  );
}
