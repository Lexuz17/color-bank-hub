import type { Product } from "@color-bank-hub/contracts/catalog";
import type { CompositionItem } from "@color-bank-hub/contracts/common";
import type { ShadeInput } from "@color-bank-hub/contracts/shade";

/**
 * Converts Excel column letter (e.g. 'A', 'Z', 'AA') to 0-based index.
 */
function colLettersToIndex(col: string): number {
  let index = 0;
  for (let i = 0; i < col.length; i++) {
    index = index * 26 + (col.charCodeAt(i) - 64);
  }
  return index - 1;
}

/**
 * Parses an .xlsx ArrayBuffer using the browser's native DecompressionStream.
 * Extracts cells from the primary sheet as a 2D string array.
 */
export async function parseXlsxBuffer(buffer: ArrayBuffer): Promise<string[][]> {
  const bytes = new Uint8Array(buffer);
  let offset = 0;
  const files: Record<string, string> = {};

  while (offset < bytes.length - 4) {
    if (bytes[offset] === 0x50 && bytes[offset + 1] === 0x4b && bytes[offset + 2] === 0x03 && bytes[offset + 3] === 0x04) {
      const compMethod = bytes[offset + 8] | (bytes[offset + 9] << 8);
      const compSize = bytes[offset + 18] | (bytes[offset + 19] << 8) | (bytes[offset + 20] << 16) | (bytes[offset + 21] << 24);
      const nameLen = bytes[offset + 26] | (bytes[offset + 27] << 8);
      const extraLen = bytes[offset + 28] | (bytes[offset + 29] << 8);
      const name = new TextDecoder().decode(bytes.subarray(offset + 30, offset + 30 + nameLen));
      const dataStart = offset + 30 + nameLen + extraLen;
      const compData = bytes.subarray(dataStart, dataStart + compSize);

      if (compMethod === 8) {
        const ds = new DecompressionStream("deflate-raw");
        const writer = ds.writable.getWriter();
        void writer.write(compData);
        void writer.close();
        const reader = ds.readable.getReader();
        const chunks: Uint8Array[] = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        const decompressed = new Uint8Array(chunks.reduce((acc, c) => acc + c.length, 0));
        let pos = 0;
        for (const c of chunks) {
          decompressed.set(c, pos);
          pos += c.length;
        }
        files[name] = new TextDecoder().decode(decompressed);
      } else if (compMethod === 0) {
        files[name] = new TextDecoder().decode(compData);
      }
      offset = dataStart + compSize;
    } else {
      offset++;
    }
  }

  // Parse shared strings if present
  const sharedStrings: string[] = [];
  if (files["xl/sharedStrings.xml"]) {
    const sxml = files["xl/sharedStrings.xml"];
    const siMatches = sxml.matchAll(/<si>(.*?)<\/si>/gs);
    for (const si of siMatches) {
      const tMatches = [...si[1].matchAll(/<t[^>]*>(.*?)<\/t>/gs)].map((m) => m[1]).join("");
      sharedStrings.push(tMatches);
    }
  }

  const sheet1 = files["xl/worksheets/sheet1.xml"];
  if (!sheet1) return [];

  const rowMatches = sheet1.matchAll(/<row[^>]*>(.*?)<\/row>/gs);
  const rows: string[][] = [];

  for (const r of rowMatches) {
    const row: string[] = [];
    const cellMatches = r[1].matchAll(/<c\s+r="([A-Z]+)\d+"(?:[^>]*?t="([^"]+)")?[^>]*>(?:<is><t>(.*?)<\/t><\/is>|<v>(.*?)<\/v>)?<\/c>/gs);
    for (const c of cellMatches) {
      const colIdx = colLettersToIndex(c[1]);
      const type = c[2];
      let val = c[3] ?? c[4] ?? "";
      if (type === "s") {
        const sIdx = Number.parseInt(val, 10);
        val = sharedStrings[sIdx] ?? val;
      }
      row[colIdx] = val;
    }
    for (let i = 0; i < row.length; i++) {
      if (row[i] === undefined) row[i] = "";
    }
    rows.push(row);
  }

  return rows;
}

/**
 * Parses tab- or comma-delimited text into rows and cells.
 */
export function parseDelimitedText(text: string): string[][] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0);

  if (!lines.length) return [];

  const isTab = lines.some((l) => l.includes("\t"));
  const delimiter = isTab ? "\t" : ",";

  return lines.map((line) => {
    if (delimiter === "\t") {
      return line.split("\t").map((cell) => cell.trim());
    }
    // Simple CSV parser supporting quotes
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        cells.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    cells.push(current.trim());
    return cells;
  });
}

function parseComposition(raw?: string): CompositionItem[] | undefined {
  if (!raw || !raw.trim()) return undefined;
  const parts = raw
    .split(/[;,]/)
    .map((p) => p.trim())
    .filter(Boolean);
  const items: CompositionItem[] = [];

  for (const part of parts) {
    const [namePart, pctPart] = part.split(":").map((s) => s.trim());
    if (namePart && pctPart) {
      const percentage = Number.parseFloat(pctPart);
      if (!Number.isNaN(percentage) && percentage >= 0 && percentage <= 100) {
        items.push({ name: namePart, percentage });
      }
    }
  }

  return items.length > 0 ? items : undefined;
}

export interface ParsedShadeResult {
  rows: ShadeInput[];
  parsedCount: number;
  unassignedProductsCount: number;
  error?: string;
}

/**
 * Maps raw matrix rows (from Excel or paste) into valid ShadeInput records.
 */
export function parseTemplateRows(rawRows: string[][], catalogProducts: Product[], defaultProductId?: string): ParsedShadeResult {
  if (!rawRows.length) {
    return { rows: [], parsedCount: 0, unassignedProductsCount: 0, error: "No data found." };
  }

  // Look for header row
  const firstRow = rawRows[0].map((c) => c.toLowerCase().trim());
  const hasOriginHeader = firstRow.some((c) => c === "origin");
  const hasShadeHeader = firstRow.some((c) => c.includes("shade") || c === "name");
  const hasSkuHeader = firstRow.some((c) => c.includes("sku"));
  const hasHexHeader = firstRow.some((c) => c.includes("hex"));

  const isHeaderPresent = hasOriginHeader || (hasShadeHeader && (hasSkuHeader || hasHexHeader));

  let headerRow: string[] = [];
  let dataRows: string[][] = [];

  if (isHeaderPresent) {
    headerRow = firstRow;
    dataRows = rawRows.slice(1);
  } else {
    dataRows = rawRows;
  }

  if (!dataRows.length) {
    return { rows: [], parsedCount: 0, unassignedProductsCount: 0, error: "Only headers detected without data rows." };
  }

  // Robust column finder: prioritizes exact match before substring match
  const findCol = (candidates: string[]): number => {
    for (const c of candidates) {
      const idx = headerRow.findIndex((h) => h === c);
      if (idx !== -1) return idx;
    }
    for (const c of candidates) {
      const idx = headerRow.findIndex((h) => h.includes(c));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const shadeIdx = isHeaderPresent ? findCol(["shade name", "shade"]) : -1;
  const productIdx = isHeaderPresent ? findCol(["product name", "product"]) : -1;
  const skuIdx = isHeaderPresent ? findCol(["sku"]) : -1;
  const hexIdx = isHeaderPresent ? findCol(["hex code", "hex"]) : -1;
  const ingredientsIdx = isHeaderPresent ? findCol(["full ingredients (inci)", "full ingredients", "ingredients", "inci"]) : -1;
  const mayContainIdx = isHeaderPresent ? findCol(["may contain"]) : -1;
  const compIdx = isHeaderPresent ? findCol(["color composition", "composition"]) : -1;

  const result: ShadeInput[] = [];
  let unassignedCount = 0;

  for (const cells of dataRows) {
    // Skip empty lines
    if (!cells.some((c) => c.trim().length > 0)) continue;

    let shadeName = "";
    let sku = "";
    let hex = "";
    let productName = "";
    let ingredientsInci = "";
    let mayContain = "";
    let compositionStr = "";

    if (isHeaderPresent) {
      shadeName = shadeIdx >= 0 ? (cells[shadeIdx] ?? "") : "";
      sku = skuIdx >= 0 ? (cells[skuIdx] ?? "") : "";
      hex = hexIdx >= 0 ? (cells[hexIdx] ?? "") : "";
      productName = productIdx >= 0 ? (cells[productIdx] ?? "") : "";
      ingredientsInci = ingredientsIdx >= 0 ? (cells[ingredientsIdx] ?? "") : "";
      mayContain = mayContainIdx >= 0 ? (cells[mayContainIdx] ?? "") : "";
      compositionStr = compIdx >= 0 ? (cells[compIdx] ?? "") : "";
    } else if (cells.length === 3) {
      // 3-column format: SKU, Shade Name, HEX (or detect if Col 0 or 2 is hex)
      if (cells[2].startsWith("#") || /^[0-9a-fA-F]{6}$/.test(cells[2])) {
        sku = cells[0];
        shadeName = cells[1];
        hex = cells[2];
      } else if (cells[0].startsWith("#") || /^[0-9a-fA-F]{6}$/.test(cells[0])) {
        hex = cells[0];
        shadeName = cells[1];
        sku = cells[2];
      } else {
        sku = cells[0];
        shadeName = cells[1];
        hex = cells[2];
      }
    } else if (cells.length >= 7) {
      // Matches the template columns:
      // 0: Origin, 1: Brand, 2: Product Name, 3: Sub-Category, 4: Shade Name, 5: SKU, 6: HEX
      productName = cells[2] ?? "";
      shadeName = cells[4] ?? "";
      sku = cells[5] ?? "";
      hex = cells[6] ?? "";
      ingredientsInci = cells[7] ?? "";
      mayContain = cells[8] ?? "";
      compositionStr = cells[9] ?? "";
    } else {
      // Fallback: take whatever cells are present
      shadeName = cells[0] ?? "";
      sku = cells[1] ?? "";
      hex = cells[2] ?? "";
    }

    shadeName = shadeName.trim();
    sku = sku.trim();
    hex = hex.trim();
    productName = productName.trim();
    ingredientsInci = ingredientsInci.trim();
    mayContain = mayContain.trim();

    if (!hex.startsWith("#") && /^[0-9a-fA-F]{6}$/.test(hex)) {
      hex = `#${hex}`;
    }

    // Determine target productId
    let targetProductId = defaultProductId;
    if (productName) {
      const matched = catalogProducts.find((p) => p.name.toLowerCase() === productName.toLowerCase());
      if (matched) {
        targetProductId = matched.id;
      }
    }

    if (!targetProductId) {
      unassignedCount++;
    }

    const composition = parseComposition(compositionStr);

    result.push({
      productId: targetProductId ?? "",
      sku: sku || undefined,
      name: shadeName,
      hex,
      ingredientsInci: ingredientsInci || undefined,
      mayContain: mayContain || undefined,
      composition,
    });
  }

  return {
    rows: result,
    parsedCount: result.length,
    unassignedProductsCount: unassignedCount,
  };
}
