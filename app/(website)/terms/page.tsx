export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";



export default async function TermsPage() {
  const tc = await prisma.termsCondition.findFirst();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pt-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Syarat & Ketentuan</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10">CV Sundaf Holiday Group</p>

        {tc?.bodyId ? (
          <div className="prose prose-blue dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: tc.bodyId }} />
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 text-center text-gray-400">
            <p>Syarat & Ketentuan akan segera tersedia.</p>
          </div>
        )}
      </div>
    </div>
  );
}
