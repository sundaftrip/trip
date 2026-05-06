import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BlogForm from "@/components/admin/BlogForm";

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.blog.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Artikel</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{post.title}</p>
      </div>
      <BlogForm post={post} />
    </div>
  );
}
