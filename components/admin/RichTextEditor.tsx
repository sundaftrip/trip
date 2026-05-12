"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List, ListOrdered, Link2, Image as ImageIcon, Heading2, Heading3, Quote } from "lucide-react";
import { useEffect, useRef } from "react";

/* ── Markdown-to-HTML converter for paste ── */
function applyInline(text: string): string {
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g,     "<em>$1</em>")
    .replace(/__([^_]+)__/g,     "<strong>$1</strong>")
    .replace(/_([^_]+)_/g,       "<em>$1</em>");
}

function markdownToHtml(text: string): string | null {
  const lines = text.split("\n");
  const hasMd =
    lines.some((l) => /^[-*•]\s/.test(l.trim())) ||
    lines.some((l) => /^\d+\.\s/.test(l.trim())) ||
    lines.some((l) => /^#{1,4}\s/.test(l.trim())) ||
    /\*\*[^*]+\*\*/.test(text) || /__[^_]+__/.test(text);

  if (!hasMd) return null;   // nothing to convert → let Tiptap handle as plain text

  let html = "";
  let inUl = false;
  let inOl = false;

  const closeList = () => {
    if (inUl) { html += "</ul>"; inUl = false; }
    if (inOl) { html += "</ol>"; inOl = false; }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const t    = line.trim();

    if (/^#{1,4}\s/.test(t)) {
      closeList();
      const lvl = Math.min((t.match(/^(#{1,4})/)?.[1].length ?? 1) + 1, 4);
      html += `<h${lvl}>${applyInline(t.replace(/^#{1,4}\s/, ""))}</h${lvl}>`;
    } else if (/^[-*•]\s/.test(t)) {
      if (!inUl) { closeList(); html += "<ul>"; inUl = true; }
      html += `<li>${applyInline(t.replace(/^[-*•]\s/, ""))}</li>`;
    } else if (/^\d+\.\s/.test(t)) {
      if (!inOl) { closeList(); html += "<ol>"; inOl = true; }
      html += `<li>${applyInline(t.replace(/^\d+\.\s/, ""))}</li>`;
    } else {
      closeList();
      html += t === "" ? "" : `<p>${applyInline(t)}</p>`;
    }
  }
  closeList();
  return html || null;
}

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function RichTextEditor({ value, onChange }: Props) {
  // Keep onChange ref fresh so onUpdate never has stale closure
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  const editorRef = useRef<ReturnType<typeof useEditor>>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Tulis konten artikel di sini..." }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChangeRef.current(editor.getHTML()),
    editorProps: {
      handlePaste(_view, event) {
        const html  = event.clipboardData?.getData("text/html")  ?? "";
        const plain = event.clipboardData?.getData("text/plain") ?? "";

        // If clipboard already has real HTML (e.g. from Word / browser), let Tiptap handle
        if (html.trim()) return false;

        // Try to convert markdown plain text → HTML
        const converted = markdownToHtml(plain);
        if (!converted) return false;  // plain prose — let Tiptap handle

        event.preventDefault();
        editorRef.current?.commands.insertContent(converted);
        return true;
      },
    },
  });

  // keep editorRef in sync so handlePaste can access latest editor instance
  useEffect(() => { (editorRef as React.MutableRefObject<typeof editor>).current = editor; }, [editor]);

  // Sync external value changes only on mount (avoid overwriting mid-edit)
  useEffect(() => {
    if (editor && value && value !== editor.getHTML()) {
      editor.commands.setContent(value);
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
    { icon: Bold,        cmd: () => editor.chain().focus().toggleBold().run(),                 active: editor.isActive("bold"),              title: "Bold" },
    { icon: Italic,      cmd: () => editor.chain().focus().toggleItalic().run(),               active: editor.isActive("italic"),            title: "Italic" },
    { icon: Heading2,    cmd: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),  active: editor.isActive("heading",{level:2}), title: "H2" },
    { icon: Heading3,    cmd: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),  active: editor.isActive("heading",{level:3}), title: "H3" },
    { icon: List,        cmd: () => editor.chain().focus().toggleBulletList().run(),           active: editor.isActive("bulletList"),        title: "Bullet list" },
    { icon: ListOrdered, cmd: () => editor.chain().focus().toggleOrderedList().run(),          active: editor.isActive("orderedList"),       title: "Ordered list" },
    { icon: Quote,       cmd: () => editor.chain().focus().toggleBlockquote().run(),           active: editor.isActive("blockquote"),        title: "Quote" },
    { icon: Link2,       cmd: addLink,                                                         active: editor.isActive("link"),             title: "Link" },
    { icon: ImageIcon,   cmd: addImage,                                                        active: false,                               title: "Image" },
  ];

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
        {tools.map((tool) => (
          <button
            key={tool.title}
            type="button"
            title={tool.title}
            /* onMouseDown + preventDefault keeps editor focus intact;
               onClick fires AFTER blur so the selection is already gone */
            onMouseDown={(e) => { e.preventDefault(); tool.cmd(); }}
            className={`p-1.5 rounded transition ${
              tool.active
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            <tool.icon size={16} />
          </button>
        ))}
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-sm dark:prose-invert max-w-none p-4 min-h-[300px] [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[280px] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-gray-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0"
      />
    </div>
  );
}
