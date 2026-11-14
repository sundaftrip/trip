/* Negara awal untuk pool. Dibuat sekali dari CMS (tombol "Buat negara awal").
   Kazakhstan memakai harga dan pengaturan yang sebelumnya ada di Google Sheet
   "SUNDAF · Pool Kazakhstan". Rusia dan Kirgistan dibuat sebagai "segera"
   (daftar minat) sampai paket dan harganya diisi dari CMS. */

import type { KzSettings, PoolContent, PoolEngine, PoolPackageData, PoolStatus } from "./core";

export type PoolDestinationSeed = {
  code: string; name: string; status: PoolStatus; engine: PoolEngine;
  city: string; title: string; lede: string; cap: string;
  milestones: number[]; minDays: number; maxPax: number; quota: number;
  content: PoolContent; settings: KzSettings; sortOrder: number;
  packages: PoolPackageData[];
};

const EMPTY_CONTENT: PoolContent = { incl: [], excl: [], notes: [], pay: [], meet: [], route: [], addons: [] };
const NO_KZ_SETTINGS: KzSettings = { joinMax: 0, kurs: 0, meet: "", meetTime: "", night: null };

const KZ_N = [2, 4, 6, 10, 14, 20, 30];
const tiers = (prices: number[]) => KZ_N.map((n, i) => ({ n, p: prices[i] }));

export const POOL_DEFAULT_DESTINATIONS: readonly PoolDestinationSeed[] = [
  {
    code: "kazakhstan", name: "Kazakhstan", status: "buka", engine: "kazakhstan",
    city: "Almaty", title: "Pool land tour Kazakhstan", lede: "",
    cap: "Harga per orang, paket 5 hari, hotel bintang 3. Belum termasuk tiket pesawat.",
    milestones: [6, 20, 30], minDays: 7, maxPax: 10, quota: 30,
    content: EMPTY_CONTENT,
    settings: { joinMax: 3, kurs: 17950, meet: "Lobi hotel paket (Astra), Almaty", meetTime: "", night: { from: "22:00", to: "06:00", fee: 0 } },
    sortOrder: 10,
    packages: [
      { code: "5", name: "5 hari 4 malam", days: 5, summary: "", single: 1816540, tiers: tiers([10403820, 7864793, 6378533, 6481745, 6543673, 5945040, 5284480]) },
      { code: "6", name: "6 hari 5 malam", days: 6, summary: "", single: 2270675, tiers: tiers([14140113, 9144628, 7596440, 7802865, 7844150, 7142305, 6357890]) },
      { code: "8", name: "8 hari 7 malam", days: 8, summary: "", single: 3178945, tiers: tiers([21612698, 11704298, 10032255, 10445105, 10445105, 9536835, 8504710]) },
    ],
  },
  {
    code: "kirgistan", name: "Kirgistan", status: "segera", engine: "generic",
    city: "Bishkek", title: "", lede: "", cap: "",
    milestones: [6], minDays: 30, maxPax: 10, quota: 0,
    content: EMPTY_CONTENT, settings: NO_KZ_SETTINGS, sortOrder: 20, packages: [],
  },
  {
    code: "rusia", name: "Rusia", status: "segera", engine: "generic",
    city: "Moskow", title: "", lede: "", cap: "",
    milestones: [6], minDays: 30, maxPax: 10, quota: 0,
    content: EMPTY_CONTENT, settings: NO_KZ_SETTINGS, sortOrder: 30, packages: [],
  },
];
