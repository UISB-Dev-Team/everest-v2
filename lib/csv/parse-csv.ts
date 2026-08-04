// Cells beginning with these chars are treated as spreadsheet formula
// injection. Prefix a single-quote so they render as plain text.

const FORMULA_TRIGGERS = /^[=+\-@\t\r]/;

function sanitizeCell(value: string): string {
  return FORMULA_TRIGGERS.test(value) ? `'${value}` : value;
}

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/**
 * Reads a File as text with best-guess encoding:
 *   1. UTF-16 LE / BE (BOM-detected)
 *   2. Strict UTF-8 (covers ASCII and UTF-8 BOM files from modern Excel)
 *   3. Windows-1252 fallback (classic Excel "Save as CSV" on Windows)
 */
export function readCsvFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.onload = () => {
      const buf = reader.result;
      if (!(buf instanceof ArrayBuffer)) {
        reject(new Error("Expected ArrayBuffer from FileReader"));
        return;
      }
      const bytes = new Uint8Array(buf);
      if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
        resolve(new TextDecoder("utf-16le").decode(bytes.subarray(2)));
        return;
      }
      if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
        resolve(new TextDecoder("utf-16be").decode(bytes.subarray(2)));
        return;
      }
      try {
        // fatal:true throws on any invalid UTF-8 byte sequence
        resolve(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
      } catch {
        resolve(new TextDecoder("windows-1252").decode(bytes));
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

// Splits one CSV line into fields, respecting RFC 4180 double-quoted fields.
function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      let field = "";
      i++; // skip opening quote
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') {
          field += '"';
          i += 2;
        } else if (line[i] === '"') {
          i++; // skip closing quote
          break;
        } else {
          field += line[i++];
        }
      }
      fields.push(sanitizeCell(field.trim()));
      if (line[i] === ",") i++;
    } else {
      const end = line.indexOf(",", i);
      if (end === -1) {
        fields.push(sanitizeCell(line.slice(i).trim()));
        break;
      }
      fields.push(sanitizeCell(line.slice(i, end).trim()));
      i = end + 1;
    }
  }
  return fields;
}

export interface ParsedCsv {
  headers: string[];
  rows: string[][];
}

/**
 * Parses a CSV string into headers + row arrays.
 * Handles: UTF BOM, Windows line endings (\r\n), RFC 4180 quoted fields, formula injection.
 */
export function parseCsv(text: string): ParsedCsv {
  const cleaned = stripBom(text ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  const lines = cleaned.split("\n").filter((line) => line.trim().length > 0);

  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = splitCsvLine(lines[0]);
  const rows = lines
    .slice(1)
    .map((line) => splitCsvLine(line))
    .filter((fields) => fields.some((f) => f.length > 0));

  return { headers, rows };
}
