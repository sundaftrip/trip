import Link from "next/link";
import { CMS_CONTENT_MAP } from "@/lib/cms-content-map";

export default function ContentMapPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Peta Konten Website</h1>
        <p className="mt-1 max-w-3xl text-sm text-gray-500 dark:text-gray-400">Temukan tempat mengedit informasi publik. Bagian yang belum memiliki kontrol CMS ditandai terbuka di bawah, bukan dianggap sudah terhubung.</p>
      </header>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <table className="w-full min-w-[680px] text-left text-sm">
          <caption className="sr-only">Hubungan bagian website dengan kontrol CMS dan batasannya</caption>
          <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
            <tr><th scope="col" className="w-1/4 px-5 py-3">Bagian publik</th><th scope="col" className="w-1/5 px-5 py-3">Buka editor</th><th scope="col" className="px-5 py-3">Sumber dan batasan</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {CMS_CONTENT_MAP.map((item) => <tr key={item.area}>
              <th scope="row" className="px-5 py-4 align-top font-medium text-gray-900 dark:text-white">{item.area}<span className="mt-1 block text-xs font-normal text-gray-500">{item.publicPath}</span></th>
              <td className="px-5 py-4 align-top">{item.controls.length ? <div className="flex flex-col items-start gap-2">{item.controls.map((control) => <Link key={control.href} href={control.href} className="font-medium text-blue-700 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 dark:text-blue-300">{control.label}</Link>)}</div> : <span className="text-gray-500">Belum ada editor CMS</span>}</td>
              <td className="px-5 py-4 align-top leading-relaxed text-gray-600 dark:text-gray-300">{item.note}</td>
            </tr>)}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500">Tautan editor tetap mengikuti izin akun. Perubahan CMS tidak mengganti format PDF. Gunakan hanya informasi yang sudah diperiksa sebelum menyimpan atau mempublikasikan.</p>
    </div>
  );
}
