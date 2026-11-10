import { Marked } from 'marked';
import mammoth from 'mammoth';

export const SUPPORTED_EXTENSIONS = ['.txt', '.md', '.docx'] as const;
export const SUPPORTED_LABEL = '.txt, .md, .docx';
export const MAX_UPLOAD_BYTES = 1_000_000; // 1 MB

export function getExtension(filename: string): string {
  const i = filename.lastIndexOf('.');
  return i === -1 ? '' : filename.slice(i).toLowerCase();
}

export function isSupportedFile(filename: string): boolean {
  return (SUPPORTED_EXTENSIONS as readonly string[]).includes(getExtension(filename));
}

export function titleFromFilename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
  return (base || 'Imported document').slice(0, 200);
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Plain text: blank lines start a new paragraph, single newlines become line breaks. */
export function textToHtml(text: string): string {
  const paragraphs = text
    .replace(/\r\n?/g, '\n')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p.split('\n').map(escapeHtml).join('<br>')}</p>`);
  return paragraphs.length ? paragraphs.join('') : '<p></p>';
}

// Raw HTML inside Markdown is escaped (shown as text) instead of being rendered.
const markdown = new Marked({
  gfm: true,
  renderer: {
    html(token) {
      return escapeHtml(token.text);
    },
  },
});

export function markdownToHtml(md: string): string {
  const html = markdown.parse(md, { async: false }) as string;
  return html.trim() || '<p></p>';
}

export async function fileToHtml(filename: string, data: Buffer): Promise<string> {
  switch (getExtension(filename)) {
    case '.txt':
      return textToHtml(data.toString('utf8'));
    case '.md':
      return markdownToHtml(data.toString('utf8'));
    case '.docx': {
      const result = await mammoth.convertToHtml({ buffer: data });
      return result.value.trim() || '<p></p>';
    }
    default:
      throw new Error(`Unsupported file type. Supported: ${SUPPORTED_LABEL}`);
  }
}
