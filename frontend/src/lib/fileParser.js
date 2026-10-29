import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import mammoth from 'mammoth';

// Configure pdfjs worker safely
try {
  if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/legacy/build/pdf.worker.mjs',
      import.meta.url
    ).toString();
  }
} catch (e) {
  console.warn('pdfjs worker configuration skipped:', e);
}

/**
 * Formats file size into a human-readable string.
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Fallback stream text extractor for PDF if pdfjs encounters an unhandled worker exception.
 * Extracts only printable text within text objects (BT ... ET) and avoids binary object garbage.
 */
function extractTextFromPdfStream(uint8Array) {
  try {
    const decoder = new TextDecoder('latin1');
    const raw = decoder.decode(uint8Array);
    const textPieces = [];

    // Match text blocks inside BT (begin text) ... ET (end text)
    const btRegex = /BT[\s\S]*?ET/g;
    let match;
    while ((match = btRegex.exec(raw)) !== null) {
      const block = match[0];
      // Match text within parenthesis (text) Tj or [(text)] TJ
      const tjRegex = /\(([^)]+)\)\s*T[jJ]/g;
      let tjMatch;
      while ((tjMatch = tjRegex.exec(block)) !== null) {
        textPieces.push(tjMatch[1]);
      }
    }

    const combined = textPieces.join(' ').replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
    if (combined.length > 30) {
      return combined;
    }
  } catch (e) {
    console.warn('Stream extraction fallback failed:', e);
  }
  return '';
}

/**
 * Extracts plain text from an uploaded file (PDF, DOCX, TXT, MD, etc.)
 * @param {File} file
 * @returns {Promise<{ text: string, wordCount: number, error?: string }>}
 */
export async function extractTextFromFile(file) {
  const fileName = file.name || '';
  const fileExt = fileName.split('.').pop()?.toLowerCase() || '';

  try {
    // 1. PDF Documents
    if (fileExt === 'pdf' || file.type === 'application/pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Data = new Uint8Array(arrayBuffer);

      let fullText = '';
      try {
        const loadingTask = pdfjsLib.getDocument({
          data: uint8Data,
          isEvalSupported: false,
          useSystemFonts: true
        });
        const pdf = await loadingTask.promise;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item) => (item.str !== undefined ? item.str : ''))
            .join(' ');
          fullText += (pageNum > 1 ? '\n\n' : '') + pageText;
        }
      } catch (pdfJsErr) {
        console.warn(`pdfjs parsing encountered issue on ${fileName}:`, pdfJsErr);
        // Try internal stream fallback
        const streamText = extractTextFromPdfStream(uint8Data);
        if (streamText && streamText.length > 50) {
          fullText = streamText;
        } else {
          throw new Error('Unable to extract text layers from this PDF. Please copy/paste text directly.');
        }
      }

      const trimmed = fullText.trim();
      const words = trimmed ? trimmed.split(/\s+/).filter(w => w.length > 0).length : 0;

      // Cap extracted words if somehow excessive
      if (words > 6000) {
        const capped = trimmed.split(/\s+/).slice(0, 5000).join(' ') + '\n\n[... Remaining content trimmed ...]';
        return {
          text: capped,
          wordCount: 5000
        };
      }

      return {
        text: trimmed,
        wordCount: words
      };
    }

    // 2. Word Documents (.docx)
    if (fileExt === 'docx') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const trimmed = (result.value || '').trim();
      const words = trimmed ? trimmed.split(/\s+/).filter(w => w.length > 0).length : 0;
      return {
        text: trimmed,
        wordCount: words
      };
    }

    // 3. Plain Text / Markdown / CSV / JSON
    const text = await file.text();
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(w => w.length > 0).length : 0;

    return {
      text: trimmed,
      wordCount: words
    };

  } catch (err) {
    console.error(`Error parsing file ${fileName}:`, err);

    // If it is NOT a PDF or binary file, we can safely attempt text read
    if (fileExt !== 'pdf' && fileExt !== 'doc' && fileExt !== 'docx') {
      try {
        const raw = await file.text();
        const cleaned = raw.replace(/[^\x20-\x7E\t\r\n]/g, ' ').replace(/\s+/g, ' ').trim();
        if (cleaned.length > 20) {
          const words = cleaned.split(/\s+/).length;
          return {
            text: cleaned,
            wordCount: words
          };
        }
      } catch {
        // ignore
      }
    }

    return {
      text: '',
      wordCount: 0,
      error: err.message || 'Failed to extract text from file'
    };
  }
}
