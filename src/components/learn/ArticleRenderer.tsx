'use client';

import { useEditor, EditorContent, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

type Props = {
  content: JSONContent;
};

/**
 * Read-only article body. Renders the TipTap/ProseMirror JSON doc straight
 * through the editor's own DOM rendering (editable: false) rather than
 * converting to an HTML string — so there's no dangerouslySetInnerHTML and
 * no sanitizer needed; ProseMirror only ever emits nodes the schema defines.
 */
export function ArticleRenderer({ content }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editable: false,
    immediatelyRender: false,
  });

  return <EditorContent editor={editor} className="article-prose" />;
}
