"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List, ListOrdered, Link2, Image as ImageIcon, Heading2, Heading3, Quote } from "lucide-react";
import { useEffect } from "react";

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function RichTextEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Tulis konten artikel di sini..." }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!editor) return null;

  function addLink() {
    const url = prompt("URL:");
    if (url) editor?.chain().focus().setLink({ href: url }).run();
  }

  function addImage() {
    const url = prompt("URL gambar:");
    if (url) editor?.chain().focus().setImage({ src: url }).run();
  }

  const tools = [
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold"), title: "Bold" },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic"), title: "Italic" },
    { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }), title: "H2" },
    { icon: Heading3, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive("heading", { level: 3 }), title: "H3" },
    { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList"), title: "Bullet list" },
    { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList"), title: "Ordered list" },
    { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive("blockquote"), title: "Quote" },
    { icon: Link2, action: addLink, active: editor.isActive("link"), title: "Link" },
    { icon: ImageIcon, action: addImage, active: false, title: "Image" },
  ];

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
        {tools.map((tool) => (
          <button key={tool.title} type="button" title={tool.title} onClick={tool.action}
            className={`p-1.5 rounded transition ${tool.active ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"}`}>
            <tool.icon size={16} />
          </button>
        ))}
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-sm dark:prose-invert max-w-none p-4 min-h-[300px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[280px]"
      />
    </div>
  );
}
