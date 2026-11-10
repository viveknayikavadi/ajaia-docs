'use client';

import type { Editor } from '@tiptap/react';

type BlockStyle = 'p' | 'h1' | 'h2' | 'h3';

function currentBlock(editor: Editor): BlockStyle {
  for (const level of [1, 2, 3] as const) {
    if (editor.isActive('heading', { level })) return `h${level}`;
  }
  return 'p';
}

function Tool({
  label, title, active, disabled, onClick, children,
}: {
  label: string; title: string; active?: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={`tool${active ? ' is-active' : ''}`}
      aria-label={label}
      aria-pressed={active}
      title={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()} // keep the text selection
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return <div className="toolbar" aria-hidden="true" style={{ height: 48 }} />;
  const chain = () => editor.chain().focus();

  return (
    <div className="toolbar" role="toolbar" aria-label="Formatting">
      <select
        className="style-select"
        aria-label="Text style"
        value={currentBlock(editor)}
        onChange={(e) => {
          const v = e.target.value as BlockStyle;
          if (v === 'p') chain().setParagraph().run();
          else chain().setHeading({ level: Number(v[1]) as 1 | 2 | 3 }).run();
        }}
      >
        <option value="p">Normal text</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
      </select>

      <span className="sep" />
      <Tool label="Bold" title="Bold (Ctrl+B)" active={editor.isActive('bold')} onClick={() => chain().toggleBold().run()}>
        <strong>B</strong>
      </Tool>
      <Tool label="Italic" title="Italic (Ctrl+I)" active={editor.isActive('italic')} onClick={() => chain().toggleItalic().run()}>
        <em>I</em>
      </Tool>
      <Tool label="Underline" title="Underline (Ctrl+U)" active={editor.isActive('underline')} onClick={() => chain().toggleUnderline().run()}>
        <u>U</u>
      </Tool>

      <span className="sep" />
      <Tool label="Bulleted list" title="Bulleted list" active={editor.isActive('bulletList')} onClick={() => chain().toggleBulletList().run()}>
        • List
      </Tool>
      <Tool label="Numbered list" title="Numbered list" active={editor.isActive('orderedList')} onClick={() => chain().toggleOrderedList().run()}>
        1. List
      </Tool>
      <Tool label="Quote" title="Quote" active={editor.isActive('blockquote')} onClick={() => chain().toggleBlockquote().run()}>
        “ ”
      </Tool>

      <span className="sep" />
      <Tool label="Undo" title="Undo (Ctrl+Z)" disabled={!editor.can().undo()} onClick={() => chain().undo().run()}>
        Undo
      </Tool>
      <Tool label="Redo" title="Redo (Ctrl+Shift+Z)" disabled={!editor.can().redo()} onClick={() => chain().redo().run()}>
        Redo
      </Tool>
    </div>
  );
}
