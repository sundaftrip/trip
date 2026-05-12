"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import {
  Bold, Italic, List, ListOrdered, Link2,
  Image as ImageIcon, Heading2, Heading3, Quote, Highlighter,
} from "lucide-react";
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

  if (!hasMd) return null;

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
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  const editorRef = useRef<ReturnType<typeof useEditor>>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Tulis konten artikel di sini..." }),
      Highlight.configure({ multicolor: false }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChangeRef.current(editor.getHTML()),
    editorProps: {
      handlePaste(_view, event) {
        const html  = event.clipboardData?.getData("text/html")  ?? "";
        const plain = event.clipboardData?.getData("text/plain") ?? "";
        if (html.trim()) return false;
        const converted = markdownToHtml(plain);
        if (!converted) return false;
        event.preventDefault();
        editorRef.current?.commands.insertContent(converted);
        return true;
      },
    },
  });

  useEffect(() => { (editorRef as React.MutableRefObject<typeof editor>).current = editor; }, [editor]);

  const loadedRef = useRef(false);
  useEffect(() => {
    if (!editor || loadedRef.current || !value) return;
    loadedRef.current = true;
    if (value !== editor.getHTML()) editor.commands.setContent(value);
  }, [editor, value]);

  if (!editor) return null;

  function addLink() {
    const url = prompt("URL:");
    if (url) editor?.chain().focus().setLink({ href: url }).run();
  }

  function addImage() {
    const url = prompt("URL gambar:");
    if (url) editor?.chain().focus().setImage({ src: url }).run();
  }

  /* ── Toolbar groups ── */
  const tools = [
    /* Inline formats — apply to selection only */
    { icon: Bold,        cmd: () => editor.chain().focus().toggleBold().run(),        active: editor.isActive("bold"),           title: "Bold",         group: 1 },
    { icon: Italic,      cmd: () => editor.chain().focus().toggleItalic().run(),      active: editor.isActive("italic"),         title: "Italic",       group: 1 },
    { icon: Highlighter, cmd: () => editor.chain().focus().toggleHighlight().run(),   active: editor.isActive("highlight"),      title: "Highlight",    group: 1 },

    /* Block formats — apply to current paragraph */
    { icon: Heading2,    cmd: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading",{level:2}), title: "H2", group: 2 },
    { icon: Heading3,    cmd: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive("heading",{level:3}), title: "H3", group: 2 },
    { icon: List,        cmd: () => editor.chain().focus().toggleBulletList().run(),  active: editor.isActive("bulletList"),     title: "Bullet list",  group: 2 },
    { icon: ListOrdered, cmd: () => editor.chain().focus().toggleOrderedList().run(),active: editor.isActive("orderedList"),    title: "Ordered list", group: 2 },
    { icon: Quote,       cmd: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive("blockquote"),    title: "Blockquote",   group: 2 },

    /* Insert */
    { icon: Link2,       cmd: addLink,   active: editor.isActive("link"), title: "Link",  group: 3 },
    { icon: ImageIcon,   cmd: addImage,  active: false,                   title: "Image", group: 3 },
  ];

  let lastGroup = 0;

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
        {tools.map((tool) => {
          const divider = tool.group !== lastGroup && lastGroup !== 0;
          lastGroup = tool.group;
          return (
            <span key={tool.title} className="contents">
              {divider && <span className="w-px h-5 bg-gray-300 dark:bg-gray-500 mx-1 shrink-0" />}
              <button
                type="button"
                title={tool.title}
                onMouseDown={(e) => { e.preventDefault(); tool.cmd(); }}
                className={`p-1.5 rounded transition ${
                  tool.active
                    ? tool.title === "Highlight"
                      ? "bg-yellow-200 dark:bg-yellow-500/30 text-yellow-700 dark:text-yellow-300"
                      : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                <tool.icon size={16} />
              </button>
            </span>
          );
        })}
      </div>

      {/* Highlight renders as <mark> — style it here */}
      <style>{`
        .ProseMirror mark { background: #fef08a; color: inherit; border-radius: 2px; padding: 0 2px; }
        .dark .ProseMirror mark { background: #854d0e; color: #fef9c3; }
      `}</style>

      <EditorContent
        editor={editor}
        className="prose prose-sm dark:prose-invert max-w-none p-4 min-h-[300px] [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[280px] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-gray-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0"
      />
    </div>
  );
}
