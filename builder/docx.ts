// Minimal, dependency-free .docx text extraction for the browser.
// A .docx is a ZIP archive; we only need the word/document.xml entry's
// paragraph text. This reads local file headers directly (no external
// zip library), matching the hand-rolled writer in generator.ts's zip().

const LOCAL_SIG = 0x04034b50;
const CENTRAL_SIG = 0x02014b50;

function findEntry(bytes: Uint8Array, name: string): { data: Uint8Array; method: number } | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const enc = new TextEncoder();
  const nameBytes = enc.encode(name);
  let offset = 0;
  while (offset + 4 <= bytes.length) {
    const sig = view.getUint32(offset, true);
    if (sig === CENTRAL_SIG) break;
    if (sig !== LOCAL_SIG) { offset++; continue; }
    const method = view.getUint16(offset + 8, true);
    let compSize = view.getUint32(offset + 18, true);
    const nameLen = view.getUint16(offset + 26, true);
    const extraLen = view.getUint16(offset + 28, true);
    const nameStart = offset + 30;
    const dataStart = nameStart + nameLen + extraLen;
    const entryName = bytes.subarray(nameStart, nameStart + nameLen);
    const isMatch = entryName.length === nameBytes.length && entryName.every((b, i) => b === nameBytes[i]);
    if (compSize === 0) {
      // Streaming (data-descriptor) entry: fall back to scanning for the next header.
      let scan = dataStart;
      while (scan + 4 <= bytes.length) {
        const s = view.getUint32(scan, true);
        if (s === LOCAL_SIG || s === CENTRAL_SIG) break;
        scan++;
      }
      compSize = scan - dataStart;
    }
    if (isMatch) return { data: bytes.subarray(dataStart, dataStart + compSize), method };
    offset = dataStart + compSize;
  }
  return null;
}

async function inflate(data: Uint8Array, method: number): Promise<Uint8Array> {
  if (method === 0) return data;
  if (typeof DecompressionStream === 'undefined') throw new Error('This browser cannot decompress .docx files. Use .txt or .md instead.');
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

export async function readDocxText(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const entry = findEntry(bytes, 'word/document.xml');
  if (!entry) throw new Error('Could not find document content in this .docx file.');
  const xmlBytes = await inflate(entry.data, entry.method);
  const xml = new TextDecoder('utf-8').decode(xmlBytes);
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.querySelector('parsererror')) throw new Error('This .docx file could not be read.');
  const paragraphs = Array.from(doc.getElementsByTagName('w:p'));
  const lines = paragraphs.map((p) => Array.from(p.getElementsByTagName('w:t')).map((t) => t.textContent || '').join(''));
  return lines.join('\n').trim();
}
