import { redirect } from "next/navigation";
import B2BCatalogManager from "@/components/admin/B2BCatalogManager";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function B2BCatalogAdminPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");
  if (!await checkPermission(session, "b2b_catalog_edit")) redirect("/admin");

  const [documents, passwords] = await Promise.all([
    prisma.b2bCatalogDocument.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    prisma.b2bCatalogPassword.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        label: true,
        active: true,
        lastUsedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Katalog B2B Russia</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Upload PDF tour B2B, atur judul yang tampil, dan kelola password travel agent.
        </p>
      </div>

      <B2BCatalogManager
        initialDocuments={documents.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        }))}
        initialPasswords={passwords.map((item) => ({
          ...item,
          lastUsedAt: item.lastUsedAt?.toISOString() ?? null,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        }))}
      />
    </div>
  );
}
