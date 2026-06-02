/* Company profile page content, credibility page aimed at DMC partners.
   Displayed in English or Russian via an in-page toggle (default English).
   PDF download offered in English and Russian. */
"use client";

import { useState } from "react";
import {
  Building2, MapPin, Compass, CheckCircle2, Phone, Mail, Download, ShieldCheck,
} from "lucide-react";
import { lora } from "@/lib/fonts";

type Lang = "en" | "ru";
type Bi = { en: string; ru: string };

const HERO = {
  eyebrow: { en: "Company Profile", ru: "Профиль компании" },
  intro: {
    en: "Sundaf Trip is an Indonesia-based tour operator under CV Sundaf Holiday Group, running affordable, well-curated small group tours to international destinations. We handle every trip end-to-end, itinerary design, ground coordination, and on-ground tour leadership, so each journey is safe, enjoyable, and memorable.",
    ru: "Sundaf Trip, индонезийский туроператор в составе CV Sundaf Holiday Group, организующий доступные, тщательно продуманные туры малыми группами по международным направлениям. Мы ведём каждую поездку под ключ, разработка маршрута, наземная координация и сопровождение тура, чтобы каждое путешествие было безопасным, приятным и запоминающимся.",
  },
  legal1: {
    en: "Registered business · NIB 1601260060842",
    ru: "Зарегистрированная компания · NIB 1601260060842",
  },
  legal2: {
    en: "Based in Jakarta, Indonesia · B2C + B2B tour operator",
    ru: "Базируется в Джакарте, Индонезия · Туроператор B2C + B2B",
  },
};

const STATS: { num: string; label: Bi }[] = [
  { num: "20+", label: { en: "Groups operated in 2025", ru: "Групп проведено в 2025" } },
  { num: "700+", label: { en: "Travelers served", ru: "Путешественников обслужено" } },
  { num: "10–20", label: { en: "Pax per departure", ru: "Человек на выезд" } },
  { num: "B2C + B2B", label: { en: "Business model", ru: "Модель бизнеса" } },
];

const ABOUT: Bi[] = [
  {
    en: "Founded by Ferdiansah, Sundaf Trip was built on the belief that international travel should be accessible to more people. We focus on small group departures with personal attention, giving travelers a high-value experience without the price tag of a private trip.",
    ru: "Компания Sundaf Trip, основанная Фердиансахом, родилась из убеждения, что международные путешествия должны быть доступны большему числу людей. Мы делаем ставку на выезды малыми группами с индивидуальным вниманием, давая путешественникам опыт высокой ценности без цены частного тура.",
  },
  {
    en: "From sourcing vendors and negotiating ground arrangements to designing itineraries and leading groups on location, our team manages the full operation in-house, keeping quality and cost under one roof.",
    ru: "От поиска подрядчиков и согласования наземного обслуживания до разработки маршрутов и сопровождения групп на месте, наша команда ведёт весь процесс собственными силами, удерживая качество и стоимость в одних руках.",
  },
];

const SERVICES: { title: Bi; desc: Bi }[] = [
  {
    title: { en: "Small Group Tours", ru: "Туры малыми группами" },
    desc: {
      en: "Curated international tours for groups of 10–20 pax, with a personal touch and flexible itineraries.",
      ru: "Продуманные международные туры для групп 10–20 человек, с индивидуальным подходом и гибкими маршрутами.",
    },
  },
  {
    title: { en: "End-to-End Coordination", ru: "Полная координация" },
    desc: {
      en: "Flights, accommodation, ground transport, meals, and attraction tickets, organized under one roof.",
      ru: "Авиаперелёты, проживание, наземный транспорт, питание и билеты на достопримечательности, всё в одних руках.",
    },
  },
  {
    title: { en: "Tour Leadership", ru: "Сопровождение тура" },
    desc: {
      en: "Every departure is accompanied by our own Indonesian-speaking tour leader.",
      ru: "Каждую поездку сопровождает наш собственный турлидер со знанием индонезийского.",
    },
  },
  {
    title: { en: "Budget-Friendly Packages", ru: "Доступные пакеты" },
    desc: {
      en: "Value-for-money packages that make international travel accessible to more Indonesian travelers.",
      ru: "Пакеты с оптимальным соотношением цены и качества, делающие международные поездки доступнее.",
    },
  },
  {
    title: { en: "Custom Itinerary Design", ru: "Индивидуальные маршруты" },
    desc: {
      en: "We design itineraries from scratch based on destination appeal, budget, and traveler preferences.",
      ru: "Мы разрабатываем маршруты с нуля, исходя из привлекательности направления, бюджета и предпочтений путешественников.",
    },
  },
  {
    title: { en: "Content & Documentation", ru: "Контент и документация" },
    desc: {
      en: "In-house content production, branded visuals, travel stories, and full trip documentation.",
      ru: "Собственное производство контента, фирменные визуалы, истории путешествий и полная документация поездок.",
    },
  },
];

const DESTINATIONS: { label: Bi; detail: Bi }[] = [
  {
    label: { en: "Current", ru: "Сейчас" },
    detail: {
      en: "Russia (Moscow · St. Petersburg · Murmansk), Central Asia, and India",
      ru: "Россия (Москва · Санкт-Петербург · Мурманск), Центральная Азия и Индия",
    },
  },
  {
    label: { en: "Expanding To", ru: "Расширяемся" },
    detail: {
      en: "Western Europe and Scandinavia",
      ru: "Западная Европа и Скандинавия",
    },
  },
];

const WHY: Bi[] = [
  {
    en: "A proven track record, 20+ groups and 700+ travelers operated through 2025.",
    ru: "Подтверждённый опыт, 20+ групп и 700+ путешественников за 2025 год.",
  },
  {
    en: "Small group specialists, 10–20 pax, for focused and well-coordinated operations.",
    ru: "Специалисты по малым группам, 10–20 человек, для чёткой и слаженной организации.",
  },
  {
    en: "Our own Indonesian-speaking tour leader on every departure.",
    ru: "Собственный турлидер со знанием индонезийского на каждом выезде.",
  },
  {
    en: "End-to-end operations: structured itineraries, clear communication, on-time coordination.",
    ru: "Полный цикл организации: структурированные маршруты, чёткая коммуникация, своевременная координация.",
  },
  {
    en: "A long-term mindset, we build lasting relationships with partners and travelers.",
    ru: "Настрой на долгосрочность, мы строим прочные отношения с партнёрами и путешественниками.",
  },
];

const DMC_STEPS: { n: string; title: Bi; desc: Bi }[] = [
  {
    n: "1",
    title: { en: "Itinerary Planning", ru: "Планирование маршрута" },
    desc: {
      en: "We share our route, destinations, group size, dates, and budget range. Your suggestions based on local knowledge are very welcome.",
      ru: "Мы сообщаем маршрут, направления, размер группы, даты и бюджетный диапазон. Ваши предложения на основе местных знаний приветствуются.",
    },
  },
  {
    n: "2",
    title: { en: "Quotation & Agreement", ru: "Расчёт и соглашение" },
    desc: {
      en: "The DMC partner provides a detailed quotation: hotels, transport, meals, and attraction tickets. We review, negotiate, and confirm.",
      ru: "DMC-партнёр предоставляет подробный расчёт: отели, транспорт, питание и билеты. Мы изучаем, обсуждаем и подтверждаем.",
    },
  },
  {
    n: "3",
    title: { en: "Pre-Trip Coordination", ru: "Координация до поездки" },
    desc: {
      en: "Final rooming list, dietary needs, and special requests are shared 3–4 weeks before departure.",
      ru: "Финальный список размещения, требования по питанию и особые пожелания передаются за 3–4 недели до вылета.",
    },
  },
  {
    n: "4",
    title: { en: "On-Ground Execution", ru: "Работа на месте" },
    desc: {
      en: "Our tour leader manages the group; the DMC partner handles local logistics, drivers, hotel check-ins, and daily coordination.",
      ru: "Наш турлидер ведёт группу; DMC-партнёр отвечает за местную логистику, водитель, заселение, ежедневная координация.",
    },
  },
  {
    n: "5",
    title: { en: "Post-Trip Review", ru: "Анализ после поездки" },
    desc: {
      en: "We share traveler feedback and discuss improvements for future departures.",
      ru: "Мы делимся отзывами путешественников и обсуждаем улучшения для будущих выездов.",
    },
  },
];

const PHOTOS: { src: string; caption: Bi }[] = [
  { src: "/trip-photos/trip-1.jpg", caption: { en: "Red Square · Moscow", ru: "Красная площадь · Москва" } },
  { src: "/trip-photos/trip-4.jpg", caption: { en: "Kaindy Lake · Kazakhstan", ru: "Озеро Каинды · Казахстан" } },
  { src: "/trip-photos/trip-6.jpg", caption: { en: "Group departure · Moscow", ru: "Вылет группы · Москва" } },
];

const SNAPSHOT: { k: Bi; v: Bi }[] = [
  { k: { en: "Legal Entity", ru: "Юридическое лицо" }, v: { en: "CV Sundaf Holiday Group", ru: "CV Sundaf Holiday Group" } },
  { k: { en: "Business License (NIB)", ru: "Лицензия (NIB)" }, v: { en: "1601260060842", ru: "1601260060842" } },
  { k: { en: "Headquarters", ru: "Главный офис" }, v: { en: "Jakarta, Indonesia", ru: "Джакарта, Индонезия" } },
  { k: { en: "Founder", ru: "Основатель" }, v: { en: "Ferdiansah", ru: "Фердиансах" } },
  { k: { en: "Business Model", ru: "Модель бизнеса" }, v: { en: "B2C + B2B Tour Operator", ru: "Туроператор B2C + B2B" } },
  { k: { en: "Tour Leadership", ru: "Сопровождение" }, v: { en: "Own Indonesian-speaking tour leader", ru: "Собственный турлидер со знанием индонезийского" } },
];

const TX = {
  aboutHead: { en: "About Us", ru: "О компании" },
  servicesHead: { en: "Our Services", ru: "Наши услуги" },
  destHead: { en: "Destinations We Serve", ru: "Направления" },
  whyHead: { en: "Why Sundaf Trip", ru: "Почему Sundaf Trip" },
  dmcHead: { en: "How We Work With DMC Partners", ru: "Как мы работаем с DMC-партнёрами" },
  photosHead: { en: "Real Departures", ru: "Реальные выезды" },
  photosSub: {
    en: "A selection of groups we have operated in Russia, Central Asia, and beyond.",
    ru: "Подборка групп, которые мы провели по России, Центральной Азии и не только.",
  },
  snapshotHead: { en: "Company Snapshot", ru: "Кратко о компании" },
  ctaHead: { en: "Partner With Sundaf Trip", ru: "Партнёрство с Sundaf Trip" },
  ctaBody: {
    en: "Download our full company profile, or reach out directly, we respond to every enquiry.",
    ru: "Скачайте полный профиль компании или свяжитесь с нами напрямую, мы отвечаем на каждый запрос.",
  },
  ctaWa: { en: "Contact via WhatsApp", ru: "Написать в WhatsApp" },
  pdfPrefix: { en: "Company Profile", ru: "Профиль компании" },
};

export default function CompanyProfileContent() {
  const [lang, setLang] = useState<Lang>("en");
  const t = (v: Bi) => v[lang];
  const head = `mt-12 mb-5 text-2xl font-bold text-gray-900 dark:text-white ${lora.className}`;

  const tabBase = "px-3 py-1.5 text-xs font-bold transition";
  const tabOn = "bg-blue-600 text-white";
  const tabOff = "bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white";

  return (
    <div className="min-h-screen pt-24 bg-white dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Language toggle ── */}
        <div className="flex justify-end mb-4">
          <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button onClick={() => setLang("en")} className={`${tabBase} ${lang === "en" ? tabOn : tabOff}`}>
              English
            </button>
            <button onClick={() => setLang("ru")} className={`${tabBase} ${lang === "ru" ? tabOn : tabOff}`}>
              Русский
            </button>
          </div>
        </div>

        {/* ── Hero ── */}
        <span className="inline-block text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">
          {t(HERO.eyebrow)}
        </span>
        <h1 className={`text-4xl lg:text-5xl font-bold leading-tight mb-5 text-gray-900 dark:text-white ${lora.className}`}>
          Sundaf Trip
        </h1>
        <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">{t(HERO.intro)}</p>

        {/* ── Legal entity ── */}
        <div className="mt-8 flex items-start gap-3 p-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <Building2 size={18} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="text-sm">
            <p className="font-bold text-gray-900 dark:text-white">CV Sundaf Holiday Group</p>
            <p className="mt-1 flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <ShieldCheck size={13} /> {t(HERO.legal1)}
            </p>
            <p className="mt-0.5 text-gray-500 dark:text-gray-400">{t(HERO.legal2)}</p>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STATS.map(({ num, label }) => (
            <div key={num} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
              <p className={`text-2xl font-bold text-blue-600 dark:text-blue-400 ${lora.className}`}>{num}</p>
              <p className="mt-1 text-[11px] leading-tight text-gray-500 dark:text-gray-400">{t(label)}</p>
            </div>
          ))}
        </div>

        {/* ── About ── */}
        <h2 className={head}>{t(TX.aboutHead)}</h2>
        {ABOUT.map((p, i) => (
          <p key={i} className={`text-sm leading-relaxed text-gray-600 dark:text-gray-400 ${i > 0 ? "mt-3" : ""}`}>
            {t(p)}
          </p>
        ))}

        {/* ── Services ── */}
        <h2 className={head}>{t(TX.servicesHead)}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SERVICES.map(({ title, desc }) => (
            <div key={title.en} className="p-5 rounded-xl border border-gray-100 dark:border-gray-800">
              <p className="font-bold text-gray-900 dark:text-white">{t(title)}</p>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{t(desc)}</p>
            </div>
          ))}
        </div>

        {/* ── Destinations ── */}
        <h2 className={head}>{t(TX.destHead)}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DESTINATIONS.map(({ label, detail }) => (
            <div key={label.en} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
              {label.en === "Current"
                ? <MapPin size={15} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
                : <Compass size={15} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />}
              <div>
                <p className="font-bold text-sm text-gray-900 dark:text-white">{t(label)}</p>
                <p className="text-xs mt-0.5 text-gray-500 dark:text-gray-400">{t(detail)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Why ── */}
        <h2 className={head}>{t(TX.whyHead)}</h2>
        <div className="space-y-3">
          {WHY.map((point) => (
            <div key={point.en} className="flex items-start gap-3">
              <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{t(point)}</p>
            </div>
          ))}
        </div>

        {/* ── How we work with DMC partners ── */}
        <h2 className={head}>{t(TX.dmcHead)}</h2>
        <div className="space-y-3">
          {DMC_STEPS.map(({ n, title, desc }) => (
            <div key={n} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
                {n}
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{t(title)}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{t(desc)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Real departures ── */}
        <h2 className={`${head} mb-1`}>{t(TX.photosHead)}</h2>
        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">{t(TX.photosSub)}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PHOTOS.map(({ src, caption }) => (
            <div key={src} className="relative aspect-[3/2] rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={t(caption)} loading="lazy" className="w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pt-8 pb-2">
                <p className="text-[11px] font-semibold text-white">{t(caption)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Company snapshot ── */}
        <h2 className={head}>{t(TX.snapshotHead)}</h2>
        <div className="rounded-xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
          {SNAPSHOT.map(({ k, v }) => (
            <div key={k.en} className="flex justify-between gap-4 px-5 py-3">
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{t(k)}</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white text-right">{t(v)}</span>
            </div>
          ))}
        </div>

        {/* ── CTA ── */}
        <div className="mt-12 p-6 rounded-2xl bg-gray-900 dark:bg-gray-800 text-center">
          <h2 className={`text-2xl font-bold text-white mb-2 ${lora.className}`}>{t(TX.ctaHead)}</h2>
          <p className="text-sm text-gray-300 mb-6">{t(TX.ctaBody)}</p>
          <a
            href="https://wa.me/6281775202759"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 font-bold text-sm rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition"
          >
            <Phone size={16} /> {t(TX.ctaWa)}
          </a>
          <div className="mt-3 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/sundaftrip-company-profile.pdf"
              download
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 font-bold text-sm rounded-xl border border-gray-600 text-gray-200 hover:bg-gray-800 transition"
            >
              <Download size={15} /> {t(TX.pdfPrefix)} · English
            </a>
            <a
              href="/sundaftrip-company-profile-ru.pdf"
              download
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 font-bold text-sm rounded-xl border border-gray-600 text-gray-200 hover:bg-gray-800 transition"
            >
              <Download size={15} /> {t(TX.pdfPrefix)} · Русский
            </a>
          </div>
          <div className="mt-5 flex flex-col sm:flex-row gap-x-6 gap-y-1 justify-center text-xs text-gray-400">
            <span className="inline-flex items-center gap-1.5">
              <Mail size={12} /> info@sundaftrip.com
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Compass size={12} /> sundaftrip.com
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
