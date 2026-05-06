import BlogForm from "@/components/admin/BlogForm";

export default function NewBlogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tulis Artikel</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Buat artikel blog baru</p>
      </div>
      <BlogForm />
    </div>
  );
}
