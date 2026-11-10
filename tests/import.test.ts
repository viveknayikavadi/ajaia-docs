import { describe, expect, it } from 'vitest';
import {
  fileToHtml,
  isSupportedFile,
  markdownToHtml,
  textToHtml,
  titleFromFilename,
} from '@/lib/import';

describe('file import', () => {
  it('accepts only .txt, .md and .docx files', () => {
    expect(isSupportedFile('notes.txt')).toBe(true);
    expect(isSupportedFile('README.MD')).toBe(true);
    expect(isSupportedFile('report.docx')).toBe(true);
    expect(isSupportedFile('image.png')).toBe(false);
    expect(isSupportedFile('noextension')).toBe(false);
  });

  it('builds a readable title from the file name', () => {
    expect(titleFromFilename('meeting_notes-2026.md')).toBe('meeting notes 2026');
    expect(titleFromFilename('.md')).toBe('Imported document');
  });

  it('turns plain text into paragraphs and escapes HTML', () => {
    const html = textToHtml('Hello <b>world</b>\nsecond line\n\nNew paragraph');
    expect(html).toBe('<p>Hello &lt;b&gt;world&lt;/b&gt;<br>second line</p><p>New paragraph</p>');
  });

  it('keeps Markdown formatting (headings, bold, lists)', () => {
    const html = markdownToHtml('# Title\n\nSome **bold** text\n\n- one\n- two\n\n1. first');
    expect(html).toContain('<h1>Title</h1>');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toMatch(/<ul>\s*<li>one<\/li>/);
    expect(html).toContain('<ol>');
  });

  it('does not render raw HTML from Markdown files', () => {
    const html = markdownToHtml('Hi\n\n<script>alert(1)</script>');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('rejects unsupported files', async () => {
    await expect(fileToHtml('photo.png', Buffer.from('x'))).rejects.toThrow(/Unsupported/);
  });

  it('converts a .txt buffer end to end', async () => {
    await expect(fileToHtml('a.txt', Buffer.from('Line one'))).resolves.toBe('<p>Line one</p>');
  });
});
